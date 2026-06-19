# KATOA Implementation Roadmap
## Production-Ready MVP Enhancement Plan

This document outlines concrete improvements to transform your existing KATOA app into a production-ready platform with advanced Bitcoin payment features.

---

## Current State Assessment

**What You Have:**
- ✅ Supabase database with RLS policies
- ✅ Authentication (email/password)
- ✅ Wishlist CRUD operations
- ✅ BTCPay integration foundation
- ✅ Basic UI components
- ✅ Mobile-responsive design

**What Needs Enhancement:**
- 🔧 Database functions and triggers for auto-updates
- 🔧 Production webhook handling
- 🔧 Advanced payment methods (BOLT12, PayNym)
- 🔧 URL metadata parser
- 🔧 Real-time notifications
- 🔧 Enhanced security patterns

---

## Phase 1: Database Enhancements (Week 1)

### 1.1 Add Missing Database Functions

Add these to your latest migration file:

```sql
-- Auto-update funding totals when gifts are confirmed
CREATE OR REPLACE FUNCTION update_funding_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Update wishlist item funding
  UPDATE wishlist_items
  SET
    sats_raised = (
      SELECT COALESCE(SUM(amount_sats), 0)
      FROM transactions
      WHERE item_id = NEW.item_id
        AND status = 'confirmed'
    ),
    is_funded = (
      SELECT COALESCE(SUM(amount_sats), 0) >= price_sats
      FROM transactions
      WHERE item_id = NEW.item_id
        AND status = 'confirmed'
    ),
    updated_at = NOW()
  WHERE id = NEW.item_id;

  -- Update wishlist total
  UPDATE wishlists
  SET
    total_sats_raised = (
      SELECT COALESCE(SUM(amount_sats), 0)
      FROM transactions
      WHERE wishlist_id = NEW.wishlist_id
        AND status = 'confirmed'
    ),
    updated_at = NOW()
  WHERE id = NEW.wishlist_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on transaction confirmation
DROP TRIGGER IF EXISTS trg_update_funding ON transactions;
CREATE TRIGGER trg_update_funding
  AFTER INSERT OR UPDATE OF status ON transactions
  FOR EACH ROW
  WHEN (NEW.status = 'confirmed')
  EXECUTE FUNCTION update_funding_totals();

-- Function to increment view count safely
CREATE OR REPLACE FUNCTION increment_view_count(wishlist_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE wishlists
  SET view_count = view_count + 1,
      updated_at = NOW()
  WHERE id = wishlist_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message)
  VALUES (p_user_id, p_type, p_title, p_message)
  RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-notify user on gift received
CREATE OR REPLACE FUNCTION notify_on_gift()
RETURNS TRIGGER AS $$
DECLARE
  wishlist_owner_id UUID;
  wishlist_title TEXT;
  item_title TEXT;
BEGIN
  -- Get wishlist owner and title
  SELECT creator_id, title INTO wishlist_owner_id, wishlist_title
  FROM wishlists
  WHERE id = NEW.wishlist_id;

  -- Get item title if applicable
  IF NEW.item_id IS NOT NULL THEN
    SELECT title INTO item_title
    FROM wishlist_items
    WHERE id = NEW.item_id;
  END IF;

  -- Create notification
  PERFORM create_notification(
    wishlist_owner_id,
    'gift_received',
    'New Gift Received!',
    CASE
      WHEN item_title IS NOT NULL THEN
        format('%s contributed %s sats to "%s" in your wishlist "%s"',
          NEW.contributor_name,
          NEW.amount_sats,
          item_title,
          wishlist_title)
      ELSE
        format('%s contributed %s sats to your wishlist "%s"',
          NEW.contributor_name,
          NEW.amount_sats,
          wishlist_title)
    END
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_on_gift ON transactions;
CREATE TRIGGER trg_notify_on_gift
  AFTER INSERT ON transactions
  FOR EACH ROW
  WHEN (NEW.status = 'confirmed')
  EXECUTE FUNCTION notify_on_gift();
```

### 1.2 Add Indexes for Performance

```sql
-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_wishlist_item ON transactions(wishlist_id, item_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_wishlists_public ON wishlists(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_wishlist_items_wishlist ON wishlist_items(wishlist_id);
```

---

## Phase 2: URL Metadata Parser (Week 1-2)

Create a utility to auto-extract product info from URLs:

```typescript
// src/lib/urlParser.ts - ENHANCE EXISTING
export interface ProductMetadata {
  title: string;
  description: string;
  price?: number;
  currency?: string;
  image?: string;
  merchant?: string;
}

export async function parseProductUrl(url: string): Promise<ProductMetadata | null> {
  try {
    // Use a serverless function or API to fetch and parse
    const response = await fetch(`/api/parse-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) return null;

    return await response.json();
  } catch (error) {
    console.error('Failed to parse URL:', error);
    return null;
  }
}

