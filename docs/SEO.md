---
title: SEO Strategy & Audit
project: KATOA
version: 1.0.0
tags: [katoa, seo, audit, keywords, search-optimization]
last_updated: 2026-07-06
owner: Kimi (Orchestrator) / Qwen (Weekly Audit)
update_frequency: Weekly (Monday)
---

# SEO — KATOA

## Live URL

https://katoa.org

## Target Keywords

| Primary Keyword | Search Intent | Current Rank |
|----------------|--------------|-------------|
| zero fee creator platform bitcoin | commercial | — |
| bitcoin lightning wishlist | transactional | — |
| nostr creator support | informational | — |
| keep 100% creator earnings | commercial | — |
| bitcoin donation platform no fees | commercial | — |

## Current Meta Tags

| Tag | Current Value | Status |
|-----|--------------|--------|
| Title | Set per-route via `PageMeta` component; homepage via `index.html` | 🟡 Title long on default — optimize to ~60 chars |
| Description | Per-route `PageMeta` + static fallback in `index.html` | ✅ |
| OG / Twitter | `og:image`, `summary_large_image` in `index.html` | ✅ |
| Canonical | Per-route via `PageMeta`; wishlist uses `/wishlist/:slug` | ✅ |

## Structured Data

- [x] WebApplication schema in `index.html` (featureList, offers)
- [ ] Organization Schema
- [ ] BreadcrumbList (UI breadcrumbs exist; JSON-LD not yet wired)
- [ ] FAQPage (FAQ page exists; schema not yet wired)

## Sitemap

Regenerate after route changes:

```bash
npm run sitemap   # → public/sitemap.xml
```

## Weekly Audit Log

| Date | Auditor | Findings | Recommendations |
|------|---------|----------|----------------|
| 2026-07-06 | Qwen3.6-27B | Score 72/100 — SPA content visibility risk; title over-optimized; no static H1 | Prerender or SSR for crawlers; shorten title; static H1 fallback |

---

## Weekly Audit — 2026-07-06

**Auditor:** Qwen3.6-27B (oMLX local)
**URL:** https://katoa.org
**Score:** 72/100

### Top 3 Strengths

1. **Complete Social Meta Tags** — OG and Twitter Card tags fully implemented with og:image, correct descriptions, and summary_large_image card type
2. **Well-Structured JSON-LD** — WebApplication schema with featureList, offers, and applicationCategory
3. **Clear Technical Directives** — Canonical URL, robots meta (index,follow), lang="en"

### Top 3 Issues (Priority Order)

1. **CRITICAL: SPA Content Visibility** — `<body>` contains only `<div id="root">`; all content is client-side rendered. Risk of delayed indexing or invisible content for non-Google crawlers
2. **Title Tag Over-Optimization** — 98 chars, keyword-stuffed. Target ~60 chars
3. **Missing H1 in Initial HTML** — No `<h1>` tag in the server-rendered HTML; H1 is only added after JS execution

### Recommendations

- Implement SSR/SSG (Next.js/Nuxt.js) or use prerendering (Prerender.io) to serve initial HTML to crawlers
- Optimize title tag: `Katoa: Zero-Fee Bitcoin Creator Platform | Lightning & Nostr` (~57 chars)
- Add a static `<h1>` to the initial HTML as fallback content

---

*Auto-audited weekly by Qwen3.6-27B (local LLM). Part of the [Give A Bit](https://giveabit.io) family.*

Safe Harbour Statement: This project is provided for educational and informational purposes only.
Nothing herein constitutes legal, financial, or investment advice. Use at your own risk.
© Give A Bit — Bitcoin sovereignty first.