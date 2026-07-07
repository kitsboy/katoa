# Katoa — Kimi / HERMES Operations Guide

**Machine:** M4 HERMES (Kimi) · **Coding:** M3 · **Live:** katoa.org (Cloudflare Pages) · **Repo:** `~/projects/katoa`

This doc is the single runbook for keeping Katoa running after Cam provisions Supabase.

**Pitch materials:** [`EXECUTIVE-SUMMARY.md`](./EXECUTIVE-SUMMARY.md) · [`MARKETING.md`](./MARKETING.md) · [`marketing/KATOA-Marketing-Presentation.pdf`](./marketing/KATOA-Marketing-Presentation.pdf) · [`docs/README.md`](./README.md)

---

## Daily commands (Kimi)

```bash
cd ~/projects/katoa
git pull origin main
npm install
npm run dev          # local check → http://localhost:5173
npm run build        # must pass before deploy
```

Deploy (from HERMES or after M3 push):

```bash
npm run build
# Strip crossorigin for CF Pages (required):
sed -i '' 's/ crossorigin//g' dist/index.html
npx wrangler pages deploy dist/ --project-name katoa --branch main
```

Or: `git push origin main` if CF Pages GitHub integration is on.

---

## 1. New Supabase project (Cam does once)

### Dashboard steps

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Name: `katoa` (or `katoa-prod`)
3. Region: closest to users (e.g. `us-east-1`)
4. **Save the database password** in your vault (1Password / Obsidian)
5. Wait ~2 min for project to provision

### Get credentials (Katoa prod project)

| What | Where | Local file |
|------|--------|------------|
| Project ref | `pglqjtipbocjnqmiwmwf` | `supabase/config.toml` |
| Project URL | `https://pglqjtipbocjnqmiwmwf.supabase.co` | `.env.local` → `VITE_SUPABASE_URL` |
| Publishable key | Settings → API → `sb_publishable_*` | `.env.local` → `VITE_SUPABASE_ANON_KEY` |
| Secret key | Settings → API → `sb_secret_*` | `.env.server.local` only — **never** Cloudflare Pages |
| Legacy JWT anon | May still exist alongside new keys; use publishable for new apps |

### Auth setup

**Authentication → Providers:**

- **Email:** ON. For dev turn OFF "Confirm email". For prod turn ON.
- **Google:** ON. Add OAuth client from Google Cloud Console.
  - Redirect URLs: `https://katoa.org/dashboard`, `http://localhost:5173/dashboard`

**Authentication → URL configuration:**

- Site URL: `https://katoa.org`
- Redirect URLs: `https://katoa.org/**`, `http://localhost:5173/**`

### Run migrations (CLI)

On HERMES or M3:

```bash
cd ~/projects/katoa
brew install supabase/tap/supabase   # if missing
supabase login
supabase link --project-ref YOUR_PROJECT_REF
./scripts/setup-supabase.sh          # pushes 24 migrations + gen types
```

### Local env file

Create `.env.local` (never commit):

```env
VITE_SUPABASE_URL=https://YOUR_REF.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
VITE_BTCMAP_API_URL=https://api.btcmap.org
VITE_BTCMAP_APP_URL=https://btcmap.org
VITE_BTCMAP_ENABLED=true
VITE_APP_URL=http://localhost:5173
```

Restart `npm run dev`. Demo login button **disappears** when real Supabase URL is set.

---

## 2. Cloudflare Pages env vars

### Dashboard (manual)

Cloudflare → Workers & Pages → **katoa** → Settings → Environment variables

Add for **Production** and **Preview**:

| Variable | Value |
|----------|--------|
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | anon key |
| `VITE_BTCMAP_API_URL` | `https://api.btcmap.org` |
| `VITE_BTCMAP_APP_URL` | `https://btcmap.org` |
| `VITE_BTCMAP_ENABLED` | `true` |
| `VITE_APP_URL` | `https://katoa.org` |

### Wrangler script (automated)

```bash
export VITE_SUPABASE_URL="..."
export VITE_SUPABASE_ANON_KEY="..."
export VITE_BTCMAP_API_URL="https://api.btcmap.org"
export VITE_BTCMAP_APP_URL="https://btcmap.org"
export VITE_BTCMAP_ENABLED="true"
chmod +x scripts/cloudflare-pages-env.sh
./scripts/cloudflare-pages-env.sh
```

Redeploy after env changes.

---

## 3. BTC Map integration

| Piece | Status |
|-------|--------|
| BTC Map embed (merchants) | Live on Explore → Show Map |
| Katoa pin overlay (Leaflet) | Orange pins from `mergeKatoaPinsWithMap()` |
| API areas count | `fetchBTCMapAreas()` via `api.btcmap.org` |
| Local dev proxy | Vite `/btcmap-api-proxy` → api.btcmap.org |

### Optional: local btcmap-api

```bash
git clone https://github.com/teambtcmap/btcmap-api.git ~/projects/btcmap-api
cd ~/projects/btcmap-api && cargo run   # binds 127.0.0.1:8000
```

In katoa `.env.local`:

```env
VITE_BTCMAP_API_URL=/btcmap-api-proxy
```

Add to `vite.config.ts` proxy target `http://127.0.0.1:8000` when using local API.

---

## 4. Preview login (no Supabase yet)

1. Open `http://localhost:5173/auth`
2. Click **Preview as Demo User →**
3. Lands on `/dashboard` as `demo_creator`

Demo state is `sessionStorage` only — sign out clears it. Real sign-up works once Supabase env is set.

---

## 5. Real user login (after Supabase)

1. `/auth` → **Sign up** with email + username + password (6+ chars)
2. If email confirm is ON, click link in inbox first
3. **Sign in** → redirects to `/dashboard`
4. Google / Nostr require provider setup in Supabase + extensions

---

## 6. Kimi checklist after Supabase goes live

# ✅ done - 24 migrations pushed — all migrations applied
# ✅ done - 7 vars on prod + preview
# ✅ done - builds clean
# ✅ done - tested on prod
  ✅ done - BTC Map + pins on Explore → Show Map shows BTC Map + Katoa pins
# ✅ done - preview + production deployed URL, smoke test
# ✅ done - katoa.org live → katoa.org
# ✅ done - ref files updated handoff + `docs/GROK-HANDOFF.md` with project ref (no secrets)

---

## 7. Troubleshooting

| Problem | Fix |
|---------|-----|
| Auth fails / network error | Check `VITE_SUPABASE_URL` not `placeholder` |
| Demo button still shows | Real URL in `.env.local`? Restart dev server |
| Map empty pins | Mock wishlists have lat/lon — toggle Show Map on Explore |
| Google OAuth redirect error | Add exact redirect URL in Supabase + Google Console |
| RLS errors on insert | User must be signed in; profile row created on sign-up |
| Build fails on CF | Run `sed` on `dist/index.html` crossorigin strip |

---

## 8. File map for agents

| Path | Purpose |
|------|---------|
| `supabase/migrations/` | 24 SQL migrations — run via `supabase db push` |
| `src/types/database.ts` | Staged types — replace with `database.generated.ts` |
| `src/lib/btcmap.ts` | BTC Map API + pin merge |
| `src/lib/demoAuth.ts` | Preview login without DB |
| `scripts/setup-supabase.sh` | One-shot DB provision |
| `scripts/cloudflare-pages-env.sh` | Push VITE_* to Cloudflare |

**Tagline:** Keep All That's Owed Always.