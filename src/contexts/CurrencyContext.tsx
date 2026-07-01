import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { fetchBtcUsdPrice } from '../lib/api/client';

export type DisplayCurrency = 'BTC' | 'SATS' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'BRL';

interface CurrencyContextType {
  displayCurrency: DisplayCurrency;
  setDisplayCurrency: (c: DisplayCurrency) => void;
  btcUsdPrice: number;
  loading: boolean;
  satsToDisplay: (sats: number) => string;
  fiatToSats: (amount: number, currency: DisplayCurrency) => number;
}

const FIAT_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149,
  BRL: 5.1,
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [displayCurrency, setDisplayCurrencyState] = useState<DisplayCurrency>(() => {
    return (localStorage.getItem('katoa-currency') as DisplayCurrency) || 'SATS';
  });
  const [btcUsdPrice, setBtcUsdPrice] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('katoa-currency', displayCurrency);
  }, [displayCurrency]);

  useEffect(() => {
    fetchBtcUsdPrice()
      .then(setBtcUsdPrice)
      .catch(() => setBtcUsdPrice(0))
      .finally(() => setLoading(false));
  }, []);

  const setDisplayCurrency = (c: DisplayCurrency) => setDisplayCurrencyState(c);

  const satsToDisplay = useCallback(
    (sats: number): string => {
      const btc = sats / 100_000_000;

      switch (displayCurrency) {
        case 'SATS':
          return `${new Intl.NumberFormat().format(sats)} sats`;
        case 'BTC':
          return `₿${btc >= 1 ? btc.toFixed(4) : btc.toFixed(8)}`;
        case 'USD':
        case 'EUR':
        case 'GBP':
        case 'JPY':
        case 'BRL': {
          if (!btcUsdPrice) return `${new Intl.NumberFormat().format(sats)} sats`;
          const usd = btc * btcUsdPrice;
          const fiat = usd * (FIAT_RATES[displayCurrency] ?? 1);
          return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: displayCurrency,
            maximumFractionDigits: displayCurrency === 'JPY' ? 0 : 2,
          }).format(fiat);
        }
        default:
          return `${sats} sats`;
      }
    },
    [displayCurrency, btcUsdPrice]
  );

  const fiatToSats = useCallback(
    (amount: number, currency: DisplayCurrency): number => {
      if (!btcUsdPrice || currency === 'SATS') return Math.round(amount);
      if (currency === 'BTC') return Math.round(amount * 100_000_000);

      const rate = FIAT_RATES[currency] ?? 1;
      const usd = amount / rate;
      const btc = usd / btcUsdPrice;
      return Math.round(btc * 100_000_000);
    },
    [btcUsdPrice]
  );

  return (
    <CurrencyContext.Provider
      value={{ displayCurrency, setDisplayCurrency, btcUsdPrice, loading, satsToDisplay, fiatToSats }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}

export const CURRENCY_OPTIONS: { code: DisplayCurrency; label: string; symbol: string }[] = [
  { code: 'SATS', label: 'Satoshis', symbol: '⚡' },
  { code: 'BTC', label: 'Bitcoin', symbol: '₿' },
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'GBP', label: 'British Pound', symbol: '£' },
  { code: 'JPY', label: 'Japanese Yen', symbol: '¥' },
  { code: 'BRL', label: 'Brazilian Real', symbol: 'R$' },
];