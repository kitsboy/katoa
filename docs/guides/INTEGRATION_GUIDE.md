# KATOA - Bitcoin & Nostr Integration Guide

## MVP Foundation Complete

This MVP provides a fully functional wishlist platform with:
- **Mock Bitcoin/Lightning payments** - Ready for real integration
- **Full Nostr integration** - Login, profiles, publishing, zaps (NIP-07, NIP-04, NIP-57)
- **Modular architecture** - Easy to extend with new Bitcoin protocols

## Nostr Features (Fully Implemented)

### Already Working

1. **Nostr Login (NIP-07)** - Sign in with browser extension (Alby, nos2x)
2. **Profile Sync** - Auto-import Nostr metadata (name, avatar, bio, Lightning address)
3. **Wishlist Publishing** - Share wishlists to Nostr relays
4. **Lightning Address Resolution** - Fetch LN addresses from Nostr profiles
5. **Encrypted Messaging (NIP-04)** - Private notifications
6. **Zap Support (NIP-57)** - Ready for Lightning payments via Nostr

### Using Nostr Features

**Login with Nostr:**
- Install a Nostr extension (Alby, nos2x, Flamingo)
- Click "Sign in with Nostr" button
- Approve the connection
- Profile data auto-syncs from your Nostr identity

**Publish Wishlist to Nostr:**
- Login with Nostr
- Create a wishlist
- Click the purple "Share" button
- Wishlist published to all configured relays

**Sync Profile:**
- Click "Sync Nostr Profile" in dashboard
- Updates avatar, bio, and Lightning address from Nostr

### Nostr Configuration

**Default Relays** (`src/lib/nostr.ts`):
- wss://relay.damus.io
- wss://relay.nostr.band
- wss://nos.lol
- wss://relay.snort.social
- wss://nostr.wine

**Customize relays:**
```typescript
const nostrService = new NostrService([
  'wss://your-relay.com',
  'wss://another-relay.io'
]);
```

## Current Mock Implementation

### Payment Flow (WishlistPage.tsx:195-240)
Currently simulates Lightning Network payments:
- Generates mock invoice strings
- Auto-completes after 3 seconds
- Creates transaction records in database

### Integration Points for Real Bitcoin

#### 1. Lightning Network Integration

**Location**: `src/pages/WishlistPage.tsx` - `handleGiftSubmit` function

Replace mock invoice generation with real BOLT11 invoice:

```typescript
// Current (Mock):
const invoice = `lnbc${giftForm.amount}n1p0xyz...mock_invoice_${Date.now()}`;

// Replace with LND/CLN/LNbits:
const { payment_request } = await fetch(`${LN_NODE_URL}/v1/invoices`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${LN_API_KEY}` },
  body: JSON.stringify({
    value: parseInt(giftForm.amount),
    memo: giftForm.message
  })
}).then(r => r.json());
```

**WebLN Support**: Check for `window.webln` to enable one-click payments:
```typescript
if (window.webln) {
  await window.webln.enable();
  await window.webln.sendPayment(invoice);
}
```

#### 2. Payment Verification

**Location**: Create new file `src/lib/lightning.ts`

Implement webhook or polling to verify payment:

```typescript
export async function verifyPayment(paymentHash: string): Promise<boolean> {
  // Check with your Lightning node
  const { settled } = await checkInvoiceStatus(paymentHash);
  return settled;
}
```

#### 3. Database Schema Ready

Tables already support:
- `transactions.payment_hash` - Store Lightning payment hash or on-chain txid
- `transactions.payment_method` - 'lightning', 'onchain', 'bip47'
- `transactions.status` - 'pending', 'completed', 'failed'

#### 4. Nostr Integration Points

**Location**: `profiles` table has `nostr_pubkey` field

Add Nostr login:
```typescript
// Install: npm install nostr-tools
import { getPublicKey, nip19 } from 'nostr-tools';

async function signInWithNostr() {
  if (!window.nostr) return;
  const pubkey = await window.nostr.getPublicKey();
  // Use pubkey as authentication
}
```

#### 5. BIP47 Payment Codes

**Location**: `profiles.lightning_address` can be repurposed or add new column

For reusable payment codes:
- Add `payment_code` column to profiles
- Generate receiving addresses per transaction
- Update payment flow to support on-chain

#### 6. QR Code Generation

**Install**: `npm install qrcode`

**Location**: `src/pages/WishlistPage.tsx` Modal (line 585)

Replace mock QR with real:
```typescript
import QRCode from 'qrcode';

