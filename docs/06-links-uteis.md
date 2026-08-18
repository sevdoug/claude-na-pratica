# Links úteis

Ferramentas e referências citadas durante o treinamento:

- **[Plugins oficiais do Claude Code](https://github.com/anthropics/claude-plugins-official)** —
  catálogo mantido pela Anthropic com plugins prontos (comandos, skills e
  MCPs empacotados) para instalar no Claude Code.
- **[RTK — Rust Token Killer](https://github.com/rtk-ai/rtk)** — proxy de CLI
  que filtra a saída de comandos (git, testes, builds) antes de chegar ao
  agente, economizando 60–90% dos tokens em operações de desenvolvimento.
  Lembre: contexto é orçamento.
- **[Caveman](https://github.com/juliusbrussee/caveman)** — na mesma linha de
  economia de contexto: compressão dos prompts/saídas para caber mais tarefa
  na mesa de trabalho.
- **[Context7](https://context7.com/)** — MCP de documentação atualizada de
  bibliotecas e frameworks. Resolve o problema do "conhecimento de treino
  desatualizado": o agente consulta a doc da versão que você usa, em vez de
  chutar a API antiga.
- **[Playwright MCP](https://github.com/microsoft/playwright-mcp)** — dá
  braços de browser ao agente: navegar, clicar, tirar screenshot e ler o
  console. Foi o que usamos para o agente testar a própria feature no
  hands-on.
- **[Maestro](https://maestro.dev/)** — equivalente para mobile: automação de
  UI em apps iOS/Android, também plugável ao agente via MCP.
