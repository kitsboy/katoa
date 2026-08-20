/**
 * Creator earnings seam — demo 14-day series until Lightning webhooks confirm
 * `transactions` rows. Never marks payments complete from the client.
 */

import { formatRelativeTime } from './i18nFormat';
import { isSupabaseConfigured, supabase } from './supabase';

export type EarningsPoint = {
  day: string;
  sats: number;
};

export type GiftEvent = {
  id: string;
  from: string;
  sats: number;
  ago: string;
  wishlistTitle?: string;
};

export type EarningsSnapshot = {
  series: EarningsPoint[];
  gifts: GiftEvent[];
  /** All confirmed txs in the fetch window, not only the 14-day sparkline. */
  lifetimeSats: number;
};

export type LiveTransactionRow = {
  id: string;
  contributor_name?: string | null;
  amount_sats: number;
  created_at?: string | null;
  wishlist_id?: string | null;
  status?: string | null;
};

/** Matches dashboard demo `totalRaised`. */
export const DEMO_EARNINGS_TOTAL_SATS = 3_250_000;

export const EARNINGS_SERIES_DAYS = 14;

const MS_PER_DAY = 86_400_000;

/** Webhook/live rows that count toward creator earnings (pending/failed do not). */
export const LIVE_EARNINGS_STATUSES = ['confirmed', 'completed', 'paid'] as const;

/**
 * Rising 14-day weights (×1000) that sum to 3_250_000 — smooth climb, not noise.
 * 85+100+115+130+150+170+195+220+250+280+320+365+415+455 = 3250.
 */
const DEMO_DAY_WEIGHTS = [85, 100, 115, 130, 150, 170, 195, 220, 250, 280, 320, 365, 415, 455] as const;

const DEMO_GIFTS: Omit<GiftEvent, 'id'>[] = [
  { from: 'Anonymous', sats: 21_000, ago: '2h ago', wishlistTitle: 'Skate Colombia' },
  { from: 'Nostr supporter', sats: 5_000, ago: '1d ago', wishlistTitle: 'Studio drops' },
  { from: 'Anonymous gifter', sats: 50_000, ago: '2d ago', wishlistTitle: 'Skate Colombia' },
  { from: 'Community member', sats: 10_000, ago: '3d ago', wishlistTitle: 'Studio drops' },
  { from: 'Nostr supporter', sats: 21_000, ago: '5d ago', wishlistTitle: 'Skate Colombia' },
];

export function sumSats(items: Array<{ sats: number }>): number {
  return items.reduce((sum, item) => sum + (Number.isFinite(item.sats) ? item.sats : 0), 0);
}

export function lastNUtcDays(n: number, now = new Date()): string[] {
  const end = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    days.push(new Date(end - i * MS_PER_DAY).toISOString().slice(0, 10));
  }
  return days;
}

export function emptyEarnings(now = new Date()): EarningsSnapshot {
  return {
    series: lastNUtcDays(EARNINGS_SERIES_DAYS, now).map((day) => ({ day, sats: 0 })),
    gifts: [],
    lifetimeSats: 0,
  };
}

/** True when there is no snapshot or the 14-day series sums to 0 sats. */
export function isLiveEarningsEmpty(snapshot?: EarningsSnapshot | null): boolean {
  if (!snapshot) return true;
  return sumSats(snapshot.series) === 0;
}

export function demoEarnings(now = new Date()): EarningsSnapshot {
  const days = lastNUtcDays(EARNINGS_SERIES_DAYS, now);
  return {
    series: days.map((day, i) => ({ day, sats: DEMO_DAY_WEIGHTS[i] * 1000 })),
    gifts: DEMO_GIFTS.map((gift, i) => ({ id: `demo-gift-${i + 1}`, ...gift })),
    lifetimeSats: DEMO_EARNINGS_TOTAL_SATS,
  };
}

/**
 * SVG polyline `points` for an inline sparkline (no chart library).
 * Y is inverted (larger sats sit higher). All-zero series is a flat baseline.
 */
