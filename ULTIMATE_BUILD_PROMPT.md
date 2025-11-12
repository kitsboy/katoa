# Ultimate BitWish Platform - Comprehensive Build Specification

## Executive Vision

Build a next-generation, Bitcoin-native wishlist and gifting platform that combines privacy, sovereignty, and ease of use. This is a decentralized social gifting platform that empowers users to receive Bitcoin payments directly without intermediaries, while maintaining complete privacy and ownership of their data.

---

## Core Platform Architecture

### Technology Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth (email/password + Nostr NIP-07 extension)
- **Payment Protocol**: BTCPay Server integration
- **Deployment**: cPanel/traditional hosting (NOT Vercel/Netlify - must work with standard LAMP/Node hosting)
- **Icons**: Lucide React
- **Design System**: Custom, modern, professional aesthetic (NO purple/indigo - use orange, blues, greens, neutral tones)

### Database Schema

#### Users Table
```sql
- id (uuid, primary key)
- email (text, unique)
- username (text, unique)
- display_name (text)
- avatar_url (text)
- bio (text)
- nostr_pubkey (text, unique, optional) -- For Nostr integration
- btcpay_store_id (text) -- BTCPay Server store ID
- btcpay_api_key (text, encrypted) -- Store API key securely
- lightning_address (text) -- user@domain.com format
- onchain_address (text) -- BIP 84 native segwit
- payment_methods (jsonb) -- Support multiple: Lightning, onchain, PayNym, BOLT12
- privacy_settings (jsonb) -- Granular privacy controls
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### Wishlists Table
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key to users)
- title (text)
- description (text)
- slug (text, unique) -- For shareable URLs
- visibility (enum: public, private, unlisted)
- cover_image_url (text)
- event_date (timestamptz, optional) -- For birthdays, weddings, etc.
- event_type (text) -- birthday, wedding, holiday, general
- location (text) -- City, Country
- country_code (text) -- For map visualization
- coordinates (point) -- lat/lng for mapping
- share_count (integer, default 0)
- view_count (integer, default 0)
- total_funded_sats (bigint, default 0) -- Track funding progress
- goal_sats (bigint, optional) -- Funding goal
- tags (text[]) -- For discovery and search
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### Wishlist Items Table
```sql
- id (uuid, primary key)
- wishlist_id (uuid, foreign key to wishlists)
- title (text)
- description (text)
- price_fiat (numeric) -- Original price in fiat
- price_sats (bigint) -- Price in satoshis
- currency (text) -- USD, EUR, etc.
- url (text) -- Link to product
- image_url (text)
- priority (enum: low, medium, high, must_have)
- quantity_desired (integer, default 1)
- quantity_received (integer, default 0)
- funded_sats (bigint, default 0) -- Amount funded so far
- status (enum: available, partially_funded, fully_funded, purchased, received)
- notes (text) -- Private notes from creator
- sort_order (integer) -- For custom ordering
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### Gifts/Contributions Table
```sql
- id (uuid, primary key)
- wishlist_id (uuid, foreign key to wishlists)
- wishlist_item_id (uuid, foreign key to wishlist_items, nullable)
- gifter_name (text, optional) -- Anonymous option
- gifter_email (text, optional)
- gifter_message (text)
- amount_sats (bigint)
- amount_fiat (numeric)
- currency (text)
- payment_method (text) -- lightning, onchain, paynym, bolt12
- payment_hash (text) -- Lightning payment hash
- txid (text) -- Onchain transaction ID
- paynym_code (text) -- For BIP 47 payments
- bolt12_offer (text) -- For BOLT12 payments
- status (enum: pending, confirmed, failed)
- is_anonymous (boolean, default false)
- btcpay_invoice_id (text)
- created_at (timestamptz)
- confirmed_at (timestamptz)
```

