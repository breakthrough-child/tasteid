#!/usr/bin/env bash
# Push every KEY=VALUE in .env.local to Vercel production (non-empty values only).
set -euo pipefail
while IFS= read -r line; do
  [[ "$line" =~ ^[A-Z_][A-Z0-9_]*= ]] || continue
  k="${line%%=*}"; v="${line#*=}"
  [ -n "$v" ] || continue
  [[ "$k" == VERCEL_* ]] && continue
  printf '%s' "$v" | npx vercel env add "$k" production --force >/dev/null 2>&1 && echo "  env: $k" || { echo "FAILED to set $k" >&2; exit 1; }
done < .env.local
