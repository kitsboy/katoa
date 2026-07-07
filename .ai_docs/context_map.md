# Katoa — Technical Context Map

> **Generated:** 2026-07-06
> **Audit target:** `~/projects/katoa/` on M3

---

## 1. Directory Structure

```
katoa/
├── .ai_docs/                  # AI-readable project documentation
├── .env.example               # Environment variable template
├── .env.local                 # Local dev secrets (gitignored)
├── .env.server.local          # Server-only secrets (gitignored)
├── AGENTS.md                  # Agent instructions
├── GROK-SESSION-PROTOCOL.md   # Grok session protocol
├── KIMI-HANDOFF-*.md          # Kimi handoff docs
├── SESSION-SUMMARY-*.md       # Session summaries
├── README.md                  # Project readme
├── LICENSE
├── package.json
├── package-lock.json
├── index.html                 # SPA entry point (SEO meta tags)
├── vite.config.ts             # Vite config (proxy, plugins, code splitting)
├── tsconfig.json              # Root TS config
├── tsconfig.app.json          # App TS config (src/, strict)
├── tsconfig.node.json         # Node TS config (vite.config.ts)
├── eslint.config.js           # ESLint flat config (TS strict)
├── postcss.config.js          # PostCSS (tailwindcss + autoprefixer)
├── tailwind.config.js         # Tailwind design tokens (custom colors, fonts)
│
├── archive/                   # Archived docs (old Netlify config, handoffs)
├── docs/                      # Project documentation
├── dist/                      # Build output (~2.9 MB)
├── node_modules/              # Dependencies
├── public/                    # Static assets (copied verbatim to dist/)
├── scripts/                   # Utility scripts (CF Pages env, Supabase setup)
│
├── src/                       # Application source
│   ├── main.tsx               # React entry point
│   ├── App.tsx                # Root component with router
│   ├── index.css              # Global styles + Tailwind directives
│   ├── vite-env.d.ts          # Vite type declarations
│   │
│   ├── pages/                 # Route pages (17, all lazy-loaded)
│   │   ├── HomePage, ExplorePage, WishlistRoutePage, DashboardPage
│   │   ├── ProjectPage, SettingsPage, PitchPage, ComparisonPage
│   │   ├── PricingPage, AboutPage, ContactPage, FAQPage
│   │   ├── AuthPage, TermsPage, PrivacyPage, NotFoundPage
│   │   └── WishlistPage (dashboard embed)
│   │
│   ├── components/            # 57 reusable UI components
│   │   ├── Navbar (floating island), Footer, MobileNav
│   │   ├── HeroOverlayCard, HeroMotionBackground, PageHero
│   │   ├── Toast, ConfirmDialog, PageMeta, Breadcrumbs, EmptyState
│   │   ├── Button, Card, Modal, Input, Link, GlassSection
│   │   ├── FeeComparison, DonateQRModal, FooterBitcoinStrip
│   │   ├── SatsDisplay, ContributorsWall, PwaInstallPrompt
│   │   └── WalletAddressManager, PaymentMethodManager, etc.
│   │
│   ├── contexts/              # React contexts
│   │   ├── AuthContext.tsx, CurrencyContext.tsx, LanguageContext.tsx
│   │
│   ├── hooks/
│   │   └── useRouter.tsx      # DEPRECATED — React Router v6 in App.tsx
│   │
│   ├── lib/                   # Library/API modules
│   │   ├── supabase.ts, nostr.ts, btcpay.ts, btcmap.ts
│   │   ├── bitcoinPrice.ts, demoAuth.ts
│   │   ├── productParser.ts, urlParser.ts
│   │   └── api/client.ts
│   │
│   ├── data/
│   │   ├── mockWishlists.ts, footerJobs.ts
│   │
│   └── types/
│       ├── database.ts, database.generated.ts
│
└── supabase/                  # Supabase configuration
    ├── config.toml            # Local Supabase config
    ├── functions/             # Edge Functions
    ├── migrations/            # Database migrations (24 files)
    └── .temp/
```

---

## 2. Dependency Table

