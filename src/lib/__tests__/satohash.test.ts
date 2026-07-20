import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getApiHealth,
  getSatohashApiUrl,
  getSatohashUrl,
  sha256Hex,
  stampGuideUrl,
  stampHash,
  verifyUrl,
} from '../satohash';

describe('sha256Hex', () => {
  it('hashes a known string to 64 lowercase hex chars', async () => {
    const hex = await sha256Hex('hello');
    expect(hex).toMatch(/^[a-f0-9]{64}$/);
    // echo -n hello | shasum -a 256
    expect(hex).toBe(
      '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'
    );
  });

  it('is deterministic for the same input', async () => {
    const a = await sha256Hex('katoa');
    const b = await sha256Hex('katoa');
    expect(a).toBe(b);
  });

  it('accepts Uint8Array', async () => {
    const bytes = new TextEncoder().encode('hello');
    expect(await sha256Hex(bytes)).toBe(await sha256Hex('hello'));
  });
});

describe('verifyUrl / stampGuideUrl', () => {
  it('builds verify URL from app base', () => {
    const hash = 'a'.repeat(64);
    const url = verifyUrl(hash);
    expect(url).toContain(getSatohashUrl());
    expect(url).toContain(`/verify/${hash}`);
  });

  it('builds stamp guide with optional hash query', () => {
    expect(stampGuideUrl()).toBe(`${getSatohashUrl()}/stamp`);
    const hash = 'b'.repeat(64);
    expect(stampGuideUrl(hash)).toBe(
      `${getSatohashUrl()}/stamp?hash=${hash}`
    );
  });
});

describe('getSatohashApiUrl / getSatohashUrl', () => {
  it('defaults to production hosts when env unset', () => {
    expect(getSatohashApiUrl()).toMatch(/satohash/);
    expect(getSatohashUrl()).toMatch(/satohash/);
  });
});

describe('stampHash', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('rejects invalid hash length', async () => {
    await expect(stampHash('deadbeef')).rejects.toThrow(/64 hex/i);
  });

  it('POSTs to /api/stamp with client header', async () => {
    const hash = 'c'.repeat(64);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'stamp-1',
        hash,
        status: 'pending',
        filename: 'profile.json',
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await stampHash(hash, { filename: 'profile.json' });

    expect(result.id).toBe('stamp-1');
    expect(result.status).toBe('pending');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${getSatohashApiUrl()}/api/stamp`);
    expect(init.method).toBe('POST');
    const headers = init.headers as Record<string, string>;
    expect(headers['X-Satohash-Client']).toBe('katoa');
    expect(headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(init.body as string)).toEqual({
      hash,
      filename: 'profile.json',
    });
  });

  it('sends optional X-Satohash-Key when provided', async () => {
    const hash = 'd'.repeat(64);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'x', hash, status: 'pending' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await stampHash(hash, { apiKey: 'family-test-key' });

    const headers = (fetchMock.mock.calls[0] as [string, RequestInit])[1]
      .headers as Record<string, string>;
    expect(headers['X-Satohash-Key']).toBe('family-test-key');
  });

  it('throws with API error detail on failure', async () => {
    const hash = 'e'.repeat(64);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 402,
        statusText: 'Payment Required',
        json: async () => ({
          error: 'Payment Required',
          message: 'Please complete Lightning settlement',
        }),
      })
    );

    await expect(stampHash(hash)).rejects.toThrow(
      /Please complete Lightning settlement/
    );
  });
});

describe('getApiHealth', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('returns ok when /health succeeds', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ status: 'ok' }),
      })
    );

    const health = await getApiHealth();
    expect(health.ok).toBe(true);
    expect(health.status).toBe(200);
    expect(health.body).toEqual({ status: 'ok' });

    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
    ];
    expect(url).toBe(`${getSatohashApiUrl()}/health`);
  });

  it('returns ok:false when fetch throws', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('network'))
    );
    await expect(getApiHealth()).resolves.toEqual({ ok: false, status: 0 });
  });
});
