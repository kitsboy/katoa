import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  escapeIlikePattern,
  isMissingColumnError,
  isPublicOrUnlistedVisibility,
  isUnsupportedVisibilityError,
  liveProfileFromRow,
  loadCreatorProfile,
  mockProfileForUsername,
  sanitizeUsername,
  selectCreatorProfileSource,
  type CreatorProfile,
  type LiveProfileRow,
} from '../creatorProfile';

vi.mock('../supabase', () => ({
  asRow: (data: unknown) => data ?? null,
  asRows: (data: unknown) => data ?? [],
  isSupabaseConfigured: vi.fn(() => false),
  supabase: {
    from: vi.fn(),
  },
}));

import { isSupabaseConfigured, supabase } from '../supabase';

type Call = {
  table: string;
  select?: string;
  ilike?: [string, string];
  eq: Array<[string, unknown]>;
  or?: string;
  maybeSingle?: boolean;
  limit?: number;
};

function thenableChain(table: string, handler: (call: Call) => { data: unknown; error: unknown }) {
  const call: Call = { table, eq: [] };
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn((cols: string) => {
    call.select = cols;
    return chain;
  });
  chain.eq = vi.fn((col: string, val: unknown) => {
    call.eq.push([col, val]);
    return chain;
  });
  chain.in = vi.fn(() => chain);
  chain.or = vi.fn((expr: string) => {
    call.or = expr;
    return chain;
  });
  chain.ilike = vi.fn((col: string, val: string) => {
    call.ilike = [col, val];
    return chain;
  });
  chain.limit = vi.fn((n: number) => {
    call.limit = n;
    return chain;
  });
  chain.maybeSingle = vi.fn(() => {
    call.maybeSingle = true;
    return chain;
  });
  chain.then = (resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) =>
    Promise.resolve(handler(call)).then(resolve, reject);
  return chain;
}

function liveRow(overrides: Partial<LiveProfileRow> = {}): LiveProfileRow {
  return {
    id: 'live-1',
    username: 'alice',
    avatar_url: 'https://example.com/a.png',
    lightning_address: 'alice@getalby.com',
    nostr_pubkey: null,
    bio: 'Live creator',
    banner_url: null,
    ...overrides,
  };
}

function liveWishlist(overrides: Record<string, unknown> = {}) {
  return {
    id: 'wl-1',
    title: 'Live list',
    description: 'From supabase',
    slug: 'live-list',
    cover_image: null,
    cover_video_url: null,
    total_sats_goal: 1000,
    total_sats_raised: 10,
    country: null,
    city: null,
    country_flag: null,
    visibility: 'public',
    ...overrides,
  };
}

describe('sanitizeUsername', () => {
  it('trims whitespace and a leading @', () => {
    expect(sanitizeUsername('  luna_vip  ')).toBe('luna_vip');
    expect(sanitizeUsername('@luna_vip')).toBe('luna_vip');
    expect(sanitizeUsername('@ Luna_VIP ')).toBe('Luna_VIP');
  });

  it('returns empty for blank input', () => {
    expect(sanitizeUsername('')).toBe('');
    expect(sanitizeUsername('   ')).toBe('');
    expect(sanitizeUsername(null)).toBe('');
    expect(sanitizeUsername(undefined)).toBe('');
  });
});

describe('escapeIlikePattern', () => {
  it('escapes LIKE wildcards and backslashes', () => {
    expect(escapeIlikePattern('luna_vip')).toBe('luna\\_vip');
    expect(escapeIlikePattern('100%')).toBe('100\\%');
    expect(escapeIlikePattern('a\\b')).toBe('a\\\\b');
    expect(escapeIlikePattern('a%_b')).toBe('a\\%\\_b');
  });

  it('leaves ordinary usernames unchanged besides wildcard chars', () => {
    expect(escapeIlikePattern('alice')).toBe('alice');
    expect(escapeIlikePattern('LunaVIP')).toBe('LunaVIP');
  });
});

