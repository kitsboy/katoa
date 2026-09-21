import { beforeEach, describe, expect, it } from 'vitest';
import { STORAGE_KEYS } from '../storage';
import type { CreateIntentParams } from '../paymentCore';
import { getSubscription, isSubscribed, subscribeLocal, unsubscribe, createSubscriptionIntent } from '../subscriptions';

describe('subscriptions', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEYS.creatorSubscriptions);
  });

  it('builds subscription intents through the shared provider contract', async () => {
    const plug = {
      name: 'btcpay' as const,
      createIntent: async (params: CreateIntentParams) => ({
        id: 'fake-subscription-intent',
        amountSats: params.amountSats,
        memo: params.memo,
        metadata: params.metadata,
        rail: params.rail,
        provider: 'btcpay' as const,
        state: 'intent' as const,
        createdAt: '2026-09-21T00:00:00.000Z',
      }),
      getStatus: async () => { throw new Error('not used'); },
      listEvents: async () => [],
    };
    const intent = await createSubscriptionIntent(plug, {
      creatorSlug: 'luna',
      tierId: 'patron',
      amountSats: 21_000,
    });
    expect(intent.metadata).toMatchObject({ kind: 'subscription', creator_slug: 'luna', tier_id: 'patron' });
  });

  it('starts unsubscribed', () => {
    expect(isSubscribed('luna-exclusive-videos')).toBe(false);
  });

  it('subscribes locally and persists', () => {
    subscribeLocal('luna-exclusive-videos', 'supporter');
    expect(isSubscribed('luna-exclusive-videos')).toBe(true);
    expect(isSubscribed('sasha-vip-content')).toBe(false);
  });

  it('unsubscribes', () => {
    subscribeLocal('luna-exclusive-videos');
    unsubscribe('luna-exclusive-videos');
    expect(isSubscribed('luna-exclusive-videos')).toBe(false);
  });

  it('records source as local (not a Lightning settlement)', () => {
    const state = subscribeLocal('luna-exclusive-videos', 'patron');
    expect(state.source).toBe('local');
    expect(getSubscription('luna-exclusive-videos')?.source).toBe('local');
  });
});
