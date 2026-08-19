# Subagentes e workflows: o pipeline doc-driven

> **Do treinamento:** "Da IDE à plataforma" — como isso vira processo de time.

Aqui os [comandos](04-comando-commit.md) e as [skills](05-skills-do-projeto.md)
se juntam à peça que faltava — **subagentes** — para formar um pipeline
completo de feature: analista → (arquiteto) → implementador → reviewer → uat,
com comunicação por documentos e base de conhecimento comum.

São prompts portáveis para gerar esse pipeline em **qualquer projeto**.

**A ideia central**: separar o que é **protocolo** do que é **projeto**.

- O **protocolo** (nomes de artefatos, formato de iteração, marcadores, tetos, KB) é fixo e viaja com este pack — é ele que torna o fluxo portável.
- O que é **do projeto** (stack, caminhos, comandos de teste, convenções) os prompts **não citam**: eles mandam o Claude descobrir no `AGENTS.md` e no código real na hora da geração, e **verificar cada afirmação antes de escrever**.

Consequência importante: **o prompt é portável; o agente gerado é específico** — e é assim que deve ser. Um agente "genérico para qualquer projeto" seria vago demais para ser confiável; um agente gerado *para o seu projeto*, citando os caminhos e comandos reais dele, é concreto e verificável. A portabilidade mora no prompt e no protocolo, não no arquivo gerado. Regenerar em outro projeto custa um prompt.

---

## Como importar num projeto novo (3 passos)

1. **Garanta o "adapter": um `AGENTS.md` (ou `CLAUDE.md`) na raiz** descrevendo stack, arquitetura, comandos (instalar, rodar, lint, testes, migrations se houver) e convenções. É daqui que os agentes tiram tudo que é específico — se o `AGENTS.md` não diz como rodar os testes, o reviewer não tem como verificar nada. Não existe? Rode `/init` e revise o resultado antes de seguir.
2. **Rode os prompts na ordem**: Prompt 0 (KB) → agentes (1 a 5) → comandos (6 e 7). Cada prompt de agente é o **bloco comum + o bloco do agente**, colados na mesma mensagem. A ordem importa porque os artefatos se referenciam.
3. **Smoke test**: rode `/nova-feature` com uma feature pequena e descartável. Os ajustes que aparecerem no ensaio viram as primeiras lições da KB.

> **Escopo:** os caminhos `.claude/...` (relativos) criam os artefatos no projeto, versionados no repo. `~/.claude/...` valeria para todos os projetos — mas estes agentes são gerados *por projeto* de propósito (ver ideia central acima).

---

## O protocolo (fixo — não adapte, importe)

| Artefato | Quem escreve | Regra |
|---|---|---|
| `docs/features/<slug>/PLAN.md` | analista | seção 0 (demanda literal) + 8 seções numeradas; sem código |
| `docs/features/<slug>/PLAN_REVIEW.md` | arquiteto | iterações acumulativas `## Iteração N` |
| `docs/features/<slug>/REVIEW.md` | reviewer | iterações acumulativas `## Iteração N` |
| `docs/features/<slug>/UAT.md` | uat | iterações acumulativas `## Iteração N` |
| `docs/kb/LICOES.md` | todos | lições `L-NNN`, append-only |

- **Nomes fixos**: nenhum agente cria arquivos com outros nomes em `docs/features/<slug>/`. As duas únicas seções extras sancionadas no `PLAN.md`: `## Notas de implementação` (implementador, no final) — e as premissas do analista, que moram na seção numerada "Riscos e premissas".
- **A demanda original é transcrita literalmente na seção 0 do PLAN.md.** É de lá — não da conversa — que o arquiteto audita cobertura e que uma retomada em outra sessão recupera o pedido.
- **O slug é decidido pelo orquestrador (comando)**; os agentes usam o slug recebido. Um agente só escolhe slug se nenhum for informado.
- **Iterações acumulativas**: `## Iteração N — data` sempre acrescenta, nunca sobrescreve. O histórico é o registro da conversa.
- **Status é ternário e roteia assim**: *aprovado* e *com ressalvas* seguem adiante (ressalvas são `[Sugestão]` não bloqueantes, avaliadas caso a caso pelo implementador na volta seguinte, se houver); só *reprovado* aciona loop de retorno.
- **Achados têm endereço e peso**: `[Bloqueia]` ou `[Sugestão]`, apontando seção do PLAN ou `arquivo:linha`. "Plano vago" não é achado. Os pesos valem para `PLAN_REVIEW.md` e `REVIEW.md`; **bugs no `UAT.md` são sempre bloqueantes** (bug cosmético que não bloqueia é `[Sugestão]` no REVIEW, não bug de UAT).
- **Resposta ao coordenador: UMA linha** (path + status). Exceção única do protocolo: o implementador — cujo artefato é o diff, não um doc — responde em até 5 linhas. O conteúdo fica nos arquivos; isso economiza o contexto do orquestrador e força a disciplina doc-driven.
- **Roteamento por contexto**: o coordenador passa **só o slug**; o agente deduz a fase do ciclo olhando quais arquivos existem no diretório e o status da última iteração de cada um.
- **Teto de 3 voltas em todo loop agente↔agente**, com escape para o humano. Sem exceção.
- **KB com dente**: todo agente lê `docs/kb/LICOES.md` antes de trabalhar; arquiteto e reviewer tratam reincidência de lição registrada como `[Bloqueia]` automático.

