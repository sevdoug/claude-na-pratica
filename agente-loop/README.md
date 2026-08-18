# Um agente é um loop 🔁

Demo executável de que um agente de IA é nada mais nada menos que:

```
enquanto (o LLM pedir ferramentas):
    executa as ferramentas
    devolve os resultados pro LLM
```

Sem tool call = terminou. Isso é 90% de qualquer agente (Cursor, Claude Code,
Devin...). O resto é engenharia de contexto.

## O que tem aqui

Três arquivos, um por conceito — na ordem em que você apresenta:

1. [`tools.ts`](tools.ts) — **as ferramentas.** Funções comuns (`read_file`,
   `write_file`, `run_shell`) + um schema pro modelo entender o que existe.
   O modelo nunca executa nada: ele só *pede*, quem executa é o nosso código.
2. [`llm.ts`](llm.ts) — **a comunicação com o LLM.** Manda o histórico + as
   ferramentas, recebe a resposta. Puro encanamento de API.
3. [`agente.ts`](agente.ts) — **o agente.** Importa os dois de cima e roda o
   loop: LLM decide → ferramenta executa → resultado volta → repete, até o
   modelo não pedir mais ferramenta. ~15 linhas de lógica.

E [`demo/`](demo/) — o cenário da apresentação: `soma.js` tem um bug
(`a - b` em vez de `a + b`) e `teste.js` falha por causa dele.

## Rodando a demo

```bash
npm install
export ANTHROPIC_API_KEY=sk-ant-...

npm run teste    # (opcional) mostra pra plateia o teste falhando
npm run agente   # o agente descobre o bug, conserta e re-roda o teste
npm run reset    # restaura o bug pra rodar a demo de novo
```

Também dá pra passar outra tarefa direto:

```bash
npm run agente -- "liste os arquivos de demo/ e explique o que cada um faz"
```

## Roteiro sugerido (palco)

1. `tools.ts` no telão — "olha aqui: incluímos as ferramentas. São funções
   normais com um schema."
2. `llm.ts` — "aqui referenciamos o LLM. Uma chamada de API, nada mais."
3. `agente.ts` — "e **tudo** que o agente faz está dentro deste loop, que
   roda até o modelo não pedir mais ferramenta."
4. `npm run teste` — teste vermelho.
5. `npm run agente` — narrar o loop enquanto roda: o modelo *decide* chamar
   `run_shell`, lê o erro, *decide* chamar `read_file`, acha o bug, *decide*
   chamar `write_file`, re-roda o teste... e quando não pede mais ferramenta,
   o loop termina sozinho.
6. `npm run teste` — teste verde.

## Avisos

- `run_shell` executa qualquer comando que o modelo pedir, via shell
  (`execSync`). Perfeito pra uma demo local, **inaceitável em produção** —
  lá você usaria allowlist de comandos, sandbox e aprovação humana.
- Modelo: `claude-opus-4-8` (troque a constante em `agente.ts` se quiser
  outro; `claude-haiku-4-5` sai mais barato pra ensaiar).