#### Media/Uploads Table
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key to users)
- wishlist_id (uuid, foreign key to wishlists, nullable)
- wishlist_item_id (uuid, foreign key to wishlist_items, nullable)
- file_url (text)
- file_type (text) -- image/jpeg, image/png, etc.
- file_size (bigint)
- alt_text (text)
- created_at (timestamptz)
```

#### Nostr Events Table (Future)
```sql
- id (uuid, primary key)
- event_id (text, unique) -- Nostr event ID
- pubkey (text) -- Event author
- kind (integer) -- Event kind
- content (jsonb) -- Event content
- tags (jsonb) -- Event tags
- sig (text) -- Event signature
- created_at (timestamptz)
```

---

## Payment Integration Architecture

### BTCPay Server Integration

#### Core Requirements
1. **Multi-tenant support**: Each user gets their own BTCPay store
2. **Self-custodial**: Users maintain complete control of their Bitcoin
3. **Lightning Network**: Full Lightning support with LNURL
4. **On-chain**: BIP 84 (Native SegWit) support
5. **Payment verification**: Webhook-based confirmation system

#### Implementation Details

**Setup Flow:**
1. User creates account on BitWish
2. System prompts BTCPay Server connection
3. User options:
   - Connect existing BTCPay store (API key)
   - Generate new store via BTCPay API
   - Skip (can add later)
4. Store API key encrypted in database
5. System creates webhooks for payment notifications

**Payment Flow:**
1. Gifter selects item/amount to fund
2. System calls BTCPay API to create invoice
3. Display QR code with Lightning/onchain options
4. BTCPay handles payment detection
5. Webhook confirms payment to BitWish
6. Update wishlist item funding status
7. Send notification to wishlist owner
8. Optional: Send thank you to gifter

**BTCPay API Endpoints to Use:**
```typescript
// Create invoice
POST /api/v1/stores/{storeId}/invoices

// Get invoice status
GET /api/v1/stores/{storeId}/invoices/{invoiceId}

// Webhook configuration
POST /api/v1/stores/{storeId}/webhooks

