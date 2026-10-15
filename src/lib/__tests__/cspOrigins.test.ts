/**
 * Guard for the Content-Security-Policy in `public/_headers`.
 *
 * `vite preview` does not serve `_headers`, so the policy can only ever be checked
 * after deploy — which is how it silently broke two features when it was narrowed
 * with a stale origin list. This test closes that gap: it reads the policy and
 * compares it against the origins the code actually contacts.
 *
 * Rules:
 *  - Every module that performs network I/O must have its literal origins allowed
 *    by the directive that governs it.
 *  - Every relay websocket in the policy must exist in code, and every relay in
 *    code must exist in the policy (both directions — dead entries hide the drift).
 *  - Origins that are reached but cannot be enumerated (a creator's Lightning
 *    address host, the BTCPay proxy) must keep the scheme-level escape hatch.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const HEADERS = readFileSync('public/_headers', 'utf8');

function directives(): Record<string, string[]> {
  const line = HEADERS.split('\n')
    .map((l) => l.trim())
    .find((l) => l.startsWith('Content-Security-Policy:'));
  if (!line) throw new Error('public/_headers has no Content-Security-Policy');
  const out: Record<string, string[]> = {};
  for (const raw of line.slice('Content-Security-Policy:'.length).split(';')) {
    const [name, ...tokens] = raw.trim().split(/\s+/);
    if (name) out[name] = tokens;
  }
  return out;
}

function allows(directive: string, origin: string): boolean {
  const tokens = directives()[directive] ?? [];
  if (tokens.includes("'none'")) return false;
  return tokens.some((token) => {
    if (token === origin) return true;
    if (token === 'https:' && origin.startsWith('https://')) return true;
    if (token === 'wss:' && origin.startsWith('wss://')) return true;
    const wildcard = token.match(/^(https|wss):\/\/\*\.([a-z0-9.-]+)$/);
    if (wildcard) return origin.startsWith(`${wildcard[1]}://`) && origin.endsWith(`.${wildcard[2]}`);
    return false;
  });
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      if (entry === '__tests__' || entry === 'i18n' || entry === 'generated') continue;
      walk(path, out);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      out.push(path);
    }
  }
  return out;
}

const NETWORK_CALL = /fetch\(|new WebSocket\(|EventSource\(/;

/**
 * Modules that open a connection. Only these are scanned for literal origins, so
 * plain navigational links, sample-data shop URLs and JSON-LD schema names in
 * pages/components/data do not get treated as connection targets.
 */
const networkModules = walk('src').filter((f) => NETWORK_CALL.test(readFileSync(f, 'utf8')));

/**
 * Origins that appear in a network module but are never actually contacted, each
 * with the reason. Every entry is asserted to still exist in code so this list
 * cannot rot into a silent blanket exemption.
 */
const NOT_CONTACTED: Record<string, string> = {
  // btcmap.ts fetches BTC Map data and also carries attribution/source links.
  'https://github.com': 'source and issue links in the map attribution',
  'https://btcmap.org': 'BTC Map attribution link',
  'https://gitea.btcmap.org': 'BTC Map issue link',
  'https://www.openstreetmap.org': 'OpenStreetMap attribution link',
};

function literals(pattern: RegExp): { origin: string; file: string }[] {
  const found: { origin: string; file: string }[] = [];
  for (const file of networkModules) {
    for (const match of readFileSync(file, 'utf8').matchAll(pattern)) {
      found.push({ origin: match[0], file });
    }
  }
  return found;
}

describe('Content-Security-Policy covers what the code contacts', () => {
  it('scans the modules that actually open connections', () => {
    // Sanity: if this collapses, the guards below would pass vacuously.
    expect(networkModules.length).toBeGreaterThan(5);
    expect(networkModules).toContain('src/lib/nostr.ts');
    expect(networkModules).toContain('src/lib/satohash.ts');
  });

  it('allows every https origin a network module fetches', () => {
    const unlisted = literals(/https:\/\/[a-z0-9.-]+/gi)
      .filter(({ origin }) => !(origin in NOT_CONTACTED))
      .filter(({ origin }) => !allows('connect-src', origin));
    expect(unlisted.map(({ origin, file }) => `${origin} (${file})`)).toEqual([]);
  });

  it('allows every relay websocket in code, and has no relay that no code uses', () => {
    const inCode = new Set(literals(/wss:\/\/[a-z0-9.-]+/gi).map(({ origin }) => origin));
    const inPolicy = (directives()['connect-src'] ?? []).filter(
      (t) => t.startsWith('wss://') && !t.includes('*'),
    );

    expect([...inCode].filter((o) => !allows('connect-src', o))).toEqual([]);
    expect(inPolicy.filter((o) => !inCode.has(o))).toEqual([]);
  });

  it('keeps every NOT_CONTACTED entry honest', () => {
    const all = literals(/https:\/\/[a-z0-9.-]+/gi).map(({ origin }) => origin);
    expect(Object.keys(NOT_CONTACTED).filter((origin) => !all.includes(origin))).toEqual([]);
  });

  it('keeps the scheme-level hatch that creator-chosen payment origins need', () => {
    // A tip invoice is fetched from https://<lightning-address-host>/.well-known/lnurlp/<name>
    // and then from whatever callback that address returns — both hosts are chosen by the
    // creator's wallet, so no allowlist can enumerate them. The BTCPay proxy origin
    // (VITE_API_BASE_URL) is deploy-specific for the same reason. Narrowing connect-src back
    // to a fixed list blocks payments, which is how this was found.
    expect(allows('connect-src', 'https://getalby.com')).toBe(true);
    expect(allows('connect-src', 'https://phoenix.acinq.co')).toBe(true);
    expect(allows('connect-src', 'https://btcpay-proxy.example.net')).toBe(true);
  });

  it('keeps the fixed origins documented in the policy', () => {
    // These entries are redundant with the `https:` hatch, but deleting one should be a
    // deliberate edit: they are the reviewable record of what the app talks to.
    for (const origin of [
      'https://api.satohash.io',
      'https://mempool.space',
      'https://api.btcmap.org',
      'https://tiles.openfreemap.org',
      'https://api.coingecko.com',
      'https://api.coinbase.com',
      'https://api.allorigins.win',
    ]) {
      expect(allows('connect-src', origin), origin).toBe(true);
    }
  });

  it('does not frame, and lets demo media load', () => {
    const csp = directives();
    expect(csp['frame-ancestors']).toEqual(["'none'"]);
    expect(csp['frame-src']).toBeUndefined();
    expect(allows('img-src', 'https://api.qrserver.com')).toBe(true);
    expect(allows('media-src', 'https://videos.pexels.com')).toBe(true);
  });
});
