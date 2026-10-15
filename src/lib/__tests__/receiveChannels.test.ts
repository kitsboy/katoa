import { describe, expect, it } from 'vitest';
import {
  emptyReceiveChannels,
  establishedChannelCount,
  establishedReceiveChannels,
  hasAnyReceiveChannel,
  usableSilentPaymentDescriptor,
} from '../receiveChannels';

const REAL_ONCHAIN = 'bc1qhm5ndfjhqxdk3cx0pngyps4f5nnwdckulmge6c8keyf2pk0neqtshjn8ad';
/** Realistic-length BIP352 address (sp1 + 116 bech32m chars). Shape only, no checksum claim. */
const SP1_ADDRESS =
  'sp1qqgste7k9hx0qed2qzx0n4y3nr6xr3k3v4x5xr0q9k5jv0qk4z9k0qed2qzx0n4y3nr6qpzry9x8gf2tvdw0s3jn54khce6mua7lqpzry9x8gf2tvdw0';
const REAL_SILENT = `silent:${SP1_ADDRESS}`;
const PLACEHOLDER_SILENT = 'silent:sp1placeholder000000000';

describe('establishedReceiveChannels', () => {
  it('counts an on-chain wallet as an established channel', () => {
    const channels = establishedReceiveChannels([
      { address_type: 'onchain', address_value: REAL_ONCHAIN, is_active: true },
    ]);
    expect(channels.onchain).toBe(true);
    expect(channels.lightning).toBe(false);
    expect(hasAnyReceiveChannel(channels)).toBe(true);
    expect(establishedChannelCount(channels)).toBe(1);
  });

  it('counts a real silent-payment descriptor as an established channel', () => {
    const channels = establishedReceiveChannels([
      { address_type: 'silent', address_value: REAL_SILENT, is_active: true },
    ]);
    expect(channels.silent).toBe(true);
    expect(hasAnyReceiveChannel(channels)).toBe(true);
  });

  it('does not count a placeholder silent descriptor', () => {
    const channels = establishedReceiveChannels([
      { address_type: 'silent', address_value: PLACEHOLDER_SILENT, is_active: true },
    ]);
    expect(channels.silent).toBe(false);
    expect(hasAnyReceiveChannel(channels)).toBe(false);
  });

  it('does not count a bare prefix with no descriptor body', () => {
    const channels = establishedReceiveChannels([
      { address_type: 'silent', address_value: 'silent:', is_active: true },
    ]);
    expect(channels.silent).toBe(false);
  });

  it('ignores inactive wallets', () => {
    const channels = establishedReceiveChannels([
      { address_type: 'onchain', address_value: REAL_ONCHAIN, is_active: false },
      { address_type: 'silent', address_value: REAL_SILENT, is_active: false },
    ]);
    expect(hasAnyReceiveChannel(channels)).toBe(false);
  });

  it('treats a profile Lightning address as a Lightning channel', () => {
    const channels = establishedReceiveChannels([], 'creator@getalby.com');
    expect(channels.lightning).toBe(true);
    expect(establishedChannelCount(channels)).toBe(1);
  });

  it('rejects placeholder and dummy channels', () => {
    const channels = establishedReceiveChannels(
      [
        { address_type: 'lightning', address_value: 'tips@example.com', is_active: true },
        { address_type: 'onchain', address_value: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', is_active: true },
      ],
      'old@example.org'
    );
    expect(channels).toEqual(emptyReceiveChannels());
  });

  it('counts all three channels at once', () => {
    const channels = establishedReceiveChannels([
      { address_type: 'lightning', address_value: 'creator@getalby.com', is_active: true },
      { address_type: 'onchain', address_value: REAL_ONCHAIN, is_active: true },
      { address_type: 'silent', address_value: REAL_SILENT, is_active: true },
    ]);
    expect(establishedChannelCount(channels)).toBe(3);
  });
});

describe('usableSilentPaymentDescriptor', () => {
  it('accepts silent: and sp: descriptors', () => {
    expect(usableSilentPaymentDescriptor(REAL_SILENT)).toBe(REAL_SILENT);
    expect(usableSilentPaymentDescriptor(`sp:${SP1_ADDRESS}`)).toBe(`sp:${SP1_ADDRESS}`);
  });

  it('rejects a short or non-bech32 sp1 body', () => {
    expect(usableSilentPaymentDescriptor('silent:sp1short')).toBeNull();
    expect(usableSilentPaymentDescriptor(`silent:${SP1_ADDRESS.slice(0, 40)}`)).toBeNull();
  });

  it('rejects empty, placeholder, and wrong-prefix values', () => {
    expect(usableSilentPaymentDescriptor('')).toBeNull();
    expect(usableSilentPaymentDescriptor(null)).toBeNull();
    expect(usableSilentPaymentDescriptor(PLACEHOLDER_SILENT)).toBeNull();
    expect(usableSilentPaymentDescriptor('bc1qhm5ndfjhqxdk3cx0pngyps4f5nnwdckulmge6c8keyf2pk0neqtshjn8ad')).toBeNull();
  });
});
