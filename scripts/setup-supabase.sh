#!/usr/bin/env bash
# Katoa — Supabase provisioning (run once per new project, then Kimi can repeat)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== Katoa Supabase Setup ==="

if ! command -v supabase &>/dev/null; then
  echo "Install Supabase CLI: https://supabase.com/docs/guides/cli"
  echo "  brew install supabase/tap/supabase"
  exit 1
fi

if [[ ! -f .env.local ]]; then
  echo "Copy .env.example → .env.local and fill VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY after linking."
  cp -n .env.example .env.local 2>/dev/null || true
fi

echo ""
echo "Step 1: Login (if needed)"
echo "  supabase login"
echo ""
echo "Step 2: Link to your new project"
echo "  supabase link --project-ref YOUR_PROJECT_REF"
echo "  (Project ref is in Supabase Dashboard → Settings → General)"
echo ""
read -r -p "Press Enter when linked, or Ctrl+C to exit..."

echo "Step 3: Push all migrations..."
supabase db push

echo "Step 4: Generate TypeScript types..."
mkdir -p src/types
supabase gen types typescript --linked > src/types/database.generated.ts
echo "  → src/types/database.generated.ts"

echo ""
echo "Step 5: Set local env (add these to .env.local and Cloudflare Pages):"
supabase status 2>/dev/null || true
echo ""
echo "  VITE_SUPABASE_URL=https://YOUR_REF.supabase.co"
echo "  VITE_SUPABASE_ANON_KEY=<anon key from Dashboard → Settings → API>"
echo ""
echo "Step 6: Enable Auth providers in Supabase Dashboard:"
echo "  - Email (confirm email OFF for dev, ON for prod)"
echo "  - Google OAuth (redirect: https://katoa.org/dashboard and http://localhost:5173/dashboard)"
echo ""
echo "Done. Run: npm run dev"