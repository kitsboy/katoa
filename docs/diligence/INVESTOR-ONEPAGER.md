---
title: Investor / Partner One-Pager
project: Katoa
version: 1.1.7
audience: investors, partners, grants
last_updated: 2026-08-24
owner: Kimi (Orchestrator) + Grok (M3 docs)
self_evolving: true
update_rule: >
  Any material change to product, stack, deploy path, traction, or ask
  MUST update this file in the same PR/commit when possible.
  Weekly freshness target: score >= 7 (see nova-product-management).
tags: [diligence, pitch, mvp, giveabit]
---
# Katoa — Investor / Partner One-Pager

**Live:** [https://katoa.org](https://katoa.org) · **GitHub:** [https://github.com/kitsboy/katoa](https://github.com/kitsboy/katoa) · **Version:** `1.1.7` · **Status:** LIVE · **Product HEAD:** `6f43b74`

## One sentence
Zero-fee Bitcoin Lightning creator support. Keep 100%.

## ELI16 (spoken)
Share a link. Get paid in Bitcoin. Keep it. Katoa is a profile + wishlist you control. Supporters send sats over Lightning to *your* wallet. Platform fee is 0% forever. No bank, no KYC. For an investor: a creator economy not rented from Visa. For a 25-year-old with a following or a night shift: the old internet takes 10–20%; this one doesn’t.

Full pitch: [`docs/EXECUTIVE-SUMMARY.md`](../EXECUTIVE-SUMMARY.md) · deck: [`docs/marketing/KATOA-Marketing-Presentation.pdf`](../marketing/KATOA-Marketing-Presentation.pdf)

## Problem
Creator platforms take 10–20%, need banks/KYC, delay payouts, and can deplatform.

## Solution
Wishlists + public profiles with Lightning and on-chain addresses the creator controls; optional Nostr; 0% platform rent. Non-custodial: Katoa never holds funds.

## Who it's for
Independent creators worldwide; students, waitstaff, tutors, musicians; supporters who want direct Lightning giving.

## Stage
Live SPA MVP — night-jewel UI, honest auth (email/Google), editable wallets, solid `/u/:username`, gift QR follows saved Lightning. Production invoice webhook is the remaining money rail.

## Traction (honest)
Live katoa.org; feature-rich UI; **11 demo creators** in sample `metrics.json` (`demo: true`). Never “thousands.” BTCPay webhook **code** exists; settlement is not claimed live.

## Model / value flow
0% platform fees forever; optional tips/donations to project ops separately. Never a % skim on creator earnings.

## Why Give A Bit
Part of an interlocking Bitcoin-sovereignty suite. Shared brand, Safe Harbour, open-source default, and cross-product rails (Lightning, Nostr) compound each product.

## 90-day north star (default)
First **settled** sats on production Lightning; confirm CF Pages on current `main`; keep diligence docs green; seed real creators (not the demo catalog).

## Risks & mitigations
| Risk | Mitigation |
|------|------------|
| Payment rail incomplete until webhook live | Gifts already point at creator Lightning addresses; never fake `confirmed` in the browser |
| Subscribe / PPV are local seams | Labeled demo until THOR webhook + `subscriptions` row |
| Spam / abuse without KYC | Rate limits, reputation, optional proofs |

## The ask (default — refine per conversation)
Lightning/BTCPay integrators; creator distribution partners; first real creators with settled sats.

## Demo path (60 seconds)
1. Open https://katoa.org
2. Sign up (email/Google) → add a Lightning address → open `/u/:username` → Tip shows that address
3. Point to this pack: `docs/diligence/` and the PDF deck

## Related pack files
- [Architecture one-pager](./ARCHITECTURE-ONEPAGER.md)
- [Ask sheet](./ASK-SHEET.md)
- [Pack index](./README.md)
- Portfolio: [Family of 8](https://github.com/kitsboy/giveabit/blob/main/docs/diligence/PORTFOLIO-FAMILY-OF-8.md)

---
**Safe Harbour:** Educational / informational only. Not financial, legal, or investment advice.
Bitcoin involves risk. DYOR. Not your keys, not your cheese.
Part of the [Give A Bit](https://giveabit.io) family.
