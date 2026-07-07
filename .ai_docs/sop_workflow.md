# Katoa — Standard Operating Procedures (SOP)

> **Project:** Katoa — Privacy-First Zero-Fee Bitcoin Commerce Platform
> **Stack:** TypeScript + React 18 + Vite 5 + Tailwind CSS 3 + Supabase
> **Domain:** https://katoa.org
> **Deploy Target:** Cloudflare Pages

---

## 1. Prerequisites

| Dependency | Version (minimum) | Check |
|---|---|---|
| Node.js | >= 18 | `node --version` |
| npm | >= 9 | `npm --version` |
| Docker (Supabase local) | latest | `docker --version` |
| Supabase CLI | latest | `supabase --version` |
| Cloudflare Wrangler (deploy) | latest | `npx wrangler --version` |

Install project dependencies:

```bash
npm install
```

---

## 2. Development Server

```bash
npm run dev
```

- Starts Vite dev server on **http://localhost:5173**
- Hot Module Replacement (HMR) enabled
- **Vite proxy** rewrites `/btcmap-api-proxy/*` → `https://api.btcmap.org` (strips prefix)
- No separate backend server — services are Supabase (remote) + BTC Map API (proxied)

### Dev proxy configuration

From `vite.config.ts`:

```
/btcmap-api-proxy → https://api.btcmap.org (changeOrigin: true, strip prefix)
```

Use `VITE_BTCMAP_API_URL=/btcmap-api-proxy` in `.env.local` to route BTC Map API through the local proxy instead of hitting the remote directly (useful for rate-limit testing or offline dev).

### Environment files

| File | Purpose | Committed? |
|---|---|---|
| `.env.example` | Template with all keys documented | Yes |
| `.env.local` | Local dev secrets (Supabase ANON key) | No (gitignored) |
| `.env.server.local` | Server-only secrets (SERVICE_ROLE key) | No (gitignored) |

---

## 3. Build

```bash
npm run build
```

- Output directory: `dist/`
- Vite bundles with code splitting into manual chunks:
  - `vendor` — `react`, `react-dom`
  - `supabase` — `@supabase/supabase-js`
  - `nostr` — `nostr-tools`
  - `ui` — `lucide-react`
- Tailwind CSS purged against `./index.html` and `./src/**/*.{js,ts,jsx,tsx}`
- TypeScript compilation via `tsc` (noEmit) is NOT part of `build` — run separately

---

## 4. TypeScript Type Checking

```bash
npm run typecheck
```

- Runs: `tsc --noEmit -p tsconfig.app.json`
- Targets `src/` directory only (excludes node_modules, dist)
- Strict mode enabled (noUnusedLocals, noUnusedParameters, noFallthroughCasesInSwitch)
- Run before committing to catch type errors

---

## 5. Supabase Setup & Database

### Link project (one-time)

```bash
supabase link --project-ref pglqjtipbocjnqmiwmwf
```

Requires Supabase CLI authentication (`supabase login`).

### Push migrations & sync types

```bash
npm run db:setup
```

This runs two commands sequentially:
1. `supabase db push` — applies all pending migrations from `supabase/migrations/`
2. `npm run db:types` — regenerates `src/types/database.generated.ts`

Individual commands also available:

```bash
npm run db:push        # Push migrations only
npm run db:types       # Regenerate TypeScript types only
```

### Migration notes

- 24 migration files in `supabase/migrations/` (dated from 2025-10-27 to 2026-07-01)
- Schema covers: wishlists, wishlist items, profiles, wallets, payment methods, social feed, following system, categories/tags, contributions/leaderboards, projects, project follows, media, auth (including Google OAuth)
- Supabase project ref: `pglqjtipbocjnqmiwmwf`

### Supabase local config (`supabase/config.toml`)

- API port: 54321
- DB port: 54322
- Studio port: 54323
- Auth site URL: `http://localhost:5173`
- Additional redirect URLs: `http://localhost:5173/dashboard`, `https://katoa.org/dashboard`
- DB major version: 15

---

## 6. Lint

```bash
npm run lint
```

- Runs: `eslint .`
- Ignores `dist/` directory
- Rules: TypeScript strict + recommended, React Hooks rules, React Refresh warnings
- Files checked: `**/*.{ts,tsx}` (TypeScript only)

---

## 7. Preview Production Build

```bash
npm run preview
```

- Serves the `dist/` directory locally via Vite preview server
- Use this to verify the production build before deploying

---

## 8. Deploy to Cloudflare Pages

### Auto-deployment

Push to the `main` branch — Cloudflare Pages auto-deploys.

### Manual env push

```bash
bash scripts/cloudflare-pages-env.sh
```

Sets environment variables from `.env.local` on Cloudflare Pages project `katoa` (both production and preview environments).

### Sensible defaults for client env vars

| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://pglqjtipbocjnqmiwmwf.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_*` (publishable key, NOT secret) |
| `VITE_BTCMAP_API_URL` | `https://api.btcmap.org` or `/btcmap-api-proxy` for local dev |
| `VITE_BTCMAP_APP_URL` | `https://btcmap.org` |
| `VITE_BTCMAP_ENABLED` | `true` |
| `VITE_APP_URL` | `https://katoa.org` (dev: `http://localhost:5173`) |
| `VITE_APP_NAME` | `KATOA` |

### Cloudflare Pages configuration

- Project name: `katoa`
- Build command: `npm run build`
- Build output: `dist/`
- SPA routing: handled by `public/_redirects` (`/* /index.html 200`)
- Security headers: in `public/_headers` (HSTS, X-Frame-Options, CSP, etc.)
- Static asset caching: 1 year immutable for `/assets/*`, images

### Legacy Netlify config

An archived `archive/netlify.toml` exists but the project has migrated to Cloudflare Pages.

---

## 9. Quick Reference

```bash
npm install           # Install dependencies
npm run dev           # Start dev server on :5173
npm run build         # Production build → dist/
npm run typecheck     # TypeScript check (strict)
npm run lint          # ESLint
npm run db:setup      # Push migrations + regenerate types
npm run preview       # Preview production build
```

## 10. Common Pitfalls

1. **ANON key must be publishable** — Never use `sb_secret_*` key in client env vars. The CLI script `cloudflare-pages-env.sh` will reject it.
2. **Proxy for local BTC Map** — Set `VITE_BTCMAP_API_URL=/btcmap-api-proxy` in `.env.local` to route through Vite proxy. The remote `https://api.btcmap.org` works too but may have rate limits.
3. **Typecheck is separate from build** — `npm run build` does NOT type-check. Always run `npm run typecheck` before committing.
4. **Supabase CLI needs Docker** — `supabase db push` requires Docker running locally.
5. **Lucide React optimization** — `lucide-react` is excluded from Vite's dep optimization (`optimizeDeps.exclude`) to avoid tree-shaking issues.
