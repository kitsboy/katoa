import { describe, expect, it } from 'vitest';
import {
  bitcoinQrData,
  getQrImageUrl,
  isBolt11Invoice,
  isDummyPaymentTarget,
  lightningQrData,
  silentPaymentQrData,
} from '../qr';

/** Realistic-length BIP352 address: sp1 + 116 bech32m characters. Shape only, no checksum claim. */
const SP1_ADDRESS =
  'sp1qqgste7k9hx0qed2qzx0n4y3nr6xr3k3v4x5xr0q9k5jv0qk4z9k0qed2qzx0n4y3nr6qpzry9x8gf2tvdw0s3jn54khce6mua7lqpzry9x8gf2tvdw0';

describe('silentPaymentQrData', () => {
  it('strips the descriptor prefix so wallets receive the bare sp1 address', () => {
    expect(silentPaymentQrData(`silent:${SP1_ADDRESS}`)).toBe(SP1_ADDRESS);
    expect(silentPaymentQrData(`sp:${SP1_ADDRESS}`)).toBe(SP1_ADDRESS);
    expect(silentPaymentQrData(`silent:sp(${SP1_ADDRESS})`)).toBe(SP1_ADDRESS);
  });

  it('returns an empty payload for empty, placeholder, or wrong-shape descriptors', () => {
    expect(silentPaymentQrData('')).toBe('');
    expect(silentPaymentQrData('silent:')).toBe('');
    expect(silentPaymentQrData('silent:sp1placeholder000000000')).toBe('');
    expect(silentPaymentQrData('bc1qhm5ndfjhqxdk3cx0pngyps4f5nnwdckulmge6c8keyf2pk0neqtshjn8ad')).toBe('');
  });
});

describe('bitcoinQrData', () => {
  it('returns bare address without amount', () => {
    expect(bitcoinQrData('bc1qtest')).toBe('bitcoin:bc1qtest');
  });

  it('includes amount in BTC when sats provided', () => {
    expect(bitcoinQrData('bc1qtest', 100_000_000)).toBe('bitcoin:bc1qtest?amount=1');
  });

  it('formats fractional BTC for BIP-21', () => {
    expect(bitcoinQrData('bc1qtest', 21_000)).toBe('bitcoin:bc1qtest?amount=0.00021');
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

describe('isBolt11Invoice', () => {
  it('detects bolt11 with or without lightning prefix', () => {
    expect(isBolt11Invoice('lnbc1test')).toBe(true);
    expect(isBolt11Invoice('lightning:lnbc1test')).toBe(true);
    expect(isBolt11Invoice('user@getalby.com')).toBe(false);
  });
});

describe('getQrImageUrl', () => {
  it('encodes data for the QR image endpoint', () => {
    const url = getQrImageUrl('bitcoin:addr', 200);
    expect(url).toContain('api.qrserver.com');
    expect(url).toContain('200x200');
    expect(url).toContain(encodeURIComponent('bitcoin:addr'));
  });

  it('does not encode dummy bitcoin.org targets', () => {
    expect(getQrImageUrl('https://bitcoin.org/donate')).toBe('');
  });
});

describe('isDummyPaymentTarget', () => {
  it('blocks bitcoin.org placeholders and empty strings', () => {
    expect(isDummyPaymentTarget('')).toBe(true);
    expect(isDummyPaymentTarget('https://bitcoin.org')).toBe(true);
    expect(isDummyPaymentTarget('bc1qtest')).toBe(false);
  });

  it('refuses to build BIP-21 for dummy addresses', () => {
    expect(bitcoinQrData('https://bitcoin.org/donate', 1000)).toBe('');
    expect(lightningQrData('https://bitcoin.org')).toBe('');
  });
});