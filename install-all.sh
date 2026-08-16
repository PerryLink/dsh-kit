#!/usr/bin/env sh
# install-all.sh — install the 15 PerryLink DSH plugins into one profile.
# Usage: ./install-all.sh [profile]   (default: web)
set -u

PROFILE="${1:-web}"

npm_plugins="
dsh-checkpoint-rewind
dsh-permission-rules
dsh-output-styles
dsh-memento
dsh-background-agents
dsh-doublecheck
dsh-auto-review
dsh-mcp-panel
dsh-lsp-actions
@perrylink/dsh-github
@perrylink/dsh-skill-pack-security-provider
dsh-session-pin
dsh-composer-history
"

git_plugins="
github:PerryLink/dsh-plugin-guide
github:PerryLink/dsh-claude-move
"

failed=""
for p in $npm_plugins; do
  echo "== installing $p =="
  dsh plugin --profile "$PROFILE" add "$p" || failed="$failed $p"
done
for p in $git_plugins; do
  echo "== installing $p =="
  dsh plugin --profile "$PROFILE" add "$p" || failed="$failed $p"
done

if [ -z "$failed" ]; then
  echo "All 15 plugins installed into profile '$PROFILE'."
else
  echo "These failed, install them manually:$failed"
fi
