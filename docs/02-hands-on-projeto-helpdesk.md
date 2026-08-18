# Hands-on: o projeto de helpdesk

Este foi o prompt usado ao vivo para construir o sistema de helpdesk do zero
com o Claude Code. Está aqui na íntegra para você reproduzir o exercício — ou
adaptar para um projeto seu.

## Antes de tudo: escolha o time certo

No treinamento usamos o modo **opusplan**:

```
/model opusplan
```

Com ele, o **planejamento** roda no Opus (o "sênior de plantão" desenha a
solução) e a **execução** troca automaticamente para o Sonnet (o "executor"
implementa). É a regra do "pensar é barato mesmo no modelo caro": a execução
barata roda em cima de decisões boas.

## O prompt

Repare no formato — é o mesmo que você usaria para brifar uma pessoa
desenvolvedora: o que construir, regras de negócio, stack com versões
explícitas, o que está **fora** do escopo e restrições de qualidade.

```
Cara, eu quero construir um sistema de helpdesk para gerenciar os chamados da minha empresa.
Preciso que seja criada uma tela inicial para que qualquer pessoa possa criar um chamado, sem autenticação.
Para criar um chamado, a pessoa deverá inserir título, descrição, prioridade (baixa, média, alta, crítica) e categoria (hardware, software, acesso, outros). Ela também deverá inserir seu e-mail, este deverá ser um campo obrigatório.
Quando o chamado for criado, ele deverá gerar um número para que o usuário possa acompanhar.
Deverá ser possível pesquisar por números de chamado, inserindo o número do chamado e o e-mail da pessoa que criou.

Na tela autenticada, deverá ser possível visualizar todos os chamados abertos e um filtro rápido para visualizar somente os chamados sob responsabilidade do usuário autenticado. Abrir por padrão com o filtro dos chamados do usuário ativo, caso tenha algum chamado vinculado a ele. Caso contrário, abrir diretamente a lista com todos os chamados.
Na lista de chamados, deverá ser diferenciado os chamados por prioridade.

Deverá ser possível entrar em um chamado para visualizar o seu detalhe e, caso nenhum usuário tenha se tornado responsável por ele, deve-se possibilitar que o usuário assuma o chamado.

Para o projeto, utilizar a seguinte stack (siga exatamente estas versões e padrões, não use padrões de versões anteriores):
- Next.js 16 com App Router e Server Actions, TypeScript em modo estrito
- Prisma 7 com driver adapter @prisma/adapter-better-sqlite3 e SQLite (dev.db)
- Zod para validação de entrada
- shadcn + Tailwind
- Vitest para testes de unidade do domínio
- NextAuth para a autenticação

Fora do escopo por enquanto, não implemente: SLA, comentários, relatórios, notificações.

Restrições:
- Sem comentários óbvios no código; README curto com instruções
- Separe domínio (regras puras), actions e componentes; features futuras serão adicionadas sem refatoração estrutural
```

## Por que este prompt funciona

- **Regras de negócio explícitas**, incluindo os detalhes chatos (filtro
  padrão condicional, e-mail obrigatório) — é exatamente onde a IA "inventa"
  se você não especificar.
- **Stack com versões cravadas** e o aviso "não use padrões de versões
  anteriores": o conhecimento de treino do modelo pode estar defasado, e sem
  isso ele mistura APIs antigas.
- **Escopo negativo** ("não implemente SLA, comentários...") vale tanto
  quanto o positivo: evita que o agente gaste contexto construindo o que
  ninguém pediu.
- **Restrições de arquitetura** preparam o terreno para as próximas features
  sem exigir refatoração estrutural.
