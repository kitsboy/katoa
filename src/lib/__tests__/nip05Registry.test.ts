import { describe, expect, it } from 'vitest';
import {
  buildNip05Registry,
  isReservedNip05Name,
  isValidNip05Name,
  NIP05_RELAYS,
  RESERVED_NIP05_NAMES,
  serializeNostrJson,
  type NostrJson,
} from '../nip05Registry';

const PLATFORM_HEX = '8d4ae39ad6906e272e778772253b59b9ae8712871043807f4655960fec0e4420';
const ALICE_HEX = 'a'.repeat(64);
const CAROL_HEX = 'b'.repeat(64);

const baseline: NostrJson = {
  names: { _: PLATFORM_HEX, katoa: PLATFORM_HEX },
  relays: { [PLATFORM_HEX]: ['wss://relay.damus.io', 'wss://nos.lol'] },
};

describe('name rules', () => {
  it('accepts the NIP-05 local-part charset only', () => {
    expect(isValidNip05Name('alice')).toBe(true);
    expect(isValidNip05Name('alice_2-b')).toBe(true);
    expect(isValidNip05Name('Alice')).toBe(false);
    expect(isValidNip05Name('alice@x')).toBe(false);
    expect(isValidNip05Name('alice smith')).toBe(false);
    expect(isValidNip05Name('a'.repeat(64))).toBe(false);
    expect(isValidNip05Name('')).toBe(false);
  });

  it('reserves the platform names', () => {
    for (const name of RESERVED_NIP05_NAMES) {
      expect(isReservedNip05Name(name)).toBe(true);
    }
    expect(isReservedNip05Name('alice')).toBe(false);
  });
});

describe('buildNip05Registry', () => {
  it('publishes a profile with a valid name and 64-hex pubkey', () => {
    const { registry, fromProfiles, skipped } = buildNip05Registry(baseline, [
      { username: 'alice', nostr_pubkey: ALICE_HEX },
    ]);

    expect(registry.names.alice).toBe(ALICE_HEX);
    expect(registry.relays[ALICE_HEX]).toEqual(NIP05_RELAYS);
    expect(fromProfiles).toEqual(['alice']);
    expect(skipped).toEqual([]);
    // The platform identity is untouched.
    expect(registry.names.katoa).toBe(PLATFORM_HEX);
    expect(registry.relays[PLATFORM_HEX]).toEqual(['wss://relay.damus.io', 'wss://nos.lol']);
  });

  it('never lets a profile take a reserved or already-published name', () => {
    const { registry, fromProfiles, skipped } = buildNip05Registry(baseline, [
      { username: 'katoa', nostr_pubkey: ALICE_HEX },
      { username: '_', nostr_pubkey: ALICE_HEX },
      { username: 'alice', nostr_pubkey: ALICE_HEX },
      { username: 'alice', nostr_pubkey: CAROL_HEX },
    ]);

    expect(fromProfiles).toEqual(['alice']);
    expect(registry.names.alice).toBe(ALICE_HEX);
    expect(registry.names.katoa).toBe(PLATFORM_HEX);
    expect(skipped.map((s) => s.reason)).toEqual([
      'reserved platform name',
      'reserved platform name',
      'name already published',
    ]);
  });

  it('skips rows that cannot be published, with a reason each', () => {
    const { registry, fromProfiles, skipped } = buildNip05Registry(baseline, [
      { username: 'nopubkey', nostr_pubkey: null },
      { username: 'badkey', nostr_pubkey: 'npub1nothex' },
      { username: 'Bad Name', nostr_pubkey: ALICE_HEX },
      { username: '   ', nostr_pubkey: ALICE_HEX },
      { username: 'carol', nostr_pubkey: CAROL_HEX.toUpperCase() },
    ]);

    expect(fromProfiles).toEqual(['carol']);
    expect(registry.names.carol).toBe(CAROL_HEX);
    expect(registry.names).not.toHaveProperty('nopubkey');
    expect(skipped).toHaveLength(4);
    expect(skipped[0].reason).toContain('no valid 64-hex nostr pubkey');
    expect(skipped[2].reason).toContain('not a valid NIP-05 name');
    expect(skipped[3].reason).toContain('no username');
  });

  it('does not mutate the baseline it was given', () => {
    const before = JSON.stringify(baseline);
    buildNip05Registry(baseline, [{ username: 'alice', nostr_pubkey: ALICE_HEX }]);
    expect(JSON.stringify(baseline)).toBe(before);
  });

  it('shares one relay entry when two names point at the same key', () => {
    const { registry } = buildNip05Registry(baseline, [
      { username: 'alice', nostr_pubkey: ALICE_HEX },
      { username: 'alice2', nostr_pubkey: ALICE_HEX },
    ]);
    expect(registry.names.alice2).toBe(ALICE_HEX);
    expect(registry.relays[ALICE_HEX]).toEqual(NIP05_RELAYS);
  });
});

describe('serializeNostrJson', () => {
  it('keeps the platform names first and sorts the rest, with a trailing newline', () => {
    const { registry } = buildNip05Registry(baseline, [
      { username: 'zoe', nostr_pubkey: CAROL_HEX },
      { username: 'alice', nostr_pubkey: ALICE_HEX },
    ]);
    const text = serializeNostrJson(registry);

    expect(text.endsWith('}\n')).toBe(true);
    const parsed = JSON.parse(text) as NostrJson;
    expect(Object.keys(parsed.names)).toEqual(['_', 'katoa', 'alice', 'zoe']);
    expect(text.indexOf('"names"')).toBeLessThan(text.indexOf('"relays"'));
  });

  it('is stable across runs so an offline build does not dirty the tree', () => {
    const first = serializeNostrJson(baseline);
    const second = serializeNostrJson({ ...baseline, names: { katoa: PLATFORM_HEX, _: PLATFORM_HEX } });
    expect(first).toBe(second);
  });
});
