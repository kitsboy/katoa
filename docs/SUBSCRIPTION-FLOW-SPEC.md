# Subscription Flow — Handoff Spec (for Grok / Kimi on Hermes)

**Status:** client scaffolded, backend NOT wired. This is the one piece that needs real Lightning + a deploy.
**Owner:** next LLM on THOR/Hermes (Grok or Kimi). You have (or can reach) the **LND server** — this spec assumes LND/BTCPay/LNbits is the settlement rail.

## Goal

Turn KATOA's creator subscriptions from a demo into real: a fan picks a tier → pays a Lightning invoice → the webhook marks them subscribed → locked posts unlock and persist.

## What already exists (do not rebuild)

| Piece | Location | Notes |
|-------|----------|-------|
| BTCPay client | `src/lib/btcpay.ts` | `BTCPayService.createInvoice(amount, currency, orderId, metadata)` → calls `VITE_API_BASE_URL` proxy. `getInvoice`, `openCheckout`. **No secrets in client.** |
| LNURL invoice | `src/lib/nostr.ts` | `requestLnurlInvoice` / NIP-57 zap path (creator `lud16`). |
| Gift flow | `src/pages/WishlistPage.tsx` | `handleGiftClick`/`GiftDraft` — creates LN invoice, records **intent only**, never marks paid client-side. |
| Webhook stub | `supabase/functions/btcpay-webhook/README.md` | Scaffold only. Describes: verify HMAC → `transactions.status='confirmed'` → bump `wishlist_items.sats_raised` + wishlist totals. |
| Follow tables | `supabase/migrations/20251113035131_add_following_system.sql` | `follows` + `wishlist_follows` already exist (free follow ≈ free subscribe). |
| Payments | `supabase/migrations/20251113045141_add_payment_methods_system.sql` | `payment_methods` (lightning/lud16 etc). |
| Client subscribe seam | `src/lib/subscriptions.ts` | Local (localStorage) subscribe/unsubscribe + `isSubscribed(slug)`. Demo-only `source:'local'` — replace with DB-backed state. |
| Tier data | `src/components/SubscriptionTiers.tsx` | `supporter`/`patron`/… tiers (sats + usd). |

## What to build

### 1. DB — `subscriptions` table (new migration)

```sql
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references profiles(id) on delete cascade,
  creator_id uuid not null references profiles(id) on delete cascade,
  tier_id text not null,            -- 'supporter' | 'patron' | ...
  price_sats bigint not null,
  status text not null default 'pending',  -- pending | active | expired | cancelled
  active_until timestamptz,         -- null = never expires (one-time/lifetime)
  invoice_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
-- indexes + RLS: subscriber can read own rows; creator can read rows where creator_id = auth.uid()
```

- `wishlist_follows` stays for free follows. Paid subscription = a row here with `status='active'`.

### 2. Invoice creation — tag metadata so the webhook knows it's a subscription

Use the existing proxy contract (`POST {VITE_API_BASE_URL}/btcpay/invoices`) with `metadata`:

```json
{ "kind": "subscription", "creatorId": "<uuid>", "tierId": "supporter" }
```

- Client (`src/lib/subscriptions.ts` or a new `subscribeWithInvoice()`): call BTCPay/LNURL with that metadata + `orderId`, then poll `getInvoice` until `Settled` (or wait for the webhook).
- Server proxy (Edge Function on THOR) injects the store API key + LND connection. It must NOT accept arbitrary amounts — validate against the tier's `price_sats` server-side.

### 3. Webhook — activate the subscription

Extend `supabase/functions/btcpay-webhook` (or a new `lnbits-webhook`):

1. Verify webhook signature/HMAC (server secret).
2. If `metadata.kind === 'subscription'`: upsert `subscriptions` row with `status='active'`, set `active_until` (tier term), store `invoice_id`.
3. Else (gift/tip): existing `transactions.status='confirmed'` path.
4. Never trust the browser for confirmation.

### 4. Client — swap the local seam for the real one

- `src/lib/subscriptions.ts`: add `subscribeWithInvoice(tier)` and `isSubscribed()` backed by Supabase (or keep localStorage as optimistic cache + reconcile with DB on load).
- `CreatorPostFeed` / `CreatorPostModal` already read a `subscribed` boolean — keep that contract; just make the source of truth the DB/`subscriptions` table.
- `WishlistPage` `handleSubscribe`: open tier picker → create invoice → poll → on `active`, unlock.

## LND / BTCPay tie-in (for THOR)

- The LND node already exists on THOR. Wire **one** of: (a) BTCPay store + its Greenfield API, or (b) LNbits + its HTTP API, or (c) LND REST directly (macaroon server-side only).
- Store **invoice/webhook secrets + macaroons in THOR's vault** (never in repo, never in `VITE_*`).
- `VITE_API_BASE_URL` → the THOR-hosted proxy Edge Function (not CF Pages directly).

## Acceptance criteria

1. Paying a tier invoice flips the fan to `subscribed` and unlocks locked posts (no client spoofing possible).
2. Unpaid/expired = locked. Cancelled/expired tier re-locks after `active_until`.
3. Free follow (`wishlist_follows`) is distinct from paid `subscriptions`.
4. `npm run check` green; no secrets in git.

## Open questions for Cam

- Tier term lengths (monthly? one-time?) and sats pricing.
- Which rail: BTCPay vs LNbits vs LND REST.
- Testnet staging before mainnet.
