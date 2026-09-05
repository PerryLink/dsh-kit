#!/usr/bin/env sh
# install-all.sh — install the 37 PerryLink DSH plugins into one profile.
# Usage: ./install-all.sh [profile]   (default: web)
set -u

PROFILE="${1:-web}"

plugins="
dsh-auto-review
dsh-background-agents
dsh-budget
dsh-checkpoint-rewind
dsh-claude-move
dsh-click
dsh-composer-history
dsh-data-quality
dsh-defend
dsh-doublecheck
dsh-draw
dsh-fast
dsh-fund-research
dsh-industry-research
dsh-library
dsh-local-ai
dsh-lsp-actions
dsh-mask
dsh-mcp-panel
dsh-memento
dsh-observe
dsh-output-styles
dsh-permission-rules
dsh-personal-directive
dsh-plugin-guide
dsh-reach
dsh-research-report
dsh-score
dsh-session-pin
dsh-session-sync
dsh-talk
dsh-test-drive
dsh-translate
dsh-wechat
@perrylink/dsh-github
@perrylink/dsh-skill-pack-security-provider
@perrylink/dsh-ticktick
"

failed=""
for p in $plugins; do
  echo "== installing $p =="
  dsh plugin --profile "$PROFILE" add "$p" || failed="$failed $p"
done

if [ -z "$failed" ]; then
  echo "All 37 plugins installed into profile '$PROFILE'."
else
  echo "These failed, install them manually:$failed"
fi
