# BTCPay Server Integration Guide

This guide explains how to integrate BTCPay Server with BitWish for accepting Bitcoin and Lightning Network payments.

## Overview

BTCPay Server is a self-hosted, open-source cryptocurrency payment processor that allows you to accept Bitcoin payments directly without intermediaries. It supports:

- On-chain Bitcoin payments
- Lightning Network (instant, low-fee payments)
- Multiple wallets and payment methods
- Nostr integration for decentralized identity
- Webhooks for payment notifications

## Setup Instructions

### 1. Deploy BTCPay Server

You have several options for running BTCPay Server:

#### Option A: Third-Party Host (Easiest)
- Use a BTCPay hosting provider like Voltage, LunaNode, or others
- Sign up and create your store
- Get your API credentials

#### Option B: Self-Hosted (Most Control)
```bash
# Using Docker (recommended)
git clone https://github.com/btcpayserver/btcpayserver-docker
cd btcpayserver-docker
export BTCPAY_HOST="your-domain.com"
export NBITCOIN_NETWORK="mainnet"
export BTCPAYGEN_CRYPTO1="btc"
export BTCPAYGEN_LIGHTNING="lnd"
./btcpay-setup.sh -i
```

### 2. Configure Your Store

1. Log into your BTCPay Server instance
2. Create a new store
3. Configure your wallet:
   - For on-chain: Import your xpub or connect hardware wallet
   - For Lightning: Connect your Lightning node (LND, c-lightning, or Eclair)

### 3. Generate API Key

1. Go to Account Settings → API Keys
2. Create new key with permissions:
   - `btcpay.store.canviewinvoices`
   - `btcpay.store.cancreateinvoice`
   - `btcpay.store.canmodifyinvoices`
3. Copy your API key

### 4. Configure Environment Variables

Add these to your `.env` file:

```env
VITE_BTCPAY_SERVER_URL=https://your-btcpay-instance.com
VITE_BTCPAY_STORE_ID=your-store-id
VITE_BTCPAY_API_KEY=your-api-key
VITE_BTCPAY_WEBHOOK_SECRET=your-webhook-secret
```

### 5. Set Up Webhooks

1. In BTCPay Server, go to Store Settings → Webhooks
2. Create a new webhook:
   - Payload URL: `https://your-app.com/api/webhooks/btcpay`
   - Events: `InvoiceSettled`, `InvoiceProcessing`, `InvoiceInvalid`, `InvoiceExpired`
   - Secret: Generate a random secret and add to `.env`

## Usage in BitWish

### Creating an Invoice

```typescript
import { btcPayService } from './lib/btcpay';

async function createDonation(wishlistId: string, amount: number) {
  if (!btcPayService) {
    console.error('BTCPay not configured');
    return;
  }

  const invoice = await btcPayService.createInvoice(
    amount,
    'USD',
    `wishlist-${wishlistId}`,
    {
      wishlistId,
      type: 'donation',
      platform: 'BitWish'
    }
  );

  // Open BTCPay checkout
  btcPayService.openCheckout(invoice.id);
}
```

### Checking Invoice Status

```typescript
async function checkPaymentStatus(invoiceId: string) {
  const invoice = await btcPayService.getInvoice(invoiceId);

  switch (invoice?.status) {
    case 'Settled':
      // Payment confirmed
      break;
    case 'Processing':
      // Payment received, waiting for confirmations
      break;
    case 'Expired':
      // Invoice expired
      break;
    case 'Invalid':
      // Payment failed
      break;
  }
}
```

## Nostr Integration

BTCPay Server has built-in Nostr support for decentralized identity and communication.

### Enable Nostr in BTCPay

1. Go to Store Settings → Integrations → Nostr
2. Generate or import your Nostr identity
3. Configure Nostr relays
4. Enable Nostr authentication

### Using Nostr with BitWish

```typescript
import { nostrService } from './lib/nostr';
import { btcPayService } from './lib/btcpay';

async function payWithNostr(wishlistId: string, amount: number) {
  // Authenticate with Nostr
  const nostrPubkey = await nostrService.getPublicKey();

  // Create invoice with Nostr metadata
  const invoice = await btcPayService.createInvoice(
    amount,
    'USD',
    `wishlist-${wishlistId}`,
    {
      wishlistId,
      nostrPubkey,
      type: 'nostr-donation'
    }
  );

  // Open checkout
  btcPayService.openCheckout(invoice.id);
}
```

