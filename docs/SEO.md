---
title: SEO Strategy & Audit
project: KATOA
version: 1.1.7
tags: [katoa, seo, keywords, lightning, nostr]
last_updated: 2026-08-24
owner: Give A Bit
---

# SEO — KATOA

## Live URL

https://katoa.org · [github.com/kitsboy/katoa](https://github.com/kitsboy/katoa) · Cloudflare Pages

## Languages (hreflang)

Shipped in-app and in `PageMeta`: **en, es, pt, fr, de, ja, zh**.

**No Swahili (`sw`) locale.** Do not add `hreflang="sw"`. See [`SEO-sw.md`](./SEO-sw.md) (N/A).

Locale titles: [`SEO-es.md`](./SEO-es.md) · [`SEO-pt.md`](./SEO-pt.md) · [`SEO-fr.md`](./SEO-fr.md) · [`SEO-de.md`](./SEO-de.md) · [`SEO-ja.md`](./SEO-ja.md) · [`SEO-zh.md`](./SEO-zh.md)

## Target keywords (glossary)

| Primary keyword | Intent |
|-----------------|--------|
| zero fee creator platform bitcoin | commercial |
| bitcoin lightning wishlist | transactional |
| nostr creator support | informational |
| keep 100% creator earnings | commercial |
| non-custodial lightning tips | transactional |

**Secondary:** katoa, katoa.org, bitcoin wishlist, lightning address, bitcoin patronage, 0% platform fees, no KYC, Give A Bit.

### Do not target (public SEO)

- **donation widget** — Pulse/Protocol widgets removed 2026-07-06; we are not a widget vendor
- **OnlyFans alternative** — competitor math lives on `/comparison`; not a search slogan
- **crypto / web3** — say **Bitcoin**
- **thousands of creators** — false. `public/metrics.json` is a **sample** (11 creators, `demo: true`)

## Default English meta

| Tag | Value |
|-----|--------|
| Title (~57 chars) | `Katoa: Zero-Fee Bitcoin Creator Platform \| Lightning & Nostr` |
| Description | Create Bitcoin wishlists, receive Lightning gifts instantly, and keep 100% of earnings. Zero platform fees, no KYC, works in 195+ countries. |
| OG image | `https://katoa.org/og-share.svg` — **1200×630** (not the 512 logo) |
| Twitter | `summary_large_image` · `@give_bit` |
| Canonical | Per-route via `PageMeta`; site `https://katoa.org/` |

`index.html` and `PageMeta` should agree. Do **not** claim `og:image:width/height` 1200×630 while serving `logo2-512.png`.

## Route map (~29 page modules)

Indexable marketing / public (sitemap): `/` `/explore` `/about` `/comparison` `/pricing` `/faq` `/contact` `/security` `/security/bounty` `/roadmap` `/templates` `/press` `/meetup` `/creators` `/creators/guidelines` `/case-studies` `/terms` `/privacy` plus public `/wishlist/:slug` and `/u/:username`.

**Noindex (do not sitemap):** `/pitch` `/auth` `/dashboard` `/settings` `/project` `/messages` `/404`.

Regenerate after route changes:

```bash
npm run sitemap   # → public/sitemap.xml (scripts/generate-sitemap.mjs)
```

## Structured data

- [x] WebApplication schema in `index.html` (featureList, offers)
- [x] Organization schema in `index.html`
- [x] FAQPage JSON-LD on `/faq` (prerender + client)
- [x] BreadcrumbList on prerendered marketing routes
- [x] Prerender (`scripts/prerender.mjs`) injects H1 + copy for crawlers

## Technical notes

| Topic | Fact |
|-------|------|
| Host | Cloudflare Pages, SPA + prerender |
| Map | MapLibre + OpenFreeMap — not a Leaflet SEO surface |
| Metrics | Labeled sample — never use KPI numbers in titles as if they were live scale |
| Visual | Night-jewel (plum/ember). Theme-color may still read charcoal until CSS lands; share card is dark jewel |
| Widgets | Removed. Do not rank for “Bitcoin donation widget” |

## Weekly audit log

| Date | Auditor | Findings | Recommendations |
|------|---------|----------|-----------------|
| 2026-07-06 | Qwen3.6-27B | Score 72/100 — SPA visibility; long title; no static H1 | Prerender + shorten title + static H1 |
| 2026-08-24 | Grok M3 | Night-jewel docs; locale titles filled; `/creators/guidelines` sitemap; OG 1200×630 via `og-share.svg`; sample metrics honesty | Keep locale files in sync with `PageMeta`; never sitemap `/pitch` |

---

## English title / description bank

Use these (or close variants) in `PageMeta` and prerender. Keep titles ~50–60 characters where possible.

| Path | Title | Description |
|------|-------|-------------|
| `/` | Katoa: Zero-Fee Bitcoin Creator Platform \| Lightning & Nostr | Create Bitcoin wishlists, receive Lightning gifts instantly, and keep 100% of earnings. Zero platform fees, no KYC, works in 195+ countries. |
| `/explore` | Explore Bitcoin Creator Projects \| KATOA | Discover Bitcoin Lightning wishlists worldwide. Support creators with non-custodial tips — 0% platform fees. |
| `/creators` | Creators on KATOA — Keep 100% of Earnings | Find creators who receive non-custodial Lightning tips. 0% platform fees forever. |
| `/creators/guidelines` | Creator Guidelines \| KATOA | How to use KATOA as a creator — wishlists, Lightning tips, DMs, and safety. |
| `/about` | About KATOA — Zero-Fee Bitcoin for Creators | Learn how KATOA helps creators keep 100% via Bitcoin Lightning. No platform fees, no KYC. |
| `/comparison` | Why KATOA: 0% Fees vs Legacy Platforms | Honest fee math: keep 100% of creator earnings on Bitcoin Lightning. No bank required. |
| `/pricing` | Pricing — $0 Forever \| KATOA | KATOA pricing is simple: $0 platform fees forever. Keep 100% of Bitcoin Lightning earnings. |
| `/faq` | FAQ — Zero Fees, Lightning & Privacy \| KATOA | Answers about Bitcoin wishlists, Lightning payments, optional Nostr, and keeping 100%. |
| `/contact` | Contact KATOA | Get in touch for creator support, partnerships, or press. |
| `/security` | Security — Non-Custodial by Design \| KATOA | We do not hold your keys or funds. Lightning goes to wallets you control. |
| `/roadmap` | Roadmap \| KATOA | What has shipped and what is next for the zero-fee Bitcoin creator platform. |
| `/templates` | Wishlist Templates \| KATOA | Start faster with Bitcoin Lightning wishlist templates — 0% platform fees. |
| `/press` | Press Kit \| KATOA | Logos, boilerplate, and facts for journalists covering KATOA. |
| `/case-studies` | Case Studies \| KATOA | How creators use zero-fee wishlists and Lightning support. Some stories are demo until live pilots publish. |
| `/meetup` | Meetup Kit \| KATOA | Materials for hosting a KATOA / Give A Bit meetup. |

`/pitch` is a private overview (`noindex`). Do not optimize it for search.

---

*Part of the [Give A Bit](https://giveabit.io) family. Safe Harbour: educational only — not legal, financial, or investment advice.*
