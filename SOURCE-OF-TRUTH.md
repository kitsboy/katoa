# SOURCE-OF-TRUTH.md — KATOA (Give A Bit Project)

**Last Updated**: 2026-06-10 (updated via update-kimi on same day)

## Project Overview (Marketing Pitch)
KATOA (katoa.org) is a privacy-first, zero-fee Bitcoin Lightning creator support platform. Anyone, anywhere can create wishlists, projects, or crowdfunding campaigns and receive support directly in Bitcoin via Lightning Network — no bank account, no KYC, no platform fees ever. Creators keep 100% ("Keep All That's Owed Always").

It is a protocol-level upgrade for creator monetization and feel-good private giving: instant settlement, global access in 195+ countries, censorship resistance, and strong privacy foundations (Nostr identity, planned PYNYM/BIP-47/Silent Payments). Features include item wishlists with auto-parsing from Amazon/eBay/Etsy, media uploads, social feeds, categories/tags, following/leaderboards/contributions, QR codes + Lightning addresses + wallet management, real-time Bitcoin price + "Bitcoin Pulse" live widget, Protocol Updates feed, multi-language, beautiful glassmorphic UI.

Built as part of the Give A Bit ecosystem (giveabit.io) with deep focus on Bitcoin sovereignty, private money, education, and Safe Harbour principles. Open source (MIT). Feels approachable and empowering — not technical or intimidating. Normal people and future AI/Nostr agents can use it to give or receive on their own terms.

## GitHub (Single Source of Truth)
- Repo: https://github.com/kitsboy/katoa.git
- Branch: main (production)
- Current status: Clean. Ahead of origin by 1 commit at start of 2026-06-10 session (STATUS.md + doc organization). Working tree clean after review.
- Recent commits (as of session):
  - 0795376 Add STATUS.md - project cleaned
  - 98f7aeb Save uncommitted changes: bitcoin pulse data and component
  - 862bd3d fix: use local hero background
  - 016c35c feat: Bitcoin Pulse widget + Protocol Updates feed + live data pipeline
  - 64dde5d Updated Navbar.tsx
- Local run: `npm install && npm run dev` (Vite on 5173)

## Deployment Details
- **Live URL**: https://katoa.org/
- **Hosting**: Cloudflare (confirmed via live HTTP/2 + CF NEL headers on 2026-06-10). SPA with custom domain katoa.org.
  - Build: `npm run build` → `dist/`
  - Configs present: netlify.toml (with strong security headers, HTTPS redirects, SPA fallback, caching — may be legacy or dual), public/_redirects, public/robots.txt + sitemap.xml
  - Previous experiments (cPanel tar uploads, Netlify Drop) archived in docs/archive/
- **Backend**: Supabase (PostgreSQL)
  - Project ref (fallback in code): wabzwiegtloclfkbxwqs
  - 23 migrations in supabase/migrations/ (core schema + wishlists/items + contributions + follows + projects + payment methods + media + social + visibility + RLS fixes)
  - Auth: Supabase (email/password + Google OAuth + Nostr NIP-07 extension support)
  - Storage: media bucket for images/videos
  - Env: VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY (required). BTCPay optional.
- **Local / Dev**:
  - `npm install`
  - `npm run dev` (recommended for editing)
  - `npm run build && npm run preview`
  - `npm run typecheck` / `npm run lint`
  - Copy .env.example → .env and fill Supabase keys (never commit .env)
- **Domain**: katoa.org (custom). DNS/SSL handled by host (CF auto).

## Key Files & Structure
- `README.md` — Primary entrypoint, features, quickstart, comparisons
- `SOURCE-OF-TRUTH.md` (this file) + `KIMI-HANDOFF-katoa-2026-06-10.md` — Handoff for Kimi/Obsidian
- `EXECUTIVE-SUMMARY.md` + `MARKETING.md` — Robust high-level + pitch docs (new for Kimi handoff)
- `STATUS.md` — Current health snapshot
- `LICENSE` — MIT (newly added)
- `docs/`
  - `ROADMAP.md` (formerly IMPLEMENTATION_ROADMAP, rebranded + cleaned)
  - `guides/` — BTCPAY_INTEGRATION.md, NOSTR_GUIDE.md, INTEGRATION_GUIDE.md, QR_CODE_INSTRUCTIONS.md (updated for KATOA)
  - `deployment/` — DEPLOYMENT.md (historical context)
  - `archive/` — Old cPanel/FIX/UPLOAD/ULTIMATE artifacts and tarballs (preserved for knowledge, not active)
- `src/` — React 18 + TS + Vite frontend
  - `components/` (30+): BitcoinPulse, ProtocolUpdates, FeeComparison, QRCodeModal, Payment/Wallet managers, GlassSection, Navbar, Footer, etc.
  - `pages/`: Home, Explore, Dashboard, Wishlist/Project, Auth, Settings, About, FAQ, Pricing, Comparison, Contact, Terms, Privacy
  - `lib/`: supabase.ts (client + full TS types), nostr.ts (full NIP support), btcpay.ts (stubs + service), bitcoinPrice.ts, productParser.ts / urlParser.ts, url utils
  - `contexts/`: Auth (email + Nostr), Language (7 langs)
  - `data/`: mockWishlists (dev)