## PYNYMS Integration

PYNYMS (Privacy-focused NYM System) can be integrated for enhanced privacy in donations.

### What is PYNYMS?

PYNYMS allows users to create pseudonymous identities that can be verified without revealing personal information. Perfect for anonymous donations.

### Integration Steps

1. Install PYNYMS client library:
```bash
npm install @pynyms/client
```

2. Create PYNYMS service:
```typescript
// src/lib/pynyms.ts
import { PynymClient } from '@pynyms/client';

export class PynymService {
  private client: PynymClient;

  constructor() {
    this.client = new PynymClient({
      mixnetEndpoint: process.env.VITE_PYNYM_MIXNET_URL,
    });
  }

  async createPseudonym(userId: string): Promise<string> {
    return await this.client.generatePseudonym(userId);
  }

  async verifyPseudonym(pseudonym: string): Promise<boolean> {
    return await this.client.verifyPseudonym(pseudonym);
  }

  async sendAnonymousDonation(
    wishlistId: string,
    amount: number,
    pseudonym: string
  ) {
    // Route payment through PYNYMS mixnet
    const anonymizedRequest = await this.client.anonymizeRequest({
      wishlistId,
      amount,
      pseudonym,
    });

    // Create BTCPay invoice
    const invoice = await btcPayService.createInvoice(
      amount,
      'USD',
      `wishlist-${wishlistId}`,
      {
        wishlistId,
        pseudonym,
        privacy: 'pynyms',
      }
    );

    return invoice;
  }
}
```

3. Use in components:
```typescript
const pynymService = new PynymService();

async function donateAnonymously() {
  // Generate pseudonym
  const pseudonym = await pynymService.createPseudonym(userId);

  // Create anonymous donation
  await pynymService.sendAnonymousDonation(
    wishlistId,
    amount,
    pseudonym
  );
}
```

## Lightning Network Tips

### Instant Payments

Lightning Network provides near-instant payments with minimal fees. Benefits:

- Payments settle in seconds
- Fees typically <1 sat
- Perfect for small donations
- Better privacy than on-chain

### Configure Lightning Address

Allow users to receive Lightning payments via Lightning Address:

```typescript
// In user profile
const lightningAddress = `${username}@your-btcpay-domain.com`;

// BTCPay automatically handles Lightning Address routing
```

### LNURL Support

BTCPay supports LNURL for seamless Lightning payments:

```typescript
// Generate LNURL for wishlist
function generateLNURL(wishlistId: string) {
  return `https://your-btcpay.com/lnurl/pay/${wishlistId}`;
}

// Users can scan QR code with Lightning wallet
```

## Security Best Practices

1. **Never expose API keys**: Keep them in `.env` and server-side only
2. **Verify webhooks**: Always verify webhook signatures
3. **Use HTTPS**: Ensure all communication is encrypted
4. **Rate limiting**: Implement rate limiting on invoice creation
5. **Monitor invoices**: Set up alerts for suspicious activity

## Testing

### Testnet Setup

For testing, use Bitcoin testnet:

```env
VITE_BTCPAY_SERVER_URL=https://testnet.btcpay.com
NBITCOIN_NETWORK=testnet
```

### Mock Payments

For development without real Bitcoin:

```typescript
// src/lib/btcpay-mock.ts
export class MockBTCPayService {
  async createInvoice() {
    return {
      id: 'mock-invoice-123',
      status: 'New',
      checkoutLink: 'https://mock-checkout',
    };
  }

  // Simulate payment after 3 seconds
  async simulatePayment(invoiceId: string) {
    setTimeout(() => {
      this.handleWebhook({
        invoiceId,
        status: 'Settled',
      });
    }, 3000);
  }
}
```

## Support

- BTCPay Documentation: https://docs.btcpayserver.org
- BTCPay Community: https://chat.btcpayserver.org
- Nostr Resources: https://nostr.com
- PYNYMS Documentation: https://pynyms.io/docs

## Next Steps

1. Deploy BTCPay Server
2. Configure store and payment methods
3. Update environment variables
4. Test with testnet Bitcoin
5. Implement webhook handlers
6. Add Nostr authentication
7. Integrate PYNYMS for privacy
8. Go live with mainnet!

---

**Note**: This integration requires a BTCPay Server instance. The platform is designed to work with or without BTCPay - if not configured, users can still donate via Lightning Address or on-chain Bitcoin addresses directly.
