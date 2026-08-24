# KATOA (Katoa.org)

**0% Fees Forever. Built on Bitcoin Lightning Network.**

A revolutionary creator platform enabling anyone, anywhere to receive support via Bitcoin and Lightning Network. No bank account required. No KYC. No platform fees. Ever.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn

### Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/kitsboy/katoa.git
   cd katoa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   ```
   http://localhost:5173
   ```

## 🌐 Deployment

### Live Site
**https://katoa.org/** — Currently live on Cloudflare (custom domain, SPA).

### Quick Deploy / Update
- Build: `npm run build` (outputs to `dist`)
- See current deployment notes in [docs/deployment/DEPLOYMENT.md](./docs/deployment/DEPLOYMENT.md)
- Historical cPanel/Netlify Drop experiments are archived in `docs/archive/` (for reference only)

**Configs**: `netlify.toml` (security headers, redirects, caching) + `public/_redirects` are present. Actual hosting confirmed via live headers (Cloudflare).

## 📚 Documentation (Best Organized for Humans + Kimi Handoff)

**Design & marketing (read before UI or pitch work)**:
- [docs/DESIGN.md](./docs/DESIGN.md) — Night-jewel tokens, contrast rules, components, z-index, mobile patterns (living doc)
- [docs/EXECUTIVE-SUMMARY.md](./docs/EXECUTIVE-SUMMARY.md) — Leadership overview (~5 min read)
- [docs/MARKETING.md](./docs/MARKETING.md) — Pitch, messaging, CTAs, campaigns
- [docs/marketing/KATOA-Marketing-Presentation.pdf](./docs/marketing/KATOA-Marketing-Presentation.pdf) — Slide deck (PDF)

**Start here for handoff / big picture**:
- [docs/KIMI-HANDOFF.md](./docs/KIMI-HANDOFF.md) — Rolling handoff log for Kimi (M4/Obsidian/HERMES)
- [LATEST-UPDATE.md](./LATEST-UPDATE.md) — One-line session summary + last commit
- [docs/EXECUTIVE-SUMMARY.md](./docs/EXECUTIVE-SUMMARY.md) — Robust high-level overview (what it is, why it matters, current state, gaps)
- [docs/MARKETING.md](./docs/MARKETING.md) — Full pitch, value props, comparisons, messaging, CTAs, Give A Bit alignment
- [docs/README.md](./docs/README.md) — Documentation index

**Guides & Reference**:
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — System overview, DB schema (from 23 migrations), Nostr/BTCPay layers, security model, data flows, extension points (excellent for Kimi + devs)
- [docs/ROADMAP.md](./docs/ROADMAP.md) — Feature roadmap (rebranded + cleaned)
- [docs/guides/BTCPAY_INTEGRATION.md](./docs/guides/BTCPAY_INTEGRATION.md) — Bitcoin payment setup (ready for live wiring)
- [docs/guides/NOSTR_GUIDE.md](./docs/guides/NOSTR_GUIDE.md) — Full Nostr integration (NIP-07, publishing, zaps prep, etc.)
- [docs/guides/INTEGRATION_GUIDE.md](./docs/guides/INTEGRATION_GUIDE.md) — Broader integration notes
- [docs/guides/QR_CODE_INSTRUCTIONS.md](./docs/guides/QR_CODE_INSTRUCTIONS.md)
- [docs/deployment/DEPLOYMENT.md](./docs/deployment/DEPLOYMENT.md) — Historical + context
- Historical junk (old cPanel tarballs, SSL fixes, upload prompts, huge build tars) → `docs/archive/` (preserved for institutional knowledge, not active)

All docs are Obsidian-friendly Markdown. Run the `giveabit-project-handoff` skill after any work to keep Kimi current.

## ✨ Features (Production-Ready Core + Live Polish)

### Core Platform (0% Fees Forever)
- ✅ **0% Platform Fees** — Keep 100% of your earnings ("Keep All That's Owed Always")
- ✅ **Global Accessibility** — Works in 195+ countries, no bank or KYC required
- ✅ **Lightning settlement path** — sats to wallets you control (production invoice webhook still THOR)
- ✅ **Censorship Resistant & Private** — Decentralized infrastructure + Nostr identity today; PYNYM / BIP-47 / Silent Payments planned

