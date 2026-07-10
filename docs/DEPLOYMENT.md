# Deployment — KATOA

**Production:** https://katoa.org  
**Pages URL:** https://katoa.pages.dev  
**GitHub:** https://github.com/kitsboy/katoa (`main`)  
**Host:** **Cloudflare Pages only** (project name: `katoa`) — do **not** use Netlify  

### Deploy (manual — preferred)

```bash
export CLOUDFLARE_API_TOKEN=…   # Pages:Edit (e.g. source motopass/.env.local)
cd ~/projects/katoa
npm run build
sed -i '' 's/ crossorigin//g' dist/index.html
npx wrangler pages deploy dist/ --project-name katoa --branch main --commit-dirty=true
```

### Env (Cloudflare Pages → Settings → Environment variables)

Client-safe only: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_BTCMAP_*`, `VITE_APP_URL`, `VITE_SITE_URL`.  
**Never** put service role keys or BTCPay API/webhook secrets in Pages env.

### Database

```bash
npm run db:push   # supabase migrations including security hardening
```

See `docs/KIMI-HERMES-OPS.md` and `docs/KIMI-HANDOFF.md` for ops detail.
