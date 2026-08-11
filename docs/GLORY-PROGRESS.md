# KATOA glory sprint — progress log

**Last updated:** 2026-08-11 (Grok on M3) · HEAD `9d38deb` · **v1.1.7**

Shipped in code without requiring Cam for external accounts or mainnet keys.

**Recent commits:** `9d38deb` · `be044e6` · `63f364f` · `646f1cd` · (+ earlier glory batches)

Approximate coverage of the 100-item list: **~70–80 implementable items fully or partially landed in UI/docs/infra**; **~15–25 need Cam/THOR/mainnet**; remainder are ongoing craft.

## 2026-08-11 batch (this session)
- Solo **10-pack**: tip menu, favorites pack, visibility badge, DM block/unread, vertical chips, PWA creator copy, a11y, Playwright messages, i18n
- **Explore map:** fix basemap (CARTO; no logo smear); btcmap-api richer popups, category emoji, `/v4/search`
- **Agent docs:** `.ai_docs` ecosystem-links/summary + `.ai_agent` for Obsidian/family discovery

## Shipped (mapped to the 100-list)

### Trust & honesty
- Honest home stats via `metrics.json` + demo labeling (no fake 2.5K / ₿1.2M)
- TrustProofStrip (0% fees · non-custodial · open source)
- Demo badges on explore cards + wishlist demo banner + landing shot “Demo”
- Security page `/security`, FAQ trust section, settings security callout
- Safe harbour line on donate modal

### Donate / mobile UX
- Tip amount picker + wallet deep links + improved DonateQRModal (mobile sheet)
- Sticky mobile gift CTA above bottom nav (safe-area)
- Trust line on wishlist pay card
- Embed HTML snippet for blogs

### Creator loop
- Onboarding + first-sat step
- Templates page `/templates`
- Milestone banner + progress 25/50/75/100 markers
- Demo activity feed (privacy-preserving aliases)
- Referral share + X intent; Nostr note copy in share menu

### Distribution / brand
- Roadmap page `/roadmap`, Press kit `/press`, Family suite links
- Footer links (security, roadmap, templates, press, pitch)
- Offline page brand + trust line; 404 trust line
- llms.txt expanded; sitemap routes for new pages
- Reduced-motion CSS; SW cache v17; error boundary recovery + ref id

### Infra hygiene (related)
- Asset Origin poison checks in deploy workflow
- productMetrics unit tests

## Needs Cam / THOR / external (cannot finish solo)

1. **Real Lightning mainnet receive** — BTCPay store + CF secrets + webhook → DB funding
2. **Live Supabase product counters** — replace sample metrics when production DB is authoritative
3. **Dynamic OG image service** — edge worker for per-wishlist cards
4. **Nostr NIP-07 login** — challenge-response backend
5. **Seed creators / white-glove onboarding** — human distribution
6. **Bug bounty fund** — sats budget
7. **Staging + testnet Lightning** — THOR/ops
8. **Lighthouse CI budget** — wire in GH Actions with thresholds
9. **Image upload pipeline** — Supabase storage transforms / CDN
10. **BOLT12 / recurring** — protocol + wallet support maturity

## Suggested next sprint (human + agent)

1. Wire BTCPay invoice create + webhook (items 1–2 of original P0)
2. Staging env with testnet
3. Real creator pilot (10 people)
4. Dynamic OG
5. E2E Playwright pay path with mocked webhook
