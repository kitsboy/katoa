import { describe, it, expect } from 'vitest';
import {
  isValidUrl,
  normalizeProductUrl,
  merchantFromHostname,
  titleFromUrlPath,
  buyLabel,
} from '../productParser';

describe('productParser helpers', () => {
  it('normalizes and validates urls', () => {
    expect(normalizeProductUrl('amazon.com/dp/B08TEST')).toBe('https://amazon.com/dp/B08TEST');
    expect(isValidUrl('https://www.nike.com/t/shoe')).toBe(true);
    expect(isValidUrl('not a url')).toBe(false);
  });

  it('detects merchants', () => {
    expect(merchantFromHostname('www.amazon.com')).toBe('Amazon');
    expect(merchantFromHostname('www.etsy.com')).toBe('Etsy');
    expect(merchantFromHostname('cool-shop.myshopify.com')).toBe('Cool-shop');
  });

  it('builds title from amazon path', () => {
    const t = titleFromUrlPath(
      'https://www.amazon.com/Skateboarding-Safety-Equipment/dp/B08SAFE123'
    );
    expect(t.toLowerCase()).toContain('skateboarding');
  });

  it('buy label', () => {
    expect(buyLabel('Amazon')).toBe('Buy on Amazon');
    expect(buyLabel('')).toBe('Buy product');
  });
});
