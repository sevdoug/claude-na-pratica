# Claude na prática

> *With great power comes great productivity.*

Material do treinamento **"Claude sob o capô"** — tudo que foi apresentado e
construído ao vivo, organizado na mesma ordem da nossa jornada:

1. **Por dentro do agente** — o que acontece quando você aperta Enter
2. **Estendendo o Claude** — skills, MCPs e comandos
3. **Da IDE à plataforma** — como isso vira processo de time

## As 3 coisas pra não esquecer

1. **Um agente de IA é apenas um loop.** Nada mais. O modelo pede
   ferramentas, seu código executa, o resultado volta — até o modelo não
   pedir mais nada.
2. **Contexto é a mesa de trabalho. E ela é limitada.** Cada mensagem,
   arquivo colado e saída de terminal disputa a mesma mesa. Contexto é
   orçamento: gaste bem.
3. **Pensar é barato mesmo no modelo caro.** Planeje com o arquiteto, execute
   com o modelo de dia a dia.

## O que tem aqui

### 📊 A apresentação

[`docs/deck-turno1.pdf`](docs/deck-turno1.pdf) — os slides completos do
treinamento.

### 🔁 O agente em ~25 linhas

[`agente-loop/`](agente-loop/) — a demo executável de que um agente é só um
loop: três arquivos (`tools.ts`, `llm.ts`, `agente.ts`), um bug plantado em
`demo/soma.js`, e o agente que descobre, conserta e re-testa sozinho. O
[README da pasta](agente-loop/README.md) tem o passo a passo para rodar em
casa — você só precisa de Node e uma API key da Anthropic.

### 📚 Os documentos, na ordem do treinamento

| Doc | O que é |
|---|---|
| [01 — Tokens na prática](docs/01-tokens-na-pratica.md) | A demo do *strawberry* 🍓 direto na API: por que o modelo não lê letras, o efeito de pedir raciocínio, e a prova de que a API não tem memória. |
| [02 — Hands-on: projeto helpdesk](docs/02-hands-on-projeto-helpdesk.md) | O prompt completo que usamos para construir o sistema de helpdesk do zero, com a anatomia do que faz um bom prompt de projeto. |
| [03 — Exemplo de CLAUDE.md](docs/03-exemplo-claude-md.md) | O meu CLAUDE.md global comentado — tom, workflow e a reflexão pós-build. Ponto de partida para o seu. |
| [04 — Comando /commit](docs/04-comando-commit.md) | Como criamos um slash command pedindo para o próprio Claude escrevê-lo. |
| [05 — Skills do projeto](docs/05-skills-do-projeto.md) | Os 4 prompts que geraram as skills do helpdesk (Prisma, Next 16, Playwright, commits) e o padrão por trás deles. |
| [06 — Links úteis](docs/06-links-uteis.md) | As ferramentas citadas no treinamento, com uma linha sobre cada uma. |

## Por onde começar

Se você só tem 30 minutos:

1. Rode o [`agente-loop`](agente-loop/) — ver o loop funcionando vale mais
   que qualquer slide.
2. Crie o seu `~/.claude/CLAUDE.md` a partir do
   [exemplo](docs/03-exemplo-claude-md.md).
3. No seu próximo projeto, escreva o prompt inicial no formato do
   [hands-on](docs/02-hands-on-projeto-helpdesk.md): regras de negócio,
   stack com versões, escopo negativo e restrições.

Quando pegar o ritmo: transforme as rotinas repetitivas do seu time em
[comandos](docs/04-comando-commit.md) e o conhecimento do projeto em
[skills](docs/05-skills-do-projeto.md).

---