describe('visibility helpers', () => {
  it('treats public, unlisted, and missing as visible', () => {
    expect(isPublicOrUnlistedVisibility('public')).toBe(true);
    expect(isPublicOrUnlistedVisibility('unlisted')).toBe(true);
    expect(isPublicOrUnlistedVisibility(null)).toBe(true);
    expect(isPublicOrUnlistedVisibility('private')).toBe(false);
    expect(isPublicOrUnlistedVisibility('draft')).toBe(false);
  });

  it('detects missing cover_video_url and unsupported unlisted enum', () => {
    expect(
      isMissingColumnError(
        { message: 'column wishlists.cover_video_url does not exist', code: '42703' },
        'cover_video_url'
      )
    ).toBe(true);
    expect(isMissingColumnError({ message: 'permission denied' }, 'cover_video_url')).toBe(false);
    expect(
      isUnsupportedVisibilityError({
        message: 'invalid input value for enum wishlist_visibility: "unlisted"',
      })
    ).toBe(true);
  });
});

describe('mockProfileForUsername', () => {
  it('matches mock creators case-insensitively', () => {
    const profile = mockProfileForUsername('LUNA_VIP');
    expect(profile?.fromMock).toBe(true);
    expect(profile?.username).toBe('luna_vip');
    expect(profile?.wishlists.some((w) => w.slug === 'luna-exclusive-videos')).toBe(true);
  });

  it('returns null when there is no mock creator', () => {
    expect(mockProfileForUsername('not_a_real_mock')).toBeNull();
  });
});

describe('selectCreatorProfileSource', () => {
  it('lets a live row win even with 0 wishlists — never mixes mock lists', () => {
    const live = liveProfileFromRow(liveRow({ username: 'luna_vip', bio: 'Real Luna' }), []);
    const selected = selectCreatorProfileSource('luna_vip', live);
    expect(selected).toBe(live);
    expect(selected?.fromMock).toBe(false);
    expect(selected?.wishlists).toEqual([]);
    expect(selected?.bio).toBe('Real Luna');
  });

  it('falls back to the mock creator when there is no live row', () => {
    const selected = selectCreatorProfileSource('luna_vip', null);
    expect(selected?.fromMock).toBe(true);
    expect(selected?.wishlists.length).toBeGreaterThan(0);
  });

  it('returns null when neither live nor mock exists', () => {
    expect(selectCreatorProfileSource('ghost_user_xyz', null)).toBeNull();
  });
});

