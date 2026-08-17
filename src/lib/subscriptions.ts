import { getStorage, setStorage, STORAGE_KEYS } from './storage';

export interface SubscriptionState {
  creatorSlug: string;
  tierId: string;
  subscribedAt: number;
  /** 'local' = demo (this session). 'invoice' = confirmed by BTCPay/LNbits webhook. */
  source: 'local' | 'invoice';
}

/**
 * Client subscription state — localStorage seam only.
 *
 * Real subscriptions must come from the backend: tier -> Lightning invoice ->
 * webhook -> `subscriptions` row (see docs/SUBSCRIPTION-FLOW-SPEC.md).
 * This module lets the demo unlock content end-to-end until that ships.
 */
export function getSubscriptions(): Record<string, SubscriptionState> {
  return getStorage<Record<string, SubscriptionState>>(STORAGE_KEYS.creatorSubscriptions, {});
}

export function isSubscribed(creatorSlug: string): boolean {
  return Boolean(getSubscriptions()[creatorSlug]);
}

export function getSubscription(creatorSlug: string): SubscriptionState | undefined {
  return getSubscriptions()[creatorSlug];
}

export function subscribeLocal(creatorSlug: string, tierId = 'supporter'): SubscriptionState {
  const subs = getSubscriptions();
  const state: SubscriptionState = {
    creatorSlug,
    tierId,
    subscribedAt: Date.now(),
    source: 'local',
  };
  subs[creatorSlug] = state;
  setStorage(STORAGE_KEYS.creatorSubscriptions, subs);
  return state;
}

export function unsubscribe(creatorSlug: string): void {
  const subs = getSubscriptions();
  delete subs[creatorSlug];
  setStorage(STORAGE_KEYS.creatorSubscriptions, subs);
}
