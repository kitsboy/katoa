import { describe, expect, it } from 'vitest';
import { subscriptionInvoiceMetadata } from '../subscriptionInvoice';
import { SUBSCRIPTION_TIER_SATS } from '../subscriptions';

const CREATOR = '11111111-1111-4111-8111-111111111111';
const FAN = '22222222-2222-4222-8222-222222222222';

describe('subscriptionInvoiceMetadata', () => {
  it('builds the metadata the webhook activates from', () => {
    const built = subscriptionInvoiceMetadata({
      creatorId: CREATOR,
      subscriberId: FAN,
      tierId: 'patron',
      creatorSlug: 'luna_vip',
    });

    expect(built.ok).toBe(true);
    if (!built.ok) return;
    expect(built.amountSats).toBe(SUBSCRIPTION_TIER_SATS.patron);
    expect(built.metadata).toMatchObject({
      kind: 'subscription',
      tier_id: 'patron',
      creator_id: CREATOR,
      subscriber_id: FAN,
      creator_slug: 'luna_vip',
      amount_sats: String(SUBSCRIPTION_TIER_SATS.patron),
    });
    expect(built.orderId).toMatch(/^sub-[0-9a-f]{8}-patron-/);
  });

  it('refuses a slug or username in place of the creator uuid', () => {
    const built = subscriptionInvoiceMetadata({
      creatorId: 'luna_vip',
      subscriberId: FAN,
      tierId: 'supporter',
    });
    expect(built.ok).toBe(false);
    if (built.ok) return;
    expect(built.error).toContain('payable profile id');
  });

  it('refuses to price a tier without a signed-in supporter', () => {
    const built = subscriptionInvoiceMetadata({
      creatorId: CREATOR,
      subscriberId: null,
      tierId: 'supporter',
    });
    expect(built.ok).toBe(false);
    if (built.ok) return;
    expect(built.error).toContain('Sign in');
  });

  it('refuses an unknown tier instead of defaulting to a price', () => {
    const built = subscriptionInvoiceMetadata({
      creatorId: CREATOR,
      subscriberId: FAN,
      tierId: 'vip',
    });
    expect(built.ok).toBe(false);
    if (built.ok) return;
    expect(built.error).toContain('Unknown tier');
  });

  it('normalizes tier casing and adds an optional top-up', () => {
    const built = subscriptionInvoiceMetadata({
      creatorId: CREATOR,
      subscriberId: FAN,
      tierId: '  CHAMPION ',
      bonusSats: 5_000,
    });
    expect(built.ok).toBe(true);
    if (!built.ok) return;
    expect(built.metadata.tier_id).toBe('champion');
    expect(built.amountSats).toBe(SUBSCRIPTION_TIER_SATS.champion + 5_000);
  });

  it('never lets a negative top-up reduce the tier price', () => {
    const built = subscriptionInvoiceMetadata({
      creatorId: CREATOR,
      subscriberId: FAN,
      tierId: 'supporter',
      bonusSats: -500_000,
    });
    expect(built.ok).toBe(true);
    if (built.ok) expect(built.amountSats).toBe(SUBSCRIPTION_TIER_SATS.supporter);
  });

  it('gives a fresh order id per attempt so an old invoice cannot be replayed', () => {
    const first = subscriptionInvoiceMetadata({ creatorId: CREATOR, subscriberId: FAN, tierId: 'patron' });
    const second = subscriptionInvoiceMetadata({ creatorId: CREATOR, subscriberId: FAN, tierId: 'patron' });
    expect(first.ok && second.ok && first.orderId !== second.orderId).toBe(true);
  });
});