// Alternative: Client-side basic parser
export function extractDomainName(url: string): string {
  try {
    const { hostname } = new URL(url);
    return hostname.replace('www.', '');
  } catch {
    return 'Unknown';
  }
}
```

Create a Supabase Edge Function for server-side parsing:

```typescript
// supabase/functions/parse-url/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    // Fetch the URL
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; KATOA/1.0)",
      },
    });

    const html = await response.text();

    // Parse Open Graph and meta tags
    const metadata = {
      title: extractMetaTag(html, "og:title") || extractTitle(html),
      description: extractMetaTag(html, "og:description") || extractMetaTag(html, "description"),
      image: extractMetaTag(html, "og:image"),
      price: extractPrice(html),
      currency: "USD",
      merchant: new URL(url).hostname.replace("www.", ""),
    };

    return new Response(JSON.stringify(metadata), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function extractMetaTag(html: string, property: string): string | null {
  const regex = new RegExp(`<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']`, "i");
  const match = html.match(regex);
  return match ? match[1] : null;
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match ? match[1] : "Untitled";
}

function extractPrice(html: string): number | null {
  const patterns = [
    /\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/,
    /price["\s:]*(\d+(?:\.\d{2})?)/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      return parseFloat(match[1].replace(",", ""));
    }
  }

  return null;
}
```

---

## Phase 3: Webhook Handler (Week 2)

Create a secure webhook endpoint:

```typescript
// supabase/functions/btcpay-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const webhookSecret = Deno.env.get("BTCPAY_WEBHOOK_SECRET")!;

const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, BTCPay-Sig",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("btcpay-sig");
    const body = await req.text();

    // Verify signature
    if (webhookSecret && signature) {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(webhookSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
      const expectedSig = Array.from(new Uint8Array(sig))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      if (signature !== `sha256=${expectedSig}`) {
        return new Response("Invalid signature", { status: 401 });
      }
    }

    const event = JSON.parse(body);

    // Handle invoice settled
    if (event.type === "InvoiceSettled" || event.invoiceStatus === "Settled") {
      const { invoiceId, metadata } = event;
      const { wishlistId, itemId, contributorName, message } = metadata || {};

      // Update transaction status
      const { error } = await supabase
        .from("transactions")
        .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
        .eq("payment_hash", invoiceId);

      if (error) {
        console.error("Failed to update transaction:", error);
        return new Response("Database error", { status: 500 });
      }

      console.log(`Payment confirmed for invoice ${invoiceId}`);
    }

    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Server error", { status: 500, headers: corsHeaders });
  }
});
```

---

## Phase 4: Enhanced BTCPay Integration (Week 2-3)

Update your BTCPay service with production patterns:

```typescript
// src/lib/btcpay.ts - ENHANCE
export class BTCPayService {
  // ... existing code ...

  // Add invoice status polling
  async pollInvoiceStatus(
    invoiceId: string,
    onUpdate: (status: string) => void,
    intervalMs: number = 2000,
    maxAttempts: number = 150 // 5 minutes
  ): Promise<void> {
    let attempts = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        onUpdate("timeout");
        return;
      }

      try {
        const invoice = await this.getInvoice(invoiceId);
        if (!invoice) {
          onUpdate("error");
          return;
        }

        onUpdate(invoice.status);

        if (invoice.status === "Settled" || invoice.status === "Invalid" || invoice.status === "Expired") {
          return; // Stop polling
        }

        attempts++;
        setTimeout(poll, intervalMs);
      } catch (error) {
        console.error("Poll error:", error);
        onUpdate("error");
      }
    };

    poll();
  }

  // Generate Lightning invoice directly
  async createLightningInvoice(
    amountSats: number,
    description: string,
    expiry: number = 900 // 15 minutes
  ): Promise<{ paymentRequest: string; paymentHash: string }> {
    const endpoint = `${this.config.serverUrl}/api/v1/stores/${this.config.storeId}/lightning/BTC/invoices`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        amount: amountSats,
        description,
        expiry,
      }),
    });

    if (!response.ok) {
      throw new Error(`BTCPay Lightning API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      paymentRequest: data.bolt11,
      paymentHash: data.paymentHash,
    };
  }
}
```

---

## Phase 5: Real-time Notifications (Week 3)

Add Supabase Realtime subscriptions:

```typescript
// src/hooks/useNotifications.ts
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Database } from "../lib/supabase";

type Notification = Database["public"]["Tables"]["notifications"]["Row"];

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // Fetch initial notifications
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.is_read).length);
      }
    };

    fetchNotifications();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    if (!userId) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}
```

---

## Phase 6: Advanced Payment Methods (Week 4)

### 6.1 BOLT12 Support

```typescript
// src/lib/bolt12.ts
export interface BOLT12Offer {
  offer: string; // bech32 encoded offer
  offerId: string;
  amount?: number; // Optional for amount-flexible offers
  description: string;
}

export async function createBOLT12Offer(
  nodeUrl: string,
  description: string,
  amountSats?: number
): Promise<BOLT12Offer> {
  // This requires a Lightning node with BOLT12 support (CLN, LDK)
  // Implementation depends on your Lightning infrastructure
  throw new Error("BOLT12 not yet implemented - requires compatible Lightning node");
}
```

### 6.2 PayNym/BIP47 Support

```typescript
// src/lib/paynym.ts
export interface PayNymCode {
  code: string; // PM8T... format
  avatar: string; // PayNym avatar URL
}

export async function resolvePayNym(paynymHandle: string): Promise<PayNymCode | null> {
  try {
    const response = await fetch(`https://paynym.is/api/v1/nym/${paynymHandle}`);
    if (!response.ok) return null;

    const data = await response.json();
    return {
      code: data.payment_code,
      avatar: `https://paynym.is/avatar/${data.nymId}`,
    };
  } catch (error) {
    console.error("Failed to resolve PayNym:", error);
    return null;
  }
}

