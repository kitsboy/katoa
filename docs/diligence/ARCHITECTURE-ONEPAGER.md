---
title: Technical Architecture One-Pager
project: Katoa
version: 1.0.0
audience: developers, technical partners
last_updated: 2026-07-13
owner: Kimi (Orchestrator) + Nova (Docs)
self_evolving: true
update_rule: >
  Any material change to product, stack, deploy path, traction, or ask
  MUST update this file in the same PR/commit when possible.
  Weekly freshness target: score >= 7 (see nova-product-management).
tags: [diligence, pitch, mvp, giveabit]
---
# Katoa — Technical Architecture One-Pager

**Live:** https://katoa.org · **Repo:** https://github.com/kitsboy/katoa · **Version:** `1.0.0`

## Stack
React/Vite · Lightning Address/LNURL · Nostr NIP-07/78 · i18n · Cloudflare Pages

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
[Public APIs / LN / Nostr / OTS]   [Optional M3/M4 services]
```

## Architecture notes
- SPA frontend for campaigns/wishlists
- Payments via Lightning address / LNURL (BTCPay wiring in progress)
- Nostr auth + profile/wishlist publish paths
- Client-heavy; payment rails external
- Multi-language UI

## Deploy path
Build → wrangler pages deploy dist/ --project-name katoa

## Data & privacy posture
Prefer client-side and user-held keys. Minimize PII. Bitcoin rails where payments exist. See project privacy/security docs if present.

## MVP boundary
- **In MVP now:** Campaign UX, LN receive surfaces, Nostr hooks, fee comparison education.
- **Explicitly later:** Live BTCPay E2E, Silent Payments/BIP-47, mobile, agent funding flows.

## Dependencies
Lightning receivers; optional BTCPay; Nostr relays

## How a technical helper starts (15 min)
```bash
git clone https://github.com/kitsboy/katoa.git
cd katoa
# typically:
npm install
npm run dev
```
Read `README.md`, `docs/DEPLOYMENT.md` (or `DEPLOY.md`), and this file.

## Known gaps (full disclosure)
See Investor one-pager risks + project `LATEST-UPDATE.md` / handoffs. Do not claim production hardness without tests/deploy verification.

## Related
- [Investor one-pager](./INVESTOR-ONEPAGER.md)
- [Ask sheet](./ASK-SHEET.md)
- Deeper docs: `docs/ARCHITECTURE.md` (if present), `SOURCE-OF-TRUTH.md`, `docs/.ai_docs/`

---
**Safe Harbour:** Educational / informational only. Not financial, legal, or investment advice.
Bitcoin involves risk. DYOR. Not your keys, not your cheese.
Part of the [Give A Bit](https://giveabit.io) family.
