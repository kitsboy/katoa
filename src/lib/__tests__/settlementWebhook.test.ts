import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  btcpaySignature,
  isConfirmedStatus,
  matchesReference,
  normalizeTxid,
  parseSettlement,
  positiveSats,
  ppvActivation,
  SUBSCRIPTION_TERM_DAYS,
  subscriptionActivation,
  tierPriceSats,
  TIER_PRICES_SATS,
  timingSafeEqual,
} from '../../../supabase/functions/_shared/settlement';
import { SUBSCRIPTION_TIER_SATS } from '../subscriptions';

const CREATOR = '11111111-1111-4111-8111-111111111111';

const settledInvoice = (overrides: Record<string, unknown> = {}) => ({
  id: 'evt_1',
  type: 'InvoiceSettled',
  invoiceId: 'inv_abc',
  metadata: { amount_sats: 21000, ...overrides },
});

describe('parseSettlement', () => {
  it('spots a settled invoice by type or by invoice status', () => {
    expect(parseSettlement(settledInvoice()).settled).toBe(true);
    expect(parseSettlement({ type: 'InvoiceProcessing' }).settled).toBe(false);
    expect(parseSettlement({ invoiceStatus: 'Settled' }).settled).toBe(true);
    expect(parseSettlement({ invoiceStatus: 'New' }).settled).toBe(false);
    expect(parseSettlement(null).settled).toBe(false);
  });

  it('resolves the row reference from metadata, order or invoice', () => {
    expect(parseSettlement(settledInvoice({ katoa_tx_id: 'tx-1' })).reference).toBe('tx-1');
    expect(parseSettlement({ orderId: 'tx-2' }).reference).toBe('tx-2');
    expect(parseSettlement({ invoiceId: 'inv_9' }).reference).toBe('inv_9');
  });

  it('reads the amount and the kind, and defaults an unnamed kind to gift', () => {
    expect(parseSettlement(settledInvoice()).providerAmountSats).toBe(21_000);
    expect(parseSettlement(settledInvoice()).kind).toBe('gift');
    expect(parseSettlement(settledInvoice({ kind: 'subscription' })).kind).toBe('subscription');
    // An unknown kind must not be treated as a subscription.
    expect(parseSettlement(settledInvoice({ kind: 'free-money' })).kind).toBe('gift');
  });

  it('takes the on-chain txid only in real 64-hex form', () => {
    expect(parseSettlement(settledInvoice({ txid: 'A'.repeat(64) })).txid).toBe('a'.repeat(64));
    expect(parseSettlement(settledInvoice({ txid: '0xdeadbeef' })).txid).toBeNull();
    expect(parseSettlement(settledInvoice({ txid: 42 })).txid).toBeNull();
    expect(normalizeTxid('b'.repeat(63))).toBeNull();
  });

  it('keeps the provider event id as the ledger key', () => {
    expect(parseSettlement(settledInvoice()).eventId).toBe('evt_1');
    expect(parseSettlement({ type: 'InvoiceSettled' }).eventId).toBeNull();
  });
});

describe('amount and reference helpers', () => {
  it('accepts whole positive sats and rejects everything else', () => {
    expect(positiveSats('21000')).toBe(21_000);
    expect(positiveSats(21_000.4)).toBe(21_000);
    expect(positiveSats(0)).toBeNull();
    expect(positiveSats(-5)).toBeNull();
    expect(positiveSats('abc')).toBeNull();
    expect(positiveSats(null)).toBeNull();
  });

  it('lets metadata narrow a match but never widen it', () => {
    expect(matchesReference(undefined, 'wishlist-1')).toBe(true);
    expect(matchesReference('wishlist-1', 'wishlist-1')).toBe(true);
    expect(matchesReference('wishlist-2', 'wishlist-1')).toBe(false);
    // Present in metadata, absent on the row: nothing to contradict, so allowed.
    expect(matchesReference('wishlist-1', null)).toBe(true);
  });

  it('knows the confirmed statuses', () => {
    expect(isConfirmedStatus('confirmed')).toBe(true);
    expect(isConfirmedStatus('PAID')).toBe(true);
    expect(isConfirmedStatus('pending')).toBe(false);
    expect(isConfirmedStatus(null)).toBe(false);
  });
});

describe('signature', () => {
  it('builds the sha256= HMAC BTCPay sends, and only matches the right body', async () => {
    const sig = await btcpaySignature('s3cret', '{"a":1}');
    expect(sig).toMatch(/^sha256=[0-9a-f]{64}$/);
    expect(sig).toBe(await btcpaySignature('s3cret', '{"a":1}'));
    expect(sig).not.toBe(await btcpaySignature('s3cret', '{"a":2}'));
    expect(sig).not.toBe(await btcpaySignature('other', '{"a":1}'));

    expect(timingSafeEqual(sig, sig)).toBe(true);
    expect(timingSafeEqual(sig, sig.replace(/.$/, '0'))).toBe(false);
    expect(timingSafeEqual('short', sig)).toBe(false);
  });
});

