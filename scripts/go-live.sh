#!/usr/bin/env bash
# One-shot go-live: after adding QLOO_API_KEY and LLM_* to .env.local, run `bash scripts/go-live.sh`.
set -euo pipefail
cd "$(dirname "$0")/.."
die() { echo "GO-LIVE FAILED: $*" >&2; exit 1; }
get() { grep -E "^$1=" .env.local | tail -1 | cut -d= -f2-; }
set_kv() { grep -qE "^$1=" .env.local && sed -i "s|^$1=.*|$1=$2|" .env.local || printf '\n%s=%s\n' "$1" "$2" >> .env.local; }

[ -n "$(get QLOO_API_KEY)" ] || die "QLOO_API_KEY is empty in .env.local"
[ -n "$(get LLM_API_KEY)" ] || die "LLM_API_KEY is empty in .env.local"
[ -n "$(get LLM_BASE_URL)" ] || die "LLM_BASE_URL is empty in .env.local"
[ -n "$(get LLM_MODEL)" ] || die "LLM_MODEL is empty in .env.local"
URL="$(get NEXT_PUBLIC_APP_URL)"; [[ "$URL" == https://* ]] || die "NEXT_PUBLIC_APP_URL must be the production https URL"

echo "1/5 QLOO_MOCK=false"; set_kv QLOO_MOCK false
echo "2/5 verify-qloo (review the table; non-200 rows -> edit lib/qloo/capabilities.ts)"
OUT="$(node scripts/verify-qloo.mjs)"; echo "$OUT"
echo "$OUT" | grep -E "^search artist" | grep -q " 200 " || die "Qloo search failed — check QLOO_API_KEY"
echo "3/5 pushing env to Vercel production"; bash scripts/push-env.sh
echo "4/5 deploying"; npx vercel --prod --yes | tail -3
echo "5/5 smoke test with Qloo assertions"; QLOO_ASSERT=1 node scripts/smoke.mjs "$URL" || die "production smoke test failed"
echo "GO-LIVE OK: $URL"
