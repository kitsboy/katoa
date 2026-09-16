import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  attestationsForCreator,
  loadReleaseAttestations,
} from '../releaseAttestations';

describe('loadReleaseAttestations — claims in, never a verdict out', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('returns [] when the registry is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    expect(await loadReleaseAttestations()).toEqual([]);
  });

  it('drops malformed entries instead of rendering broken proof UI', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          releases: [
            {
              id: 'good',
              creator: 'katoa',
              title: 'Anchored release',
              hash: 'a'.repeat(64),
            },
            { id: 'bad-hash', creator: 'katoa', title: 'no fingerprint', hash: 'zzz' },
            { id: 'no-title', creator: 'katoa', hash: 'b'.repeat(64) },
          ],
        }),
      })
    );

    const list = await loadReleaseAttestations();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('good');
    expect(list[0].hash).toBe('a'.repeat(64));
  });

  it('lowercases stored hashes so the chain check always compares like-for-like', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          releases: [
            {
              id: 'upper',
              creator: 'katoa',
              title: 'Upper-case fingerprint',
              hash: 'ABCDEF'.repeat(10) + 'ABCD',
            },
          ],
        }),
      })
    );
    const list = await loadReleaseAttestations();
    expect(list[0].hash).toBe('abcdef'.repeat(10) + 'abcd');
  });
});

describe('attestationsForCreator', () => {
  it('matches by username, case-insensitively, ignoring leading @', () => {
    const list = [
      { id: 'a', creator: 'Katoa', title: 't', hash: 'a'.repeat(64) },
      { id: 'b', creator: 'paul_music', title: 't', hash: 'b'.repeat(64) },
      { id: 'c', creator: 'other', title: 't', hash: 'c'.repeat(64) },
    ];
    expect(attestationsForCreator(list, '@paul_music').map((r) => r.id)).toEqual(['b']);
    expect(attestationsForCreator(list, 'KATOA').map((r) => r.id)).toEqual(['a']);
    expect(attestationsForCreator(list, 'nobody')).toEqual([]);
  });
});