describe('subscriptionActivation', () => {
  const now = new Date('2026-10-15T12:00:00.000Z');

  it('activates a tier at its canonical price', () => {
    const result = subscriptionActivation(
      { creator_id: CREATOR, tier_id: 'patron' },
      42_000,
      now,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.creatorId).toBe(CREATOR);
    expect(result.priceSats).toBe(42_000);
    expect(result.activeUntil).toBe(
      new Date(now.getTime() + SUBSCRIPTION_TERM_DAYS * 86_400_000).toISOString(),
    );
  });

  it('prices the tier itself, so the payload cannot discount it', () => {
    // 1 sat of metadata claiming "champion" does not buy champion.
    const cheap = subscriptionActivation({ creator_id: CREATOR, tier_id: 'champion' }, 1, now);
    expect(cheap.ok).toBe(false);
    if (cheap.ok) return;
    expect(cheap.reason).toContain('underpaid');
    expect(tierPriceSats('champion')).toBe(105_000);
  });

  it('accepts an overpayment rather than stranding a settled gift', () => {
    const result = subscriptionActivation({ creator_id: CREATOR, tier_id: 'supporter' }, 50_000, now);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.priceSats).toBe(21_000);
  });

  it('refuses an unknown tier and a missing creator', () => {
    expect(subscriptionActivation({ creator_id: CREATOR, tier_id: 'vip' }, 500_000, now).ok).toBe(false);
    expect(subscriptionActivation({ tier_id: 'supportor' }, 500_000, now).ok).toBe(false);
    expect(subscriptionActivation({ creator_id: 'not-a-uuid', tier_id: 'patron' }, 42_000, now).ok).toBe(
      false,
    );
    expect(subscriptionActivation({ creator_id: CREATOR, tier_id: 'patron' }, null, now).ok).toBe(false);
  });
});

describe('ppvActivation', () => {
  const creator = CREATOR;
  const fan = '33333333-3333-4333-8333-333333333333';
  const meta = { creator_id: creator, subscriber_id: fan, post_key: 'luna-post-9', price_sats: 25000 };

  it('unlocks a post when the settled amount meets the price', () => {
    const result = ppvActivation(meta, 25_000);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result).toMatchObject({ fanId: fan, creatorId: creator, postKey: 'luna-post-9', priceSats: 25_000 });
  });

  it('accepts an overpayment but refuses a cheaper invoice than the price', () => {
    expect(ppvActivation(meta, 30_000).ok).toBe(true);
    const cheap = ppvActivation(meta, 100);
    expect(cheap.ok).toBe(false);
    if (cheap.ok) return;
    expect(cheap.reason).toContain('underpaid');
  });

  it('refuses a missing fan, creator, post key or price', () => {
    expect(ppvActivation({ ...meta, subscriber_id: undefined }, 25_000).ok).toBe(false);
    expect(ppvActivation({ ...meta, subscriber_id: 'luna_vip' }, 25_000).ok).toBe(false);
    expect(ppvActivation({ ...meta, creator_id: 'luna_vip' }, 25_000).ok).toBe(false);
    expect(ppvActivation({ ...meta, post_key: '' }, 25_000).ok).toBe(false);
    expect(ppvActivation({ ...meta, price_sats: undefined }, 25_000).ok).toBe(false);
    expect(ppvActivation(meta, null).ok).toBe(false);
  });
});

describe('the webhook activates PPV unlocks too', () => {
  const source = readFileSync(
    join(process.cwd(), 'supabase/functions/btcpay-webhook/index.ts'),
    'utf8',
  );

  it('branches on the ppv kind and writes the unlock row', () => {
    expect(source).toContain('activatePpv');
    expect(source).toContain('from("post_unlocks")');
  });
});

describe('tier prices agree with the client', () => {
  it('matches src/lib/subscriptions.ts exactly', () => {
    expect(TIER_PRICES_SATS).toEqual(SUBSCRIPTION_TIER_SATS);
  });
});

describe('the webhook keeps one maths for funding totals', () => {
  const source = readFileSync(
    join(process.cwd(), 'supabase/functions/btcpay-webhook/index.ts'),
    'utf8',
  );

  it('recomputes totals instead of adding the amount again', () => {
    expect(source).toContain('recompute_funding_totals');
    // The additive RPC double-counted against the funding trigger.
    expect(source).not.toContain('increment_funding_totals');
  });

  it('activates subscriptions from the canonical tier price, never the payload', () => {
    expect(source).toContain('subscriptionActivation');
    expect(source).toContain('from("subscriptions")');
  });

  it('records the on-chain txid only through the validated field', () => {
    expect(source).toContain('if (context.txid) patch.txid = context.txid');
  });
});

describe('the migration does not leave two maths in place', () => {
  const sql = readFileSync(
    join(process.cwd(), 'supabase/migrations/20261015130000_settlement_totals_and_txid.sql'),
    'utf8',
  );

  it('makes the legacy additive function recompute instead', () => {
    expect(sql).toContain('PERFORM public.recompute_funding_totals(p_wishlist_id, p_item_id)');
    expect(sql).toContain('Deprecated');
  });

  it('points the trigger at the same recompute', () => {
    expect(sql).toContain('PERFORM public.recompute_funding_totals(NEW.wishlist_id, NEW.item_id)');
  });
});
