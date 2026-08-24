# ARCHITECTURE — KATOA

**Date**: 2026-08-24 (night-jewel + honest MVP; prior: 2026-07-09 security audit + CF Pages)
**Audience**: Kimi, future developers, Give A Bit architects. Keep it simple + accurate.  
**Related**: [`DESIGN.md`](./DESIGN.md) · [`EXECUTIVE-SUMMARY.md`](./EXECUTIVE-SUMMARY.md) · product HEAD `6f43b74`

---

## High-Level Overview

KATOA is a modern SPA (React + TypeScript + Vite) that talks to a Supabase Postgres backend. It is deliberately **Bitcoin- and Nostr-native** from the data model up, with 0% platform fees as an architectural invariant (no billing tables, no "take rate" anywhere).

The product lets creators publish rich "support surfaces" (wishlists / projects) that accept direct Bitcoin Lightning (and on-chain) value. Givers discover, follow, contribute, and see impact in near real time.

**Key design principles** (visible in code):
- Client-heavy with strong typed contracts to Supabase.
- Row Level Security (RLS) is the source of truth for authorization — never trust client code alone.
- Nostr is a first-class identity and distribution layer (not bolted on).
- Bitcoin payment options are plural and progressive (direct addresses today → full BTCPay invoices + BOLT12 tomorrow).
- UI is premium but accessible; **night-jewel** (plum/ember glass, violet product, bitcoin-orange money) with motion hero, BTC price strip, and accessible overlays (toast, confirm dialogs). Beige and all-black are retired.
- Everything is open source (MIT) so users can audit, fork, or self-host the frontend.

---

## Frontend Architecture

**Tech**:
- React 18 + TypeScript (strict)
- Vite (fast HMR, simple build to `dist/`)
- Tailwind CSS + custom design tokens (bitcoin-orange, neon-cyan, glass effects, glows)
- Lucide icons, react-markdown, html-react-parser
- No heavy global state lib — React Context for Auth, Language, Currency + ToastProvider
- React Router DOM v6 (`BrowserRouter` in `App.tsx`) — `src/hooks/useRouter.tsx` is deprecated

**Structure**:
```
src/
  main.tsx + App.tsx          # Providers (Auth, Language, Currency, Toast) + lazy router
  components/ (57)            # Reusable, presentational + interactive
    - Primitives: Card, Button, Input, Modal, Tooltip, GlassSection, EmptyState
    - Chrome: Navbar (floating island), Footer, MobileNav, Breadcrumbs, PageMeta
    - Hero: HeroOverlayCard, HeroMotionBackground, PageHero
    - UX: Toast, ConfirmDialog, PwaInstallPrompt, ChangelogModal, OnboardingChecklist
    - Bitcoin: FeeComparison, DonateQRModal, FooterBitcoinStrip, QRCodeModal, SatsDisplay
    - Data: PaymentMethodManager, WalletAddressManager, WishlistItemsList, ContributorsWall
  pages/ (~29, lazy-loaded)   # Home, Explore, Creators, /u/:username, WishlistRoute, Dashboard, Project, Settings,
                              # About, Contact, FAQ, Pricing, Comparison, Pitch, Auth, Legal, 404, press, meetup, …
  contexts/
    AuthContext.tsx           # Email/password + full Nostr NIP-07 flows, profile sync
    LanguageContext.tsx       # 7 langs + pageStrings for page-specific copy
    CurrencyContext.tsx       # Fiat display preference
  lib/                        # Pure(ish) utilities & service clients
    supabase.ts               # Client + comprehensive hand-written Database types (profiles, wishlists, items, txns, notifications, shipping, wallet_addresses...)
    nostr.ts                  # NostrService: relays, profile fetch, publishWishlist (kind 30078), getLightningAddress, encrypted DM, zap requests
    btcpay.ts                 # BTCPayService stubs + invoice creation, checkout open, lightning helpers (ready for prod wiring)
    bitcoinPrice.ts, productParser.ts / urlParser.ts
  data/                       # Dev mocks only
  hooks/                      # useRouter (and future custom hooks)
```

**Data flow examples**:
- Auth: Supabase signIn → create/update profile row (also Nostr path: window.nostr.getPublicKey → kind 0 metadata → upsert profile + nostr_pubkey)
- Create wishlist: Dashboard form → supabase insert (creator_id = auth.user) → optional nostrService.publishWishlist(...) → toast
- View public wishlist: `/wishlist/:slug` → supabase select (public RLS) + items + contributions → render progress + QR/donate modal
- Contribute: User enters name/message/amount → pick or paste address / future invoice → record pending transaction row → (future) poll or webhook confirms → triggers (future) funding total functions + notifications

