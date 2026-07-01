/**
 * Staged API client — all external calls route here for caching, fallbacks, and Edge Function proxy.
 * Connections activate when Supabase Edge Functions / Cloudflare Workers are deployed.
 */

export type ApiHealthStatus = 'ok' | 'degraded' | 'down';

export interface ApiHealth {
  supabase: ApiHealthStatus;
  prices: ApiHealthStatus;
  btcmap: ApiHealthStatus;
  btcpay: ApiHealthStatus;
  nostr: ApiHealthStatus;
}

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { data: unknown; expires: number }>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expires) return null;
  return entry.data as T;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, expires: Date.now() + CACHE_TTL_MS });
}

async function fetchWithFallback<T>(
  urls: string[],
  parser: (res: Response) => Promise<T>
): Promise<T> {
  let lastError: Error | null = null;

  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return await parser(res);
    } catch (err) {
      lastError = err as Error;
    }
  }

  throw lastError ?? new Error('All providers failed');
}

/** Staged health check — expand when Edge Function /api/health is live. */
export async function checkApiHealth(): Promise<ApiHealth> {
  const edgeUrl = import.meta.env.VITE_API_BASE_URL;

  if (edgeUrl) {
    try {
      const res = await fetch(`${edgeUrl}/health`);
      if (res.ok) return res.json();
    } catch {
      // fall through to client-side checks
    }
  }

  return {
    supabase: import.meta.env.VITE_SUPABASE_URL ? 'degraded' : 'down',
    prices: 'degraded',
    btcmap: import.meta.env.VITE_BTCMAP_ENABLED === 'false' ? 'down' : 'degraded',
    btcpay: import.meta.env.VITE_BTCPAY_SERVER_URL ? 'degraded' : 'down',
    nostr: 'ok',
  };
}

/** Staged price fetch with cache + fallback providers. */
export async function fetchBtcUsdPrice(): Promise<number> {
  const cached = getCached<number>('btc_usd');
  if (cached) return cached;

  const price = await fetchWithFallback(
    [
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
      'https://api.coinbase.com/v2/exchange-rates?currency=BTC',
    ],
    async (res) => {
      const data = await res.json();
      if (data.bitcoin?.usd) return data.bitcoin.usd as number;
      if (data.data?.rates?.USD) return 1 / parseFloat(data.data.rates.USD);
      throw new Error('Unexpected price response');
    }
  );

  setCache('btc_usd', price);
  return price;
}

export { getCached, setCache, fetchWithFallback };