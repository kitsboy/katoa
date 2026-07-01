#!/usr/bin/env bash
# Prints Cloudflare Pages env vars from .env.local (client-safe only — no secrets)
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ ! -f .env.local ]]; then
  echo "Missing .env.local — copy from .env.example and fill in Supabase keys"
  exit 1
fi

# shellcheck disable=SC1091
source .env.local

echo ""
echo "=== Cloudflare Pages → katoa → Settings → Environment variables ==="
echo "Add these to BOTH Production and Preview:"
echo ""
echo "VITE_SUPABASE_URL=${VITE_SUPABASE_URL:-}"
echo "VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY:-}"
echo "VITE_BTCMAP_API_URL=${VITE_BTCMAP_API_URL:-https://api.btcmap.org}"
echo "VITE_BTCMAP_APP_URL=${VITE_BTCMAP_APP_URL:-https://btcmap.org}"
echo "VITE_BTCMAP_ENABLED=${VITE_BTCMAP_ENABLED:-true}"
echo "VITE_APP_URL=https://katoa.org"
echo "VITE_APP_NAME=KATOA"
echo ""
echo "⚠️  NEVER add SUPABASE_SERVICE_ROLE_KEY or sb_secret_* to Cloudflare Pages."
echo "    Those belong in .env.server.local / Edge Functions only."
echo ""
echo "Or with wrangler (after: export CLOUDFLARE_API_TOKEN=...):"
echo "  ./scripts/cloudflare-pages-env.sh"
echo ""