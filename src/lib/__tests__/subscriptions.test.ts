import { beforeEach, describe, expect, it } from 'vitest';
import { STORAGE_KEYS } from '../storage';
import { getSubscription, isSubscribed, subscribeLocal, unsubscribe } from '../subscriptions';

describe('subscriptions', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEYS.creatorSubscriptions);
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
