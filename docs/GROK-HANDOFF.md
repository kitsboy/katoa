# Katoa — Grok Handoff

**Prepared:** 2026-07-06 by Grok (M3) — updated after frontend polish batches
**For:** Grok / first-time katoa developer
**Repo:** github.com/kitsboy/katoa
**Live:** katoa.org → Cloudflare Pages
**Branch:** main
**Last commit:** `c65d1ed`

---

## 1. What Is Katoa

Zero-fee Bitcoin Lightning creator support platform. Wishlists, crowdfunding, Nostr identity, 7 languages. Tagline: "Keep All That's Owed Always."

**Pitch & leadership docs:** [`EXECUTIVE-SUMMARY.md`](./EXECUTIVE-SUMMARY.md) · [`MARKETING.md`](./MARKETING.md) · PDF deck [`marketing/KATOA-Marketing-Presentation.pdf`](./marketing/KATOA-Marketing-Presentation.pdf)

## 2. Quick Start

```bash
cd ~/projects/katoa
npm install
npm run dev        # → http://localhost:5173
npm run build      # → dist/
npm run preview    # → http://localhost:4173 (serves dist/)
npm run sitemap    # → public/sitemap.xml
```

## 3. Architecture

| Layer | Tech | Notes |
|-------|------|-------|
| Framework | React 18 + TypeScript + Vite | Not React 19 like giveabit.io |
| Router | React Router DOM v6.26 | BrowserRouter in App.tsx — all pages lazy-loaded |
| State | React Context (Auth, Language, Currency) + ToastProvider | No external state library |
| Auth | Supabase + Nostr NIP-07 | Lazy client — placeholder fallback if down |
| i18n | `LanguageContext` + `pageStrings` | 7 languages — see [`I18N.md`](./I18N.md) |
| Styling | Tailwind CSS v3 + custom theme | **Read [`docs/DESIGN.md`](./DESIGN.md)** — floating nav, hero overlay |
| Payments | Supabase (DB) + Nostr + Lightning | BTCPay stubs in `lib/btcpay.ts` |

## 4. File Tree (key paths)

```
katoa/
├── src/
│   ├── App.tsx              # Lazy routes + providers
│   ├── main.tsx             # Entry point
│   ├── index.css            # Tailwind + hero/nav CSS classes
│   ├── components/          # 57 components
│   │   ├── Navbar.tsx       # Floating island nav (.nav-island)
│   │   ├── HeroOverlayCard.tsx, HeroMotionBackground.tsx
│   │   ├── Toast.tsx, ConfirmDialog.tsx, PageMeta.tsx
│   │   ├── Footer.tsx, MobileNav.tsx, FeeComparison.tsx
│   │   └── ...
│   ├── pages/               # 17 page components (all lazy)
│   │   ├── HomePage.tsx, ExplorePage.tsx, WishlistRoutePage.tsx
│   │   ├── DashboardPage.tsx, ProjectPage.tsx, SettingsPage.tsx
│   │   ├── PitchPage.tsx, ComparisonPage.tsx, PricingPage.tsx
│   │   ├── AboutPage.tsx, ContactPage.tsx, FAQPage.tsx
│   │   ├── AuthPage.tsx, TermsPage.tsx, PrivacyPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   ├── LanguageContext.tsx  # translations + pageStrings
│   │   └── CurrencyContext.tsx
│   ├── lib/
│   │   ├── supabase.ts, nostr.ts, btcpay.ts
│   │   └── bitcoinPrice.ts, productParser.ts
│   └── data/changelog.json
├── scripts/
│   └── generate-sitemap.mjs
├── public/
│   ├── sw.js                # PWA service worker v2
│   ├── _headers, _redirects
│   └── content/updates.md   # Changelog markdown
└── docs/                    # Full doc index in docs/README.md
```

## 5. Deployment Pipeline

| Step | Command | Notes |
|------|---------|-------|
| Build | `npm run build` | Outputs to `dist/` |
| Sitemap | `npm run sitemap` | Before deploy if routes changed |
| Deploy (git) | `git push origin main` | CF Pages auto-builds from GitHub |
| Deploy (wrangler) | `wrangler pages deploy dist/ --project-name katoa` | From M4 |

**Critical pre-deploy steps:**
```bash
sed -i '' 's/ crossorigin//g' dist/index.html   # CF Pages module script fix
```

## 6. Known Issues

| Issue | Status | Fix |
|-------|--------|-----|
| Supabase project live | ✅ 23 migrations | Google OAuth needs Cloud Console credentials |
| ExplorePage JS chunk | 🟡 ~698KB (Lucide) | Further per-icon imports or dynamic imports |
| SPA SEO visibility | 🟡 Client-rendered only | Prerender/SSR recommended (see SEO.md) |
| BTCPay end-to-end | 🟡 Stubs + guide ready | Webhook edge function + prod wiring |

## 7. Quick Reference for Grok

- **TypeScript app** — `.tsx` files, strict mode
- **Router is React Router v6** — use `<Link to="...">`, `useNavigate()`, `useLocation()`
- **No Bitcoin Pulse / Protocol Updates** — removed 2026-07-06; homepage uses motion hero
- **ConfirmDialog + useToast** — never use native `confirm()` or `alert()`
- **Design system** — floating `.nav-island` navbar, `.hero-overlay-card`, charcoal/glass everywhere
- **Handoff protocol** — read `GROK-SESSION-PROTOCOL.md`, append to `docs/KIMI-HANDOFF.md` at session end

## 8. Kimi / HERMES Operations

Full runbook: **`docs/KIMI-HERMES-OPS.md`**

Scripts: `scripts/setup-supabase.sh`, `scripts/cloudflare-pages-env.sh`

## 9. Contact

- **Kimi** (Hermes Agent) — orchestration, Supabase/CF ops, vault
- **Grok** (M3) — frontend implementation, builds, pushes
- **Give A Bit parent**: giveabit.io — shared ecosystem, deployment template