### Creator & Project Features
- ✅ Create unlimited projects, wishlists, and crowdfunding campaigns
- ✅ Multiple revenue streams (donations, wishlist items, future subscriptions)
- ✅ Add items from Amazon, eBay, Etsy with smart URL auto-parsing (title, image, price)
- ✅ Per-item funding progress + goals + merchant links + shipping flags
- ✅ Rich media: uploads (images, video, docs), profile banners, galleries
- ✅ Social feed embeds (X/Twitter, Instagram, YouTube)
- ✅ Categories, tags, visibility controls, geo/country support

### Bitcoin & Payment Features (Live Today)
- ✅ Direct Lightning Address + on-chain + payment code (LNURL) support
- ✅ Multiple wallet addresses per creator with labels
- ✅ Beautiful QR code generation + scanner
- ✅ Real-time Bitcoin price + sats conversion (footer strip, navbar ticker)
- ✅ **Fee Comparison** calculator (shows exactly how much traditional platforms take)
- ✅ Motion hero with glass overlay card, floating island navbar, PWA install prompt
- ✅ BTCPay Server integration **code + comprehensive guide ready** (full live wiring is the current priority gap)
- ✅ Nostr-powered Lightning address resolution

### Social & Discovery (Fully Wired)
- ✅ Follow system + project follows
- ✅ Contributions tracking + leaderboards
- ✅ Explore / discover page
- ✅ Public + private visibility
- ✅ Share buttons everywhere

### Platform & UX
- ✅ Multi-language support (en, es, pt, fr, de, ja, zh — no Swahili)
- ✅ Night-jewel design system (deep plum / ember — not beige, not all-black; mobile-first)
- ✅ Toast notifications, ConfirmDialog, EmptyState, Breadcrumbs, PageMeta (dynamic OG)
- ✅ PWA service worker v2, offline fallback, `npm run sitemap`
- ✅ Nostr authentication (NIP-07 browser extension: Alby etc.) — full profile sync + wishlist publishing (NIP-78)
- ✅ Dashboard for full self-serve management

### In Progress / Next
- 🚧 BTCPay Server end-to-end (invoices, webhooks, checkout) — stubs + guide excellent
- 🚧 Deeper privacy layers (PYNYM client integration, BIP-47, etc.)
- 🚧 Real-time notifications polish, email (privacy-preserving), analytics
- See [docs/ROADMAP.md](./docs/ROADMAP.md) for full phased plan

**Live differentiators you can feel today**: Motion hero, fee calculator, Nostr login flow, explore pagination, and the instant "keep 100%" story.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Context

### Backend
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Email/Password)
- **Storage**: Supabase Storage
- **Row Level Security**: Comprehensive RLS policies

### Bitcoin Integration
- **Payments**: BTCPay Server + Lightning Network
- **Libraries**: nostr-tools for decentralized identity
- **Map**: MapLibre GL + OpenFreeMap (Leaflet fully removed)
- **Price Data**: Coinbase / CoinGecko APIs (footer + navbar BTC price strip; Pulse/Protocol widgets removed)

### Infrastructure
- **Hosting (Live)**: Cloudflare (custom domain katoa.org, CF headers confirmed)
- **Configs**: netlify.toml + public/_redirects (SPA routing, strong security headers, caching)
- **Backend**: Supabase (Postgres + Auth + Storage + RLS)
- **Bitcoin**: Lightning + Nostr + BTCPay (in progress)
- **SSL / Edge**: Automatic via host

## 📁 Project Structure

```
/src
  /components     # 57 reusable UI components
    - HeroOverlayCard, HeroMotionBackground, Navbar (floating island)
    - Toast, ConfirmDialog, PageMeta, Breadcrumbs, EmptyState
    - FeeComparison, DonateQRModal, FooterBitcoinStrip, PwaInstallPrompt
    - PaymentMethodManager, WalletAddressManager, QRCodeModal, etc.
  /contexts       # AuthContext, LanguageContext, CurrencyContext
  /data           # changelog.json, mock data
  /hooks          # useRouter.tsx (deprecated — React Router v6 in App.tsx)
  /lib            # supabase, nostr, btcpay, bitcoinPrice, productParser
  /pages          # ~29 route pages (lazy-loaded)
    - Home, Explore, Creators, Guidelines, /u/:username profiles
    - WishlistRoute, Dashboard, Project, Settings, Messages
    - About, Contact, FAQ, Pricing, Comparison, Pitch (noindex)
    - Security, Roadmap, Templates, Press, Meetup, Case studies
    - Terms, Privacy, Auth, NIP-05, NotFound
/scripts          # generate-sitemap.mjs, setup-supabase.sh, etc.
/supabase/migrations  # 23 database migrations
/public           # sw.js, robots.txt, sitemap.xml, static assets
```

