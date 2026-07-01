# Katoa — Grok Handoff

**Prepared:** 2026-07-01 by Kimi (Hermes Agent)
**For:** Grok (xAI) — first-time katoa developer
**Repo:** github.com/kitsboy/katoa
**Live:** katoa.org → Cloudflare Pages
**Branch:** main

---

## 1. What Is Katoa

Zero-fee Bitcoin Lightning creator support platform. Wishlists, crowdfunding, Bitcoin Pulse widget, Nostr identity, 7 languages. Tagline: "Keep All That's Owed Always."

## 2. Quick Start

```bash
cd ~/projects/katoa
npm install
npm run dev        # → http://localhost:5173
npm run build      # → dist/
npm run preview    # → http://localhost:4173 (serves dist/)
```

## 3. Architecture

| Layer | Tech | Notes |
|-------|------|-------|
| Framework | React 18 + TypeScript + Vite | Not React 19 like giveabit.io |
| Router | React Router DOM v6.30 | BrowserRouter in App.tsx — clean URLs |
| State | React Context (Auth, Language) | No external state library |
| Auth | Supabase | Lazy client — placeholder fallback if down |
| i18n | Custom LanguageContext | 7 languages embedded in TS file |
| Styling | Tailwind CSS v3 + custom theme | Custom colors: neon-cyan, night-blue, bitcoin-orange |
| Payments | Supabase (DB) + Nostr + Lightning | Nostr via nostr-tools |

## 4. File Tree

```
katoa/
├── src/
│   ├── App.tsx              # Router + Layout wrapper
│   ├── main.tsx             # Entry point (no router here)
│   ├── index.css            # Tailwind + custom theme
│   ├── components/          # Reusable: Navbar, Footer, Card, Button, etc.
│   │   ├── Link.tsx         # React Router Link wrapper (accepts `href` or `to`)
│   │   ├── Navbar.tsx       # Responsive nav with mobile drawer
│   │   └── Footer.tsx       # Footer with donate QR modal
│   ├── pages/               # 16 page components
│   │   ├── HomePage.tsx
│   │   ├── ExplorePage.tsx
│   │   ├── AuthPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── WishlistPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── ProjectPage.tsx
│   │   ├── AboutPage.tsx, ContactPage.tsx, FAQPage.tsx
│   │   ├── PricingPage.tsx, ComparisonPage.tsx
│   │   ├── TermsPage.tsx, PrivacyPage.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx   # Supabase auth + profile
│   │   └── LanguageContext.tsx # 7-language i18n (en, es, pt, fr, de, ja, zh)
│   ├── lib/
│   │   ├── supabase.ts      # Lazy Supabase client with placeholder fallback
│   │   └── nostr.ts         # Nostr service (SimplePool, events)
│   └── hooks/
│       └── useRouter.tsx    # DEPRECATED — kept for reference, not used
├── public/
│   ├── _headers             # Security + Cache + Content-Type rules
│   ├── _redirects           # SPA: /* /index.html 200
│   └── content/updates.md   # Changelog content
├── docs/
│   ├── DIRECTORY-MAP.md     # Full tree + facts (generated)
│   ├── MISSION.md, SEO*.md, I18N.md
│   └── ARCHITECTURE.md, ROADMAP.md, MARKETING.md
├── archive/                 # Stale reference docs (not deleted)
├── vite.config.ts           # Code-split: vendor, supabase, nostr, ui chunks
└── package.json             # v1.0.0 — deps include react-router-dom
```

## 5. Deployment Pipeline

| Step | Command | Notes |
|------|---------|-------|
| Build | `npm run build` | Outputs to `dist/` |
| Deploy (wrangler) | `wrangler pages deploy dist/ --project-name katoa --branch main` | From M4 |
| Deploy (git) | `git push origin main` | CF Pages auto-builds from GitHub |
| Preview | Wrangler output URL (e.g. `https://abc123.katoa.pages.dev`) | Always deploy to preview first |

**Critical pre-deploy steps:**
```bash
# Strip crossorigin from module scripts (required for CF Pages)
sed -i '' 's/ crossorigin//g' dist/index.html

# Verify content-types
curl -sI "https://preview-url/assets/index-*.js" | grep content-type  # Expect: application/javascript
curl -sI "https://preview-url/assets/index-*.css" | grep content-type  # Expect: text/css
```

## 6. Known Issues

| Issue | Status | Fix |
|-------|--------|-----|
| Supabase project deleted | 🟡 Placeholder fallback active | Create new Supabase project, set `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` in CF Pages env vars |
| 1.5MB JS bundle | 🟡 Code-split but still large | Add page-level `React.lazy()` for 14 pages to split further |
| Custom i18n (7 langs) vs shared (8 langs) | 🟡 Uses own LanguageContext | Can refactor to use giveabit.io's `I18nProvider` if desired |
| `netlify.toml` archived | ✅ Migrated to `_headers` | Security + cache rules now in CF Pages format |

## 7. Quick Reference for Grok

- **This is a TypeScript app** — `.tsx` files, strict mode. Different from giveabit.io's plain JSX.
- **Router is React Router v6** — use `<Link to="...">`, `<Route path="...">`, `useNavigate()` etc.
- **Supabase is lazy** — `createClient()` wrapped in try/catch. Use `getClient()` for guaranteed client access.
- **LanguageContext has 7 languages** embedded in one file. To add an 8th (e.g. Arabic), add the records to the `translations` object and the `Language` type.
- **The `docs/DIRECTORY-MAP.md`** has the full file tree for quick navigation.
- **When deploying**: always verify `_headers` has CSS + JS Content-Type rules, and `dist/index.html` has no `crossorigin` attribute on `<script>` tags.

## 8. Kimi / HERMES Operations

Full runbook for Supabase provisioning, Cloudflare env vars, BTC Map, and demo login:

**`docs/KIMI-HERMES-OPS.md`**

Scripts: `scripts/setup-supabase.sh`, `scripts/cloudflare-pages-env.sh`

## 9. Contact

- **Kimi** (Hermes Agent) — handled the React Router migration, code-split, Supabase resilience, and docs port
- **Give A Bit parent**: giveabit.io — shared i18n, deployment template, all project documentation