# BitWish (Katoa.org)

A Bitcoin-powered global crowdfunding platform enabling anyone to create wishlists and receive support via Bitcoin and Lightning Network.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/bitwish.git
   cd bitwish
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

Your site is having connection issues because it's not deployed yet.

### **Fastest Method - Netlify Drop (2 minutes)**

1. Build: `npm run build`
2. Go to: https://app.netlify.com/drop
3. Drag the `dist` folder
4. Connect custom domain `katoa.org`

**Full deployment guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - How to deploy to production
- [BTCPay Integration](./BTCPAY_INTEGRATION.md) - Bitcoin payment setup
- [Nostr Guide](./NOSTR_GUIDE.md) - Decentralized identity integration
- [Integration Guide](./INTEGRATION_GUIDE.md) - API and webhooks

## ✨ Features

- ✅ Create public wishlists with Bitcoin addresses
- ✅ Add items from Amazon, eBay, Etsy with auto-parsing
- ✅ Track funding progress per item
- ✅ Upload images, videos, documents
- ✅ Share on all social platforms
- ✅ QR codes for easy Bitcoin donations
- ✅ Lightning Network support
- ✅ Multi-language (7 languages)
- ✅ Nostr authentication ready
- 🚧 BTCPay Server integration (in progress)
- 🚧 PYNYMS privacy layer (planned)

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Payments**: BTCPay Server + Lightning
- **Icons**: Lucide React

## 📁 Project Structure

```
/src
  /components     # Reusable UI components
  /contexts       # React contexts (Auth, Language)
  /data           # Mock data for development
  /hooks          # Custom React hooks
  /lib            # Utilities (Supabase, Nostr, BTCPay)
  /pages          # Page components
/supabase
  /migrations     # Database migrations
/public           # Static assets
```

## 🔧 Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run typecheck  # Type checking
npm run lint       # Code linting
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

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Optimized policies for performance at scale
- Environment variables for sensitive data
- HTTPS enforced in production
- XSS and CSRF protection

## 🤝 Contributing

This project welcomes contributions! To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Troubleshooting

### Site shows "ERR_CONNECTION_TIMED_OUT"
- **Issue**: Domain not deployed yet
- **Fix**: Follow [DEPLOYMENT.md](./DEPLOYMENT.md) to deploy

### Database errors
- **Issue**: Supabase not configured
- **Fix**: Check `.env` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### Build fails
- **Issue**: Dependencies or TypeScript errors
- **Fix**: Run `npm install` and `npm run typecheck`

## 📞 Support

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check the `/docs` guides
- **Community**: Join discussions in Issues

## 🎯 Roadmap

- [x] Core wishlist functionality
- [x] Product URL parsing
- [x] Media uploads
- [x] Social sharing
- [x] QR code generation
- [ ] BTCPay Server live integration
- [ ] Nostr authentication
- [ ] PYNYMS privacy layer
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Analytics dashboard

---

**Built with ❤️ and ⚡ for a better world**
