import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DEMO_EARNINGS_TOTAL_SATS,
  EARNINGS_SERIES_DAYS,
  demoEarnings,
  earningsFromTransactions,
  emptyEarnings,
  fetchLiveEarnings,
  formatSparkline,
  sumSats,
} from '../earnings';

vi.mock('../supabase', () => ({
  isSupabaseConfigured: vi.fn(() => false),
  supabase: {
    from: vi.fn(),
  },
}));

import { isSupabaseConfigured, supabase } from '../supabase';

const NOW = new Date('2026-08-20T12:00:00.000Z');

function parseYs(points: string): number[] {
  return points.split(' ').map((pair) => Number(pair.split(',')[1]));
}

describe('demoEarnings', () => {
  it('returns 14 consecutive UTC days ending today', () => {
    const { series } = demoEarnings(NOW);
    expect(series).toHaveLength(EARNINGS_SERIES_DAYS);
    expect(series[0].day).toBe('2026-08-07');
    expect(series[series.length - 1].day).toBe('2026-08-20');
    for (let i = 1; i < series.length; i += 1) {
      const prev = Date.parse(`${series[i - 1].day}T00:00:00.000Z`);
      const next = Date.parse(`${series[i].day}T00:00:00.000Z`);
      expect(next - prev).toBe(86_400_000);
    }
  });

  it('is a strictly rising series totaling the dashboard demo raised amount', () => {
    const { series } = demoEarnings(NOW);
    for (let i = 1; i < series.length; i += 1) {
      expect(series[i].sats).toBeGreaterThan(series[i - 1].sats);
    }
    expect(sumSats(series)).toBe(DEMO_EARNINGS_TOTAL_SATS);
    expect(sumSats(series)).toBe(3_250_000);
  });

  it('is deterministic (no random noise)', () => {
    expect(demoEarnings(NOW)).toEqual(demoEarnings(NOW));
  });

  it('includes ~5 privacy-preserving gift aliases', () => {
    const { gifts } = demoEarnings(NOW);
    expect(gifts).toHaveLength(5);
    const from = gifts.map((g) => g.from);
    expect(from).toContain('Anonymous');
    expect(from).toContain('Nostr supporter');
    expect(from).toContain('Anonymous gifter');
    expect(from).toContain('Community member');
    expect(gifts.every((g) => g.id && g.ago && g.sats > 0)).toBe(true);
    expect(gifts.some((g) => g.wishlistTitle === 'Skate Colombia')).toBe(true);
  });
});

describe('sumSats', () => {
  it('sums sats and treats non-finite as 0', () => {
    expect(sumSats([])).toBe(0);
    expect(sumSats([{ sats: 21_000 }, { sats: 5_000 }])).toBe(26_000);
    expect(sumSats([{ sats: Number.NaN }, { sats: 10 }])).toBe(10);
  });
});

describe('formatSparkline', () => {
  it('returns an empty string for no points', () => {
    expect(formatSparkline([])).toBe('');
  });

  it('emits one x,y pair per point', () => {
    const { series } = demoEarnings(NOW);
    const points = formatSparkline(series, 240, 48);
    const pairs = points.split(' ');
    expect(pairs).toHaveLength(series.length);
    expect(pairs.every((p) => /^\d+(\.\d+)?,\d+(\.\d+)?$/.test(p))).toBe(true);
  });

  it('places later (higher) sats higher on the SVG (smaller y)', () => {
    const { series } = demoEarnings(NOW);
    const ys = parseYs(formatSparkline(series, 240, 48));
    expect(ys[ys.length - 1]).toBeLessThan(ys[0]);
  });

  it('draws a flat line for an all-zero series', () => {
    const ys = parseYs(formatSparkline(emptyEarnings(NOW).series, 240, 48));
    expect(new Set(ys).size).toBe(1);
  });
});

describe('emptyEarnings', () => {
  it('is 14 zero days and no gifts', () => {
    const empty = emptyEarnings(NOW);
    expect(empty.series).toHaveLength(14);
    expect(sumSats(empty.series)).toBe(0);
    expect(empty.gifts).toEqual([]);
  });
});

