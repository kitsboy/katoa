import { describe, expect, it } from 'vitest';
import { buildWalletDeepLinks, defaultWalletHref } from '../qr';

describe('buildWalletDeepLinks', () => {
  it('passes bolt11 into Phoenix and Zeus — not wallet homepages', () => {
    const chips = buildWalletDeepLinks('lnbc1invoice');
    expect(chips.map((c) => c.name)).toEqual(['Phoenix', 'Zeus']);
    expect(chips[0].href).toContain(encodeURIComponent('lnbc1invoice'));
    expect(chips[1].href).toBe('zeusln://send?invoice=lnbc1invoice');
    expect(chips.some((c) => c.name === 'Wallet of Satoshi')).toBe(false);
    expect(chips.some((c) => c.href === 'muun://')).toBe(false);
  });

  it('passes BIP-21 into Muun instead of an empty muun://', () => {
    const chips = buildWalletDeepLinks('bitcoin:bc1qtest?amount=0.00021');
    expect(chips).toEqual([
      { name: 'Muun', href: 'bitcoin:bc1qtest?amount=0.00021', kind: 'uri' },
    ]);
  });

  it('does not invent wallet chips for a Lightning address', () => {
    expect(buildWalletDeepLinks('user@getalby.com')).toEqual([]);
    expect(defaultWalletHref('user@getalby.com')).toBe('lightning:user@getalby.com');
  });
});
