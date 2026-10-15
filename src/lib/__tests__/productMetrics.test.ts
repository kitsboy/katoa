import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  envelopeFromCounters,
  fetchLiveCounters,
  homeStatsFromMetrics,
  loadHomeStats,
  type CountersClient,
  type ProductMetricsEnvelope,
} from '../productMetrics';

const sample: ProductMetricsEnvelope = {
  schema: 'gab.product-metrics.v1',
  productId: 'katoa',
  name: 'Katoa',
  updatedAt: '2026-08-11T00:00:00.000Z',
  kpis: [
    { key: 'creators_total', label: 'Creators', value: 11, format: 'number' },
    { key: 'sats_raised_total', label: 'Sats', value: 3_250_000, format: 'number' },
  ],
  raw: { demo: true, source: 'mock' },
};

/** Fake Supabase client shaped like the two queries fetchLiveCounters makes. */
function fakeClient(options: {
  creators?: number | null;
  rows?: Array<{ total_sats_raised: number | null; total_sats_goal: number | null }>;
  error?: unknown;
}): CountersClient {
  return {
    from: (table) => ({
      select: () =>
        Promise.resolve(
          table === 'profiles'
            ? { count: options.creators ?? null, error: options.error }
            : { data: options.rows ?? [], error: options.error }
        ),
    }),
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('homeStatsFromMetrics', () => {
  it('formats counts and labels demo sample', () => {
    const s = homeStatsFromMetrics(sample);
    expect(s.creators).toBe('11');
    expect(s.volume).toContain('sats');
    expect(s.isDemoSample).toBe(true);
    expect(s.source).toBe('metrics');
  });

  it('formats large creator counts with K', () => {
    const s = homeStatsFromMetrics({
      ...sample,
      kpis: [{ key: 'creators_total', label: 'Creators', value: 2500, format: 'number' }],
      raw: { demo: false },
    });
    expect(s.creators).toBe('2.5K');
    expect(s.isDemoSample).toBe(false);
  });

  it('never labels a live envelope a sample, even if a demo flag leaks in', () => {
    const live = envelopeFromCounters({ creators: 3, wishlists: 4, satsRaised: 0, fundedCampaigns: 0 });
    const s = homeStatsFromMetrics({ ...live, raw: { ...live.raw, demo: true } });
    expect(s.source).toBe('supabase');
    expect(s.isDemoSample).toBe(false);
  });
});

describe('fetchLiveCounters', () => {
  it('reads counts and the maintained totals column', async () => {
    const counters = await fetchLiveCounters(
      fakeClient({
        creators: 7,
        rows: [
          { total_sats_raised: 21_000, total_sats_goal: 21_000 },
          { total_sats_raised: 500, total_sats_goal: 10_000 },
        ],
      })
    );
    expect(counters).toEqual({ creators: 7, wishlists: 2, satsRaised: 21_500, fundedCampaigns: 1 });
  });

  it('treats a missing count or a query error as no answer, not as zero', async () => {
    expect(await fetchLiveCounters(fakeClient({ creators: null }))).toBeNull();
    expect(
      await fetchLiveCounters(fakeClient({ creators: 7, error: new Error('permission denied') }))
    ).toBeNull();
  });

  it('returns null when Supabase is not configured', async () => {
    // The test environment has no real project URL/anon key.
    expect(await fetchLiveCounters()).toBeNull();
  });
});

describe('loadHomeStats', () => {
  it('prefers live counters and drops the demo sample entirely', async () => {
    const stats = await loadHomeStats(fakeClient({ creators: 9, rows: [] }));
    expect(stats.source).toBe('supabase');
    expect(stats.isDemoSample).toBe(false);
    expect(stats.creators).toBe('9');
    expect(stats.volume).toBe('0 sats');
  });

  it('falls back to the labeled sample when only the static file answers', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(sample), { status: 200 })));
    const stats = await loadHomeStats(fakeClient({ creators: null }));
    expect(stats.source).toBe('metrics');
    expect(stats.isDemoSample).toBe(true);
  });

  it('reports unavailable rather than guessing', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 500 })));
    const stats = await loadHomeStats(fakeClient({ creators: null }));
    expect(stats.source).toBe('unavailable');
    expect(stats.creators).toBe('—');
    expect(stats.volume).toBe('—');
  });
});
