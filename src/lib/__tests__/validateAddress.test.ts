import { describe, expect, it } from 'vitest';
import {
  decodePaymentUri,
  isDummyPaymentTarget,
  usablePaymentAddress,
  validateBitcoinAddress,
  validateLightningAddress,
  validateNpub,
  validatePynym,
  validateWalletAddress,
  validateXpub,
} from '../validateAddress';

describe('decodePaymentUri', () => {
  it('strips bitcoin: and query amount', () => {
    expect(decodePaymentUri('bitcoin:bc1qhm5ndfjhqxdk3cx0pngyps4f5nnwdckulmge6c8keyf2pk0neqtshjn8ad?amount=0.01')).toBe(
      'bc1qhm5ndfjhqxdk3cx0pngyps4f5nnwdckulmge6c8keyf2pk0neqtshjn8ad'
    );
  });

  it('strips lightning: prefix', () => {
    expect(decodePaymentUri('lightning:user@getalby.com')).toBe('user@getalby.com');
    expect(decodePaymentUri('LIGHTNING:lnbc1pvjluezpp5qqqsyqcvq0emr')).toBe('lnbc1pvjluezpp5qqqsyqcvq0emr');
  });

  it('leaves bare addresses unchanged', () => {
    expect(decodePaymentUri('  user@getalby.com  ')).toBe('user@getalby.com');
  });
});

describe('validateLightningAddress', () => {
  it('accepts Lightning addresses', () => {
    expect(validateLightningAddress('user@getalby.com')).toBeNull();
  });

  it('accepts lnbc invoices and lnurl', () => {
    expect(validateLightningAddress('lnbc1pvjluezpp5qqqsyqcvq0emr')).toBeNull();
    expect(validateLightningAddress('lntb1testnetinvoiceabc')).toBeNull();
    expect(validateLightningAddress('lnurl1dp68gurn8ghj7')).toBeNull();
  });

  it('rejects bare ln and non-addresses', () => {
    expect(validateLightningAddress('ln')).toMatch(/lnbc\/lntb/);
    expect(validateLightningAddress('lnxyz')).toMatch(/lnbc\/lntb/);
    expect(validateLightningAddress('not-an-email')).toMatch(/Lightning/);
  });

  it('accepts lightning: URI wrappers', () => {
    expect(validateLightningAddress('lightning:alice@walletofsatoshi.com')).toBeNull();
  });
});

describe('validateBitcoinAddress', () => {
  it('accepts typical bech32 addresses', () => {
    expect(
      validateBitcoinAddress('bc1qhm5ndfjhqxdk3cx0pngyps4f5nnwdckulmge6c8keyf2pk0neqtshjn8ad')
    ).toBeNull();
  });

  it('accepts tb1 / 1 / 3 prefixes', () => {
    expect(validateBitcoinAddress('tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx')).toBeNull();
    expect(validateBitcoinAddress('1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2')).toBeNull();
    expect(validateBitcoinAddress('3J98t1WpEZ73CNmYviecrnyiWrnqRhWNLy')).toBeNull();
  });

  it('rejects too-short addresses', () => {
    expect(validateBitcoinAddress('bc1qshort')).toMatch(/26 and 90/);
  });

  it('rejects missing prefixes', () => {
    expect(validateBitcoinAddress('xyzabcdefghijklmnopqrstuvwxyz123456')).toMatch(/bc1, tb1, 1, or 3/);
  });
});

describe('validateXpub / npub / pynym / wallet', () => {
  it('accepts xpub prefixes', () => {
    expect(validateXpub('xpub6CUGRUonZSQ4TWtTMmzXdrXDtypWKiKrhko4egYFZjGoh')).toBeNull();
    expect(validateXpub('zpub6rFR7y4Q2AijBEqTUquhVz398htDFrtymD9xYYfG1m4wS')).toBeNull();
    expect(validateXpub('npub1abc')).toMatch(/xpub/);
  });

  it('requires npub1', () => {
    expect(validateNpub('npub1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq')).toBeNull();
    expect(validateNpub('nsec1secret')).toMatch(/npub1/);
  });

  it('requires PM8T for PYNYM', () => {
    expect(validatePynym('PM8TJ1234567890abcdef')).toBeNull();
    expect(validatePynym('nym-not-pynym')).toMatch(/PM8T/);
  });

  it('routes wallet types', () => {
    expect(validateWalletAddress('onchain', 'bc1qhm5ndfjhqxdk3cx0pngyps4f5nnwdckulmge6c8keyf2pk0neqtshjn8ad')).toBeNull();
    expect(validateWalletAddress('lightning', 'ln')).toMatch(/lnbc/);
    expect(validateWalletAddress('lightning', 'lightning:user@getalby.com')).toBeNull();
  });
});

describe('dummy payment targets', () => {
  it('rejects bitcoin.org and example placeholders on save', () => {
    expect(isDummyPaymentTarget('https://bitcoin.org/donate')).toBe(true);
    expect(validateBitcoinAddress('https://bitcoin.org/donate')).toMatch(/placeholder/);
    expect(validateLightningAddress('tips@example.com')).toMatch(/placeholder/);
    expect(validateWalletAddress('onchain', 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh')).toMatch(/placeholder/);
  });

  it('usablePaymentAddress returns null for dummies and real strings for wallets', () => {
    expect(usablePaymentAddress('')).toBeNull();
    expect(usablePaymentAddress('donate.bitcoin.org')).toBeNull();
    expect(usablePaymentAddress('alice@getalby.com')).toBe('alice@getalby.com');
    expect(
      usablePaymentAddress('bc1qhm5ndfjhqxdk3cx0pngyps4f5nnwdckulmge6c8keyf2pk0neqtshjn8ad')
    ).toBe('bc1qhm5ndfjhqxdk3cx0pngyps4f5nnwdckulmge6c8keyf2pk0neqtshjn8ad');
  });
});
