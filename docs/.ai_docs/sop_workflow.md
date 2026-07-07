# katoa — Standard Operating Procedure

## Build
```bash
cd ~/projects/katoa && npm run build
```

## Dev Server
```bash
cd ~/projects/katoa && npm run dev
```

## Pre-Deploy Checks
```bash
cd ~/projects/katoa && git status && npm run build
```
## Deploy (Manual — wrangler from M4)
### Step 1: Sync dist from M3 to M4
```bash
rsync -avz --delete ~/projects/katoa/dist/ m4:~/tmp-katoa-dist/
```

### Step 2: On M4, deploy
```bash
wrangler pages deploy ~/tmp-katoa-dist/ --project-name katoa
```

## Post-Deploy Verify
```bash
curl -s ## Stack\n| Layer | Technology |\n|-------|-----------|\n| Frontend | React + TypeScript |\n| Styling | Tailwind CSS |\n| Database | Supabase (PostgreSQL) |\n| Auth | Google OAuth |\n| i18n | 7 languages |\n\n## Ports\n| Service | Port |\n|---------|------|\n| Dev server | 5173 |\n\n## External Services\n| Service | Purpose |\n|---------|---------|\n| Supabase | Auth, database |\n| Google OAuth | User auth |\n| BTCPay | Lightning payments (planned) |\n\n## Hosting\nCloudflare Pages manual deploy — katoa.org | grep -q 'katoa'
```
