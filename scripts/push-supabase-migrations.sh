#!/usr/bin/env bash
# Run AFTER: supabase login && supabase link --project-ref pglqjtipbocjnqmiwmwf
set -euo pipefail
cd "$(dirname "$0")/.."

echo "=== Pushing Katoa migrations to pglqjtipbocjnqmiwmwf ==="

if ! supabase projects list &>/dev/null; then
  echo "Run first: supabase login"
  exit 1
fi

if [[ ! -f supabase/.temp/project-ref ]] && [[ ! -f .supabase/project-ref ]]; then
  echo "Run first: supabase link --project-ref pglqjtipbocjnqmiwmwf"
  exit 1
fi

supabase db push
echo "=== Generating TypeScript types ==="
mkdir -p src/types
supabase gen types typescript --linked > src/types/database.generated.ts
echo "Done. Restart: npm run dev"