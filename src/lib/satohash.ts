/**
 * Thin Satohash timestamp client for the Give A Bit family (katoa).
 * Public OTS create runs on the Satohash server (public calendars);
 * this client only calls the HTTP API — no local OTS calendars.
 *
 * @see https://satohash.io
 * @see https://api.satohash.io
 */

const DEFAULT_API_URL = 'https://api.satohash.io';
const DEFAULT_APP_URL = 'https://satohash.io';
const CLIENT_ID = 'katoa';
const HEX64 = /^[a-f0-9]{64}$/i;

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

/** API base (stamp + health). Override with VITE_SATOHASH_API_URL. */
export function getSatohashApiUrl(): string {
  return stripTrailingSlash(
    import.meta.env.VITE_SATOHASH_API_URL || DEFAULT_API_URL
  );
}

/** Frontend base (verify + stamp guide links). Override with VITE_SATOHASH_URL. */
export function getSatohashUrl(): string {
  return stripTrailingSlash(
    import.meta.env.VITE_SATOHASH_URL || DEFAULT_APP_URL
  );
}

/** SHA-256 hex digest of a string or binary payload (Web Crypto). */
export async function sha256Hex(
  input: string | ArrayBuffer | Uint8Array
): Promise<string> {
  let data: BufferSource;
  if (typeof input === 'string') {
    data = new TextEncoder().encode(input);
  } else if (input instanceof Uint8Array) {
    data = input;
  } else {
    data = input;
  }
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Public verify page for a stamp id or hash. */
export function verifyUrl(hashOrId: string): string {
  return `${getSatohashUrl()}/verify/${encodeURIComponent(hashOrId)}`;
}

/** Public stamp guide / web stamp UI (optional prefilled hash). */
export function stampGuideUrl(hash?: string): string {
  const base = `${getSatohashUrl()}/stamp`;
  if (!hash) return base;
  return `${base}?hash=${encodeURIComponent(hash)}`;
}

export interface StampResult {
  id: string;
  hash: string;
  filename?: string;
  status: string;
  created_at?: string;
  ipfs_cid?: string;
  email_sent?: boolean;
}

export interface StampOptions {
  filename?: string;
  /** Family free-tier key (X-Satohash-Key). Prefer not baking secrets into client builds. */
  apiKey?: string;
  signal?: AbortSignal;
}

/**
 * POST /api/stamp — submit a 64-char SHA-256 hex hash for OTS timestamping.
 * Sends X-Satohash-Client: katoa and optional X-Satohash-Key.
 */
export async function stampHash(
  hash: string,
  options: StampOptions = {}
): Promise<StampResult> {
  const normalized = hash.trim().toLowerCase();
  if (!HEX64.test(normalized)) {
    throw new Error('Hash must be exactly 64 hex characters (SHA-256)');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Satohash-Client': CLIENT_ID,
  };

  const apiKey = options.apiKey ?? import.meta.env.VITE_SATOHASH_KEY;
  if (apiKey) {
    headers['X-Satohash-Key'] = apiKey;
  }

  const body: { hash: string; filename?: string } = { hash: normalized };
  if (options.filename) {
    body.filename = options.filename;
  }

  const res = await fetch(`${getSatohashApiUrl()}/api/stamp`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: options.signal,
  });

  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const errBody = (await res.json()) as {
        message?: string;
        error?: string;
      };
      detail = errBody.message || errBody.error || detail;
    } catch {
      // keep status text
    }
    throw new Error(`Satohash stamp failed: ${detail}`);
  }

  return (await res.json()) as StampResult;
}

export interface ApiHealthResult {
  ok: boolean;
  status: number;
  body?: unknown;
}

/** GET /health on the Satohash API. */
export async function getApiHealth(
  signal?: AbortSignal
): Promise<ApiHealthResult> {
  try {
    const res = await fetch(`${getSatohashApiUrl()}/health`, {
      headers: { Accept: 'application/json' },
      signal,
    });
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = undefined;
    }
    return { ok: res.ok, status: res.status, body };
  } catch {
    return { ok: false, status: 0 };
  }
}