export function generatePayNymQR(paymentCode: string): string {
  // Generate QR code for payment code
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    paymentCode
  )}`;
}
```

---

## Phase 7: Production Deployment (Week 4-5)

### 7.1 Environment Setup

```bash
# .env.production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_BTCPAY_SERVER_URL=https://your-btcpay.com
VITE_BTCPAY_STORE_ID=your-store-id
```

### 7.2 Build Optimization

```typescript
// vite.config.ts - UPDATE
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          supabase: ["@supabase/supabase-js"],
          bitcoin: ["nostr-tools"], // Add when implemented
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    proxy: {
      "/api": "http://localhost:5174", // Local dev server
    },
  },
});
```

### 7.3 cPanel Upload Script

```bash
#!/bin/bash
# deploy.sh

echo "Building production bundle..."
npm run build

echo "Creating deployment archive..."
cd dist
tar -czf ../deployment.tar.gz *
cd ..

echo "Upload deployment.tar.gz to your cPanel File Manager"
echo "Extract to public_html/"
echo "Done!"
```

### 7.4 .htaccess for SPA Routing

```apache
# public_html/.htaccess
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Don't rewrite files or directories
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d

  # Rewrite everything else to index.html
  RewriteRule . /index.html [L]
</IfModule>

# Enable compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Enable caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
</IfModule>
```

---

## Testing Checklist

### Functional Tests
- [ ] User registration and login
- [ ] Create wishlist with multiple items
- [ ] Add item from URL (auto-parse metadata)
- [ ] Make gift (Lightning + onchain)
- [ ] Webhook confirms payment
- [ ] Funding totals update automatically
- [ ] Notifications sent to wishlist owner
- [ ] Real-time updates work
- [ ] Public wishlist view accessible
- [ ] Anonymous gifting works

### Security Tests
- [ ] RLS policies prevent unauthorized access
- [ ] API keys never exposed to client
- [ ] Webhook signature verification works
- [ ] SQL injection attempts blocked
- [ ] XSS attempts sanitized
- [ ] Rate limiting prevents abuse

### Performance Tests
- [ ] Page load < 2 seconds
- [ ] Lighthouse score > 90
- [ ] Database queries optimized
- [ ] Images lazy-loaded
- [ ] Bundle size < 600KB

---

## Success Metrics

**Week 1:**
- Database functions deployed
- URL parser working
- 95% test coverage on core features

**Week 2:**
- Webhook handling production-ready
- BTCPay integration fully tested
- First real Bitcoin payment processed

**Week 3:**
- Real-time notifications working
- User feedback collected
- Bug fixes deployed

**Week 4:**
- Advanced payment methods stubbed
- Production deployment successful
- SSL certificate installed

**Week 5:**
- User onboarding < 5 minutes
- Payment success rate > 95%
- Zero critical bugs

---

## Future Enhancements (Post-MVP)

### Q1 2026
- Nostr integration (NIP-07 auth)
- BOLT12 offers
- Mobile app (React Native)
- Multi-language support

### Q2 2026
- PayNym/BIP47 integration
- Gift pooling for group gifts
- Advanced analytics dashboard
- API for third-party integrations

### Q3 2026
- Merchant partnerships
- Affiliate program
- Premium features
- White-label solution

---

## Resources

- [BTCPay Server API Docs](https://docs.btcpayserver.org/API/Greenfield/v1/)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [BOLT12 Specification](https://github.com/lightning/bolts/blob/master/12-offer-encoding.md)
- [BIP47 PayNym](https://github.com/bitcoin/bips/blob/master/bip-0047.mediawiki)
- [Nostr NIPs](https://github.com/nostr-protocol/nips)

---

**This roadmap transforms your MVP into a production-grade Bitcoin gifting platform. Start with Phase 1 and work sequentially for best results.**
