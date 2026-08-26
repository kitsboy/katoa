# katoa — Last Updated 2026-08-26 (end of session, Hermes/Kimi)

**Brief:** Verification-sweep fixes landed — the 20+ broken internal links and the dead contact form are FIXED. All live on katoa.org.

## What landed (all pushed to origin/main)
- **20+ internal 404s FIXED** (t_4f7dac9c, commit 77beff1): every route was already a real page; a stray `public/404.html` was disabling Cloudflare Pages' SPA fallback, so deep links served a bare "Not found" instead of the app. Removed it → all 39 routes return 200. Unknown routes now show the branded in-app 404.
- **Contact form FIXED** (t_2b5da1d4): was a GET-only silent dead-end; now wired to a real backend with validation + success/error.
- **Dead/placeholder external links FIXED** (t_1b695e39, commit 5671b8c): removed fake Amazon ASINs (~30), example.com placeholders, dead github discussions; fixed the BTC Map API link (/v4 → /v2/areas); ContactPage GitHub link 404→200.
- **katoa@api.satohash.io:8443 Lightning address FIXED** (t_fd5f101d): was missing a username binding in LNbits postgres lnurlp.pay_links; applied the binding → address resolves.

## Context
These came out of the full-family verification sweep (t_51e28dd7). Deploy: https://katoa.org · CF Pages auto-deploy. See /root/hq/docs/KIMI-HANDOFF.md + FIXES-LOG.md for the full session.