**Live / ambient UI**:
- FooterBitcoinStrip + Navbar BTC ticker fetch price via cached client API
- HeroMotionBackground + HeroOverlayCard on homepage (motion orbs, glass card)
- ChangelogModal surfaces version notes from `src/data/changelog.json`
- PWA: `public/sw.js` v2 with offline fallback; `PwaInstallPrompt` for install UX
- SocialProofTicker, ContributorsWall for social proof on explore/pitch pages

**Removed (2026-07-06)**: `BitcoinPulse.tsx`, `ProtocolUpdates.tsx`, `LightningField.tsx` — homepage simplified to motion hero + stats strip.

---

## Backend & Database (Supabase)

**23 migrations** (supabase/migrations/, ordered by timestamp). Latest: 20251113215820_add_project_follows.sql

**Core tables** (from src/lib/supabase.ts Database type + migrations):

- **profiles**: id (auth.users), username, avatar_url, bio, lightning_address, nostr_pubkey + verified, xpub_address, pynym_code, preferred_currency, geo (city/lat/lon/country), timestamps
- **wishlists**: creator_id → profiles, title, description, slug (unique), is_public, theme_color, cover_image, total_sats_goal / raised, wallet_address_id, geo, timestamps. (Later migrations added categories, visibility, projects structure v2)
- **wishlist_items**: wishlist_id, title, description, price_sats, sats_raised, image_url, product_url, merchant_link, shipping_required, sort_order, is_funded, timestamps
- **wallet_addresses**: user_id, address_type (lightning|xpub|pynym), address_value, label, is_active
- **transactions** (contributions): wishlist_id, item_id?, contributor_name, amount_sats, message, payment_method, payment_hash, status, created_at. (Note: some older roadmap docs mention "transactions" table; current types use this.)
- **notifications**: user_id, type, title, message, is_read
- **follows** / **project_follows**: social graph
- **wishlist_media**, **shipping_addresses**, payment-related (payment_codes, payment_methods from later migrations), contributions/leaderboards additions.

**Security model (the most important part)**:
- Every table has RLS policies (see the many "fix_security_and_performance" migrations).
- Public can read published wishlists/items/contributions (with visibility filters).
- Only the owner (auth.uid() == creator_id or user_id) can insert/update/delete their own rows.
- Service role / edge functions (future) for webhooks that need to bypass RLS safely.
- No secrets in client bundle (env vars only for anon key + optional BTCPay public-ish creds).

**Future DB work visible in old roadmap** (some may already be partially in later migrations):
- Triggers for auto-updating sats_raised / is_funded on confirmed transactions
- View counters, notification helpers
- Indexes for performance on public lists + user lookups

**Storage**:
- Supabase Storage bucket(s) for media (created in one of the migrations around 20251108).
- RLS on storage objects too (owner-only write, public read for published).

**Auth providers**:
- Supabase built-in (email + password, Google OAuth added in early migration)
- Nostr (pure client-side via extension, then upsert profile)

---

## Bitcoin & Nostr Integration Layers

**Nostr (very complete today)**:
- lib/nostr.ts + AuthContext
- NIP-07 (extension signing)
- Kind 0 profile sync (name, picture, about, lud16/lud06)
- Kind 30078 parameterized replaceable for wishlists (d: slug, title/desc/url tags, JSON content)
- NIP-04 encrypted DMs (for private creator notifications)
- NIP-57 zap request scaffolding
- Configurable relays (good defaults: damus, nostr.band, nos.lol, etc.)
- UI: "Sign in with Nostr" appears only if extension detected; purple accents for Nostr features; "Sync Nostr Profile" button in dashboard.

**Bitcoin payments (hybrid — works today, fuller experience coming)**:
- Today: creators publish Lightning addresses / xpubs / payment codes in profiles or per-wishlist. Givers pay directly with any wallet; creator sees the tx (or manually marks). QR + copy helpers everywhere.
- BTCPay path (prepared):
  - src/lib/btcpay.ts service class
  - Full guide in docs/guides/BTCPAY_INTEGRATION.md (self-host or hosted, API keys, webhooks, Nostr/PYNYM notes, testnet, mock for dev)
  - Future: createInvoice, openCheckout, webhook → update transaction status → trigger funding rollups + notify
