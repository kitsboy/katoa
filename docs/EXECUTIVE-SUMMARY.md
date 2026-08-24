# KATOA — Executive Summary

**Date:** 2026-08-24  
**Project:** KATOA (katoa.org)  
**Version:** 1.1.7  
**Product HEAD:** `6f43b74` — *fix: gift/tip Lightning follows the saved wallet address*  
**Status:** Live product SPA · night-jewel visual era · Cloudflare Pages  
**Ecosystem:** [Give A Bit](https://giveabit.io) — Bitcoin sovereignty tools for private, feel-good giving  
**License:** MIT (open source)  
**Source:** [github.com/kitsboy/katoa](https://github.com/kitsboy/katoa)

> **5-minute read.** Pitch copy: [`MARKETING.md`](./MARKETING.md). Visuals: [`DESIGN.md`](./DESIGN.md) · deck [`marketing/KATOA-Marketing-Presentation.pdf`](./marketing/KATOA-Marketing-Presentation.pdf) · HTML source [`marketing/katoa-presentation.html`](./marketing/katoa-presentation.html).

---

## Elevator pitch

**KATOA** (*Keep All That's Owed Always*) is a **0% PLATFORM-fee** creator support surface on **Bitcoin Lightning**, with **Nostr optional**. Supporters send value directly to wallets the creator controls. The platform never takes a cut — forever.

It turns “I want to help this person or project” into a borderless payment where the recipient **keeps 100%** of what they are owed (minus tiny network fees, never a Katoa skim).

**One line:** *Zero fees. Bitcoin Lightning. 195+ countries. Creators keep everything.*

---

## ELI16 pitch (investor / 25-year-old user)

*Canonical spoken pitch from 2026-08-24. Use this for investors, waitstaff, students, and anyone who should get it in under a minute.*

Katoa is a place where you can get paid directly in Bitcoin — from anywhere, without a bank, a middleman, or a 20% “platform cut.” You make a page (a profile plus wishlists of things you need or want), share the link, and people send you sats over Lightning. That’s the same idea as a tip jar, a GoFundMe, or a subscribe button, except the money is meant to land in *your* wallet, and Katoa’s fee is **0%**. Forever. You’re not waiting a week for PayPal. You’re not handing a fifth of your tips to a corporation.

If you’re a student, a waitress, a musician, a skater, a tutor — anyone with fans, regulars, or a community — you sign up with email or Google (Nostr is optional if you’re into that). You add your own Lightning or Bitcoin address. You put up a profile people can actually use: tip, follow, message, subscribe, fund a wishlist item, or buy something from a product link. Supporters scan a QR, tap their wallet, done. Katoa never holds your money and does not KYC you. That’s the point: private, global, and you keep 100%.

The cool bits are the ones that make that feel real instead of “crypto homework.” Lightning is coffee-money speed on rails that work in 195+ countries with no bank account. Wishlists turn “I need rent / gear / a skate ramp” into a clear list with progress bars. Creator profiles look like a modern feed — posts, tips, tiers — without the platform owning you. There’s a map of Bitcoin-accepting places, seven languages, and you’re part of Give A Bit, not a random app. Under the hood it’s open source, so anyone can audit that the 0% claim isn’t a marketing trick.

You’d use it because the old internet taxes the people doing the work. Large subscription apps take ~20%. Link-in-bio tools take a slice or a monthly fee. Banks freeze, delay, or lock out whole countries. Katoa is the opposite bet: if someone wants to support you, almost every sat should reach you, on terms you control. For an investor, that’s a creator economy that isn’t rented from Visa and app stores. For a 25-year-old with a following or a night shift, it’s simpler: share a link, get paid, keep it.

### Honest today (do not skip this box)

| Claim in the story | Product truth |
|--------------------|---------------|
| “Get paid in Bitcoin” | Gifts/tips open the creator’s **saved Lightning or on-chain address** (wallet row wins over a stale profile field). Katoa never holds funds. |
| “Instantly / seconds” | Lightning **path**. Production invoice → webhook → `confirmed` is **not live** until THOR deploys it. Browser never fakes settlement. |
| “Subscribe / PPV / likes / comments” | **Client-local seams**, labeled demo, until Lightning webhook + Nostr. |
| “Nostr login” | Extension **check / link**, not a session. Email + Google are the real register path. |
| “Thousands of creators” | **False.** Sample catalog: **11** creators, `metrics.json` `demo: true`. |

---

## The problem (why now)

The creator economy runs on rent extraction:

| Platform | Typical take | Friction |
|----------|--------------|----------|
| Large subscription platforms | ~20% | Bank + KYC, multi-day holds, deplatforming risk |
| Wishlist / gifting apps | ~10% | Limited countries for low fees |
| Link-in-bio | 9–10% or **$40/mo** | Payment processor dependency |
| Crowdfunding | 5%+ plus fulfillment | Slow settlement, geographic limits |

Billions of dollars never reach the people doing the work. Millions more **cannot participate at all** — unbanked, sanctioned, or censored creators are locked out of legacy rails.

Givers want to send real value **directly and privately**. Instead they get surveillance-heavy checkout and opaque fees.

---

## The KATOA answer

| Dimension | KATOA |
|-----------|-------|
| Platform fees | **0% — forever** (architectural invariant; no take-rate tables) |
| Settlement intent | **Bitcoin Lightning** to creator-controlled destinations (non-custodial) |
| Geography | **195+ countries** — permissionless Bitcoin rails |
| Banking / KYC | **Not required** to receive support |
| Identity | **Nostr optional** — your keys, your profile |
| Code | **MIT open source** — auditable, forkable |
| Design | **Night-jewel** — live CSS `#0e0a18` / `#160e24`; DESIGN plum `#12081c` / ember `#080510`. Violet product, bitcoin-orange money |

**For creators:** You keep what you're owed. You own the relationship with supporters. You can live anywhere and still get paid.

**For givers:** Almost every sat reaches the person you care about — without a 30% “processing” black hole.

---

## What is built today (24 August 2026)

### Product (live at [katoa.org](https://katoa.org))

- **Full SPA:** ~29 lazy-loaded page modules (Home, Explore, Creators, public `/u/:username` profiles, wishlists, dashboard, pricing, comparison, security, templates, press, meetup, case studies, guidelines, legal, pitch, 404, and more)
- **Night-jewel UI:** Deep plum / ember surfaces (not beige, not pure black). Violet `#a78bfa` product energy, bitcoin orange for money, neon cyan for interactive. Highlight-trim cards + violet hover rings. Opaque header island + mobile dock; page copy clears safe-area chrome.
- **MVP client path:** Email + Google register/sign-in; signup agrees to Terms/Privacy; Nostr is **check/link only**; add **and edit** Lightning/on-chain wallets; dummy `bitcoin.org` / example addresses rejected; solid `/u/:username` with Tip / Follow / Message and owner “Edit addresses”; complete `/terms` `/privacy` + SPA 404; gift/tip QR uses the **saved wallet Lightning address**.
- **UX infrastructure:** Toast, ConfirmDialog, PageMeta (OG share card `og-share.svg` 1200×630), Breadcrumbs, EmptyState, PWA, `npm run sitemap`, prerender for crawlers
- **Education & conversion:** Fee comparison calculator, platform comparison tables, templates, creator guidelines
- **Bitcoin surface area:** Lightning addresses, on-chain, QR, footer/nav **BTC price strip**. Map is **MapLibre + OpenFreeMap** (Leaflet fully removed). BTCPay webhook **code exists**; production invoice → webhook settlement is **not claimed live**
- **Creator surfaces:** Wishlists, public profiles, discovery grid, tip menus, subscription **tiers in the UI**
- **OF-parity seams (honest):** Likes, comments, PPV unlock, and subscribe are **client-local** until THOR Lightning webhook + `subscriptions` row. Demo content is labeled Demo
- **Nostr:** Optional identity, NIP-07 path, wishlist publishing foundations, NIP-05 claim UI
- **i18n:** **en, es, pt, fr, de, ja, zh**. **No Swahili locale in the app**

### What was removed

- **Pulse / Protocol widgets** removed 2026-07-06. Do not market “live network widgets.” The footer/nav BTC **price** strip remains.
- **Beige marketing** `#dfd4c8` retired. Changelog does **not** auto-open (it stole first taps).

### Engineering

| Layer | Stack |
|-------|-------|
| Frontend | React 18, TypeScript, Vite, Tailwind v3 |
| Routing | React Router DOM v6 (clean URLs; SPA `/* /index.html 200`) |
| Backend | Supabase (Postgres, Auth, Storage, RLS) |
| Bitcoin / map / social | nostr-tools, **MapLibre GL + OpenFreeMap**, mempool / price APIs |
| Hosting | **Cloudflare Pages** (katoa.org) |
| Design system | [`docs/DESIGN.md`](./DESIGN.md) · root [`DESIGN.md`](../DESIGN.md) |

### Data model (high level)

Profiles · Wishlists · Items · Contributions · Projects · Follows · Wallet addresses · Payment methods · Media · Notifications — protected by **Row Level Security**.

### Honest metrics (do not inflate)

[`public/metrics.json`](../public/metrics.json) is a **labeled SAMPLE** (`raw.demo: true`). Current catalog snapshot: **11 creators**. Never say “thousands of creators.” UI must keep the demo/sample label until live Supabase counters exist.

### Tests (this era)

Unit suite green in the night-jewel/MVP pass (~222). Playwright coverage includes landing, FAQ, dashboard, 404, auth, legal, creator-profile.

### Staged / blocked (Cam / THOR)

- Confirm Cloudflare Pages rebuilt `main` after `6f43b74` (hard-refresh katoa.org)
- BTCPay / LND webhook deployed + `BTCPAY_WEBHOOK_SECRET` — invoice → confirmed tx → dashboard
- Real Lightning subscribe / PPV (replace local seams)
- Platform nsec in THOR vault; NIP-05 merge process; NIP-07 challenge login Edge Function
- Authoritative product counters
- First creators with **settled** sats on production rails

---

## Strategic positioning

**Category:** Sovereign creator infrastructure — not another rent-seeking “creator platform.”

**Differentiators that matter:**

1. **0% is a promise, not a promo** — no billing tables, no take-rate logic in the architecture  
2. **Bitcoin-first** — Lightning is the default mental model, not an add-on  
3. **Nostr optional** — identity and wishlists can live beyond the app  
4. **Radical transparency** — in-app fee math, open source, labeled demo data  
5. **Give A Bit alignment** — mission, tone, Safe Harbour, ecosystem credibility

**Primary audiences:** Independent creators, activists, mutual-aid organizers, unbanked or censored builders, Bitcoin/Nostr natives. Also: students, hospitality workers, tutors, musicians — anyone with a community who should not pay 20% rent.

**Not primary (yet):** Enterprise compliance suites, traditional e-commerce at scale.

**Public SEO language:** Use *zero fee creator platform bitcoin*, *bitcoin lightning wishlist*, *nostr creator support*, *keep 100% creator earnings*, *non-custodial lightning tips*. Avoid “donation widget,” “crypto/web3,” and “OnlyFans alternative” as public slogans.

---

## Business model (explicit)

**Platform revenue from creators: $0.**

Sustainability paths (aligned with FOSS + mission):

- Voluntary Bitcoin support (footer / open-source support)
- Future optional self-hosted or premium *infrastructure* services — never a % skim on creator earnings
- Ecosystem cross-promotion via Give A Bit

The marketing and product must never introduce hidden rent. See [`MARKETING.md`](./MARKETING.md) § Risks.

---

## Competitive snapshot ($10k/month creator)

| Platform | Approx. annual fees lost |
|----------|-------------------------|
| 20% take-rate platforms | ~$24,000 |
| 10% wishlist apps | ~$12,000 |
| Link-in-bio + subscription | ~$10,800 + subscription |
| **KATOA** | **$0 platform fee** |

Drive prospects to `/comparison` and the live calculator — let the math close. Lightning **network** fees are tiny and not Katoa’s cut.

---

## Documentation map (start here)

| Doc | Purpose |
|-----|---------|
| [`EXECUTIVE-SUMMARY.md`](./EXECUTIVE-SUMMARY.md) | This file — leadership & handoff |
| [`MARKETING.md`](./MARKETING.md) | Pitch, messaging, CTAs, campaigns, ELI16 |
| [`marketing/KATOA-Marketing-Presentation.pdf`](./marketing/KATOA-Marketing-Presentation.pdf) | Slide deck (PDF) |
| [`marketing/katoa-presentation.html`](./marketing/katoa-presentation.html) | Editable 16:9 slide source |
| [`DESIGN.md`](./DESIGN.md) | Night-jewel tokens, components, UI rules |
| [`GROK-HANDOFF.md`](./GROK-HANDOFF.md) | Developer quick-start |
| [`KIMI-HANDOFF.md`](./KIMI-HANDOFF.md) | Rolling M3 → Kimi log |
| [`KIMI-HERMES-OPS.md`](./KIMI-HERMES-OPS.md) | Supabase + Cloudflare ops |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Technical deep dive |
| [`ROADMAP.md`](./ROADMAP.md) | Implementation phases |
| [`MISSION.md`](./MISSION.md) | Purpose & values |
| [`SEO.md`](./SEO.md) | Search + locale titles |
| [`diligence/`](./diligence/) | Investor one-pager + ask |

---

## Prioritized next steps

1. **Production Lightning path** — webhook live, confirmed gifts, no fake “instant settlement” until sats land  
2. **Replace OF-parity local seams** — subscribe / PPV / likes-comments backed by Lightning + Nostr  
3. **Real usage proof** — first creators with public wishlists and **settled** sats  
4. **Authoritative metrics** — retire the sample `metrics.json` when counters are real  
5. **Privacy depth** — PayNyms, **BOLT12 as a path** (not shipped as live recurring), PYNYM roadmap  

---

## Success metrics

- Creators onboarded with public wishlists (count **real** accounts, not the 11-creator sample)  
- Confirmed sats flowing (DB-tracked contributions)  
- **Zero platform fees upheld** — by design and by governance  
- Nostr adoption (linked pubkeys, published lists)  
- First end-to-end Lightning invoice confirmed on katoa.org  
- Qualitative: *“I received the full amount”*

---

## Risks (honest)

| Risk | Mitigation |
|------|------------|
| “0% forever” promise | Architectural + cultural commitment; document in MISSION |
| Lightning settlement not fully live | Market addresses, QR, and non-custodial intent; never invent live invoices |
| Early-stage social proof | Lean on open source, fee math, labeled demo — never “thousands of creators” |
| Local OF-parity seams | Ship UI; label demo; block on THOR webhook |
| Visual drift | Night-jewel is the target; beige `#dfd4c8` and pure `#000` are retired |

---

## Safe harbour

This project is provided for educational and informational purposes. Nothing herein constitutes legal, financial, or investment advice. Use at your own risk.

**© Give A Bit — Bitcoin sovereignty first.**

---

*KATOA — Keep All That's Owed Always. The platform that actually serves creators.*

---
**Diligence pack:** [docs/diligence/](./diligence/) (investor + architecture + ask)
