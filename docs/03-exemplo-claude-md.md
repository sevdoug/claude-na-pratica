# Exemplo de CLAUDE.md global

O `CLAUDE.md` é o arquivo de instruções que o Claude Code carrega em **toda**
conversa. Ele pode viver em dois lugares:

- `~/.claude/CLAUDE.md` — global, vale para todos os seus projetos (é o caso
  deste exemplo);
- `<projeto>/CLAUDE.md` — específico do repositório, versionado com o time.

Lembre da regra do treinamento: tudo que está aqui **ocupa a mesa de
trabalho** (o contexto) em toda mensagem. Então seja enxuto — comportamento e
processo, não documentação.

Abaixo, o meu `CLAUDE.md` global que mostrei no treinamento. Use como ponto
de partida e adapte ao seu jeito de trabalhar:

```markdown
# Instruções gerais

- Nada de "Great question!", "I'd be happy to help!" ou qualquer filler. Só responde.
- Tenha opinião. Se uma abordagem é ruim, diz que é ruim. Se tem uma forma melhor, sugere direto.
- Antes de perguntar qualquer coisa, tenta resolver sozinho. Lê o arquivo, olha o contexto, busca no projeto. Só pergunta se realmente travou.

## Workflow
1. **Entender o problema** — clarificar requisitos se necessário
2. **Planejar solução** — arquitetura/abordagem antes de codar
3. **Implementar** — código limpo, incremental
4. **Auto-validar** — testes, lint, edge cases
5. **Reflexão pós-build** — obrigatório após implementar:
   - "Agora que construí, o que eu faria diferente?"
   - "Tem refactor que valha a pena fazer agora?" (se sim, fazer — refactors são baratos)
   - "Os testes cobrem os edge cases reais ou só o happy path?"
   - Se a resposta a qualquer uma dessas revelar melhorias significativas, aplicar antes de entregar
6. **Entregar** — com contexto (o que foi feito, como testar, limitações conhecidas, e se houve refactors pós-build)

## Regras de Ouro
- Reportar incertezas antes de assumir
- Qualidade > velocidade
- **Documentação quando necessário** Código autoexplicativo é ideal. Comentários quando a lógica é complexa. README atualizado sempre.
```

## Destaques

- **Tom e postura** ("tenha opinião", "sem filler") mudam mais o dia a dia do
  que qualquer regra técnica.
- A **reflexão pós-build** é o passo que quase ninguém pede — e é onde o
  agente pega os próprios atalhos antes de você precisar apontar.
- Repare no que **não** está aqui: nada de convenções de stack ou detalhes de
  projeto. Isso pertence ao `CLAUDE.md` do repositório ou a uma skill
  (carregada só quando a tarefa pede — veja o doc 05).