// Lightning invoice generation
POST /api/v1/stores/{storeId}/lightning/invoices
```

### Advanced Payment Methods

#### BIP 47 (PayNym/Reusable Payment Codes)
- **Purpose**: Static, reusable payment identifiers that maintain privacy
- **Implementation**:
  - Users generate/import PayNym codes
  - Display PayNym avatar on profile
  - Enable direct PayNym-to-PayNym gifting
  - No address reuse, no linking transactions
  - Integration with Samourai/Sparrow wallet standards

**Features:**
- PayNym discovery and "following"
- QR code generation for PayNym codes
- Payment notification channel
- Transaction history privacy

#### BIP 49 (P2SH-wrapped SegWit)
- **Purpose**: Backward compatibility with older wallets
- **Implementation**:
  - Generate P2SH addresses when requested
  - Support mixed address types per user preference
  - Clear labeling of address types in UI

#### BOLT 12 (Lightning Offers)
- **Purpose**: Reusable Lightning payment requests
- **Implementation**:
  - Generate static BOLT12 offers per wishlist/item
  - QR codes that never expire
  - Better privacy than BOLT11 invoices
  - Amount-flexible offers
  - Integration with compatible Lightning nodes

**Features:**
- Static QR codes for wishlists
- No invoice expiration issues
- Improved privacy (blinded paths)
- Support for offers in user profiles

#### Nostr Integration (NIP-07, NIP-57 Zaps)

**Phase 1: Authentication (NIP-07)**
- Sign in with Nostr extension (Alby, nos2x, etc.)
- Pubkey becomes primary identifier
- No email required for Nostr users
- Seamless cross-platform identity

**Phase 2: Wishlist Publishing (NIP-51 Lists)**
- Publish wishlists as Nostr lists
- Discoverable across Nostr clients
- Decentralized wishlist hosting
- Censorship-resistant

**Phase 3: Zaps Integration (NIP-57)**
- Lightning tips with Nostr social proof
- Zap splits for collaborative gifts
- Public gift notifications on Nostr
- Integration with Nostr social graph

**Phase 4: Private Messaging (NIP-04/NIP-44)**
- Encrypted thank you messages
- Gifter-recipient communication
- Group gift coordination

---

## Feature Specifications

### Core Features (MVP)

#### 1. User Authentication & Profiles
- Email/password registration
- Profile customization (avatar, bio, display name)
- Username-based URLs (@username/wishlist-slug)
- Payment address management
- Privacy settings dashboard

#### 2. Wishlist Management
- Create multiple wishlists
- Rich text descriptions
- Media uploads (images, videos)
- Custom categorization/tagging
- Visibility controls (public/private/unlisted)
- Shareable links with preview cards
- Event date assignment
- Location/country selection

#### 3. Wishlist Items
- Add items from URL (auto-parse title/image/price)
- Manual item creation
- Price in fiat with live BTC conversion
- Multiple images per item
- Priority levels
- Quantity tracking
- Partial funding support
- Status management

#### 4. Gifting Flow
- Browse public wishlists
- Search by location/event/tags
- Select item or custom amount
- Choose payment method (Lightning/onchain)
- Optional message to recipient
- Anonymous gifting option
- Payment confirmation page
- Automatic notifications

#### 5. Discovery & Explore
- Map view of wishlists by location
- Filter by event type
- Search by username/tags
- Trending wishlists
- Recently funded items
- Featured wishlists (curated)

#### 6. Notifications
- Email notifications for:
  - New gifts received
  - Payment confirmations
  - Wishlist milestones (50% funded, etc.)
  - Item fully funded alerts
- In-app notification center
- Customizable notification preferences

### Advanced Features (Post-MVP)

#### 7. Social Features
- Follow other users
- Share wishlists on social media (Twitter, Nostr, etc.)
- Embed wishlists on external websites
- Collaborative wishlists (wedding registries, group gifts)
- Gift pooling for expensive items
- Public gift feed (with privacy controls)

#### 8. Analytics Dashboard
- Wishlist view counts
- Link click tracking
- Funding progress charts
- Geographic distribution of gifters
- Most popular items
- Traffic sources
- Bitcoin price impact visualization

#### 9. Bitcoin Price Intelligence
- Real-time BTC/USD rate
- Price alerts for items
- Historical price comparison
- "Best time to buy" indicators
- Auto-update sats equivalent
- Multi-currency support

#### 10. Advanced Privacy Features
- Stealth addresses for gifters
- Tor support
- No JavaScript fallback pages
- Clearnet/Tor dual links
- PayNym integration for maximum privacy
- Optional KYC-free operation

#### 11. Merchant Features
- Affiliate link support
- Price drop notifications
- Auto-purchase when fully funded
- Receipt upload
- Shipping address management (encrypted)
- Gift delivery coordination

#### 12. Gamification & Engagement
- Achievement badges
- Wishlist completion celebrations
- Gifter leaderboards (optional)
- Seasonal challenges
- Referral rewards (sats)

#### 13. Mobile Optimization
- Progressive Web App (PWA)
- Mobile-first design
- Deep linking support
- Share sheet integration
- QR code scanner
- NFC payment support

### Future Integrations

#### Payment Protocols
- **Liquid Network**: L-BTC support for faster settlements
- **RGB Protocol**: Token-based gift cards
- **Fedimint**: Chaumian e-cash for private small payments
- **DLCs**: Discreet Log Contracts for conditional gifts
- **Submarine Swaps**: Lightning<->onchain atomic swaps

#### Identity & Social
- **DIDs**: Decentralized identifiers
- **Web5**: Decentralized web nodes for data storage
- **Lens Protocol**: Social graph integration
- **Farcaster**: Alternative social layer

#### Wallet Integrations
- **Alby**: Browser extension wallet
- **BlueWallet**: Mobile wallet deep links
- **Zeus**: Lightning node remote control
- **Sparrow**: Desktop wallet PSBTs
- **Muun**: Unified Lightning/onchain

#### Advanced Nostr Features
- **NIP-90**: Data Vending Machines for AI-powered gift suggestions
- **NIP-26**: Delegated event signing for team accounts
- **NIP-28**: Public chat channels for gift discussions
- **NIP-96**: File storage and sharing
- **NIP-98**: HTTP Auth for API access

---

## UI/UX Design Requirements

### Design Principles
1. **Bitcoin-native aesthetic**: Orange, gold, and modern neutrals
2. **Clarity over cleverness**: Simple, intuitive flows
3. **Mobile-first**: 80% of users on mobile
4. **Fast loading**: Optimized images, lazy loading, CDN
5. **Accessibility**: WCAG 2.1 AA compliance
6. **Privacy-conscious**: No tracking, minimal data collection
7. **Progressive enhancement**: Works without JavaScript for core features

### Key Pages & Components

#### Landing Page (HomePage)
- Hero section with clear value proposition
- How it works (3-step visual guide)
- Featured wishlists (curated examples)
- Bitcoin stats ticker (price, network stats)
- Trust indicators (non-custodial, privacy-first)
- CTA: "Create Your Wishlist" (prominent)
- Footer: Social links, documentation, blog

#### Dashboard (User Home)
- Overview cards (total funded, views, active wishlists)
- Quick actions (Create wishlist, Share, Settings)
- Recent activity feed
- Funding progress bars
- Notification center
- Bitcoin balance display (if integrated wallet)

#### Wishlist Creation/Editor
- Step-by-step wizard:
  1. Basic info (title, description, event type)
  2. Add items (URL parser, manual entry)
  3. Customize appearance (cover image, theme)
  4. Payment setup (BTCPay connection)
  5. Privacy settings
  6. Share & publish
- Live preview panel
- Drag-and-drop reordering
- Bulk import from CSV/Amazon wishlist
- Template gallery (birthday, wedding, baby shower, etc.)

#### Public Wishlist View
- Hero image/banner
- Creator profile card
- Event countdown (if applicable)
- Funding progress visualization
- Item grid/list view toggle
- Filter/sort options
- Share button with custom message preview
- QR code for easy mobile sharing
- Gift button (prominent, sticky on scroll)

#### Gift Flow
- Item selection modal
- Amount input (fiat + sats)
- Payment method selector (Lightning/onchain/PayNym)
- Message to recipient (optional)
- Anonymous toggle
- QR code display
- Payment status indicator
- Success page with confetti animation
- Thank you message

#### Explore Page
- Interactive map (Mapbox/Leaflet)
- Pin clusters by location
- Sidebar with list view
- Filters: event type, date range, funding status
- Search bar (username, keywords, location)
- Sort: newest, trending, nearly funded, nearby
- Preview cards on hover

#### Settings Page
- Profile editing
- Payment address management
- Connected accounts (BTCPay, Nostr)
- Privacy controls
- Notification preferences
- Security (2FA, API keys)
- Export data
- Delete account

### Component Library

#### Reusable Components
- **Button**: Primary, secondary, ghost, danger variants
- **Card**: Flexible container with header/body/footer
- **Modal**: Overlay dialogs with animations
- **Input**: Text, number, email with validation
- **Select**: Dropdown with search
- **QRCode**: Dynamic QR generation with logos
- **BitcoinAddress**: Copyable address with QR toggle
- **FundingProgress**: Circular and linear progress bars
- **ItemCard**: Wishlist item display with actions
- **UserAvatar**: Profile image with fallback initials
- **ShareButton**: Multi-platform share with preview
- **MediaUpload**: Drag-drop with preview
- **PriceDisplay**: Fiat + BTC with conversion
- **NotificationBadge**: Unread count indicator
- **Navbar**: Responsive with mobile menu
- **Footer**: Sitemap and social links

### Animations & Micro-interactions
- Smooth page transitions
- Button hover states
- Loading skeletons
- Payment success confetti
- Funding progress animations
- Toast notifications
- Drawer/modal slide-ins
- Icon micro-animations

---

## Technical Implementation Details

### Frontend Architecture

#### Routing
```typescript
/ - Landing page
/explore - Discover wishlists
/dashboard - User dashboard (protected)
/wishlist/new - Create wishlist (protected)
/wishlist/:id/edit - Edit wishlist (protected)
/@:username/:slug - Public wishlist view
/gift/:wishlistId/:itemId - Gift flow
/settings - User settings (protected)
/about - About page
/pricing - Pricing page (if premium tiers)
/auth - Login/signup
/privacy - Privacy policy
/terms - Terms of service
/contact - Contact form
```

#### State Management
- **React Context** for global state (auth, theme, language)
- **URL state** for filters/search
- **Local storage** for user preferences
- **Supabase Realtime** for live updates

#### API Integration
```typescript
// Supabase client setup
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// BTCPay client
class BTCPayClient {
  async createInvoice(storeId: string, amount: number, currency: string)
  async getInvoiceStatus(invoiceId: string)
  async createWebhook(storeId: string, url: string)
}

