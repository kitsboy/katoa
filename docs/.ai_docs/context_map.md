# katoa — Context Map

**Last updated:** 2026-07-06

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Router | React Router DOM v6 (lazy-loaded pages) |
| Styling | Tailwind CSS (charcoal/glass design system) |
| Database | Supabase (PostgreSQL, cloud-hosted) |
| Auth | Supabase + Google OAuth + Nostr NIP-07 |
| i18n | `LanguageContext` — 7 languages + `pageStrings` |
| Payments | BTCPay Server (wiring in progress) |
| Identity | Nostr |

## Ports

| Service | Port |
|---------|------|
| Dev server | 5173 |
| Supabase | Cloud-hosted (project: pglqjtipbocjnqmiwmwf) |

## Key Architecture

- Zero-fee Bitcoin Lightning creator support
- 17 lazy-loaded routes, 57 components
- Floating island navbar (`.nav-island`), motion hero (`HeroOverlayCard`)
- Toast + ConfirmDialog (no native dialogs)
- PWA service worker v2 (`public/sw.js`)
- Mobile-first responsive design

## Removed (2026-07-06)

- `BitcoinPulse.tsx`, `ProtocolUpdates.tsx`, `LightningField.tsx`

## External Services

| Service | Purpose |
|---------|---------|
| Supabase | Auth, database, realtime |
| Google OAuth | User sign-in |
| BTCPay | Lightning payment processing (pending) |
| CoinGecko | BTC price (cached client) |

## Hosting

Cloudflare Pages — auto-deploy on `main` push
Custom domain: https://katoa.org
Last commit: `c65d1ed`

## Scripts

```bash
npm run dev | build | preview | typecheck | lint | sitemap
```

## Doc index

`docs/README.md` — full documentation map