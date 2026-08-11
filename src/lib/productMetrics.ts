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

/** When Supabase is configured, attempt live profile count for home stats. */
export async function fetchLiveCreatorCount(): Promise<number | null> {
  try {
    const { isSupabaseConfigured, supabase } = await import('./supabase');
    if (!isSupabaseConfigured()) return null;
    const { count, error } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    if (error || count == null) return null;
    return count;
  } catch {
    return null;
  }
}

export function homeStatsFromMetrics(m: ProductMetricsEnvelope): HomeStats {
  const kpi = (key: string) => m.kpis.find((k) => k.key === key)?.value ?? 0;
  const creators = kpi('creators_total');
  const sats = kpi('sats_raised_total');
  return {
    creators: formatCount(creators),
    volume: formatSats(sats),
    countries: '195+',
    source: 'metrics',
    isDemoSample: Boolean(m.raw?.demo || m.raw?.source?.includes('mock')),
    updatedAt: m.updatedAt,
  };
}