// Nostr client
class NostrClient {
  async publish(event: NostrEvent)
  async subscribe(filters: Filter[])
  async getProfile(pubkey: string)
}
```

### Backend/Database

#### Row Level Security Policies

**Users Table:**
```sql
-- Users can view all public profiles
CREATE POLICY "Public profiles viewable by all"
  ON users FOR SELECT
  TO authenticated, anon
  USING (true);

-- Users can update own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

**Wishlists Table:**
```sql
-- Public wishlists viewable by all
CREATE POLICY "Public wishlists viewable by all"
  ON wishlists FOR SELECT
  TO authenticated, anon
  USING (visibility = 'public' OR visibility = 'unlisted');

-- Owners can view own private wishlists
CREATE POLICY "Owners can view own wishlists"
  ON wishlists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create wishlists
CREATE POLICY "Users can create wishlists"
  ON wishlists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Owners can update own wishlists
CREATE POLICY "Owners can update own wishlists"
  ON wishlists FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Owners can delete own wishlists
CREATE POLICY "Owners can delete own wishlists"
  ON wishlists FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

**Gifts Table:**
```sql
-- Wishlist owners can view gifts to their wishlists
CREATE POLICY "Owners can view gifts to their wishlists"
  ON gifts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = gifts.wishlist_id
      AND wishlists.user_id = auth.uid()
    )
  );