- `supabase/migrations/` — 23 SQL files, latest 20251113215820_add_project_follows.sql
- `public/` — Static: hero bg, sats logo, donations QR, live-data/bitcoin-pulse.json, content/updates.md (jurisdiction note), robots, sitemap, _redirects
- `scripts/bitcoin-pulse.js` — Data helper
- Configs: vite.config.ts (minimal), tailwind, postcss, tsconfig*, eslint, netlify.toml, package.json (name fixed to "katoa")

## Mission Alignment
Strong Give A Bit alignment: Bitcoin sovereignty + private feel-good giving for normal people. 0% fees forever, no banks/KYC, Lightning instant + private, Nostr decentralized identity, PYNYM/privacy layers planned (BIP-47, Silent Payments), education-focused, Safe Harbour language, always tie back to giveabit.io. Open source so users own their tools. Approachable, positive, respectful of sovereignty. "Protocol-level upgrade" not another rent-seeking platform.

## Recent Changes & Lessons Learned (2026-06-10 Review + Organize Session)
- Full folder review + best-practice reorganization for Kimi handoff (documentation priority #1).
- Created robust SOURCE-OF-TRUTH, KIMI-HANDOFF, EXECUTIVE-SUMMARY, MARKETING docs.
- Cleaned root: moved tarballs + 7+ historical cPanel/SSL/upload/prompt junk to docs/archive/. Removed unused HomePageOld.tsx + NavbarOld.tsx. Fixed package.json name, .env.example (BitWish→KATOA), .gitignore (artifacts, envs).
- Added missing LICENSE (MIT) with project header.
- Rebranded lingering "BitWish" references in guides/ROADMAP.
- Updated STATUS.md with accurate current state, gaps, tech.
- Enhanced README (in progress during session) with live URL, correct GH, new doc links, accurate hosting note, Give A Bit tie-in.
- Live site confirmed working (https://katoa.org returns 200 on CF).
- Git snapshot captured. Project was already "cleaned" in May; this session made it handoff-ready and self-documenting.
- Lesson: Old deployment experiments accumulate fast — archive aggressively + keep one source-of-truth deployment note. Always run giveabit-project-handoff skill at end of work.
- Nostr features are quite complete in code (AuthContext + lib/nostr.ts); BTCPay is the main "in progress" gap matching roadmap.
- 2026-06-10 update-kimi: Created SESSION-SUMMARY-2026-06-10.md and appended clean "Latest Session Summary" section to KIMI-HANDOFF-katoa-2026-06-10.md per goodbye skill pattern. All handoff files (SOURCE, KIMI-HANDOFF, EXECUTIVE-SUMMARY, MARKETING, ARCHITECTURE) + organized docs now ready for Kimi vault integration.

## Gaps / Improvements
- BTCPay live integration (invoices, webhooks/Supabase Edge Functions or serverless, polling, store config) — guides + lib stubs exist but not wired end-to-end in prod.
- Automated tests + CI.
- Generate + use Supabase types (npx supabase gen types) instead of hand-maintained in lib/supabase.ts.
- Expand privacy: integrate @pynyms/client or equivalent, BIP-47 PayNym, Silent Payments, more ZK feel.
- Real-time notifications polish, email (if desired, privacy-preserving), contributor dashboards.
- Deployment docs: consolidate to reflect actual CF hosting + any Git integration used for deploys.
- Minor: update any remaining old clone URLs in docs, add more screenshots or Loom to README, contributor guidelines beyond basic.
- Future per roadmap: BOLT12, mobile, advanced analytics, subscriptions, team collab, AI recs.
- Add project to Give A Bit master lists / Kanban on Kimi side.

## How to Start and Edit in the Future
1. `cd ~/projects/katoa`
2. `npm install` (first time or after pulls)
3. `npm run dev` — best for live editing/hot reload in Goose sessions.
4. Open http://localhost:5173 (or the URL printed).
5. Edit in `src/` (components, pages, lib, contexts). UI changes instant.
6. For Bitcoin features: set real Supabase + (future) BTCPay envs.
7. Build/test: `npm run build && npm run typecheck && npm run lint`
8. **Always** run the giveabit-project-handoff skill (or "use the giveabit-project-handoff skill") at the end of any session to update SOURCE-OF-TRUTH, generate fresh KIMI-HANDOFF, etc. This keeps Kimi (M4/Obsidian/HERMES) perfectly current without raw chat dumps.
9. To hand off: ensure Tailscale access to M4, copy the new SOURCE + KIMI-HANDOFF + summaries into the vault/project folder for nightly backups.

**This file is the single source of truth.** All future work must reference and update this first (or via the skill). 

**Template Rule for All Future Give A Bit Projects**: Every project must have at least: GitHub source + branch, live URL, full deployment details (platform, build, envs, secrets note), key local docs list, simple everyday-language pitch tied to Give A Bit/Bitcoin/privacy, Git snapshot + recent changes, mission alignment, gaps/improvements, hand-off notes, and clear "how to start editing" steps.

**Done ✅** (hand-off ready for Kimi on M4 HERMES).