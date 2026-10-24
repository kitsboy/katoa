import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { CurrencyProvider, useCurrency } from '../CurrencyContext';

vi.mock('../../lib/api/client', () => ({
  fetchBtcUsdPrice: vi.fn(() => Promise.resolve(38000)),
}));

function wrapper({ children }: { children: ReactNode }) {
  return <CurrencyProvider>{children}</CurrencyProvider>;
}

async function loadedCurrency() {
  const { result } = renderHook(() => useCurrency(), { wrapper });
  await waitFor(() => expect(result.current.loading).toBe(false));
  return result;
}

describe('CurrencyProvider per-unit Bitcoin price', () => {
  it('converts the USD price into the selected fiat currency', async () => {
    const result = await loadedCurrency();

    expect(result.current.btcPriceForCurrency('USD')).toBe(38000);
    expect(result.current.btcPriceForCurrency('EUR')).toBeCloseTo(34960, 5);
    expect(result.current.formatPerUnitBitcoinPrice('USD')).toContain('38,000');
  });

  it('formats the Romanian Leu without throwing (RIA is not an ISO code)', async () => {
    const result = await loadedCurrency();

    expect(() => result.current.formatPerUnitBitcoinPrice('RIA')).not.toThrow();
    expect(result.current.formatPerUnitBitcoinPrice('RIA')).toMatch(/437,000/);
  });

  it('describes a whole Bitcoin for the BTC and SATS display modes', async () => {
    const result = await loadedCurrency();

    expect(result.current.formatPerUnitBitcoinPrice('BTC')).toBe('₿1');
    expect(result.current.formatPerUnitBitcoinPrice('SATS')).toBe('100,000,000 sats');
  });
});