describe('loadCreatorProfile', () => {
  const profileCalls: Call[] = [];
  const wishlistCalls: Call[] = [];

  afterEach(() => {
    profileCalls.length = 0;
    wishlistCalls.length = 0;
    vi.mocked(isSupabaseConfigured).mockReturnValue(false);
    vi.mocked(supabase.from).mockReset();
  });

  function mockDb(opts: {
    profile?: { data: unknown; error: unknown };
    wishlists?: Array<{ data: unknown; error: unknown }> | { data: unknown; error: unknown };
  }) {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    const wishlistQueue = Array.isArray(opts.wishlists) ? [...opts.wishlists] : opts.wishlists ? [opts.wishlists] : [];
    vi.mocked(supabase.from).mockImplementation((table: string) =>
      thenableChain(table, (call) => {
        if (table === 'profiles') {
          profileCalls.push(call);
          return (opts.profile ?? { data: null, error: null }) as { data: unknown; error: unknown };
        }
        wishlistCalls.push(call);
        if (wishlistQueue.length > 0) return wishlistQueue.shift() as { data: unknown; error: unknown };
        return { data: [], error: null };
      })
    );
  }

  it('returns null for an empty username without querying', async () => {
    await expect(loadCreatorProfile('   ')).resolves.toBeNull();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('uses mock fallback when Supabase is not configured', async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(false);
    const profile = await loadCreatorProfile('luna_vip');
    expect(profile?.fromMock).toBe(true);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('looks up profiles with escaped ilike, not eq', async () => {
    mockDb({
      profile: { data: liveRow({ username: 'luna_vip' }), error: null },
      wishlists: { data: [], error: null },
    });
    await loadCreatorProfile('Luna_VIP');
    expect(profileCalls[0]?.ilike?.[0]).toBe('username');
    expect(profileCalls[0]?.ilike?.[1]).toBe(escapeIlikePattern('Luna_VIP'));
    expect(profileCalls[0]?.ilike?.[1]).toBe('Luna\\_VIP');
    expect(profileCalls[0]?.maybeSingle).toBe(true);
  });

  it('returns the live profile with 0 wishlists instead of the mock creator lists', async () => {
    mockDb({
      profile: { data: liveRow({ username: 'luna_vip', bio: 'On-chain Luna' }), error: null },
      wishlists: { data: [], error: null },
    });
    const profile = await loadCreatorProfile('luna_vip');
    expect(profile?.fromMock).toBe(false);
    expect(profile?.bio).toBe('On-chain Luna');
    expect(profile?.wishlists).toEqual([]);
    expect(wishlistCalls[0]?.eq).toContainEqual(['creator_id', 'live-1']);
    expect(wishlistCalls[0]?.or).toContain('visibility.eq.public');
    expect(wishlistCalls[0]?.or).toContain('visibility.eq.unlisted');
  });

  it('keeps live wishlists when the row exists', async () => {
    mockDb({
      profile: { data: liveRow(), error: null },
      wishlists: { data: [liveWishlist()], error: null },
    });
    const profile = await loadCreatorProfile('Alice');
    expect(profile?.fromMock).toBe(false);
    expect(profile?.username).toBe('alice');
    expect(profile?.wishlists).toHaveLength(1);
    expect(profile?.wishlists[0]?.slug).toBe('live-list');
  });

  it('falls back to mock when no profile row exists', async () => {
    mockDb({ profile: { data: null, error: null } });
    const profile = await loadCreatorProfile('sasha_vip');
    expect(profile?.fromMock).toBe(true);
    expect(profile?.username).toBe('sasha_vip');
    expect(wishlistCalls).toHaveLength(0);
  });

  it('does not pretend a failed profile select is live', async () => {
    mockDb({ profile: { data: null, error: { message: 'JWT expired' } } });
    const profile = await loadCreatorProfile('luna_vip');
    expect(profile?.fromMock).toBe(true);
    expect((profile as CreatorProfile).wishlists.length).toBeGreaterThan(0);
  });

  it('retries wishlists without cover_video_url when that column is missing', async () => {
    mockDb({
      profile: { data: liveRow(), error: null },
      wishlists: [
        {
          data: null,
          error: { message: 'column wishlists.cover_video_url does not exist', code: '42703' },
        },
        { data: [liveWishlist({ cover_video_url: undefined })], error: null },
      ],
    });
    const profile = await loadCreatorProfile('alice');
    expect(profile?.fromMock).toBe(false);
    expect(profile?.wishlists).toHaveLength(1);
    expect(wishlistCalls[0]?.select).toContain('cover_video_url');
    expect(wishlistCalls[1]?.select).not.toContain('cover_video_url');
  });

  it('retries with public-only visibility when unlisted is not in the enum', async () => {
    mockDb({
      profile: { data: liveRow(), error: null },
      wishlists: [
        {
          data: null,
          error: { message: 'invalid input value for enum wishlist_visibility: "unlisted"' },
        },
        { data: [liveWishlist()], error: null },
      ],
    });
    const profile = await loadCreatorProfile('alice');
    expect(profile?.fromMock).toBe(false);
    expect(profile?.wishlists).toHaveLength(1);
    expect(wishlistCalls[0]?.or).toContain('unlisted');
    expect(wishlistCalls[1]?.eq).toContainEqual(['visibility', 'public']);
  });

  it('drops private/draft rows even if they leak through', async () => {
    mockDb({
      profile: { data: liveRow(), error: null },
      wishlists: {
        data: [
          liveWishlist({ id: 'pub', slug: 'pub', visibility: 'public' }),
          liveWishlist({ id: 'hid', slug: 'hid', visibility: 'private' }),
          liveWishlist({ id: 'dft', slug: 'dft', visibility: 'draft' }),
        ],
        error: null,
      },
    });
    const profile = await loadCreatorProfile('alice');
    expect(profile?.wishlists.map((w) => w.slug)).toEqual(['pub']);
  });
});