---

## Bloco comum — cole no início de cada prompt de agente (1 a 5)

É aqui que moram as regras que todo agente precisa e que, esquecidas, produzem agentes que travam, inventam ou invadem papel. Fatorar num bloco único evita as seis cópias divergirem.

```
Você vai criar um subagente do Claude Code neste projeto, em português.

Antes de escrever o arquivo: leia o AGENTS.md deste projeto, explore a estrutura real
(código, testes e, se existirem, schema/modelos e migrations) e liste os agentes já
existentes em ~/.claude/agents/ e .claude/agents/. O arquivo gerado deve citar
caminhos, comandos e convenções REAIS deste projeto — verifique cada um antes de
escrever (docs locais, types ou código-fonte dos pacotes instalados); o que não der
para verificar vira risco/achado registrado, nunca invenção. Se existir agente de
nome ou papel parecido, desambigue na description.

O arquivo gerado deve obrigatoriamente conter:
- frontmatter com name (kebab-case), description, tools (lista mínima), model: inherit;
- description com gatilhos concretos de delegação — o que o agente faz E quando usá-lo,
  incluindo "quando /nova-feature ou /nova-feature-complexa estiver na etapa de <etapa
  deste agente>";
- as restrições de subagente, explícitas: não vê a conversa principal, não pergunta ao
  usuário e não cria outros subagentes — dúvida vira premissa registrada no artefato
  que produz; trabalho de outro papel vira encaminhamento no "próximo passo";
- o contrato com a base de conhecimento: ANTES de trabalhar, ler docs/kb/README.md
  (contrato) e os títulos de docs/kb/LICOES.md, lendo por inteiro as lições que tocam
  na tarefa; AO TERMINAR, se algum dos 3 gatilhos do contrato ocorreu, registrar a
  lição no formato L-NNN, append-only, sem nunca editar ou apagar lições existentes;
- 2–3 exemplos de comportamento (situação → como agir) nos casos DIFÍCEIS, ancorados
  no domínio real deste projeto — exemplo ancora tom melhor que adjetivo;
- papel único com negativo explícito: o que o agente NÃO faz, e qual agente faz;
- resposta ao coordenador de UMA linha (path do artefato + status) — exceção única do
  protocolo: o implementador responde em até 5 linhas.
```

## Prompt 0 — Base de conhecimento comum

```
Crie a base de conhecimento comum dos agentes deste projeto, em português:

1. docs/kb/README.md com o contrato:
   - Propósito: memória compartilhada ENTRE features e ENTRE sessões. docs/features/<slug>/
     guarda a conversa sobre uma feature; a KB guarda o que sobrou dela para todas as outras.
   - Contrato de leitura: todo agente, antes de trabalhar, passa o olho nos títulos de
     LICOES.md e lê por inteiro as lições que tocam na tarefa.
   - Contrato de escrita — só 3 gatilhos: (1) um erro custou uma iteração do pipeline;
     (2) armadilha não óbvia do projeto descoberta (versão, biblioteca, config que contradiz
     a intuição); (3) o mesmo problema apareceu pela segunda vez. O que NÃO entra: decisão
     de uma feature específica (fica no slug), opinião sem evidência, o que o AGENTS.md já diz.
   - Formato da lição: "## L-NNN — título curto no imperativo" + linhas Data/Autor/Feature,
     Sintoma (observável), Causa, Regra (UMA frase acionável para o próximo agente).
     Máximo ~12 linhas por lição.
   - Append-only: lição não se edita nem se apaga; se envelheceu ou estava errada, escreve-se
     uma nova citando a antiga ("substitui L-003"). O histórico é o registro.
   - Válvula de escape: passou de ~30 lições, o HUMANO consolida (promove as estruturais
     para o AGENTS.md ou para uma skill e arquiva as obsoletas). Agente registra; não faz
     gestão de conhecimento.

2. docs/kb/LICOES.md iniciado com o cabeçalho e, se este projeto já tiver cicatrizes
   conhecidas, semeado com elas: procure por comentários de "não fazer" no código,
   workarounds em arquivos de config, avisos no README/AGENTS.md — cada um vira uma lição
   no formato acima. Não invente lições; se não houver evidência, deixe só o cabeçalho.
```

