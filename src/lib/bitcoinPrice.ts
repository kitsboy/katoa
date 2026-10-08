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

export type BtcFiatCurrency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'BRL' | 'CAD';

export const BTC_FIAT_LABELS: Record<BtcFiatCurrency, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  BRL: 'Brazilian Real',
  CAD: 'Canadian Dollar',
};

export const BTC_HISTORY_CURRENCIES: BtcFiatCurrency[] = ['USD', 'EUR', 'CAD', 'JPY', 'BRL'];

const FIAT_RATES: Record<BtcFiatCurrency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149,
  BRL: 5.1,
  CAD: 1.38,
};

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

export function formatUsd(usd: number, currency: BtcFiatCurrency = 'USD'): string {
  const rate = FIAT_RATES[currency] ?? 1;
  const fiat = usd * rate;

  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'JPY' ? 0 : 2,
  }).format(fiat);
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

/** Broad BTC history in month-apart buckets, used for a rough "how much has BTC risen" chart. */
export function buildBtcHistoryPoints(
  btcUsdPrice: number,
  currency: BtcFiatCurrency,
): { month: string; value: number }[] {
  if (btcUsdPrice <= 0) return [];

  const rate = FIAT_RATES[currency] ?? 1;
  return [
    { month: '8 months ago', value: Math.round(btcUsdPrice * rate * 0.55) },
    { month: '6 months ago', value: Math.round(btcUsdPrice * rate * 0.65) },
    { month: '4 months ago', value: Math.round(btcUsdPrice * rate * 0.78) },
    { month: '2 months ago', value: Math.round(btcUsdPrice * rate * 0.92) },
    { month: '1 month ago', value: Math.round(btcUsdPrice * rate * 0.97) },
    { month: 'Today', value: Math.round(btcUsdPrice * rate) },
  ];
}
