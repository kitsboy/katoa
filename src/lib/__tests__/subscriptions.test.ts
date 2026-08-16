import { beforeEach, describe, expect, it } from 'vitest';
import { STORAGE_KEYS } from '../storage';
import { isSubscribed, subscribeLocal, unsubscribe } from '../subscriptions';

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
});
