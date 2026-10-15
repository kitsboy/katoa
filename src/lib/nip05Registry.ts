/**
 * NIP-05 registry rules for `/.well-known/nostr.json`.
 *
 * The file is generated at build time (see `scripts/generate-nip05.ts`) from the
 * committed platform identity plus live `profiles.username` → `profiles.nostr_pubkey`
 * state. Everything here is pure so the rules are testable without a build.
 *
 * NIP-05 says "this domain maps this name to this key". It is not KYC, so the
 * registry records the mapping and nothing more.
 */

export interface NostrJson {
  names: Record<string, string>;
  relays: Record<string, string[]>;
}

/**
 * Relays published for every key in the file. Must stay a subset of the CSP
 * connect-src list in `public/_headers` (guarded by cspOrigins.test.ts).
 */
export const NIP05_RELAYS: string[] = [
  'wss://relay.damus.io',
  'wss://relay.nostr.band',
  'wss://nos.lol',
  'wss://relay.snort.social',
  'wss://nostr.wine',
  'wss://relay.primal.net',
  'wss://purplepag.es',
  'wss://relay.nostr.bg',
];

/** Names the platform owns; a profile may never claim one. */
export const RESERVED_NIP05_NAMES = ['_', 'katoa'] as const;

const HEX_PUBKEY = /^[0-9a-f]{64}$/;
const NIP05_NAME = /^[a-z0-9\-_.]+$/;

/** NIP-05 local part: lowercase, 1-63 characters, no spaces or punctuation beyond - _ . */
export function isValidNip05Name(name: string): boolean {
  return NIP05_NAME.test(name) && name.length <= 63;
}

export function isHexPubkey(value: string): boolean {
  return HEX_PUBKEY.test(value);
}

export function isReservedNip05Name(name: string): boolean {
  return (RESERVED_NIP05_NAMES as readonly string[]).includes(name);
}

export interface ProfileClaim {
  username: string | null;
  nostr_pubkey: string | null;
}

export interface RegistryBuild {
  registry: NostrJson;
  /** Names published from live profile state. */
  fromProfiles: string[];
  /** Why a row was left out, so a build log can say it plainly. */
  skipped: Array<{ username: string | null; reason: string }>;
}

/**
 * Merge committed platform entries with profile rows.
 *
 * Rules, in order:
 * - the baseline (platform identity) always wins a name collision,
 * - a row needs both a valid NIP-05 name and a 64-hex pubkey,
 * - reserved names are never taken from profile state,
 * - duplicate names collapse to the first row (input order is respected).
 */
export function buildNip05Registry(
  baseline: NostrJson,
  profiles: ProfileClaim[],
): RegistryBuild {
  const names: Record<string, string> = { ...baseline.names };
  const relays: Record<string, string[]> = { ...baseline.relays };
  const fromProfiles: string[] = [];
  const skipped: RegistryBuild['skipped'] = [];

  for (const profile of profiles) {
    const username = (profile.username ?? '').trim();
    if (!username) {
      skipped.push({ username: null, reason: 'no username' });
      continue;
    }
    if (!isValidNip05Name(username)) {
      skipped.push({ username, reason: 'username is not a valid NIP-05 name' });
      continue;
    }
    if (isReservedNip05Name(username)) {
      skipped.push({ username, reason: 'reserved platform name' });
      continue;
    }
    if (username in names) {
      skipped.push({ username, reason: 'name already published' });
      continue;
    }
    const pubkey = (profile.nostr_pubkey ?? '').trim().toLowerCase();
    if (!isHexPubkey(pubkey)) {
      skipped.push({ username, reason: 'no valid 64-hex nostr pubkey on the profile' });
      continue;
    }

    names[username] = pubkey;
    relays[pubkey] = relays[pubkey] ?? [...NIP05_RELAYS];
    fromProfiles.push(username);
  }

  return { registry: { names, relays }, fromProfiles, skipped };
}

/** Stable serialization: profile names sorted, two-space indent, trailing newline. */
export function serializeNostrJson(registry: NostrJson): string {
  // Reserved names first in their declared order, then everything else sorted —
  // the input object's key order must never change the bytes we write.
  const reserved = RESERVED_NIP05_NAMES.filter((name) => name in registry.names);
  const rest = Object.keys(registry.names)
    .filter((name) => !isReservedNip05Name(name))
    .sort((a, b) => a.localeCompare(b));

  const names: Record<string, string> = {};
  for (const name of [...reserved, ...rest]) names[name] = registry.names[name];

  const relays: Record<string, string[]> = {};
  for (const pubkey of Object.keys(registry.relays).sort()) {
    relays[pubkey] = [...registry.relays[pubkey]];
  }

  return `${JSON.stringify({ names, relays }, null, 2)}\n`;
}