## 🔧 Available Scripts

```bash
npm run dev        # Start development server (port 5173)
npm run build      # Build for production
npm run preview    # Preview production build
npm run typecheck  # TypeScript type checking
npm run lint       # ESLint code linting
npm run sitemap    # Regenerate public/sitemap.xml
```

## 🌍 Environment Variables

Required variables (add to `.env`):

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Optional (for Bitcoin payments — public config only; never put store API keys in `VITE_*`):

```env
VITE_BTCPAY_SERVER_URL=your-btcpay-url
VITE_BTCPAY_STORE_ID=your-store-id
```

BTCPay settlement is `supabase/functions/btcpay-webhook` (HMAC + service role). Deploy with `supabase functions deploy btcpay-webhook --no-verify-jwt` and `supabase secrets set BTCPAY_WEBHOOK_SECRET`. Point the store webhook at `https://<project-ref>.supabase.co/functions/v1/btcpay-webhook` for `InvoiceSettled` / `InvoicePaymentSettled`. See `supabase/functions/btcpay-webhook/README.md`.

## 🗄️ Database Schema

### Core Tables
- `profiles` - User profiles with banners and social feeds
- `wishlists` - Project/wishlist containers
- `wishlist_items` - Individual items within wishlists
- `wallet_addresses` - Bitcoin wallet addresses
- `payment_codes` - Lightning addresses, LNURL
- `contributions` - Donation tracking
- `follows` - User following system
- `wishlist_media` - Media attachments

### Features
- Comprehensive Row Level Security (RLS)
- Optimized indexes for performance
- Foreign key constraints
- Automatic timestamps
- Cascade deletes

## 🔐 Security

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Authenticated user policies
- ✅ Owner-only edit/delete permissions
- ✅ Public read for published content
- ✅ Environment variables for sensitive data
- ✅ HTTPS enforced in production
- ✅ XSS and CSRF protection
- ✅ No API keys exposed in client code
- ✅ Secure wallet address validation

## 🎨 Design Principles

Night-jewel (target — CSS landing in parallel). See [`docs/DESIGN.md`](./docs/DESIGN.md).

### Color Palette
- Deep plum (`#12081c`) / ember (`#080510`) — page surfaces. **Not** beige `#dfd4c8`. **Not** pure `#000`
- Violet (`#a78bfa`) — product energy, hover rings
- Bitcoin orange (`#F7931A`) — money, sats, donate
- Neon cyan (`#14E6FF`) — interactive, focus, links
- Body near-white; muted ≥ `#c4b8d4` (never gray-600 on dark)

### UX Features
- Soft glow effects on primary elements
- Smooth transitions and hover states
- Portal-based tooltips (always visible)
- Responsive breakpoints
- Accessible contrast ratios
- Mobile-first design

## 🤝 Contributing & Handoff

This project welcomes contributions! (See the basic process in the old text below; we will expand into a proper CONTRIBUTING.md soon.)

**For Give A Bit two-machine workflow (M3 coding ↔ M4 Kimi/Obsidian)**:
- At the end of any session, run the **giveabit-project-handoff** skill.
- This updates SOURCE-OF-TRUTH.md and generates a clean KIMI-HANDOFF-*.md.
- Kimi integrates the structured docs into MASTER-BRAIN.md, Kanban, and the permanent vault (no raw chat dumps).
- Sync the hand-off files (and/or project folder) via Tailscale to the M4 Obsidian location for nightly backups.

**Current hand-off package (as of 2026-08-24)**:
- `docs/KIMI-HANDOFF.md` — rolling session log
- `LATEST-UPDATE.md` — last commit one-liner
- `docs/EXECUTIVE-SUMMARY.md`, `docs/MARKETING.md`, `docs/DESIGN.md`
- `docs/GROK-HANDOFF.md` — developer quick-start