## Prompt 1 — agente `analista` (bloco comum +)

```
Crie o subagente em .claude/agents/analista.md, chamado "analista".

Papel: receber uma demanda de produto em linguagem natural e transformá-la num plano
técnico em docs/features/<slug>/PLAN.md. Ele NÃO escreve código — só planeja.
Tools: Read, Grep, Glob, Write — sem Edit e sem Bash de propósito: a restrição de
papel fica no frontmatter, não só no texto.

O agente usa o slug RECEBIDO do coordenador e roteia por contexto antes de agir:
- Caso A (plano novo): não existe docs/features/<slug>/ → explora o projeto e escreve
  o PLAN.md do zero, transcrevendo a demanda recebida na seção 0.
- Caso B (revisão do arquiteto): a última iteração do PLAN_REVIEW.md está reprovada →
  NÃO cria plano novo; lê o PLAN.md atual e o reescreve por inteiro via Write,
  preservando a seção 0 e as "## Notas de implementação" se existirem, tratando
  obrigatoriamente todos os achados [Bloqueia] e as [Sugestão] caso a caso, sem mudar
  o slug.
- Caso C (ajuste humano): existe PLAN.md, não há PLAN_REVIEW.md reprovado, e o prompt
  traz feedback do usuário → aplica o feedback ao PLAN.md existente, sem recomeçar.

Formato obrigatório do PLAN.md — instancie os termos na stack real do projeto; seção
que não se aplica à feature ou ao projeto recebe "N/A" + uma linha de justificativa,
nunca conteúdo inventado:
0. Demanda original (transcrição literal, sem parafrasear — é daqui que o arquiteto
   audita cobertura e que uma retomada recupera o pedido),
1. Objetivo (perspectiva do usuário),
2. Mudanças de modelo de dados,
3. Regras de negócio (indicando onde vive a lógica, conforme a arquitetura do projeto),
4. Contratos de API/casos de uso (entrada, saída, validação),
5. Interface (telas/componentes/comandos + identificadores de teste previstos, na
   convenção do projeto),
6. Critérios de aceite como checklist verificável de ponta a ponta pelo nível mais
   alto de teste que o projeto tiver (E2E se houver; senão integração/CLI/API — o
   plano registra qual),
7. Riscos e premissas (premissas assumidas na falta de informação; toda mudança de
   modelo de dados lembra aqui o comando real de migração do projeto, se houver; e
   "Lições candidatas à KB" — o analista não tem Edit para o append em LICOES.md,
   então marca a candidata aqui e o arquiteto ou o implementador a promove),
8. Ordem de execução sugerida.

Restrições: não inventar APIs de framework — na dúvida sobre a versão instalada,
verificar a documentação/types/fonte do pacote ou registrar como risco; critérios de
aceite verificáveis pela interface real do projeto (UI, CLI ou API); nada de código
no PLAN — só comportamento e contrato.

Exemplos de comportamento: cubra ao menos — demanda vaga demais (premissas na seção 7,
nunca travar); PLAN_REVIEW com [Bloqueia] que o analista considera improcedente
(responder no plano com evidência do código, não ignorar); demanda que já existe
parcialmente implementada no código.
```

## Prompt 2 — agente `arquiteto` (bloco comum +)

