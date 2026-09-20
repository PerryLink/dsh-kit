#!/usr/bin/env sh
# install-all.sh — install every PerryLink DSH plugin listed in plugins.txt.
# Usage: ./install-all.sh [profile]   (default: web)
#
# The roster is plugins.txt next to this script. Do not inline a package list
# here: scripts/check-parity.mjs fails when either installer hard-codes one, and
# holds README.md's counts to the same file.
set -u

PROFILE="${1:-web}"
ROSTER="$(dirname "$0")/plugins.txt"

if [ ! -f "$ROSTER" ]; then
  echo "plugins.txt not found next to this script: $ROSTER" >&2
  exit 1
fi

failed=""
count=0
while IFS= read -r line; do
  case "$line" in ''|'#'*) continue ;; esac
  plugin=$(printf '%s' "$line" | tr -d ' \t\r')
  [ -n "$plugin" ] || continue
  count=$((count + 1))
  echo "== installing $plugin =="
  dsh plugin --profile "$PROFILE" add "$plugin" || failed="$failed $plugin"
done < "$ROSTER"

if [ -z "$failed" ]; then
  echo "All $count plugins installed into profile '$PROFILE'."
else
  echo "These failed, install them manually:$failed"
fi
