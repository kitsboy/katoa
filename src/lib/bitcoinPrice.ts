const CACHE_KEY = 'katoa_btc_price_cache';
const CACHE_DURATION = 5 * 60 * 1000;

interface PriceCache {
  price: number;
  timestamp: number;
}

async function fetchFromCoinGecko(): Promise<number> {
  const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
  if (!response.ok) throw new Error(`CoinGecko ${response.status}`);
  const data = await response.json();
  return data.bitcoin.usd;
}

async function fetchFromCoinbase(): Promise<number> {
  const response = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot');
  if (!response.ok) throw new Error(`Coinbase ${response.status}`);
  const data = await response.json();
  return parseFloat(data.data.amount);
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

    let price: number;
    try {
      price = await fetchFromCoinGecko();
    } catch {
      price = await fetchFromCoinbase();
    }

    localStorage.setItem(CACHE_KEY, JSON.stringify({
      price,
      timestamp: Date.now(),
    }));

    return price;
  } catch (error) {
    console.error('Error fetching Bitcoin price:', error);
    const stale = localStorage.getItem(CACHE_KEY);
    if (stale) {
      const { price }: PriceCache = JSON.parse(stale);
      if (price > 0) return price;
    }
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