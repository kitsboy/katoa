#!/usr/bin/env bash
# Set Cloudflare Pages environment variables for katoa (production + preview)
# Requires: npx wrangler login
set -euo pipefail

PROJECT="${CLOUDFLARE_PAGES_PROJECT:-katoa}"

usage() {
  cat <<EOF
Usage: ./scripts/cloudflare-pages-env.sh

Set these in your shell before running (or edit this script):

  export VITE_SUPABASE_URL="https://xxxx.supabase.co"
  export VITE_SUPABASE_ANON_KEY="eyJ..."
  export VITE_BTCMAP_API_URL="https://api.btcmap.org"
  export VITE_BTCMAP_APP_URL="https://btcmap.org"
  export VITE_BTCMAP_ENABLED="true"
  export VITE_APP_URL="https://katoa.org"

Then run this script to push to Cloudflare Pages project: $PROJECT

Manual alternative (Dashboard):
  Cloudflare → Workers & Pages → $PROJECT → Settings → Environment variables
  Add each VITE_* var for Production AND Preview.
EOF
}

# Auto-load client env from .env.local if present
if [[ -f .env.local ]] && [[ -z "${VITE_SUPABASE_URL:-}" ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
  export VITE_APP_URL="${VITE_APP_URL:-https://katoa.org}"
fi

if [[ -z "${VITE_SUPABASE_URL:-}" ]]; then
  usage
  exit 1
fi

# Block accidental secret key in client env
if [[ "${VITE_SUPABASE_ANON_KEY:-}" == sb_secret_* ]]; then
  echo "ERROR: VITE_SUPABASE_ANON_KEY must be the PUBLISHABLE key (sb_publishable_*), not sb_secret_*"
  exit 1
fi

echo "Setting production env for $PROJECT..."
for key in VITE_SUPABASE_URL VITE_SUPABASE_ANON_KEY VITE_BTCMAP_API_URL VITE_BTCMAP_APP_URL VITE_BTCMAP_ENABLED VITE_APP_URL VITE_APP_NAME; do
  val="${!key:-}"
  [[ -z "$val" ]] && continue
  echo "  $key"
  npx wrangler pages project variable create "$key" --project-name "$PROJECT" --environment production --value "$val" 2>/dev/null \
    || npx wrangler pages project variable update "$key" --project-name "$PROJECT" --environment production --value "$val"
done

echo "Setting preview env for $PROJECT..."
for key in VITE_SUPABASE_URL VITE_SUPABASE_ANON_KEY VITE_BTCMAP_API_URL VITE_BTCMAP_APP_URL VITE_BTCMAP_ENABLED VITE_APP_URL VITE_APP_NAME; do
  val="${!key:-}"
  [[ -z "$val" ]] && continue
  npx wrangler pages project variable create "$key" --project-name "$PROJECT" --environment preview --value "$val" 2>/dev/null \
    || npx wrangler pages project variable update "$key" --project-name "$PROJECT" --environment preview --value "$val"
done

echo "Done. Redeploy: git push origin main"