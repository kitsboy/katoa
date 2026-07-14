# KATOA — Executive Summary

**Date:** 2026-07-06  
**Project:** KATOA (katoa.org)  
**Version:** 1.1.0  
**Status:** Live MVP · charcoal/glass UI complete · 200 frontend improvements shipped · Supabase + Cloudflare staged
**Ecosystem:** [Give A Bit](https://giveabit.io) — Bitcoin sovereignty tools for private, feel-good giving  
**License:** MIT (open source)

> **5-minute read.** For pitch copy see [`MARKETING.md`](./MARKETING.md). For visuals see [`marketing/KATOA-Marketing-Presentation.pdf`](./marketing/KATOA-Marketing-Presentation.pdf).

---

## Elevator pitch

**KATOA** (*Keep All That's Owed Always*) is a zero-fee, privacy-first creator support platform built natively on **Bitcoin Lightning** and **Nostr**.

It turns “I want to help this person or project” into an instant, borderless payment where the recipient **keeps 100%** — no platform skim, no bank gatekeepers, no seven-day payout holds.

**One line:** *Zero fees. Instant Bitcoin. 195+ countries. Creators keep everything.*

---

## The problem (why now)

The creator economy runs on rent extraction:

| Platform | Typical take | Friction |
|----------|--------------|----------|
| OnlyFans | ~20% | Bank + KYC, 7-day holds, deplatforming risk |
| Throne | ~10% | Limited countries for low fees |
| Linktree | 9–10% or **$40/mo** | Payment processor dependency |
| Kickstarter / Indiegogo | 5%+ plus fulfillment | Slow settlement, geographic limits |

**Billions of dollars** never reach the people doing the work. Millions more **cannot participate at all** — unbanked, sanctioned, or censored creators are locked out of legacy rails.

Givers want to send real value **directly and privately**. Instead they get surveillance-heavy checkout flows and opaque fees.

---

## The KATOA answer

| Dimension | KATOA |
|-----------|-------|
| Platform fees | **0% — forever** (architectural invariant) |
| Settlement | **Seconds** via Lightning Network |
| Geography | **195+ countries** — permissionless Bitcoin rails |
| Banking / KYC | **Not required** to receive support |
| Identity | **Nostr-native** — your keys, your profile |
| Code | **MIT open source** — auditable, forkable |
| Design | Dark glass UI, live Bitcoin data, mobile-first |

**For creators:** You keep what you're owed. You own the relationship with supporters. You can live anywhere and still get paid.

**For givers:** Almost every sat reaches the person you care about — fast, private, without a 30% “processing” black hole.

---

## What is built today (July 2026)

### Product (live at katoa.org)

- **Full SPA:** 17 lazy-loaded routes including Pitch, WishlistRoute (`/wishlist/:slug`), 404
- **Modern UI:** Charcoal/glass across all pages; motion hero (`HeroOverlayCard`, `HeroMotionBackground`); floating island navbar; redesigned Footer
- **UX infrastructure:** Toast, ConfirmDialog, PageMeta (dynamic OG), Breadcrumbs, EmptyState, PWA v2, `npm run sitemap`
- **Education & conversion:** Fee comparison calculator with URL-synced params, earnings slider, platform comparison tables
- **Bitcoin surface area:** QR codes, Lightning addresses, on-chain support, live price strip (footer + navbar), BTC Map integration
- **Nostr:** NIP-07 login, profile sync, wishlist publishing (NIP-78), encrypted messaging foundations
- **i18n:** 7 languages via `LanguageContext` + `pageStrings`; Intl formatting in `SatsDisplay`

### Engineering

| Layer | Stack |
|-------|-------|
| Frontend | React 18, TypeScript, Vite, Tailwind v3 |
| Routing | React Router DOM v6 (clean URLs) |
| Backend | Supabase (Postgres, Auth, Storage, RLS) |
| Bitcoin / social | nostr-tools, Leaflet (BTC Map), mempool APIs |
| Hosting | Cloudflare Pages (katoa.org) |
| Design system | [`docs/DESIGN.md`](./DESIGN.md) |

### Data model (high level)

Profiles · Wishlists · Items · Contributions · Projects · Follows · Wallet addresses · Payment methods · Media · Notifications — all protected by **Row Level Security**.

### Staged / in flight

- Supabase migrations + Google OAuth (HERMES/Kimi ops runbook)
- Demo auth preview when Supabase is not configured
- BTCPay Server end-to-end invoice flow (foundation exists; production wiring next)
- Full type generation from linked Supabase project

---

## Strategic positioning

**Category:** Sovereign creator infrastructure — not another rent-seeking “creator platform.”

**Differentiators that matter:**

1. **0% is a promise, not a promo** — no billing tables, no take-rate logic in the architecture  
2. **Bitcoin-first** — Lightning is the default mental model, not an add-on  
3. **Nostr as distribution** — identity and wishlists can live beyond the app  
4. **Radical transparency** — in-app fee math, open source, live network widgets  
5. **Give A Bit alignment** — mission, tone, and ecosystem credibility

**Primary audiences:** Independent creators, activists, mutual-aid organizers, unbanked or censored builders, Bitcoin/Nostr natives, future agent-driven campaigns.

**Not primary (yet):** Enterprise compliance suites, traditional e-commerce at scale.

---

## Business model (explicit)

**Platform revenue from creators: $0.**

Sustainability paths (aligned with FOSS + mission):

- Voluntary Bitcoin donations (footer / open-source support)
- Future optional self-hosted or premium *infrastructure* services — never a % skim on creator earnings
- Ecosystem cross-promotion via Give A Bit

The marketing and product must never introduce hidden rent. See [`MARKETING.md`](./MARKETING.md) § Risks.

---

## Competitive snapshot ($10k/month creator)

| Platform | Approx. annual fees lost |
|----------|-------------------------|
| OnlyFans | ~$24,000 |
| Throne | ~$12,000 |
| Linktree | ~$10,800 + subscription |
| **KATOA** | **$0** |

Drive prospects to `/comparison` and the live calculator — let the math close.

---

## Documentation map (start here)

| Doc | Purpose |
|-----|---------|
| [`EXECUTIVE-SUMMARY.md`](./EXECUTIVE-SUMMARY.md) | This file — leadership & handoff |
| [`MARKETING.md`](./MARKETING.md) | Pitch, messaging, CTAs, campaigns |
| [`marketing/KATOA-Marketing-Presentation.pdf`](./marketing/KATOA-Marketing-Presentation.pdf) | Embellished slide deck |
| [`DESIGN.md`](./DESIGN.md) | Tokens, components, UI rules |
| [`GROK-HANDOFF.md`](./GROK-HANDOFF.md) | Developer quick-start |
| [`KIMI-HERMES-OPS.md`](./KIMI-HERMES-OPS.md) | Supabase + Cloudflare ops |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Technical deep dive |
| [`ROADMAP.md`](./ROADMAP.md) | Implementation phases |
| [`MISSION.md`](./MISSION.md) | Purpose & values |

---

## Prioritized next steps

1. **BTCPay production wiring** — webhooks, invoice polling, mainnet path  
2. **Supabase live** — migrations applied, Google Auth, Cloudflare env vars  
3. **Real usage proof** — first creators with live wishlists and settled sats  
4. **Test coverage** — nostr, parsers, auth critical paths  
5. **Privacy depth** — PayNyms, BOLT12 subscriptions, PYNYM roadmap  
6. **Growth polish** — notifications, contributor UX, email (privacy-first)

---

## Success metrics

- Creators onboarded with public wishlists  
- Confirmed sats flowing (DB-tracked contributions)  
- **Zero platform fees upheld** — by design and by governance  
- Nostr adoption (linked pubkeys, published lists)  
- First end-to-end BTCPay Lightning invoice on katoa.org  
- Qualitative: *“I received the full amount instantly”*

---

## Risks (honest)

| Risk | Mitigation |
|------|------------|
| “0% forever” promise | Architectural + cultural commitment; document in MISSION |
| BTCPay not fully live | Market what works today (addresses, QR, Nostr); transparent roadmap |
| Early-stage social proof | Lean on open source, live widgets, comparison math |
| ExplorePage bundle size | Lucide chunk ~698KB — further tree-shaking needed |

---

## Safe harbour

This project is provided for educational and informational purposes. Nothing herein constitutes legal, financial, or investment advice. Use at your own risk.

**© Give A Bit — Bitcoin sovereignty first.**

---

*KATOA — Keep All That's Owed Always. The platform that actually serves creators.*

---
**Diligence pack:** [docs/diligence/](../diligence/) (investor + architecture + ask)