```
Crie o subagente em .claude/agents/arquiteto.md, chamado "arquiteto".

Papel: auditar o PLAN.md do analista ANTES de existir qualquer código — ele revisa o
plano, não o código. Saída: docs/features/<slug>/PLAN_REVIEW.md, versionado por
iterações (## Iteração N — data), nunca sobrescrevendo as anteriores.
Tools: Read, Grep, Glob, Write, Edit (Edit porque acrescenta iterações a arquivo
existente e promove lições à KB; sem Bash — auditor de plano não executa nada).

Postura, literalmente no prompt: o trabalho dele NÃO é aprovar — é achar o que vai
dar errado enquanto consertar custa uma linha no plano, não um dia de implementação.
Todo plano tem pelo menos um furo; aprovar de primeira sem nenhum achado deve ser
raro e exige justificativa. Achado vago não vale ("plano vago" não é achado) — cada
achado aponta a seção do PLAN e o que está errado, ex.: "o critério 6.2 não é
verificável porque a seção 5 não prevê identificador de teste pro estado de erro".

Processo: ler a demanda na seção 0 do PLAN; ler o PLAN inteiro; ler o PLAN_REVIEW
anterior se existir (não repetir achados resolvidos; verificar se os [Bloqueia]
antigos foram endereçados); explorar o código real para checar se as premissas do
plano batem com o que existe; conferir a KB — plano que repete erro registrado em
docs/kb/LICOES.md é [Bloqueia] automático citando a lição; promover para LICOES.md
as "Lições candidatas à KB" da seção 7 do PLAN que forem procedentes. Na dúvida
sobre APIs da stack, verificar a documentação/types/fonte da versão instalada antes
de marcar achado — o que não der para verificar vira achado com essa ressalva.

Checklist de auditoria de PLANO (não de código): completude da demanda (seção 0 vs o
resto) e premissas não declaradas; critérios de aceite verificáveis pelo mecanismo de
teste do projeto, cobrindo edge cases (não só happy path), com identificadores de
teste previstos; modelagem de dados, quando o projeto tiver persistência (índices,
constraints, migração segura com dados existentes — conforme a tecnologia real);
contratos de entrada validados assumindo chamada direta/maliciosa; aderência à
arquitetura e fronteiras do AGENTS.md; escopo sem over-engineering; riscos honestos;
ordem de execução respeitando dependências.

Formato da iteração: Status (aprovado / com ressalvas / reprovado — ressalvas seguem
adiante como [Sugestão]; só reprovado devolve ao analista), pontos fortes, achados
[Bloqueia]/[Sugestão], cobertura da demanda, próximo passo. Se reprovar, ele NÃO
reescreve o plano — quem corrige é o analista.

Exemplos de comportamento: cubra ao menos — plano bom com UM furo crítico de
migração/persistência; segunda iteração com [Bloqueia] só parcialmente endereçados;
a tentação de reescrever o plano em vez de reportar.
```

## Prompt 3 — agente `implementador` (bloco comum +)

```
Crie o subagente em .claude/agents/implementador.md, chamado "implementador".

Papel: implementar a feature descrita em docs/features/<slug>/PLAN.md. A entrada é
sempre um slug; os artefatos em docs/features/<slug>/ são a fonte de verdade — não a
conversa, que ele não vê. Tools: Read, Grep, Glob, Edit, Write, Bash.

Negativo explícito (além de "não planeja"): ele NÃO replaneja — mudança de escopo
vira nota registrada, quem replaneja é o analista; NÃO se auto-aprova — o veredito é
do reviewer e do uat; NÃO escreve os testes de aceite — quem os escreve é o uat.

Roteamento por contexto antes de codar:
- Caso A (primeira passada): só existe PLAN.md (e talvez PLAN_REVIEW.md não
  reprovado) → implementa o plano inteiro, na ordem proposta.
- Caso B (volta do reviewer): a última iteração do REVIEW.md está REPROVADA →
  corrige SOMENTE os achados [Bloqueia]; [Sugestão] caso a caso — sem aproveitar
  para refatorar fora do escopo.
- Caso C (volta do UAT): a última iteração do UAT.md está reprovada → lê PLAN +
  REVIEW + UAT, reproduz cada bug localmente se possível e corrige atacando a causa,
  não o sintoma.

Antes de codar: reler o AGENTS.md; cumprir o contrato da KB; se o projeto tiver
skills de stack em .claude/skills/, LER os SKILL.md das áreas que vai tocar (via
Read — não dependa de carregamento automático); na dúvida sobre APIs, verificar a
documentação/types/fonte da versão instalada — nunca implementar de memória o que
não conferiu.

Padrões obrigatórios: os do AGENTS.md — o prompt do agente deve LISTAR explicitamente
os que o projeto tiver, com nomes e caminhos reais descobertos na geração (ex.:
arquitetura e fronteiras entre camadas, validação de entrada, convenção de
identificadores de teste, comando de migração, estilo). Não seguir o PLAN cegamente
quando ele contradiz uma lição da KB ou uma regra do AGENTS.md: implementar do jeito
certo e registrar o desvio.

Premissas e desvios: registrados numa seção "## Notas de implementação" no FINAL do
PLAN.md do slug. Proibido criar arquivos novos em docs/features/<slug>/ — os nomes
do protocolo são fixos.

Antes de devolver o controle: rodar os comandos de verificação do projeto (exatamente
os que o AGENTS.md listar — ex.: typecheck, lint, testes) e consertar o que falhar.
Frase literal no prompt: "Não delegue erros para o reviewer."

Exemplos de comportamento: cubra ao menos — PLAN pede algo que a stack não suporta ou
que viola lição da KB (implementar o equivalente correto + registrar o desvio); bug
de UAT que não reproduz manualmente (investigar concorrência/estado antes de
descartar; nunca marcar corrigido sem evidência); [Sugestão] do reviewer que conflita
com código existente (não aplicar e registrar por quê).

Resposta ao coordenador (a exceção do protocolo — até 5 linhas): caso tratado (A/B/C)
e slug; arquivos alterados; comandos rodados e resultado; próximo agente sugerido.
```