describe('earningsFromTransactions', () => {
  it('buckets confirmed sats into the last 14 UTC days and lists recent gifts', () => {
    const snapshot = earningsFromTransactions(
      [
        {
          id: 'tx-1',
          contributor_name: 'Nostr supporter',
          amount_sats: 21_000,
          created_at: '2026-08-20T10:00:00.000Z',
          wishlist_id: 'wl-1',
          status: 'confirmed',
        },
        {
          id: 'tx-2',
          contributor_name: 'hidden@example.com',
          amount_sats: 5_000,
          created_at: '2026-08-19T08:00:00.000Z',
          wishlist_id: 'wl-2',
          status: 'completed',
        },
        {
          id: 'tx-old',
          contributor_name: 'Anonymous',
          amount_sats: 9_999_999,
          created_at: '2026-01-01T00:00:00.000Z',
          wishlist_id: 'wl-1',
          status: 'confirmed',
        },
      ],
      { 'wl-1': 'Skate Colombia', 'wl-2': 'Studio drops' },
      NOW,
    );

    expect(snapshot.series).toHaveLength(14);
    expect(snapshot.series.find((p) => p.day === '2026-08-20')?.sats).toBe(21_000);
    expect(snapshot.series.find((p) => p.day === '2026-08-19')?.sats).toBe(5_000);
    expect(sumSats(snapshot.series)).toBe(26_000);
    expect(snapshot.gifts).toHaveLength(3);
    expect(snapshot.gifts[0].from).toBe('Nostr supporter');
    expect(snapshot.gifts[0].wishlistTitle).toBe('Skate Colombia');
    expect(snapshot.gifts[1].from).toBe('Anonymous');
  });
});

describe('fetchLiveEarnings', () => {
  afterEach(() => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(false);
    vi.mocked(supabase.from).mockReset();
  });

  it('returns null when Supabase is not configured', async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(false);
    await expect(fetchLiveEarnings('user-1')).resolves.toBeNull();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('returns null without a user id', async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    await expect(fetchLiveEarnings(null)).resolves.toBeNull();
    await expect(fetchLiveEarnings(undefined)).resolves.toBeNull();
  });

  it('returns null when the transactions query errors (missing table / RLS)', async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'wishlists') {
        return thenable({ data: [{ id: 'wl-1', title: 'Skate Colombia' }], error: null });
      }
      return thenable({ data: null, error: { message: 'relation "transactions" does not exist' } });
    });
    await expect(fetchLiveEarnings('user-1')).resolves.toBeNull();
  });

  it('maps confirmed rows when the table exists', async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'wishlists') {
        return thenable({ data: [{ id: 'wl-1', title: 'Skate Colombia' }], error: null });
      }
      return thenable({
        data: [
          {
            id: 'tx-live',
            contributor_name: 'Anonymous',
            amount_sats: 21_000,
            created_at: new Date().toISOString(),
            status: 'confirmed',
            wishlist_id: 'wl-1',
          },
        ],
        error: null,
      });
    });

    const snapshot = await fetchLiveEarnings('user-1');
    expect(snapshot).not.toBeNull();
    expect(sumSats(snapshot!.series)).toBe(21_000);
    expect(snapshot!.gifts[0]?.from).toBe('Anonymous');
    expect(snapshot!.gifts[0]?.wishlistTitle).toBe('Skate Colombia');
  });
});

function thenable<T>(result: T) {
  const chain: Record<string, unknown> = {};
  const self = () => chain;
  chain.select = vi.fn(self);
  chain.eq = vi.fn(self);
  chain.in = vi.fn(self);
  chain.order = vi.fn(self);
  chain.limit = vi.fn(self);
  chain.then = (resolve: (value: T) => unknown, reject?: (reason: unknown) => unknown) =>
    Promise.resolve(result).then(resolve, reject);
  return chain;
}