Run the **giveabit-project-handoff** skill at session end per `GROK-SESSION-PROTOCOL.md`.

---

### Basic Contribution Process (Classic)
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly (`npm run build` and `npm run typecheck`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style
- TypeScript for type safety
- Functional components with hooks
- Tailwind CSS for styling
- ESLint configuration included
- Meaningful component names
- Comment complex logic

## 📄 License

MIT License — See [LICENSE](./LICENSE) (newly added during 2026-06-10 organization pass for clean handoff).

## 🆘 Troubleshooting

### Site shows "ERR_CONNECTION_TIMED_OUT"
- **Issue**: Domain not deployed yet
- **Fix**: Follow [DEPLOYMENT.md](./DEPLOYMENT.md) to deploy

### Database errors
- **Issue**: Supabase not configured
- **Fix**: Check `.env` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- **Fix**: Run migrations from `/supabase/migrations/` in order

### Build fails
- **Issue**: Dependencies or TypeScript errors
- **Fix**: Run `npm install` and `npm run typecheck`
- **Fix**: Clear `node_modules` and reinstall: `rm -rf node_modules package-lock.json && npm install`

### Tooltips not showing
- **Issue**: Portal rendering issue
- **Fix**: Tooltips use React portals to document.body - ensure no CSP blocking

### Bitcoin price not updating
- **Issue**: CoinGecko API rate limit
- **Fix**: Implement caching or use backup API

## 📞 Support

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check the guide files in root directory
- **Community**: Join discussions in Issues
- **Email**: Contact through website

## 🎯 Roadmap

See the full living roadmap: **[docs/ROADMAP.md](./docs/ROADMAP.md)** (rebranded from early BitWish notes, cleaned during handoff prep).

**High-level status (2026-08-24, v1.1.7)**:
- ✅ ~29 routes live at katoa.org (Cloudflare Pages) — wishlists, public `/u/:username` profiles, creators, map, PWA, i18n (7 langs)
- ✅ Night-jewel visual target (plum / ember / violet). Map is MapLibre + OpenFreeMap
- ✅ OF-parity UI (likes/comments/PPV/subscribe) as **client-local seams** until THOR Lightning webhook
- 🚧 Production Lightning invoices + webhook (code exists; do not claim live settlement)
- 📋 Sample metrics only (`public/metrics.json`, 11 creators, `demo: true`) — never “thousands of creators”

The product is a usable 0% PLATFORM-fee Bitcoin creator surface today. Stay honest about Lightning and demo catalogs.

## 🌟 Why KATOA?

### For Creators
- Keep 100% of your earnings (0% platform fees)
- Receive payments from anywhere in the world
- No bank account or KYC required
- Instant settlement via Lightning Network
- Censorship-resistant platform
- Own your data and keys

### vs. Other Platforms
- **Throne**: 10% fees, limited countries, requires banking
- **Linktree**: 9-10% fees + $40/month, requires banking
- **OnlyFans**: 20% fees, 7-day payouts, requires banking
- **Kickstarter**: 5% + 3-5% payment fees, fulfillment required
- **KATOA**: 0% fees, 195+ countries, instant payouts

### Technical Advantages
- Built on Bitcoin Lightning (decentralized)
- Open source (MIT license)
- Modern tech stack (React, TypeScript, Supabase)
- Enterprise-grade security (RLS, HTTPS)
- Scalable architecture

---

**Built with ⚡ on Bitcoin Lightning Network**

**KATOA - Keep All That's Owed Always**

*Empowering creators worldwide with financial freedom and true ownership.*

---

**Part of the Give A Bit ecosystem** — [giveabit.io](https://giveabit.io)  
Bitcoin sovereignty tools for private, feel-good giving. Privacy (Lightning + Nostr + PYNYM), education, Safe Harbour, open source.

**For Kimi / future hand-offs**: See `docs/KIMI-HANDOFF.md` + `LATEST-UPDATE.md`. Documentation is the most important deliverable for seamless M3↔M4 continuity.


## Diligence / partner pack
Full disclosure for technical & financial partners: **[docs/diligence/](./docs/diligence/)**  
Portfolio map: [Family of 8](https://github.com/kitsboy/giveabit/blob/main/docs/diligence/PORTFOLIO-FAMILY-OF-8.md)