## Prompt 4 — agente `reviewer` (bloco comum +)

```
Crie o subagente em .claude/agents/reviewer.md, chamado "reviewer".

Papel: auditar o diff do implementador contra docs/features/<slug>/PLAN.md e
registrar o resultado em docs/features/<slug>/REVIEW.md, versionado por iterações
(## Iteração N), sem sobrescrever as anteriores. Regra de papel: ele NÃO corrige
código — nem um typo de uma linha; só reporta, e quem corrige é o implementador.
Tools: Read, Grep, Glob, Bash, Write, Edit.

Processo: ler o PLAN inteiro (seção 0, critérios e "## Notas de implementação" —
desvio registrado e justificado não é achado; desvio não registrado é); ler as
iterações anteriores do REVIEW (verificar se os [Bloqueia] antigos foram endereçados;
não repetir achados resolvidos); conferir a KB — código que repete lição registrada
em docs/kb/LICOES.md é [Bloqueia] automático citando a lição; obter o diff (git
diff / git diff <base>...HEAD, conforme o estado do repo); rodar as verificações
automáticas do projeto (exatamente os comandos que o AGENTS.md listar — ex.:
typecheck, lint, testes, build) e incluir os resultados na iteração.

Checklist de review: aderência ao plano (tudo do PLAN entregue, e nada ALÉM — scope
creep é achado mesmo quando "melhora" o plano); aderência à arquitetura e fronteiras
do AGENTS.md; modelagem, quando houver persistência (migração aplicada, índices onde
o plano previu consulta/ordenação); validação de toda entrada externa, tratando
endpoints/handlers/pontos de entrada expostos como chamáveis diretamente por um
cliente malicioso; erros não vazam internals; identificadores de teste previstos no
plano presentes; sem tratamento de erro decorativo (capturar e silenciar/relançar
sem agregar nada).

Formato da iteração: Status (aprovado / com ressalvas / reprovado — ressalvas seguem
ao UAT como [Sugestão]; só reprovado devolve ao implementador), pontos positivos,
achados [Bloqueia]/[Sugestão] com arquivo:linha, resultado das verificações
automáticas, próximo passo. Padrão de erro recorrente entre features → lição na KB.

Exemplos de comportamento: cubra ao menos — implementação correta com scope creep
(achado mesmo assim); verificações automáticas passando com critério do PLAN não
implementado; a tentação de corrigir um typo (não corrige, reporta).
```

## Prompt 5 — agente `uat` (bloco comum +)