| Package | Version | Purpose |
|---|---|---|
| **Dependencies** | | |
| react | ^18.3.1 | UI framework |
| react-dom | ^18.3.1 | DOM renderer |
| react-router-dom | ^6.26.0 | Client-side routing (SPA) |
| @supabase/supabase-js | ^2.57.4 | Supabase client (auth, DB, storage) |
| nostr-tools | ^2.17.1 | Nostr protocol (decentralized identity) |
| lucide-react | ^0.344.0 | Icon library |
| react-markdown | ^10.1.0 | Markdown rendering |
| leaflet | ^1.9.4 | Map display (BTC Map pins) |
| html-react-parser | ^5.2.17 | HTML-to-React parsing |
| url | ^0.11.4 | URL parsing polyfill |
| **Dev Dependencies** | | |
| vite | ^5.4.2 | Bundler & dev server |
| @vitejs/plugin-react | ^4.3.1 | React Fast Refresh + JSX transform |
| typescript | ^5.5.3 | Type system |
| tailwindcss | ^3.4.1 | Utility-first CSS |
| postcss | ^8.4.35 | CSS post-processor |
| autoprefixer | ^10.4.18 | CSS vendor prefixes |
| eslint | ^9.9.1 | Linter (flat config) |
| typescript-eslint | ^8.3.0 | TS lint rules |

---

## 3. Vite Proxy Configuration

```
Mount:       /btcmap-api-proxy
Target:      https://api.btcmap.org
Rewrite:     Strip /btcmap-api-proxy prefix
ChangeOrigin: true
```

Used to proxy BTC Map API requests locally — avoids CORS issues in development.

---

## 4. Supabase Configuration

- **Project ref:** pglqjtipbocjnqmiwmwf
- **Remote URL:** https://pglqjtipbocjnqmiwmwf.supabase.co
- **Auth:** Email/password + Google OAuth
- **Database:** PostgreSQL 15
- **Local ports:** API: 54321, DB: 54322, Studio: 54323
- **Migrations:** 24 files
- **Auth redirect URLs:** http://localhost:5173, http://localhost:5173/dashboard, https://katoa.org/dashboard
- **Edge Functions:** Yes

---

## 5. Development Server

- **URL:** http://localhost:5173
- **Port:** 5173 (Vite default)
- **HMR:** Yes (React Fast Refresh)
- **Dev proxy:** /btcmap-api-proxy active

---

## 6. Environment Variables

### Client-side (VITE_* prefix)

| Variable | Required |
|---|---|
| VITE_SUPABASE_URL | Yes |
| VITE_SUPABASE_ANON_KEY | Yes (publishable key only) |
| VITE_BTCMAP_API_URL | Yes |
| VITE_BTCMAP_APP_URL | Yes |
| VITE_BTCMAP_ENABLED | Yes |
| VITE_APP_URL | Yes |
| VITE_APP_NAME | Yes |
| VITE_API_BASE_URL | No |
| VITE_DEMO_MODE | No |
| VITE_BTCPAY_* vars | No (optional BTCPay Server) |

### Server-only (NOT VITE_*)

| Variable | Purpose |
|---|---|
| SUPABASE_PROJECT_REF | pglqjtipbocjnqmiwmwf |
| SUPABASE_URL | Remote Supabase URL |
| SUPABASE_SERVICE_ROLE_KEY | Admin key (server-side only) |

---

## 7. Build Output

- **Format:** Static SPA (index.html + JS/CSS chunks + assets)
- **Output:** dist/ (~2.9 MB)
- **Chunks:** vendor (react), supabase, nostr; Lucide split per-route (no monolithic ui chunk)
- **Caching:** 1-year immutable for /assets/* and images
- **SPA routing:** /* -> /index.html 200
- **Security headers:** HSTS, X-Frame-Options, CSP

---

## 8. Deploy Targets

| Target | Status |
|---|---|
| Cloudflare Pages | **Primary** (auto-deploy on main push) |
| Netlify | Archived (config in archive/netlify.toml) |

---

## 9. Key Design Details

- **Design tokens:** charcoal, neon-cyan, bitcoin-orange (modern); night-blue/sand-tan legacy in CSS only
- **Hero/nav CSS:** `.hero-overlay-card`, `.nav-island`, `.hero-headline-accent` in index.css
- **PWA:** public/sw.js v2; `npm run sitemap` for sitemap generation
- **SEO:** OG tags, Twitter Cards, JSON-LD structured data in index.html
- **Integrations:** Nostr (decentralized identity), BTC Map (Leaflet), BTCPay Server (optional), Lightning Network