-- Anyone can create gifts (anonymous support)
CREATE POLICY "Anyone can create gifts"
  ON gifts FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);
```

#### Database Functions

```sql
-- Increment view count
CREATE OR REPLACE FUNCTION increment_view_count(wishlist_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE wishlists
  SET view_count = view_count + 1
  WHERE id = wishlist_uuid;
END;
$$ LANGUAGE plpgsql;

-- Update funding totals
CREATE OR REPLACE FUNCTION update_funding_totals()
RETURNS trigger AS $$
BEGIN
  -- Update wishlist item
  UPDATE wishlist_items
  SET funded_sats = (
    SELECT COALESCE(SUM(amount_sats), 0)
    FROM gifts
    WHERE wishlist_item_id = NEW.wishlist_item_id
    AND status = 'confirmed'
  )
  WHERE id = NEW.wishlist_item_id;

  -- Update wishlist total
  UPDATE wishlists
  SET total_funded_sats = (
    SELECT COALESCE(SUM(amount_sats), 0)
    FROM gifts
    WHERE wishlist_id = NEW.wishlist_id
    AND status = 'confirmed'
  )
  WHERE id = NEW.wishlist_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on gift confirmation
CREATE TRIGGER update_funding_on_gift
AFTER INSERT OR UPDATE ON gifts
FOR EACH ROW
EXECUTE FUNCTION update_funding_totals();
```

### Security Considerations

#### Data Protection
- Encrypt sensitive fields (API keys, addresses)
- Hash passwords with bcrypt (handled by Supabase)
- Validate all inputs (client and server)
- Sanitize user-generated content
- Rate limiting on API endpoints
- CSRF protection
- XSS prevention

#### Privacy Features
- No third-party trackers
- Optional anonymous browsing
- Tor-friendly (no Cloudflare, no reCAPTCHA)
- Minimal data collection
- GDPR compliance
- Right to deletion
- Data export functionality

#### Bitcoin Security
- Never store private keys
- API keys encrypted at rest
- Webhook signature verification
- Address validation before display
- Lightning invoice expiry handling
- Double-spend protection via BTCPay

---

## Deployment & Infrastructure

### Environment Variables
```bash
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# BTCPay Server
VITE_BTCPAY_URL=
BTCPAY_WEBHOOK_SECRET=

# Optional: Nostr
NOSTR_RELAY_URL=

# Optional: Services
MAPBOX_ACCESS_TOKEN=
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
```

### Build Configuration

**Vite Config:**
```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_BTCPAY_URL,
        changeOrigin: true
      }
    }
  }
})
```

### Deployment Steps (cPanel)

1. Build production bundle: `npm run build`
2. Upload `dist/` contents to `public_html/`
3. Configure `.htaccess` for SPA routing:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```
4. Set up SSL certificate (Let's Encrypt)
5. Configure environment variables
6. Test all routes and payment flows

### Performance Optimization

- **Image optimization**: WebP format, lazy loading, srcset
- **Code splitting**: Route-based chunking
- **CDN**: Serve static assets from CDN
- **Caching**: Service worker for offline support
- **Compression**: Gzip/Brotli on server
- **Database indexing**: Optimize query performance
- **Connection pooling**: Efficient database connections

---

## Testing Strategy

### Unit Tests
- Component rendering
- Form validation
- Utility functions
- Bitcoin amount conversions
- URL parsing

### Integration Tests
- Authentication flow
- Wishlist CRUD operations
- Gift creation and confirmation
- Payment webhook handling
- Notification system

### End-to-End Tests
- User registration → wishlist creation → gifting
- BTCPay invoice creation and payment
- Nostr authentication and publishing
- Mobile responsiveness
- Cross-browser compatibility

### Security Testing
- SQL injection attempts
- XSS vulnerability scanning
- CSRF token validation
- Rate limiting effectiveness
- API authentication bypass attempts

---

## Documentation Requirements

### User Documentation
1. **Getting Started Guide**
   - Creating account
   - Setting up payment
   - Creating first wishlist
   - Sharing with friends

2. **How-to Guides**
   - BTCPay Server setup
   - Nostr integration
   - Privacy settings
   - Advanced features

3. **FAQ**
   - What is Bitcoin?
   - How do Lightning payments work?
   - Is my data private?
   - How do I receive gifts?

### Developer Documentation
1. **API Reference**
   - Supabase schema
   - BTCPay integration
   - Webhook endpoints
   - Nostr event formats

2. **Architecture Guide**
   - System overview
   - Data flow diagrams
   - Component hierarchy
   - State management

3. **Deployment Guide**
   - Environment setup
   - Build process
   - Server configuration
   - Troubleshooting

---

## Monetization Strategy (Optional)

### Free Tier
- Unlimited wishlists
- Unlimited items
- Basic features
- Community support

### Premium Tier ($5/month or 50,000 sats)
- Custom domains
- Advanced analytics
- Priority support
- White-label embeds
- API access
- Early access to features

### Enterprise
- Multiple team members
- Branded experience
- SLA guarantee
- Dedicated support
- Custom integrations

---

## Launch Checklist

### Pre-Launch
- [ ] Core features complete and tested
- [ ] BTCPay integration functional
- [ ] Mobile responsive on all devices
- [ ] SSL certificate installed
- [ ] Privacy policy and terms drafted
- [ ] User documentation complete
- [ ] Marketing site ready
- [ ] Social media accounts created
- [ ] Beta tester feedback incorporated
- [ ] Performance benchmarks met

### Launch Day
- [ ] Deploy to production
- [ ] Monitor error logs
- [ ] Test payment flows live
- [ ] Announce on Twitter/Nostr
- [ ] Post on Bitcoin forums
- [ ] Email beta users
- [ ] Monitor server performance
- [ ] Be ready for support requests

### Post-Launch (Week 1)
- [ ] Daily user metrics review
- [ ] Bug fixes and hotpatches
- [ ] User feedback collection
- [ ] Content marketing (blog posts)
- [ ] Community engagement
- [ ] Media outreach
- [ ] Feature iteration based on data

---

## Success Metrics

### Key Performance Indicators
- **User Growth**: New signups per day/week/month
- **Wishlist Creation**: Number of active wishlists
- **Gift Volume**: Total sats gifted through platform
- **Conversion Rate**: Visitors → gifters
- **Retention**: Users returning to create 2nd wishlist
- **Payment Success**: % of initiated payments completed
- **Performance**: Page load times, uptime
- **Engagement**: Time on site, pages per session

### Target Milestones
- **Month 1**: 100 users, 50 wishlists, 1M sats gifted
- **Month 3**: 500 users, 250 wishlists, 10M sats gifted
- **Month 6**: 2,000 users, 1,000 wishlists, 50M sats gifted
- **Month 12**: 10,000 users, 5,000 wishlists, 500M sats gifted

---

## Future Vision

### Long-term Goals
1. **Become the default Bitcoin gifting platform**: The "Venmo for gifts" but with Bitcoin
2. **Onboard non-Bitcoiners**: Easiest way to receive your first sats
3. **Global reach**: Support for 50+ countries and 20+ languages
4. **Ecosystem integration**: Deep wallet and service integrations
5. **Protocol standard**: Define open standard for Bitcoin wishlists
6. **Decentralized operation**: Transition to fully decentralized architecture
7. **Orange-pill millions**: Convert gifters to Bitcoin holders
8. **Merchant partnerships**: Direct gift fulfillment integration

### Possible Features (2+ years out)
- AI gift recommendations
- Voice-controlled wishlist creation
- AR gift preview (scan room, place virtual item)
- Physical gift card dispensers (Bitcoin ATM-style)
- POS terminal integration for in-store wishlists
- Multi-sig gift vaults (release on milestone)
- Time-locked gifts (birthday surprise)
- Charity/donation wishlists with matching
- Peer-to-peer gift marketplace
- Gift wrapping and delivery services
- Video message attachments
- Live gift unboxing streams
- Gamified gift hunts (scavenger hunts with Bitcoin prizes)

---

## Prompt Usage Instructions

**When using this prompt to build the application:**

1. **Start with MVP**: Focus on core features first (auth, wishlists, basic gifting)
2. **Iterate**: Build → Test → Get feedback → Improve
3. **Security first**: Implement RLS, validation, and encryption from day one
4. **Mobile-first**: Design for mobile, enhance for desktop
5. **Performance matters**: Optimize for speed at every step
6. **Documentation**: Document as you build
7. **User-centric**: Every decision should benefit the user
8. **Bitcoin-native**: Think in sats, design for Lightning, prioritize self-custody

**Customization Guidance:**
- Replace placeholder text with actual brand copy
- Adjust color scheme to match brand identity
- Modify feature priorities based on user research
- Scale infrastructure based on expected traffic
- Adapt payment methods to target market regulations

**Development Phases:**

**Phase 1 (Weeks 1-4): Foundation**
- Database schema
- Authentication
- Basic wishlist CRUD
- Simple UI components

**Phase 2 (Weeks 5-8): Core Features**
- BTCPay integration
- Gift flow
- Public wishlist views
- Notifications

**Phase 3 (Weeks 9-12): Polish & Launch**
- Explore page
- Analytics
- Mobile optimization
- Testing & bug fixes

**Phase 4 (Post-Launch): Growth**
- Nostr integration
- Advanced payment methods
- Social features
- Premium tiers

---

## Technical Excellence Standards

This application should exemplify:
- **Clean code**: ESLint/Prettier, consistent naming, proper TypeScript types
- **Scalable architecture**: Modular, maintainable, well-documented
- **User experience**: Intuitive, fast, delightful interactions
- **Security**: Defense in depth, minimal attack surface
- **Privacy**: Data minimization, user control, transparency
- **Accessibility**: Keyboard navigation, screen reader support, WCAG compliance
- **Performance**: Sub-2s load times, smooth 60fps animations
- **Reliability**: 99.9% uptime, graceful error handling, data integrity

---

## The Bitcoin Ethos

This platform embodies Bitcoin values:
- **Self-sovereignty**: Users own their data and funds
- **Privacy**: No surveillance, minimal data collection
- **Censorship-resistance**: Unstoppable gift giving
- **Permissionless**: Anyone can participate
- **Transparency**: Open source (future goal)
- **Decentralization**: No single point of failure
- **Sound money**: Prices in sats, think long-term
- **Freedom**: Financial freedom as a fundamental right

---

**Build this platform with pride. Make it production-ready, secure, fast, and beautiful. This is the future of gifting.**

---

## End of Specification

**Version**: 1.0
**Last Updated**: 2025-10-30
**Status**: Ready for Development
**Estimated Build Time**: 12-16 weeks (MVP)
**Budget Recommendation**: $50k-$100k (with team) or 500-1000 hours (solo)

Good luck, and stack sats! ⚡🧡