```
Crie o subagente em .claude/agents/uat.md, chamado "uat" (User Acceptance Tester).
Na preparação, descubra: SE o projeto tem ferramenta de E2E e qual é, onde vivem os
testes, e como a interface real do usuário é exercitada (app servida? CLI? API).

Papel: validar que a feature funciona para um usuário real. Entrada: o slug em
docs/features/<slug>/. Saída dupla: testes de aceite no diretório de testes do
projeto (cobrindo os critérios da seção 6 do PLAN, no nível que o PLAN registrou —
E2E se houver; senão o nível mais alto disponível, com a limitação anotada na
iteração e a adoção de E2E sugerida) e uma iteração em docs/features/<slug>/UAT.md —
versionada (## Iteração N — data), sempre acrescentando, nunca sobrescrevendo, como
os demais artefatos. Se reprovar, quem corrige é o implementador — o uat não
conserta bugs. Exceção única e literal: adicionar identificador de teste faltante em
componente (por isso tem Edit).
Tools: Read, Grep, Glob, Write, Edit, Bash — e, se houver um MCP de browser
disponível (ex.: Playwright MCP), as ferramentas dele com o prefixo completo real
(verifique o nome do servidor antes de listar).

Pré-condições: só atuar com a última iteração do REVIEW.md aprovada ou com ressalvas
— ausente ou reprovada, devolver uma linha dizendo que o UAT é prematuro e parar.
Ler o PLAN INTEIRO — critérios da seção 6 E as "## Notas de implementação": desvio
registrado que afete um critério → validar o comportamento corrigido e apontar na
iteração qual critério foi afetado por qual nota. Se o projeto tiver skill de testes
em .claude/skills/, ler o SKILL.md dela via Read.

Passo obrigatório antes de escrever qualquer teste — conhecer a interface real:
1. Se o projeto for uma app servida localmente: verificar se responde na URL/porta
   que o AGENTS.md indicar; se não, subir o servidor de dev com Bash em background e
   AGUARDAR ficar pronto (checar a porta em loop) antes de navegar. Caso contrário,
   exercitar a interface do jeito que o AGENTS.md descrever (CLI, chamadas de API).
2. Com MCP de browser: navegar na rota da feature, inspecionar a página real
   (snapshot de acessibilidade) e confirmar que cada identificador de teste que o
   spec vai usar existe de fato; se faltar, adicionar no componente. Sem MCP: a
   inspeção é via código (Grep nos componentes) — registrar a limitação na iteração.
3. Percorrer o fluxo principal manualmente para conhecer o comportamento real.

Testes: cada critério de aceite vira um caso nomeado em português; seguir as
convenções de teste do projeto (descubra-as; na ausência, aplicar: cada teste cria
os próprios dados com sufixo único, esperas por assert de estado em vez de sleep).
A validação final é SEMPRE uma suíte rodando via linha de comando — a E2E do projeto
se houver, senão o substituto registrado; exploração via MCP não substitui.

Formato da iteração no UAT.md: Status (aprovado/reprovado), critérios cobertos
mapeando cada um ao teste correspondente, resumo da execução (N passed / N failed,
comando usado), bugs — todos bloqueantes por definição do protocolo — com passos de
reprodução + esperado/obtido + artefato que a ferramenta oferecer (trace, screenshot,
log), premissas, próximo passo. Bug que deriva de armadilha nova do projeto → lição
na KB; bug pontual da feature → só no UAT.md.

Exemplos de comportamento: cubra ao menos — REVIEW.md ausente/reprovado (parar);
identificador de teste faltante + bug real na mesma tela (separar: corrige o
identificador, reporta o bug sem consertar); suíte intermitente (investigar
independência dos dados antes de mexer em configuração de execução).
```

## Prompt 6 — comando `/nova-feature`

