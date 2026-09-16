import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  verifyProof,
} from '../satohash';

describe('verifyProof — the only path to a "verified" verdict', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('rejects a malformed hash before any network call', async () => {
    await expect(verifyProof('deadbeef')).rejects.toThrow(/64 hex/i);
  });

  it('POSTs to /api/verify with the katoa client header', async () => {
    const hash = 'f'.repeat(64);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ verified: false, reason: 'no_block_attestation' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await verifyProof(hash);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/verify');
    expect(init.method).toBe('POST');
    const headers = init.headers as Record<string, string>;
    expect(headers['X-Satohash-Client']).toBe('katoa');
    expect(JSON.parse(init.body as string)).toEqual({ hash });
  });

  it('returns a confirmed verdict untouched, with method + height', async () => {
    const apiVerdict = {
      verified: true,
      verified_method: 'bitcoind',
      bitcoin_block_height: 967273,
      ots_download_url: 'https://api.satohash.io/api/stamps/abc?download=true',
      registry_status: 'confirmed',
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => apiVerdict })
    );

    const verdict = await verifyProof('1ce9eb8bd293fd5d759ff1f180dadb265c857abfd21020dbf8ca7967900b4f66');
    expect(verdict.verified).toBe(true);
    expect(verdict.verified_method).toBe('bitcoind');
    expect(verdict.bitcoin_block_height).toBe(967273);
    // The client must not drop or reshape what the chain check returned.
    expect(verdict.ots_download_url).toBe(apiVerdict.ots_download_url);
  });

  it('reports a rejection plainly — never upgrades it', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          verified: false,
          reason: 'merkle_root_mismatch',
          error: 'The proof points at a block that does not commit to this file.',
        }),
      })
    );

    const verdict = await verifyProof('0'.repeat(64));
    expect(verdict.verified).toBe(false);
    expect(verdict.reason).toBe('merkle_root_mismatch');
    expect(verdict.bitcoin_block_height).toBeUndefined();
  });

  it('throws with API detail when the checker itself fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: async () => ({ error: 'checker down' }),
      })
    );
    await expect(verifyProof('a'.repeat(64))).rejects.toThrow(/checker down/);
  });

  it('treats a structured 404 as an honest not-proven verdict, not a network error', async () => {
    // The live API answers forged/unknown hashes with HTTP 404 + a structured
    // body. That is a verdict — the checker resolved the hash and found no
    // attestation. Throwing here would render "Waiting for Bitcoin" (a lie).
    const apiRejection = {
      verified: false,
      registry_check: true,
      registry: { found: false, status: null },
      error: 'Hash not found in registry.',
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => apiRejection,
      })
    );

    const verdict = await verifyProof('0'.repeat(64));
    expect(verdict.verified).toBe(false);
    expect(verdict.error).toBe('Hash not found in registry.');
  });

  it('still throws on a 4xx without a structured verified body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: async () => ({ error: 'rate limited' }),
      })
    );
    await expect(verifyProof('b'.repeat(64))).rejects.toThrow(/rate limited/);
  });
});
