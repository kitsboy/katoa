# KATOA (Katoa.org)

**0% Fees Forever. Built on Bitcoin Lightning Network.**

A revolutionary creator platform enabling anyone, anywhere to receive support via Bitcoin and Lightning Network. No bank account required. No KYC. No platform fees. Ever.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/katoa.git
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

### **Fastest Method - Netlify Drop (2 minutes)**

1. Build: `npm run build`
2. Go to: https://app.netlify.com/drop
3. Drag the `dist` folder
4. Connect custom domain `katoa.org`

**Full deployment guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - How to deploy to production
- [cPanel Instructions](./FINAL-CPANEL-INSTRUCTIONS.md) - Deploy to cPanel hosting
- [BTCPay Integration](./BTCPAY_INTEGRATION.md) - Bitcoin payment setup
- [Nostr Guide](./NOSTR_GUIDE.md) - Decentralized identity integration
- [Integration Guide](./INTEGRATION_GUIDE.md) - API and webhooks
- [Implementation Roadmap](./IMPLEMENTATION_ROADMAP.md) - Feature roadmap

## ✨ Features

### Core Platform
- ✅ **0% Platform Fees** - Keep 100% of your earnings
- ✅ **Global Accessibility** - Works in 195+ countries
- ✅ **No Banking Required** - Bitcoin-native payments
- ✅ **Instant Settlement** - Lightning Network payments
- ✅ **Censorship Resistant** - Decentralized infrastructure
- ✅ **True Privacy** - Zero-knowledge proofs

### Creator Features
- ✅ Create unlimited projects and wishlists
- ✅ Multiple revenue streams (donations, subscriptions, crowdfunding)
- ✅ Add items from Amazon, eBay, Etsy with auto-parsing
- ✅ Track funding progress per item
- ✅ Upload images, videos, documents
- ✅ Profile banners and media galleries
- ✅ Social feed integration (Twitter, Instagram, YouTube)
- ✅ Categories and tags for discoverability

### Payment Features
- ✅ Bitcoin Lightning Network integration
- ✅ Multiple wallet address support
- ✅ Payment codes (Lightning Address, LNURL)
- ✅ QR codes for easy donations
- ✅ BTCPay Server integration ready
- ✅ Real-time Bitcoin price conversion

### Social Features
- ✅ Follow system
- ✅ Contributions tracking
- ✅ Leaderboards
- ✅ Share on all social platforms
- ✅ Public/private project visibility
- ✅ Explore and discover creators

### Platform Features
- ✅ Multi-language support (7 languages)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Bitcoin stats dashboard
- ✅ Fee comparison calculator
- ✅ Interactive tooltips with detailed info
- ✅ Premium UI/UX with animations

### In Progress
- 🚧 BTCPay Server live integration
- 🚧 Nostr authentication
- 🚧 PYNYMS privacy layer
- 🚧 Email notifications

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
- **Price Data**: CoinGecko API

### Infrastructure
- **Hosting**: Netlify / cPanel
- **CDN**: Netlify Edge
- **SSL**: Automatic HTTPS

## 📁 Project Structure

```
/src
  /components     # Reusable UI components
    - BitcoinStats.tsx
    - FeeComparison.tsx
    - QRCodeModal.tsx
    - Tooltip.tsx (with React portals)
    - PaymentMethodManager.tsx
    - WalletAddressManager.tsx
    - And 15+ more components
  /contexts       # React contexts
    - AuthContext.tsx (Authentication)
    - LanguageContext.tsx (i18n)
  /data           # Mock data for development
  /hooks          # Custom React hooks
    - useRouter.tsx
  /lib            # Utilities
    - supabase.ts (Database client)
    - nostr.ts (Nostr integration)
    - btcpay.ts (Payment integration)
    - bitcoinPrice.ts (Price fetching)
    - productParser.ts (URL parsing)
  /pages          # Page components
    - HomePage.tsx
    - DashboardPage.tsx
    - WishlistPage.tsx
    - ProjectPage.tsx
    - ExplorePage.tsx
    - ComparisonPage.tsx
    - PricingPage.tsx
    - SettingsPage.tsx
    - And 5+ more pages
/supabase
  /migrations     # Database migrations (20+ files)
/public           # Static assets
  - sats.svg (KATOA logo)
  - donations-qr.png
  - robots.txt
  - sitemap.xml
```

## 🔧 Available Scripts

```bash
npm run dev        # Start development server (port 5173)
npm run build      # Build for production
npm run preview    # Preview production build
npm run typecheck  # TypeScript type checking
npm run lint       # ESLint code linting
```

## 🌍 Environment Variables

Required variables (add to `.env`):

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Optional (for Bitcoin payments):

```env
VITE_BTCPAY_SERVER_URL=your-btcpay-url
VITE_BTCPAY_STORE_ID=your-store-id
VITE_BTCPAY_API_KEY=your-api-key
```

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

### Color Palette
- Bitcoin Orange (`#FF8700`) - Primary brand color
- Emerald/Cyan gradients - Success states
- Night Blue - Background tones
- Neutral grays - UI elements

### UX Features
- Soft glow effects on primary elements
- Smooth transitions and hover states
- Portal-based tooltips (always visible)
- Responsive breakpoints
- Accessible contrast ratios
- Mobile-first design

## 🤝 Contributing

This project welcomes contributions! To contribute:

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

MIT License - See LICENSE file for details

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

### Phase 1 - Core Platform ✅
- [x] User authentication
- [x] Profile management
- [x] Wishlist/project creation
- [x] Item management
- [x] Media uploads
- [x] Social sharing
- [x] QR code generation

### Phase 2 - Bitcoin Integration ✅
- [x] Wallet address management
- [x] Payment codes (Lightning, LNURL)
- [x] QR code generation
- [x] Bitcoin price tracking
- [x] Fee comparison calculator
- [ ] BTCPay Server live integration
- [ ] Automatic payment detection

### Phase 3 - Social Features ✅
- [x] Follow system
- [x] Contributions tracking
- [x] Leaderboards
- [x] Social feed embedding
- [x] Categories and tags
- [x] Explore page

### Phase 4 - Privacy & Decentralization 🚧
- [ ] Nostr authentication
- [ ] PYNYMS privacy layer
- [ ] Zero-knowledge proofs
- [ ] Encrypted messaging
- [ ] Decentralized storage

### Phase 5 - Advanced Features 📋
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Analytics dashboard
- [ ] Creator verification
- [ ] Milestone tracking
- [ ] Recurring subscriptions (BOLT 12)
- [ ] Multi-signature wallets
- [ ] Team collaboration

### Phase 6 - Scale & Optimize 📋
- [ ] Performance optimization
- [ ] CDN integration
- [ ] Advanced search
- [ ] AI-powered recommendations
- [ ] Video streaming
- [ ] Live streaming integration

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
