import { describe, expect, it } from 'vitest';
import { bitcoinQrData, getQrImageUrl, lightningQrData } from '../qr';

describe('bitcoinQrData', () => {
  it('returns bare address without amount', () => {
    expect(bitcoinQrData('bc1qtest')).toBe('bitcoin:bc1qtest');
  });

  it('includes amount in BTC when sats provided', () => {
    expect(bitcoinQrData('bc1qtest', 100_000_000)).toBe('bitcoin:bc1qtest?amount=1');
  });
});

describe('lightningQrData', () => {
  it('prefixes ln invoice', () => {
    expect(lightningQrData('lnbc1test')).toBe('lightning:lnbc1test');
  });

  it('preserves existing lightning prefix', () => {
    expect(lightningQrData('lightning:lnbc1test')).toBe('lightning:lnbc1test');
  });
});

describe('getQrImageUrl', () => {
  it('encodes data for chart API', () => {
    const url = getQrImageUrl('bitcoin:addr', 200);
    expect(url).toContain('cht=qr');
    expect(url).toContain('200x200');
    expect(url).toContain(encodeURIComponent('bitcoin:addr'));
  });
});