export function formatSparkline(
  points: Array<{ sats: number }>,
  width = 240,
  height = 48,
): string {
  if (!points.length || width <= 0 || height <= 0) return '';

  const padX = 2;
  const padY = 3;
  const values = points.map((p) => Math.max(0, Number.isFinite(p.sats) ? p.sats : 0));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const innerW = Math.max(1, width - padX * 2);
  const innerH = Math.max(1, height - padY * 2);
  const n = values.length;

  return values
    .map((value, i) => {
      const x = n === 1 ? width / 2 : padX + (i * innerW) / (n - 1);
      const y = padY + innerH - ((value - min) / span) * innerH;
      return `${roundCoord(x)},${roundCoord(y)}`;
    })
    .join(' ');
}

export function earningsFromTransactions(
  rows: LiveTransactionRow[],
  wishlistTitles: Record<string, string> = {},
  now = new Date(),
): EarningsSnapshot {
  const days = lastNUtcDays(EARNINGS_SERIES_DAYS, now);
  const buckets = new Map(days.map((day) => [day, 0]));

  for (const row of rows) {
    if (!isConfirmedStatus(row.status)) continue;
    const day = row.created_at?.slice(0, 10);
    if (!day || !buckets.has(day)) continue;
    buckets.set(day, (buckets.get(day) || 0) + (row.amount_sats || 0));
  }

  const confirmed = [...rows]
    .filter((row) => isConfirmedStatus(row.status))
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));

  const gifts: GiftEvent[] = confirmed.slice(0, 5).map((row) => ({
    id: row.id,
    from: aliasContributor(row.contributor_name),
    sats: row.amount_sats || 0,
    ago: row.created_at ? formatRelativeTime(new Date(row.created_at)) : '',
    wishlistTitle: row.wishlist_id ? wishlistTitles[row.wishlist_id] : undefined,
  }));

  return {
    series: days.map((day) => ({ day, sats: buckets.get(day) || 0 })),
    gifts,
    lifetimeSats: confirmed.reduce((sum, row) => sum + (row.amount_sats || 0), 0),
  };
}

/**
 * Confirmed Lightning gifts for a creator from `transactions`.
 * Queries rows whose `wishlist_id` is in the creator's wishlists.
 * `wishlist_id` is NOT NULL in schema, so we do not join `wishlist_items`
 * for null ids. Returns null when Supabase is missing, the table is absent,
 * or the query fails — caller falls back to demo (isDemoUser) or empty.
 * Empty wishlists → `emptyEarnings()` (UI zeros, not a hang).
 */
export async function fetchLiveEarnings(userId?: string | null): Promise<EarningsSnapshot | null> {
  if (!userId || !isSupabaseConfigured()) return null;

  try {
    const { data: wishlists, error: wishlistError } = await supabase
      .from('wishlists')
      .select('id, title')
      .eq('creator_id', userId);

    if (wishlistError) return null;

    const list = (wishlists ?? []) as Array<{ id: string; title: string }>;
    const titles: Record<string, string> = {};
    for (const row of list) titles[row.id] = row.title;
    const ids = list.map((row) => row.id);
    if (!ids.length) return emptyEarnings();

    const { data: rows, error: txError } = await supabase
      .from('transactions')
      .select('id, contributor_name, amount_sats, created_at, status, wishlist_id')
      .in('wishlist_id', ids)
      .in('status', [...LIVE_EARNINGS_STATUSES])
      .order('created_at', { ascending: false })
      .limit(500);

    if (txError) return null;

    return earningsFromTransactions((rows ?? []) as LiveTransactionRow[], titles);
  } catch {
    return null;
  }
}

function isConfirmedStatus(status?: string | null): boolean {
  if (!status) return false;
  return (LIVE_EARNINGS_STATUSES as readonly string[]).includes(status.toLowerCase());
}

function aliasContributor(name?: string | null): string {
  const trimmed = name?.trim() || '';
  if (!trimmed || trimmed.includes('@')) return 'Anonymous';
  return trimmed;
}

function roundCoord(n: number): number {
  return Math.round(n * 100) / 100;
}
