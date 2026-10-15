import { getStorage, setStorage, STORAGE_KEYS } from './storage';
import { asRows, supabase } from './supabase';
import { canUseDemoAuth } from './demoAuth';
import type { PaymentIntent, PaymentMetadata, PaymentProviderPlug } from './paymentCore';

export interface SubscriptionState {
  creatorSlug: string;
  tierId: string;
  subscribedAt: number;
  /** 'local' = demo (this device). 'invoice' = confirmed by the webhook. */
  source: 'local' | 'invoice';
  /** Set when the backend knows an expiry ('invoice' rows only). */
  activeUntil?: number | null;
}

/**
 * Where a subscription's unlock state comes from.
 * - `db`   — Supabase is configured, so only `subscriptions` rows unlock content.
 * - `demo` — no backend in this build; a labelled device seam is the only option.
 */
export type SubscriptionGateMode = 'db' | 'demo';

export function subscriptionGateMode(): SubscriptionGateMode {
  return canUseDemoAuth() ? 'demo' : 'db';
}

/** True when this build has no authoritative subscription source to consult. */
export function usesLocalSubscriptionSeam(): boolean {
  return subscriptionGateMode() === 'demo';
}

/**
 * Tier prices in sats — one source of truth for the tier cards and the invoice
 * path (`SubscriptionTiers` renders these, the subscribe flow prices them).
 */
export const SUBSCRIPTION_TIER_SATS: Record<string, number> = {
  supporter: 21000,
  patron: 42000,
  champion: 105000,
};

/** Sats for a tier id, falling back to the entry tier (never 0 — a paid tier). */
export function subscriptionTierSats(tierId: string): number {
  return SUBSCRIPTION_TIER_SATS[tierId] ?? SUBSCRIPTION_TIER_SATS.supporter;
}

/** Build the canonical payment intent used when real subscription settlement is enabled. */
export async function createSubscriptionIntent(
  plug: PaymentProviderPlug,
  params: {
    creatorSlug: string;
    tierId: string;
    amountSats: number;
    metadata?: PaymentMetadata;
  },
): Promise<PaymentIntent> {
  return plug.createIntent({
    amountSats: params.amountSats,
    rail: 'lightning',
    memo: `KATOA subscription: ${params.creatorSlug}/${params.tierId}`,
    metadata: {
      ...params.metadata,
      kind: 'subscription',
      creator_slug: params.creatorSlug,
      tier_id: params.tierId,
    },
  });
}

/* ------------------------------------------------------------------ *
 * Authoritative state — the `subscriptions` table (see
 * supabase/migrations/20261015120000_add_subscriptions.sql). Only the
 * webhook can write an activation, so nothing here can be spoofed from
 * the browser; these helpers only read.
 * ------------------------------------------------------------------ */

/** Row shape as selected below (creator joined to a username). */
export interface DbSubscriptionRow {
  tier_id: string;
  status: string;
  active_until: string | null;
  created_at: string | null;
  creator?: { username: string | null } | null;
}

/**
 * A row unlocks subscriber-only content only while it is active and unexpired.
 * `active_until === null` means the tier never expires.
 */
export function isActiveSubscriptionRow(
  row: Pick<DbSubscriptionRow, 'status' | 'active_until'>,
  now: Date = new Date(),
): boolean {
  if (row.status !== 'active') return false;
  if (!row.active_until) return true;
  const until = new Date(row.active_until).getTime();
  if (!Number.isFinite(until)) return false;
  return until > now.getTime();
}

/** Map DB rows to keyed subscription state (keyed by creator username = slug). */
export function mapDbSubscriptionRows(
  rows: DbSubscriptionRow[],
  now: Date = new Date(),
): Record<string, SubscriptionState> {
  const out: Record<string, SubscriptionState> = {};
  for (const row of rows) {
    const slug = row.creator?.username?.trim();
    if (!slug) continue;
    if (!isActiveSubscriptionRow(row, now)) continue;
    const started = row.created_at ? new Date(row.created_at).getTime() : NaN;
    out[slug] = {
      creatorSlug: slug,
      tierId: row.tier_id,
      subscribedAt: Number.isFinite(started) ? started : 0,
      source: 'invoice',
      activeUntil: row.active_until ? new Date(row.active_until).getTime() : null,
    };
  }
  return out;
}

/**
 * Read the signed-in fan's own active subscriptions. RLS returns nothing when
 * there is no session, so an anonymous visitor can never unlock locked posts.
 */
export async function fetchDbSubscriptions(
  now: Date = new Date(),
): Promise<Record<string, SubscriptionState>> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('tier_id, status, active_until, created_at, creator:profiles!subscriptions_creator_id_fkey(username)')
    .eq('status', 'active');

  if (error || !data) return {};
  return mapDbSubscriptionRows(asRows<DbSubscriptionRow>(data), now);
}

/** Cancel the caller's own subscription (server-side, cannot activate anything). */
export async function cancelDbSubscription(creatorSlug: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('cancel_my_subscription', {
    p_creator_username: creatorSlug,
  });
  if (error) {
    console.warn('Could not cancel subscription:', error.message);
    return false;
  }
  return data === true;
}

/* ------------------------------------------------------------------ *
 * Demo seam — only usable where no backend gate exists. Kept so the
 * preview build can still demonstrate the locked/unlocked flow.
 * ------------------------------------------------------------------ */

export function getSubscriptions(): Record<string, SubscriptionState> {
  return getStorage<Record<string, SubscriptionState>>(STORAGE_KEYS.creatorSubscriptions, {});
}

/** Demo-seam lookup. Prefer the `useCreatorSubscriptions` hook in the UI. */
export function isSubscribed(creatorSlug: string): boolean {
  return Boolean(getSubscriptions()[creatorSlug]);
}

export function getSubscription(creatorSlug: string): SubscriptionState | undefined {
  return getSubscriptions()[creatorSlug];
}

/**
 * Persist a demo subscription on this device.
 *
 * Refuses to run where Supabase is configured: with a real backend a
 * subscription is a `subscriptions` row written by the webhook after a settled
 * Lightning invoice, and a browser-writable unlock would be a paywall bypass.
 */
export function subscribeLocal(creatorSlug: string, tierId = 'supporter'): SubscriptionState {
  if (!usesLocalSubscriptionSeam()) {
    throw new Error(
      'Local subscription unlock is disabled in this build: subscriptions must be activated by the Lightning webhook.',
    );
  }
  const subs = getSubscriptions();
  const state: SubscriptionState = {
    creatorSlug,
    tierId,
    subscribedAt: Date.now(),
    source: 'local',
    activeUntil: null,
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