const qrCodeDataURL = await QRCode.toDataURL(invoice);
<img src={qrCodeDataURL} alt="Lightning Invoice" />
```

#### 7. Real-time Updates via Supabase

Already configured - just add subscription:

```typescript
useEffect(() => {
  const subscription = supabase
    .channel('transactions')
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'transactions' },
      (payload) => {
        // Update UI with new payment
        loadWishlist();
      }
    )
    .subscribe();

  return () => subscription.unsubscribe();
}, []);
```

## Environment Variables Needed

Add to `.env` for production:

```
# Lightning Node
VITE_LN_NODE_URL=https://your-lnd-node.com
VITE_LN_API_KEY=your_api_key

# BTCPay Server (alternative)
VITE_BTCPAY_URL=https://your-btcpay.com
VITE_BTCPAY_API_KEY=your_api_key

# Optional: For on-chain
VITE_BITCOIN_NETWORK=mainnet
```

## Recommended Packages

```bash
# Lightning Network
npm install @lightninglabs/lnc-web
npm install @getalby/sdk

# Bitcoin
npm install bitcoinjs-lib

# Nostr (Already installed)
npm install nostr-tools  # ✅ Installed

# QR Codes
npm install qrcode

# WebLN types
npm install --save-dev @webbtc/webln-types
```

## Architecture Notes

### Modular Payment Adapters

Create `src/lib/payments/` directory:

```
src/lib/payments/
  ├── index.ts          # Payment adapter interface
  ├── lightning.ts      # Lightning Network
  ├── onchain.ts        # On-chain Bitcoin
  ├── bip47.ts          # BIP47 reusable codes
  └── liquid.ts         # Liquid Network
```

Each adapter implements:
```typescript
interface PaymentAdapter {
  generateInvoice(amount: number, memo: string): Promise<string>;
  verifyPayment(hash: string): Promise<boolean>;
  getBalance(): Promise<number>;
}
```

## Security Considerations

1. **Never expose private keys** - Use backend API for signing
2. **Validate all amounts** - Check min/max limits
3. **Rate limiting** - Prevent invoice spam
4. **Webhook verification** - Verify payment callbacks
5. **RLS policies** - Already implemented in database

## Testing

Mock implementations allow full UI/UX testing without real Bitcoin:
- Test payment flows
- Validate user experience
- Measure conversion rates
- Test mobile responsiveness

Switch to real Bitcoin on testnet before mainnet:
```
VITE_BITCOIN_NETWORK=testnet
VITE_LN_NODE_URL=https://testnet-node.com
```

## Current Features (All Working)

### Authentication & Identity
- ✅ User authentication with email/password
- ✅ **Nostr login with NIP-07 extension**
- ✅ **Nostr profile sync** (avatar, bio, Lightning address)
- ✅ **Nostr pubkey display** with connection status

### Wishlist Management
- ✅ Create/manage multiple wishlists
- ✅ Add/edit/delete wishlist items
- ✅ Public and private wishlists
- ✅ **Publish wishlists to Nostr relays**
- ✅ Custom themes and cover images
- ✅ Funding goals and progress tracking

### Payments & Transactions
- ✅ Mock Lightning payments with invoice generation
- ✅ **Zap request creation (NIP-57)** - Ready for real zaps
- ✅ **Lightning address resolver from Nostr profiles**
- ✅ Real-time funding progress bars
- ✅ Transaction history
- ✅ Anonymous or named gifting

### User Experience
- ✅ Creator dashboard with analytics
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Search and explore wishlists
- ✅ Real-time updates with Supabase
- ✅ Beautiful Bitcoin-themed UI
- ✅ **Nostr connection indicators**

## Next Steps for Production

### High Priority (Nostr Ready)
1. ✅ **Nostr login/identity** - DONE
2. ✅ **Nostr profile integration** - DONE
3. ✅ **Wishlist publishing to Nostr** - DONE
4. Connect real Lightning node for zaps
5. Implement WebLN for one-click payments
6. Add real payment verification webhooks

### Medium Priority
7. Deploy Edge Functions for payment processing
8. Implement OpenTimestamps for wishlist state
9. Add IPFS/Arweave for decentralized storage
10. Create comprehensive API documentation

### Future Enhancements
11. Add BIP47 for enhanced privacy
12. Implement Nostr relay management UI
13. Add DM notifications via NIP-04
14. Set up monitoring and alerts
15. Add Liquid Network support

## Support

The entire codebase is modular and well-commented. Each component has a single responsibility and clear integration points for Bitcoin functionality.
