import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  hasNip07: vi.fn(() => false),
  followPubkey: vi.fn(),
  unfollowPubkey: vi.fn(),
}));

vi.mock('../nostr', () => ({
  hasNip07: mocks.hasNip07,
  nip07UserMessage: (e: unknown) => (e instanceof Error ? e.message : String(e)),
  nostrService: {
    normalizePubkey: (value: string) => {
      if (/^[0-9a-f]{64}$/i.test(value)) return value.toLowerCase();
      if (value === 'npub1valid') return 'a'.repeat(64);
      throw new Error('bad key');
    },
    followPubkey: mocks.followPubkey,
    unfollowPubkey: mocks.unfollowPubkey,
  },
}));

import { followCreator, followState, unfollowCreator } from '../followActions';
import { getFollow, isFollowingOnNostr, unfollowLocal } from '../follows';

const HEX = 'd'.repeat(64);

const ok = (accepted: string[], existingListFound = true) => ({
  ok: true,
  accepted,
  failed: [],
  existingListFound,
});

const failure = (message: string) => ({
  ok: false,
  accepted: [],
  failed: [],
  message,
  existingListFound: false,
});

describe('followCreator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasNip07.mockReturnValue(false);
    unfollowLocal('luna_vip');
    unfollowLocal('sasha_vip');
  });

  it('publishes a Nostr kind-3 follow when an extension is available', async () => {
    mocks.hasNip07.mockReturnValue(true);
    mocks.followPubkey.mockResolvedValue(ok(['wss://relay.damus.io', 'wss://nos.lol']));

    const result = await followCreator({ username: 'luna_vip', nostrPubkey: HEX });

    expect(mocks.followPubkey).toHaveBeenCalledWith(HEX);
    expect(result).toMatchObject({ following: true, source: 'nostr', relays: 2, ok: true });
    expect(result.message).toContain('kind-3 saved to 2 relay(s)');
    expect(isFollowingOnNostr('luna_vip')).toBe(true);
    expect(followState('luna_vip')).toEqual({ following: true, source: 'nostr' });
  });

  it('says a fresh list was started when no earlier contact list was reachable', async () => {
    mocks.hasNip07.mockReturnValue(true);
    mocks.followPubkey.mockResolvedValue(ok(['wss://nos.lol'], false));

    const result = await followCreator({ username: 'luna_vip', nostrPubkey: HEX });
    expect(result.message).toContain('starts fresh');
  });

  it('keeps a device follow when the creator has no Nostr key', async () => {
    mocks.hasNip07.mockReturnValue(true);

    const result = await followCreator({ username: 'luna_vip', nostrPubkey: null });

    expect(mocks.followPubkey).not.toHaveBeenCalled();
    expect(result).toMatchObject({ following: true, source: 'local', relays: 0, ok: false });
    expect(result.message).toContain('has not published a Nostr key');
    expect(getFollow('luna_vip')?.source).toBe('local');
    expect(isFollowingOnNostr('luna_vip')).toBe(false);
  });

  it('keeps a device follow and asks for an extension when none is installed', async () => {
    const result = await followCreator({ username: 'sasha_vip', nostrPubkey: HEX });

    expect(mocks.followPubkey).not.toHaveBeenCalled();
    expect(result.source).toBe('local');
    expect(result.message).toContain('NIP-07 extension');
    expect(getFollow('sasha_vip')?.source).toBe('local');
  });

  it('falls back to a device follow when the kind-3 publish fails', async () => {
    mocks.hasNip07.mockReturnValue(true);
    mocks.followPubkey.mockResolvedValue(failure('Could not confirm publish on any relay'));

    const result = await followCreator({ username: 'luna_vip', nostrPubkey: HEX });

    expect(result.following).toBe(true);
    expect(result.source).toBe('local');
    expect(result.ok).toBe(false);
    expect(result.message).toContain('on this device only');
    expect(result.message).toContain('Could not confirm publish on any relay');
  });

  it('does not publish for an unreadable key, and says which case it is', async () => {
    mocks.hasNip07.mockReturnValue(true);

    const result = await followCreator({ username: 'luna_vip', nostrPubkey: 'npub1garbage' });
    expect(mocks.followPubkey).not.toHaveBeenCalled();
    expect(result.source).toBe('local');
    expect(result.message).toContain('could not be read');
  });

  it('publishes for a valid npub, converting it to hex first', async () => {
    mocks.hasNip07.mockReturnValue(true);
    mocks.followPubkey.mockResolvedValue(ok(['wss://nos.lol']));

    await followCreator({ username: 'luna_vip', nostrPubkey: 'npub1valid' });
    expect(mocks.followPubkey).toHaveBeenCalledWith('a'.repeat(64));
  });
});

describe('unfollowCreator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasNip07.mockReturnValue(true);
    unfollowLocal('luna_vip');
  });

  it('updates the kind-3 list for a Nostr follow', async () => {
    mocks.followPubkey.mockResolvedValue(ok(['wss://nos.lol']));
    await followCreator({ username: 'luna_vip', nostrPubkey: HEX });

    mocks.unfollowPubkey.mockResolvedValue(ok(['wss://nos.lol', 'wss://relay.damus.io']));
    const result = await unfollowCreator({ username: 'luna_vip', nostrPubkey: HEX });

    expect(mocks.unfollowPubkey).toHaveBeenCalledWith(HEX);
    expect(result).toMatchObject({ following: false, source: 'nostr', ok: true, relays: 2 });
    expect(followState('luna_vip').following).toBe(false);
  });

  it('changes nothing when the kind-3 update fails', async () => {
    mocks.followPubkey.mockResolvedValue(ok(['wss://nos.lol']));
    await followCreator({ username: 'luna_vip', nostrPubkey: HEX });

    mocks.unfollowPubkey.mockResolvedValue(failure('extension denied'));
    const result = await unfollowCreator({ username: 'luna_vip', nostrPubkey: HEX });

    expect(result.following).toBe(true);
    expect(result.ok).toBe(false);
    expect(result.message).toContain('Still following');
    expect(followState('luna_vip')).toEqual({ following: true, source: 'nostr' });
  });

  it('tells you the Nostr list was left untouched when only a device follow existed', async () => {
    const result = await unfollowCreator({ username: 'luna_vip', nostrPubkey: HEX });

    expect(mocks.unfollowPubkey).not.toHaveBeenCalled();
    expect(result.following).toBe(false);
    expect(result.message).toContain('on this device');
  });
});
