#!/usr/bin/env sh
# install-family.sh — install every installable family package (117).
# Usage: ./install-family.sh [profile] (default profile: web)
#
# Reads family.txt, which is generated from dsh-plugins/family.json. It is a
# fuller surface than install-all.sh: 39 mainline default + 53 core checkers +
# 10 catalog-only compliance tools + 15 domain plugins. It excludes the two
# domain suites (their members are listed), 3 retired packages and 3 support
# repositories. See dsh-plugins/ROSTER.md for the scope table.
set -u
PROFILE="${1:-web}"
ROSTER="$(dirname "$0")/family.txt"
if [ ! -f "$ROSTER" ]; then
  echo "family.txt not found next to this script: $ROSTER" >&2
  exit 1
fi
failed=""
count=0
while IFS= read -r line; do
  line="${line%%#*}"
  plugin=$(printf '%s' "$line" | tr -d ' \t\r')
  [ -n "$plugin" ] || continue
  count=$((count + 1))
  echo "== installing $plugin =="
  dsh plugin --profile "$PROFILE" add "$plugin" || failed="$failed $plugin"
done < "$ROSTER"
if [ -z "$failed" ]; then
  echo "All $count family packages installed into profile '$PROFILE'."
else
  echo "These failed, install them manually:$failed"
  exit 1
fi
