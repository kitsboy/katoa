import { describe, expect, it } from 'vitest';
import { formatCurrency, formatNumber, formatRelativeTime, formatSatsLabel } from '../i18nFormat';

describe('formatSatsLabel', () => {
  it('uses singular sat for 1', () => {
    expect(formatSatsLabel(1, 'en-US')).toBe('1 sat');
  });

  it('uses plural sats', () => {
    expect(formatSatsLabel(21000, 'en-US')).toMatch(/21,000 sats/);
  });
});

describe('formatCurrency', () => {
  it('formats USD', () => {
    expect(formatCurrency(1000, 'USD', 'en-US')).toMatch(/\$1,000/);
  });
});

describe('formatNumber', () => {
  it('respects locale grouping', () => {
    expect(formatNumber(1000000, 'en-US')).toBe('1,000,000');
  });
});

describe('formatRelativeTime', () => {
  it('returns relative string for past dates', () => {
    const past = new Date(Date.now() - 60_000);
    const result = formatRelativeTime(past, 'en');
    expect(result.length).toBeGreaterThan(0);
  });
});