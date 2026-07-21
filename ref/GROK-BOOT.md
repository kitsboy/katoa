# GROK BOOT — READ THIS EVERY SESSION

**This file lives in every repo's ref/ directory.** Every time you open this project, read ref/GROK-BOOT.md first.

## Required: Add analytics + metrics to this project

Before making any code changes, do this:

**Step 1 — Umami tracking script**

Add this to the site's `<head>` (already in `index.html` for katoa):

```html
<script defer src="https://analytics.giveabit.io/script.js" data-website-id="fa7b78d8-b121-40ff-a139-8bfab40baec5"></script>
```

Website ID for **katoa.org**: `fa7b78d8-b121-40ff-a139-8bfab40baec5`  
Full table: HQ `docs/UMAMI-DEPLOYMENT.md`. Host is THOR Umami on `:3002` — public name should reverse-proxy to `analytics.giveabit.io`.

**Step 2 — /metrics.json endpoint**

Create `public/metrics.json` with the `gab.product-metrics.v1` schema (done).

Katoa KPIs (from https://hq.giveabit.io/docs/ALL-SITE-METRICS.md):

| Metric | Type | Source |
|--------|------|--------|
| creators_total | KPI | Supabase profiles |
| campaigns_active | KPI | Active projects |
| sats_raised_total | KPI | LNbits / contributions |
| sats_raised_30d | KPI | Aggregate |
| wishlists_total | KPI | Creator wishlists |
| zaps_received | KPI | Nostr zaps |
| avg_campaign_sats | KPI | Average raised |
| creators_daily | Series | Signups over time |
| sats_daily | Series | Raised / day |
| creator_funnel | Funnel | Visit → Create → Fund |

**Step 3 — Push ref/ docs to this repo**

After adding metrics, keep `ref/GROK-BOOT.md` current. Commit + push.

## Why this matters

THOR's HQ pulls analytics + metrics from every product. Without Umami + `/metrics.json`, this product shows demo data on the ops glass. With them, it shows live creators, campaigns, sats, and the creator funnel.

## Need help?

Ask Kimi on THOR (via Hermes).
