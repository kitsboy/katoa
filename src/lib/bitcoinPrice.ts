const CACHE_KEY = 'btc_price_cache';
const CACHE_DURATION = 5 * 60 * 1000;

interface PriceCache {
  price: number;
  timestamp: number;
}

export async function getBitcoinPrice(): Promise<number> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { price, timestamp }: PriceCache = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return price;
      }
    }

    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
    const data = await response.json();
    const price = data.bitcoin.usd;

    localStorage.setItem(CACHE_KEY, JSON.stringify({
      price,
      timestamp: Date.now()
    }));

    return price;
  } catch (error) {
    console.error('Error fetching Bitcoin price:', error);
    return 0;
  }
}

export function usdToSats(usd: number, btcPrice: number): number {
  if (btcPrice === 0) return 0;
  return Math.round((usd / btcPrice) * 100_000_000);
}

export function satsToUsd(sats: number, btcPrice: number): number {
  return (sats / 100_000_000) * btcPrice;
}

export function formatSats(sats: number): string {
  return new Intl.NumberFormat().format(sats);
}

export function formatUsd(usd: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(usd);
}