- Price: CoinGecko (or similar) via bitcoinPrice.ts with real-time feel in UI.
- FeeComparison component: pure marketing/education gold (shows the delta vs rent platforms).

**Privacy roadmap items (architectural hooks already in schema)**:
- pynym_code on profiles + wallet type
- nostr_pubkey_verified
- xpub (for BIP-47 style reusable codes)
- Future: mixnet routing for donation requests, encrypted everything, pseudonymous verified identities without doxxing.

---

## Deployment & Ops

- **Build**: Vite → static `dist/` (SPA)
- **Hosting (live)**: Cloudflare Pages / equivalent with custom domain. Strong security headers (X-Frame-DENY, HSTS, CSP upgrade-insecure, etc.) are in netlify.toml (may be used for preview or was previous host).
- **SPA routing**: /* → /index.html (200)
- **Env**: Only VITE_* vars (safe for client). Supabase anon key is intentionally public for client apps; rotate if concerned.
- **CI/Quality**: Currently manual (`npm run typecheck`, `npm run lint`, `npm run build`). Easy to add GitHub Actions.
- **Analytics / monitoring**: None wired yet (privacy-first, add only if it respects the mission).
- **Backups**: Supabase handles DB; user responsible for any edge function / secret backups. Hand-off files + vault for knowledge.

**Note on historical noise**: Lots of cPanel tar experiments, SSL cert fixes, "upload this now" prompts, and ULTIMATE_BUILD_PROMPT.md. All moved to docs/archive/ during 2026-06-10 cleanup so the signal (current CF + Supabase) is clear.

---

## Security Considerations (2026-07-09 hardening)

- RLS everywhere; audit migration `20260709000000_security_hardening_audit.sql` on prod
- **Transactions:** clients may only insert `pending` gifts — never `completed`/`confirmed` from browser
- **Funding triggers:** run only when status becomes `confirmed` (server/webhook path)
- **Contributions / supporters / leaderboard / notifications:** no open client write policies
- **Private visibility:** not enumerable; single-slug access via `get_wishlist_by_slug` RPC
- **Profiles:** public SELECT of profile rows (needed for guest wishlist creator joins)
- **Storage `media`:** INSERT restricted to owner folder `auth.uid()`
- **Nostr login:** pubkey-as-password **disabled** until Edge Function challenge auth
- **BTCPay:** no API keys or webhook secrets in `VITE_*` — proxy via `VITE_API_BASE_URL` only
- **Protected routes:** `/dashboard`, `/settings`, `/project/*`
- HTTPS + CSP (`public/_headers` on Cloudflare Pages)
- Nostr signing keys stay in the user’s extension

**Still open (architectural):**
- Edge Function: BTCPay invoices + HMAC webhook → `confirmed`
- Edge Function: Nostr NIP-07 challenge → Supabase session
- Rate limiting, CI secret scanning, payment idempotency

---

## Data & Privacy Philosophy

- User owns their keys (Nostr) and their money (Lightning direct or self-hosted BTCPay).
- Platform should know as little as possible: a contribution can be pseudonymous (name + message only).
- Public data is opt-in (published wishlists).
- Future PYNYM layer will let even the "who paid whom" relationship be mixnet-routed.
- This is why "Safe Harbour" and giveabit.io language matters — legal + cultural protection for private voluntary association and giving.

---

## How to Extend (Practical Advice)

- New page: add route in App.tsx + create pages/WhateverPage.tsx + Link in Navbar/Footer.
- New Bitcoin method: extend wallet_address types + UI in PaymentMethodManager + wire into QR / payment tabs.
- Real BTCPay: implement the webhook Edge Function (see guide), call btcPayService from a "Pay" button, listen for settled → update txn row.
- Deeper Nostr: add more event kinds (comments as kind 1 replies, reactions, badges).
- Privacy: add pynymService.ts modeled after the sketch in the BTCPay guide.

---

**This architecture doc + the types in src/lib/supabase.ts + the 23 migrations + lib/nostr.ts + lib/btcpay.ts should let any competent dev (or Kimi) understand the system quickly and extend it safely while respecting the 0% fee + sovereignty invariants.**

**Cross-reference**: SOURCE-OF-TRUTH.md, EXECUTIVE-SUMMARY.md, the guides in docs/guides/, and the actual code.

**Done ✅** — architecture captured cleanly for the handoff.