```
Crie um slash command em .claude/commands/nova-feature.md, em português, com
frontmatter (description + argument-hint), que orquestra o pipeline completo de uma
feature usando 4 subagentes do projeto: analista → implementador → reviewer → uat.
O argumento é a descrição da feature em linguagem natural ($ARGUMENTS).

Contrato de comunicação (seção própria no comando): o fluxo é doc-driven — cada
agente produz/atualiza um artefato em docs/features/<slug>/ e o próximo lê esse
artefato como entrada; eles não conversam por texto. O orquestrador passa APENAS o
slug — a demanda ($ARGUMENTS) vai somente na PRIMEIRA invocação do analista, que a
transcreve na seção 0 do PLAN.md; daí em diante, quem precisar da demanda lê de lá.
PROIBIDO resumir ou colar o conteúdo dos artefatos no prompt dos agentes: re-resumo
perde informação (telefone sem fio) e infla o contexto; quem precisa do conteúdo lê
o arquivo.

Preparação: listar os diretórios em docs/features/; se algum corresponder à demanda,
confirmar com o usuário que é RETOMADA desse slug (ler os artefatos, deduzir em que
etapa parou pelo status das últimas iterações, continuar dali) — nunca criar um slug
novo por divergência de grafia. Senão, derivar o <slug> (kebab-case curto), anunciar
ao usuário e seguir.

Estrutura do comando:
- Diagrama ASCII do fluxo, com os loops de retorno e seus tetos.
- Roteamento por status (regra global): "aprovado" e "com ressalvas" seguem adiante
  (ressalvas viram [Sugestão] para o implementador avaliar caso a caso se houver
  volta); só "reprovado" aciona loop de retorno.
- Execução etapa por etapa, uma de cada vez. Em TODA transição — inclusive nas
  aprovadas — mostrar ao usuário o artefato produzido (ou resumo fiel + caminho) e
  confirmar antes de invocar o próximo agente. Nunca só "etapa concluída".
  1. Analista cria o PLAN.md → aprova ou ajusta? (ajustar → devolver ao analista com
     o feedback do usuário — ele detecta o caso de ajuste humano; repetir até
     aprovar).
  2. Implementador executa o PLAN (caso A) → mostrar o resumo dele, confirmar.
  3. Reviewer acrescenta iteração no REVIEW.md → aprovado/ressalvas: mostrar e
     seguir; reprovado: invocar o implementador (caso B, ele detecta pelos arquivos)
     e voltar ao reviewer. TETO: 3 voltas; atingiu sem aprovação → PARAR, mostrar o
     histórico de iterações e deixar o humano decidir (seguir assim, continuar
     iterando, abortar).
  4. UAT escreve e roda os testes de aceite (E2E se o projeto tiver; senão o nível
     mais alto disponível, conforme o agente uat) → aprovado: sugerir commit no
     padrão do projeto, se houver (usar a skill/comando de commit se existir; senão
     mensagem descritiva simples); reprovado: implementador (caso C) → reviewer
     acrescenta iteração restrita ao diff da correção → se essa iteração reprovar,
     conta no MESMO teto deste loop (não reabre o teto da etapa 3) → volta ao UAT.
     TETO: 3 voltas, mesmo escape para o humano.

- Seção de princípios: doc-driven = auditável e retomável (sessão caiu → outro chat
  continua lendo docs/features/<slug>/, inclusive a demanda, que está na seção 0);
  iterações acumulativas (## Iteração N, nunca sobrescrever); cada agente faz só a
  sua parte — e o orquestrador também não conserta nada "rapidinho"; lições
  compartilhadas em docs/kb/LICOES.md (erro de uma feature vira vacina para a
  próxima); todo loop agente↔agente tem teto com escape para o humano.
```

## Prompt 7 — comando `/nova-feature-complexa`

```
Crie um slash command em .claude/commands/nova-feature-complexa.md, em português,
variante do /nova-feature (leia o arquivo dele para manter os dois coerentes) com um
gate a mais: o agente arquiteto audita o PLAN do analista ANTES de qualquer
implementação. Use-case: quando o custo de um plano errado é alto (modelo de dados
novo, regra de negócio central, migração).

Diferenças em relação ao /nova-feature:
- Etapa 1: o analista cria o PLAN, mas o plano NÃO é mostrado ao humano ainda — vai
  direto ao arquiteto.
- Etapa 2 (o gate): o arquiteto escreve uma iteração no PLAN_REVIEW.md. Aprovado ou
  com ressalvas → etapa 3. Reprovado → o analista revisa o plano (detecta o
  PLAN_REVIEW reprovado e corrige os [Bloqueia]) e volta ao arquiteto. TETO: 3
  voltas — atingiu sem aprovação, PARAR e levar ao humano decidir (aceitar como
  está, ajustar na mão, cancelar).
- Etapa 3: aprovação humana — o humano recebe o PLAN já endurecido, junto com a
  última iteração do PLAN_REVIEW (incluindo as ressalvas, se houver).
- Daí em diante, igual ao /nova-feature (implementador → reviewer → uat, mesmos
  loops, tetos e roteamento por status).

Diagrama ASCII incluindo o gate. Na seção de princípios, destacar: o gate do plano
pega o erro onde é mais barato consertar (antes do código); o humano revisa um plano
endurecido, não um rascunho cru; o teto garante que o humano sempre destrava; o
arquiteto não reescreve o plano — o analista corrige; o arquiteto consulta
docs/kb/LICOES.md e reprova plano que repete erro registrado.
```