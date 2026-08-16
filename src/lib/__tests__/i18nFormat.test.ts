import { describe, expect, it } from 'vitest';
import { formatCompactCount, formatCurrency, formatNumber, formatRelativeTime, formatSatsLabel } from '../i18nFormat';

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

describe('formatCompactCount', () => {
  it('abbreviates thousands and millions', () => {
    expect(formatCompactCount(1284, 'en-US')).toBe('1.3K');
    expect(formatCompactCount(1_250_000, 'en-US')).toBe('1.3M');
  });

  it('leaves values under 1,000 plain', () => {
    expect(formatCompactCount(876, 'en-US')).toBe('876');
    expect(formatCompactCount(0, 'en-US')).toBe('0');
  });
});