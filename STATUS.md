# KATOA - Status

**Last Updated**: 2026-06-10

KATOA (katoa.org) — Privacy-first, zero-fee Bitcoin Lightning creator platform.

## Current State
- ✅ Clean Git repo (main branch, https://github.com/kitsboy/katoa.git)
- ✅ Production-ready React + TypeScript + Vite + Tailwind frontend
- ✅ Full Supabase backend (23 migrations, comprehensive RLS, profiles, wishlists, items, contributions, follows, social, media, payment methods, Nostr/PYNYM fields)
- ✅ Live at https://katoa.org (Cloudflare-hosted SPA with custom domain)
- ✅ Nostr integration (NIP-07 login, profile sync, wishlist publishing, LN address resolution, encrypted DMs, zap prep)
- ✅ Bitcoin-native features: Lightning addresses, wallet management, QR codes, real-time price, fee comparison, Bitcoin Pulse widget, Protocol Updates
- ✅ Multi-page app: Home (with live widgets), Explore, Project/Wishlist views, Dashboard, Auth, Settings, About, FAQ, Pricing, Comparison, Contact, Terms, Privacy
- ✅ 0% fees messaging, global access (195+), privacy focus

## Recent Work
- Project cleaned and STATUS added (May 28)
- Bitcoin Pulse live data component + Protocol Updates feed added
- Hero background made local for reliability
- Full rebrand from early BitWish concepts to KATOA
- Organized docs, added hand-off materials for Kimi (June 2026)

## Known Gaps (for future or Kimi)
- Live BTCPay Server integration (code stubs + guides exist, webhook/edge functions pending)
- Full production webhook + invoice polling
- Tests (unit + e2e)
- Supabase type generation (current types manually maintained in src/lib/supabase.ts)
- Deeper privacy (PYNYM client, BIP-47, Silent Payments) per Give A Bit roadmap
- Email / real-time notifications polish
- Mobile app consideration
- Analytics / creator verification
- Deployment docs reflect current CF hosting (netlify.toml remains as fallback/legacy)

## Tech Notes
- npm run dev / build / typecheck / lint
- Supabase URL hardcoded fallback in lib (wabzwiegtloclfkbxwqs) — use .env in prod
- netlify.toml + public/_redirects for SPA/HTTPS/security headers (actual host: Cloudflare)
- Open source MIT (see LICENSE)

This is the single source of truth for project health. Always run giveabit-project-handoff skill after sessions.

**Done ✅** — ready for Kimi hand-off.
