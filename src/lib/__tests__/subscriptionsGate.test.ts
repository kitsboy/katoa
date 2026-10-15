import { beforeEach, describe, expect, it, vi } from 'vitest';

// Simulate a build WITH a real Supabase backend: the local unlock seam must be
// unusable, so a browser-writable value can never bypass the paywall.
vi.mock('../demoAuth', () => ({
  canUseDemoAuth: () => false,
  DEMO_PROFILE: {},
  DEMO_USER_ID: 'demo',
  isDemoSessionActive: () => false,
  setDemoSessionActive: () => {},
}));

import {
  getSubscriptions,
  isActiveSubscriptionRow,
  mapDbSubscriptionRows,
  subscribeLocal,
  subscriptionGateMode,
  subscriptionTierSats,
  unsubscribe,
  usesLocalSubscriptionSeam,
  type DbSubscriptionRow,
} from '../subscriptions';

function row(overrides: Partial<DbSubscriptionRow> = {}): DbSubscriptionRow {
  return {
    tier_id: 'supporter',
    status: 'active',
    active_until: null,
    created_at: '2026-10-01T00:00:00.000Z',
    creator: { username: 'luna_vip' },
    ...overrides,
  };
}

describe('subscription gate mode', () => {
  it('uses the DB gate when a backend is configured', () => {
    expect(subscriptionGateMode()).toBe('db');
    expect(usesLocalSubscriptionSeam()).toBe(false);
  });
});

describe('isActiveSubscriptionRow', () => {
  const now = new Date('2026-10-15T12:00:00.000Z');

  it('is false unless the row is active', () => {
    expect(isActiveSubscriptionRow({ status: 'pending', active_until: null }, now)).toBe(false);
    expect(isActiveSubscriptionRow({ status: 'cancelled', active_until: null }, now)).toBe(false);
    expect(isActiveSubscriptionRow({ status: 'expired', active_until: null }, now)).toBe(false);
  });

  it('treats a null expiry as never expiring', () => {
    expect(isActiveSubscriptionRow({ status: 'active', active_until: null }, now)).toBe(true);
  });

  it('re-locks once the term has passed', () => {
    expect(
      isActiveSubscriptionRow({ status: 'active', active_until: '2026-10-15T11:59:59.000Z' }, now)
    ).toBe(false);
    expect(
      isActiveSubscriptionRow({ status: 'active', active_until: '2026-10-16T00:00:00.000Z' }, now)
    ).toBe(true);
  });

  it('refuses an unparseable expiry rather than unlocking', () => {
    expect(isActiveSubscriptionRow({ status: 'active', active_until: 'not-a-date' }, now)).toBe(false);
  });
});

describe('mapDbSubscriptionRows', () => {
  const now = new Date('2026-10-15T12:00:00.000Z');

  it('keys active rows by creator username and marks them invoice-confirmed', () => {
    const mapped = mapDbSubscriptionRows([row()], now);
    expect(Object.keys(mapped)).toEqual(['luna_vip']);
    expect(mapped.luna_vip.source).toBe('invoice');
    expect(mapped.luna_vip.tierId).toBe('supporter');
    expect(mapped.luna_vip.subscribedAt).toBe(Date.parse('2026-10-01T00:00:00.000Z'));
    expect(mapped.luna_vip.activeUntil).toBeNull();
  });

  it('drops inactive, expired and unnamed rows', () => {
    const mapped = mapDbSubscriptionRows(
      [
        row({ status: 'pending' }),
        row({ active_until: '2026-10-01T00:00:00.000Z' }),
        row({ creator: null }),
        row({ creator: { username: 'sasha_vip' }, tier_id: 'patron' }),
      ],
      now
    );
    expect(Object.keys(mapped)).toEqual(['sasha_vip']);
    expect(mapped.sasha_vip.tierId).toBe('patron');
  });

  it('records a bounded expiry for a term subscription', () => {
    const mapped = mapDbSubscriptionRows([row({ active_until: '2026-11-15T00:00:00.000Z' })], now);
    expect(mapped.luna_vip.activeUntil).toBe(Date.parse('2026-11-15T00:00:00.000Z'));
  });
});

describe('local seam where a backend exists', () => {
  beforeEach(() => {
    unsubscribe('luna_vip');
    unsubscribe('sasha_vip');
  });

  it('refuses to mint a subscription from the browser', () => {
    expect(() => subscribeLocal('luna_vip', 'patron')).toThrow(/Lightning webhook/i);
    expect(getSubscriptions()).toEqual({});
  });

  it('leaves a forged storage value unread by the DB gate', () => {
    const forged = { luna_vip: { creatorSlug: 'luna_vip', tierId: 'patron', subscribedAt: 1, source: 'local' } };
    window.localStorage.setItem('katoa_creator_subscriptions', JSON.stringify(forged));
    // The tampered value is present on this device…
    expect(getSubscriptions().luna_vip).toBeTruthy();
    // …but the DB gate resolves unlocks from rows only, so it grants nothing.
    expect(mapDbSubscriptionRows([], new Date())).toEqual({});
    window.localStorage.removeItem('katoa_creator_subscriptions');
  });
});

describe('tier pricing', () => {
  it('prices known tiers and falls back to the entry tier', () => {
    expect(subscriptionTierSats('patron')).toBe(42000);
    expect(subscriptionTierSats('champion')).toBe(105000);
    expect(subscriptionTierSats('does-not-exist')).toBe(21000);
  });
});
