/**
 * Load public product metrics (gab.product-metrics.v1) for honest UI stats.
 * Prefer this over inventing vanity numbers like "2.5K creators".
 */

export interface ProductMetricsEnvelope {
  schema: string;
  productId: string;
  name: string;
  updatedAt: string;
  kpis: Array<{
    key: string;
    label: string;
    value: number;
    format: string;
    priority?: number;
    hint?: string;
  }>;
  raw?: {
    demo?: boolean;
    source?: string;
    note?: string;
  };
}

export type HomeStats = {
  creators: string;
  volume: string;
  countries: string;
  source: 'metrics' | 'supabase' | 'unavailable';
  isDemoSample: boolean;
  updatedAt?: string;
};

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatSats(n: number): string {
  if (n >= 100_000_000) return `₿${(n / 100_000_000).toFixed(2)}`;
  if (n >= 1_000) return `${formatCount(n)} sats`;
  return `${n} sats`;
}

export async function fetchProductMetrics(): Promise<ProductMetricsEnvelope | null> {
  try {
    // Prefer live metrics endpoint later; static file is always present from prebuild
    const res = await fetch('/metrics.json', { cache: 'no-cache' });
    if (!res.ok) return null;
    const data = (await res.json()) as ProductMetricsEnvelope;
    if (data?.schema !== 'gab.product-metrics.v1') return null;
    return data;
  } catch {
    return null;
  }
}

/** Counters that only the database can answer authoritatively. */
export interface ProductCounters {
  creators: number;
  wishlists: number;
  /** Sum of the maintained `wishlists.total_sats_raised` column, not client-side arithmetic. */
  satsRaised: number;
  fundedCampaigns: number;
}

/** Minimal shape of the Supabase client this module uses, so tests can inject a fake. */
export interface CountersClient {
  from(table: 'profiles' | 'wishlists' | string): {
    select(
      columns: string,
      options?: { count?: 'exact'; head?: boolean }
    ): PromiseLike<{ count?: number | null; data?: unknown; error?: unknown }>;
  };
}

function rowsOf(data: unknown): Array<{ total_sats_raised?: number | null; total_sats_goal?: number | null }> {
  return Array.isArray(data) ? data : [];
}

/**
 * Authoritative platform counters from Supabase.
 *
 * `sats_raised_total` is read from `wishlists.total_sats_raised`, which is only ever moved by
 * the atomic `increment_funding_totals` RPC under service role once a payment settles. It is
 * therefore 0 until real settlements happen, and 0 is the truthful number to show — unlike the
 * sample catalog's millions, which is why the two sources must never be mixed.
 *
 * Returns null whenever it cannot answer honestly: Supabase unconfigured, query error, or a
 * missing count. RLS limits these rows to public wishlists, which is the intended scope.
 * A dedicated stats RPC is the scale-up path once the table outgrows one round trip.
 */
export async function fetchLiveCounters(client?: CountersClient): Promise<ProductCounters | null> {
  try {
    let db = client;
    if (!db) {
      const { isSupabaseConfigured, supabase } = await import('./supabase');
      if (!isSupabaseConfigured()) return null;
      db = supabase as unknown as CountersClient;
    }

    const profiles = await db.from('profiles').select('*', { count: 'exact', head: true });
    if (profiles?.error || profiles?.count == null) return null;

    const lists = await db.from('wishlists').select('total_sats_raised, total_sats_goal');
    if (lists?.error) return null;
    const rows = rowsOf(lists?.data);

    return {
      creators: profiles.count,
      wishlists: rows.length,
      satsRaised: rows.reduce((sum, row) => sum + (row.total_sats_raised ?? 0), 0),
      fundedCampaigns: rows.filter((row) => {
        const goal = row.total_sats_goal ?? 0;
        return goal > 0 && (row.total_sats_raised ?? 0) >= goal;
      }).length,
    };
  } catch {
    return null;
  }
}

/** Wrap live counters in the same envelope the static metrics file uses. */
export function envelopeFromCounters(
  counters: ProductCounters,
  updatedAt = new Date().toISOString()
): ProductMetricsEnvelope {
  const kpi = (key: string, label: string, value: number, priority: number) => ({
    key,
    label,
    value,
    format: 'number',
    priority,
  });
  return {
    schema: 'gab.product-metrics.v1',
    productId: 'katoa',
    name: 'Katoa',
    updatedAt,
    kpis: [
      kpi('creators_total', 'Creators', counters.creators, 1),
      kpi('wishlists_total', 'Wishlists', counters.wishlists, 1),
      kpi('sats_raised_total', 'Sats raised', counters.satsRaised, 2),
      kpi('campaigns_funded', 'Funded campaigns', counters.fundedCampaigns, 3),
    ],
    raw: {
      demo: false,
      source: 'supabase.wishlists.total_sats_raised',
      note: 'Live counters from Supabase. Totals come from the maintained wishlists.total_sats_raised column.',
    },
  };
}

export function homeStatsFromMetrics(m: ProductMetricsEnvelope): HomeStats {
  const kpi = (key: string) => m.kpis.find((k) => k.key === key)?.value ?? 0;
  const creators = kpi('creators_total');
  const sats = kpi('sats_raised_total');
  const live = Boolean(m.raw?.source?.startsWith('supabase'));
  return {
    creators: formatCount(creators),
    volume: formatSats(sats),
    countries: '195+',
    source: live ? 'supabase' : 'metrics',
    // A live envelope is never a sample, and a sample is never presented as live.
    isDemoSample: live ? false : Boolean(m.raw?.demo || m.raw?.source?.includes('mock')),
    updatedAt: m.updatedAt,
  };
}

/**
 * Home stats from one source at a time: live Supabase counters, else the labeled sample file,
 * else an explicit "unavailable". Mixing them (a real creator count beside a sample volume with
 * the demo banner cleared) is the failure this replaces.
 */
export async function loadHomeStats(client?: CountersClient): Promise<HomeStats> {
  const live = await fetchLiveCounters(client);
  if (live) return homeStatsFromMetrics(envelopeFromCounters(live));

  const metrics = await fetchProductMetrics();
  if (metrics) return homeStatsFromMetrics(metrics);

  return {
    creators: '—',
    volume: '—',
    countries: '195+',
    source: 'unavailable',
    isDemoSample: false,
  };
}
