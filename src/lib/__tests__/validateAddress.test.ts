import { describe, expect, it } from 'vitest';
import { validateBitcoinAddress, validateLightningAddress } from '../validateAddress';

describe('validateLightningAddress', () => {
  it('accepts Lightning addresses', () => {
    expect(validateLightningAddress('user@getalby.com')).toBeNull();
  });

  it('accepts ln invoices', () => {
    expect(validateLightningAddress('lnbc1pvjluezpp5qqqsyqcvq0emr')).toBeNull();
  });

  it('rejects invalid email-style addresses', () => {
    expect(validateLightningAddress('not-an-email')).toMatch(/Lightning/);
  });
});

describe('validateBitcoinAddress', () => {
  it('accepts typical bech32 addresses', () => {
    expect(
      validateBitcoinAddress('bc1qhm5ndfjhqxdk3cx0pngyps4f5nnwdckulmge6c8keyf2pk0neqtshjn8ad')
    ).toBeNull();
  });

  it('rejects too-short addresses', () => {
    expect(validateBitcoinAddress('bc1qshort')).toMatch(/26 and 90/);
  });
});