# Hooks na prática: confinando o agente à worktree

> **A regra:** instrução no prompt é probabilística. Hook é determinístico.

Este é um hook real, nascido de um problema real: rodando agentes em git
worktrees paralelas, o Claude às vezes se perdia e editava arquivos **no
checkout principal** (via caminho absoluto) em vez de na worktree onde a
sessão rodava. Pedir "não escreva fora da worktree" no `CLAUDE.md` ajuda,
mas é um pedido — o modelo pode esquecer. Um **hook `PreToolUse`** intercepta
a ferramenta *antes* de ela executar e bloqueia de forma garantida.

É a diferença entre combinar e trancar a porta.

## A configuração

Em `.claude/settings.json` do projeto:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit|NotebookEdit",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/confine-to-cwd.sh"
          }
        ]
      }
    ]
  }
}
```

O `matcher` filtra quais ferramentas disparam o hook — aqui, só as de
escrita. O script recebe via stdin um JSON com a ferramenta, os argumentos e
o `cwd` da sessão, e decide: sai em silêncio (libera) ou devolve uma decisão
de `deny` com o motivo.

## O script

`.claude/hooks/confine-to-cwd.sh`:

```bash
#!/usr/bin/env bash
# Guard-rail: numa git worktree, bloqueia Write/Edit/MultiEdit/NotebookEdit cujo
# alvo caia dentro do *checkout principal* do repositório (em vez da worktree).
# Impede que um agente rodando numa worktree escreva por engano no diretório
# principal via caminho absoluto.
#
# NÃO restringe quando a sessão já roda no checkout principal, nem escritas fora
# do repo (ex.: /tmp, ~/.claude/memory). Fail-open: na dúvida, libera.
#
# Registrado em .claude/settings.json como PreToolUse. Depende de jq, git, node.
set -uo pipefail

input=$(cat)
tool=$(jq -r '.tool_name' <<<"$input")
case "$tool" in
  Write | Edit | MultiEdit | NotebookEdit) ;;
  *) exit 0 ;;
esac

cwd=$(jq -r '.cwd' <<<"$input")
path=$(jq -r '.tool_input.file_path // .tool_input.notebook_path // empty' <<<"$input")
[ -z "$path" ] && exit 0

# .git compartilhado; o diretório-pai dele é o checkout principal do repo.
common=$(git -C "$cwd" rev-parse --git-common-dir 2>/dev/null) || exit 0 # não é repo → não restringe

# Resolve common, cwd e alvo para caminhos absolutos canônicos (.. , . e
# symlinks resolvidos, mesmo que o arquivo ainda não exista) — numa só
# invocação do node, para não pagar 3 cold-starts. Saída: 3 linhas.
resolved=$(node -e '
const path = require("path"), fs = require("fs");
const [base, ...ps] = process.argv.slice(1);
const realabs = (p) => {
  let cur = path.resolve(base, p), suf = "";
  while (!fs.existsSync(cur) && cur !== path.dirname(cur)) { suf = suf ? path.join(path.basename(cur), suf) : path.basename(cur); cur = path.dirname(cur); }
  try { cur = fs.realpathSync(cur); } catch {}
  return suf ? path.join(cur, suf) : cur;
};
process.stdout.write(ps.map(realabs).join("\n"));
' "$cwd" "$common" "$cwd" "$path" 2>/dev/null) || exit 0

{ read -r main_git; read -r cwd_r; read -r abs; } <<<"$resolved"
if [ -z "${main_git:-}" ] || [ -z "${cwd_r:-}" ] || [ -z "${abs:-}" ]; then exit 0; fi # fail-open
main_repo=$(dirname "$main_git")

# Bloqueia só quando o alvo está DENTRO do checkout principal e FORA do cwd.
# Na sessão principal main_repo == cwd_r, então a 2ª condição nunca dispara.
if [[ "$abs" == "$main_repo"/* && "$abs" != "$cwd_r"/* ]]; then
  jq -n --arg p "$abs" --arg m "$main_repo" --arg c "$cwd_r" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: ("Bloqueado: escrita no checkout principal a partir de uma worktree.\nAlvo:           " + $p + "\nprincipal:      " + $m + "\ncwd (worktree): " + $c + "\nEscreva com caminho relativo, dentro da worktree.")
    }
  }'
fi
exit 0
```

Lembre de dar permissão de execução: `chmod +x .claude/hooks/confine-to-cwd.sh`.

## Como ele decide

1. **Só ferramentas de escrita** — qualquer outra sai na hora.
2. **Descobre o checkout principal** via `git rev-parse --git-common-dir`:
   numa worktree, o `.git` é compartilhado e o pai dele é o checkout
   principal. Fora de um repo git, libera.
3. **Canonicaliza os caminhos** (resolve `..`, symlinks, e funciona mesmo
   para arquivo que ainda não existe) — sem isso, `../projeto/arquivo.ts`
   escaparia da checagem.
4. **Bloqueia só a combinação perigosa**: alvo *dentro* do checkout
   principal e *fora* do cwd da sessão. Na sessão principal as duas
   condições nunca se cruzam, então o hook é invisível no dia a dia.

## O que copiar desse design

- **Fail-open consciente**: todo caminho de erro (sem jq, sem node, fora de
  repo) termina em `exit 0`. Um guard-rail que trava a sessão em falso
  positivo é pior que não ter guard-rail. Inverta isso (fail-closed) só
  quando o hook for de segurança de verdade, não de conveniência.
- **`deny` com motivo didático**: a `permissionDecisionReason` volta para o
  modelo — que lê "escreva com caminho relativo, dentro da worktree" e se
  corrige sozinho na tentativa seguinte. O hook bloqueia *e* ensina.
- **A regra de ouro dos hooks**: se um comportamento precisa acontecer
  *sempre* ("nunca X", "antes de todo Y"), não pertence ao prompt — pertence
  a um hook. Prompt orienta; hook garante.

## Limitações conhecidas

- **Não cobre escritas via Bash** (`echo foo > arquivo`, `sed -i`, etc.).
  Cobrir exigiria interceptar e interpretar todo comando de shell — bem mais
  invasivo e frágil. Para o erro que este hook mira (o agente usando as
  ferramentas nativas de edição com caminho absoluto errado), a cobertura é
  suficiente.
- **Depende de `jq` e `node`** no ambiente — se faltarem, o fail-open libera
  tudo silenciosamente.
