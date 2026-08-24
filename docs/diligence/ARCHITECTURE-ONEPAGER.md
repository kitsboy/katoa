---
title: Technical Architecture One-Pager
project: Katoa
version: 1.1.7
audience: developers, technical partners
last_updated: 2026-08-24
owner: Kimi (Orchestrator) + Grok (M3)
self_evolving: true
update_rule: >
  Any material change to product, stack, deploy path, traction, or ask
  MUST update this file in the same PR/commit when possible.
  Weekly freshness target: score >= 7 (see nova-product-management).
tags: [diligence, pitch, mvp, giveabit]
---
# Katoa — Technical Architecture One-Pager

**Live:** https://katoa.org · **Repo:** https://github.com/kitsboy/katoa · **Version:** `1.1.7` · **Product HEAD:** `6f43b74`

## Stack
React 18 / TypeScript / Vite / Tailwind v3 · React Router v6 · Supabase (Postgres, Auth, Storage, RLS) · Lightning Address + on-chain wallets · nostr-tools (NIP-07 **check**) · MapLibre + OpenFreeMap · i18n (en es pt fr de ja zh) · Cloudflare Pages

## System map (boxes)
```
[User browser]
     |
     v
[SPA / static app on Cloudflare Pages]
     |
        +--------+--------+
        |                 |
        v                 v
[Supabase Auth/RLS]   [Creator Lightning / on-chain dest]
        |
        v
[Optional: BTCPay webhook Edge Function — code exists, not claimed live]
```

## Architecture notes
- SPA frontend for campaigns/wishlists/public profiles (`/u/:username`)
- Payments: creator-controlled Lightning + on-chain addresses. Gift dest picker: `src/lib/creatorProfile.ts` (`pickReceiveDestinations` — **wallet Lightning wins** over stale `profiles.lightning_address`)
- Dummy example addresses rejected (`isDummyPaymentTarget`)
- Nostr: extension check/link until NIP-07 challenge Edge Function
- Subscribe / PPV / likes / comments / seen: **localStorage seams**
- Client never sets `confirmed` / `sats_raised` from a gift close
- Night-jewel UI: live CSS `#0e0a18` / `#160e24`

## Deploy path
Build → Cloudflare Pages project `katoa` (`npm run build` → `dist/`). GitHub push may auto-build; confirm hard-refresh after `6f43b74`. Prefer `wrangler pages deploy dist/ --project-name katoa` if Pages lags.

## Data & privacy posture
Prefer client-side and user-held keys. Minimize PII. No KYC product. Bitcoin rails where payments exist. No `VITE_` payment secrets.

## MVP boundary
- **In MVP now:** Auth (email/Google), editable wallets, public profiles, gift/tip QR to saved Lightning, wishlists, fee comparison, night-jewel chrome, SPA 404, legal URLs, 7 languages.
- **Explicitly later:** Live BTCPay/LND E2E webhook, NIP-07 session, Silent Payments/BIP-47, BOLT12 recurring as a product, paid unlocks.

## Dependencies
Creator Lightning receivers; optional BTCPay on THOR; Nostr relays; Supabase

## How a technical helper starts (15 min)
```bash
git clone https://github.com/kitsboy/katoa.git
cd katoa
npm install
npm run dev
```
Read `README.md`, `docs/DESIGN.md`, `docs/EXECUTIVE-SUMMARY.md`, and this file.

## Known gaps (full disclosure)
See Investor one-pager risks + `docs/KIMI-HANDOFF.md` + `docs/NEXT-NEEDS-CAM.md`. Do not claim production Lightning invoices without webhook confirmation.

## Related
- [Investor one-pager](./INVESTOR-ONEPAGER.md)
- [Ask sheet](./ASK-SHEET.md)
- Deeper docs: `docs/ARCHITECTURE.md`, `docs/DESIGN.md`, `docs/KIMI-HANDOFF.md`

---
**Safe Harbour:** Educational / informational only. Not financial, legal, or investment advice.
Bitcoin involves risk. DYOR. Not your keys, not your cheese.
Part of the [Give A Bit](https://giveabit.io) family.
