# Skills: o que o agente sabe

> **Do treinamento:** "Revelação progressiva: a estante etiquetada, não o
> manual decorado. Escrever a etiqueta é 80% do trabalho."

Uma skill é uma pasta em `.claude/skills/<nome>/` com um `SKILL.md`:

```
padroes-server-actions/
├── SKILL.md
│   ├── name + description   ← a etiqueta (sempre visível, custo ~zero)
│   └── instruções completas ← o manual (carregado sob demanda)
└── scripts/                 ← equipamento (opcional)
```

Só o **nome + description** de cada skill fica permanentemente no contexto.
O corpo é carregado quando o agente decide que a tarefa pede — por isso
skills não sofrem do problema do `AGENTS.md` inflado, que você paga em toda
mensagem. E por isso a `description` é a parte mais importante: é ela que
decide quando a skill entra em campo.

Assim como no comando `/commit`, pedimos para o próprio Claude escrever as
skills. Abaixo, os quatro prompts usados no projeto de helpdesk — repare que
cada um entrega o **contexto que o agente não teria como adivinhar**
(decisões do projeto, pegadinhas de versão, regras do time) e diz
explicitamente o que a `description` deve cobrir.

## 1. `prisma-migrations` — como mexer no banco

```
Crie uma skill em .claude/skills/prisma-migrations/SKILL.md documentando como
mexer no banco deste projeto. Contexto que a skill precisa capturar:

- Usamos Prisma 7 com driver adapter @prisma/adapter-better-sqlite3 e SQLite.
  A connection string fica em prisma.config.ts (via DATABASE_URL), NÃO no
  schema.prisma — Prisma 7 rejeita `url` no datasource.
- O client é gerado em src/generated/prisma/ (fora do git) e o código de
  aplicação deve sempre usar o singleton src/lib/prisma.ts.
- SQLite não suporta enums no Prisma: usamos String no schema e validamos os
  valores com zod em src/lib/schemas.ts.

A skill deve documentar: o fluxo padrão para mudar o schema (editar schema →
npm run db:migrate -- --name <slug> → atualizar zod → seed se precisar), como
resetar o banco do zero (db:reset + db:seed), um exemplo de como instanciar o
client com o adapter, e uma seção de armadilhas (não editar migrations na mão,
não importar o client em client components, commitar as migrations).

Na description do frontmatter, deixe claro que a skill deve ser usada sempre
que alguém mexer em prisma/schema.prisma, models ou prisma/seed.ts.
```

## 2. `nextjs-app-router` — convenções do Next 16

```
Crie uma skill em .claude/skills/nextjs-app-router/SKILL.md com as convenções
de Next.js 16 (App Router) deste projeto. Ponto central: Next 16 mudou APIs em
relação ao 14/15 e o seu conhecimento de treino pode estar desatualizado — a
skill deve mandar ler node_modules/next/dist/docs/01-app/ como fonte de
verdade antes de codar.

Conteúdo que quero na skill:

- A estrutura de pastas do src/ (app/, components/, lib/ com prisma.ts,
  sla.ts, schemas.ts).
- Uma tabela de decisão: quando usar Server Action vs Route Handler.
- Regras de Server Actions: arquivo com "use server" no topo, validar tudo
  com zod antes de tocar o banco, sempre chamar revalidatePath após mutação,
  retornar { error } para erros recuperáveis.
- Server vs Client Components: default é Server; "use client" só com estado,
  event handlers ou APIs de browser. Server Components podem ser async.
- A pegadinha do Next 16: params e searchParams agora são Promises, e os
  tipos PageProps/LayoutProps/RouteContext são globais gerados — não importar.
- Padrões de UI do projeto: Tailwind v4, dark-first com zinc-*, status em
  emerald/amber/red, e todo elemento testável recebe data-testid em kebab-case.

Use nas description: "ao criar páginas, mutações ou rotas".
```

## 3. `playwright-e2e` — padrões de teste E2E

```
Crie uma skill em .claude/skills/playwright-e2e/SKILL.md com os padrões de
testes E2E deste projeto. O que ela precisa cobrir:

- Specs vivem em tests/e2e/<feature>.spec.ts; o playwright.config.ts já sobe
  o dev server sozinho (webServer); browser padrão Chromium.
- Comandos: npm run test:e2e (headless), test:e2e:ui, e como filtrar um spec
  específico com -g.
- Seletores: SOMENTE getByTestId. Proibido classe CSS, XPath, nth-child. Se
  faltar data-testid no componente, a regra é adicionar no componente antes
  de escrever o teste.
- Independência: cada test() cria seus próprios dados com sufixo único
  (Date.now()) pra não colidir entre execuções.
- Esperas: asserts de estado (toHaveText, toBeVisible) em vez de
  waitForTimeout — timeout só com comentário justificando.
- Estrutura test.describe + testes nomeados em português, padrão
  arrange/act/assert.
- Uma seção sobre o Playwright MCP: usar durante o desenvolvimento do teste
  (abrir a app, browser_snapshot pra validar data-testid, capturar trace de
  bug), mas a validação final é sempre via npm run test:e2e.

Description: usar ao criar ou alterar arquivos em tests/e2e/.
```

## 4. `conventional-commits` — padrão de commits e PRs

```
Crie uma skill em .claude/skills/conventional-commits/SKILL.md com o padrão
de commits e PRs do projeto:

- Formato Conventional Commits: <tipo>(<escopo>): <descrição>, corpo
  explicando o porquê (não o quê), rodapé para BREAKING CHANGE/refs.
- Tipos permitidos: feat, fix, refactor, chore, docs, test, perf — com uma
  linha explicando cada um.
- Escopos comuns do projeto: tasks, sla, tags, db, ui, e2e, agents, skills, mcp.
- 3-4 exemplos reais no contexto do projeto (tasks/SLA/tags).
- Títulos de PR no mesmo formato, com um template de corpo de PR: O que muda /
  Por que / Como testar / Critérios de aceite / Riscos.
- Regras: assunto <= 72 caracteres, verbos no infinitivo em português
  ("adiciona", não "adicionado"), um commit = uma mudança lógica.

Description: usar ao gerar mensagens de commit ou abrir PRs via GitHub MCP.
```

## O padrão por trás dos quatro prompts

1. **Contexto que só você tem** — decisões do projeto, pegadinhas de versão,
   regras do time. É isso que diferencia uma skill de documentação genérica.
2. **Estrutura pedida explicitamente** — fluxo padrão, exemplos, seção de
   armadilhas.
3. **A etiqueta bem definida** — todo prompt termina dizendo o que colocar na
   `description`, porque é ela que faz a skill ser usada na hora certa.
