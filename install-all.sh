#!/usr/bin/env sh
# install-all.sh — install the PerryLink DSH plugins listed in plugins.txt.
# Usage: ./install-all.sh [profile] [--include-checkers]   (default profile: web)
#
# The roster is plugins.txt next to this script. Do not inline a package list
# here: scripts/check-parity.mjs fails when either installer hard-codes one, and
# holds README.md's counts to the same file.
#
# Retired packages are not in plugins.txt, so this never installs them. Frozen
# packages are, and are installed — a trailing "# ..." comment on their line
# marks them; it is stripped here and counted for the summary below.
#
# Lines marked `# opt-in` are skipped unless --include-checkers is passed. The 53
# compliance checkers are marked that way: they are roster plugins and the counts
# include them, but a starter pack that silently installs 92 packages is not a
# starter pack.
set -u

PROFILE="web"
INCLUDE_CHECKERS=0
for arg in "$@"; do
  case "$arg" in
    --include-checkers) INCLUDE_CHECKERS=1 ;;
    *) PROFILE="$arg" ;;
  esac
done
ROSTER="$(dirname "$0")/plugins.txt"

if [ ! -f "$ROSTER" ]; then
  echo "plugins.txt not found next to this script: $ROSTER" >&2
  exit 1
fi

failed=""
count=0
frozen=0
while IFS= read -r line; do
  # opt-in lines are skipped unless asked for, checked before the comment goes
  if [ "$INCLUDE_CHECKERS" -eq 0 ]; then
    case "$line" in *'# opt-in'*) continue ;; esac
  fi
  # drop a trailing "# ..." status comment, then surrounding whitespace
  line="${line%%#*}"
  plugin=$(printf '%s' "$line" | tr -d ' \t\r')
  [ -n "$plugin" ] || continue
  count=$((count + 1))
  echo "== installing $plugin =="
  dsh plugin --profile "$PROFILE" add "$plugin" || failed="$failed $plugin"
done < "$ROSTER"

# report the frozen count from the roster's own marks, for the summary only
frozen=$(grep -c 'FROZEN' "$ROSTER" 2>/dev/null || echo 0)
skipped=$(grep -c '# opt-in' "$ROSTER" 2>/dev/null || echo 0)

if [ -z "$failed" ]; then
  echo "All $count plugins installed into profile '$PROFILE' ($frozen of them frozen — see plugins.txt)."
  if [ "$INCLUDE_CHECKERS" -eq 0 ] && [ "$skipped" -gt 0 ]; then
    echo "$skipped opt-in plugins were skipped; pass --include-checkers to install them too (see plugins.txt)."
  fi
else
  echo "These failed, install them manually:$failed"
fi
