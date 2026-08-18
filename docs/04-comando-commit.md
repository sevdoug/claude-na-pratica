# Criando um comando: /commit

Comandos (slash commands) são atalhos reutilizáveis do Claude Code: um
arquivo markdown em `.claude/commands/<nome>.md` vira o comando `/<nome>` no
chat. É a forma mais barata de padronizar tarefas repetitivas do time —
commit, changelog, review, o que for.

No treinamento, em vez de escrever o arquivo na mão, pedimos para o próprio
Claude criar o comando. Este foi o prompt:

```
cara, agora eu preciso criar um comando chamado commit no claude do meu projeto, onde eu possa fazer o commit das mudanças em staging com uma mensagem convencional.
Basicamente, quero que ele siga:

Escreva a mensagem de commit em português, no formato Conventional Commits (feat, fix, refactor, test, docs, chore), com escopo quando fizer sentido (ex: feat(chamados): ...). Primeira linha com até 72 caracteres; corpo só se a mudança pedir explicação. Se não houver nada em staging, avise e não faça nada. Então execute o commit.
```

Depois disso, basta digitar `/commit` em qualquer conversa do projeto e o
Claude analisa o staging, escreve a mensagem no padrão e executa o commit.

## O que copiar desse padrão

- **Comportamento para o caso vazio** ("se não houver nada em staging, avise
  e não faça nada") — sem isso o agente inventa algo para commitar.
- **Formato exato da saída** (Conventional Commits, 72 caracteres, escopo):
  quanto mais concreto, menos variação entre execuções.
- O mesmo raciocínio vale para qualquer rotina do time: se você explica a
  mesma coisa duas vezes no chat, ela merece virar comando ou skill.
