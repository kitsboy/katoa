import { mockWishlists } from '../data/mockWishlists';
import { asRow, asRows, isSupabaseConfigured, supabase } from './supabase';

export interface ProfileWishlist {
  id: string;
  title: string;
  description: string;
  slug: string;
  cover_image: string | null;
  cover_video_url?: string | null;
  total_sats_goal: number;
  total_sats_raised: number;
  subscriber_count?: number;
  country?: string | null;
  city?: string | null;
  country_flag?: string | null;
}

export interface CreatorProfile {
  username: string;
  avatar_url: string | null;
  bio?: string;
  lightning_address?: string | null;
  nostr_pubkey?: string | null;
  banner_url?: string | null;
  wishlists: ProfileWishlist[];
  fromMock: boolean;
}

export type LiveProfileRow = {
  id: string;
  username: string;
  avatar_url: string | null;
  lightning_address: string | null;
  nostr_pubkey: string | null;
  bio: string | null;
  banner_url: string | null;
};

type WishlistRow = {
  id: string;
  title: string;
  description: string;
  slug: string;
  cover_image: string | null;
  cover_video_url?: string | null;
  total_sats_goal: number;
  total_sats_raised: number;
  country: string | null;
  city: string | null;
  country_flag: string | null;
  visibility?: string | null;
};

type QueryError = { message?: string; code?: string; details?: string } | null | undefined;

const PROFILE_COLUMNS =
  'id, username, avatar_url, lightning_address, nostr_pubkey, bio, banner_url';

const WISHLIST_COLUMNS_WITH_VIDEO =
  'id, title, description, slug, cover_image, cover_video_url, total_sats_goal, total_sats_raised, country, city, country_flag, visibility';

const WISHLIST_COLUMNS_NO_VIDEO =
  'id, title, description, slug, cover_image, total_sats_goal, total_sats_raised, country, city, country_flag, visibility';

type MockCreatorExtras = {
  bio?: string;
  lightning_address?: string | null;
  nostr_pubkey?: string | null;
};
type MockListExtras = {
  cover_video_url?: string;
  subscriber_count?: number;
};

export function sanitizeUsername(raw: string | null | undefined): string {
  if (!raw) return '';
  let value = raw.trim();
  if (value.startsWith('@')) value = value.slice(1).trim();
  return value;
}

/** Escape `%`, `_`, and `\` so `.ilike` is an exact case-insensitive match. */
export function escapeIlikePattern(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

export function isPublicOrUnlistedVisibility(visibility?: string | null): boolean {
  if (!visibility) return true;
  const v = visibility.toLowerCase();
  return v === 'public' || v === 'unlisted';
}

function errorText(error: QueryError): string {
  if (!error) return '';
  return `${error.message ?? ''} ${error.code ?? ''} ${error.details ?? ''}`;
}

export function isMissingColumnError(error: QueryError, column: string): boolean {
  const text = errorText(error).toLowerCase();
  if (!text.includes(column.toLowerCase())) return false;
  return (
    text.includes('does not exist') ||
    text.includes('schema cache') ||
    text.includes('42703') ||
    error?.code === '42703'
  );
}

export function isUnsupportedVisibilityError(error: QueryError): boolean {
  const text = errorText(error).toLowerCase();
  return (
    text.includes('unlisted') ||
    text.includes('invalid input value for enum') ||
    text.includes('wishlist_visibility')
  );
}

export function liveProfileFromRow(row: LiveProfileRow, wishlists: ProfileWishlist[]): CreatorProfile {
  return {
    username: row.username,
    avatar_url: row.avatar_url,
    bio: row.bio || undefined,
    lightning_address: row.lightning_address,
    nostr_pubkey: row.nostr_pubkey,
    banner_url: row.banner_url,
    wishlists,
    fromMock: false,
  };
}

/** Live row always wins (including 0 wishlists). No live row → mock. Never mix. */
export function selectCreatorProfileSource(
  username: string,
  live: CreatorProfile | null
): CreatorProfile | null {
  if (live && !live.fromMock) return live;
  return mockProfileForUsername(username);
}

export function mockProfileForUsername(username: string): CreatorProfile | null {
  const needle = sanitizeUsername(username).toLowerCase();
  if (!needle) return null;
  const lists = mockWishlists.filter((w) => w.creator.username.toLowerCase() === needle);
  if (lists.length === 0) return null;
  const first = lists[0];
  const creators = lists.map((w) => w.creator as typeof w.creator & MockCreatorExtras);
  const withBio = creators.find((c) => c.bio);
  const withLn = creators.find((c) => c.lightning_address);
  return {
    username: first.creator.username,
    avatar_url: first.creator.avatar_url,
    bio: withBio?.bio,
    lightning_address: withLn?.lightning_address ?? null,
    nostr_pubkey: creators.find((c) => c.nostr_pubkey)?.nostr_pubkey ?? null,
    banner_url: null,
    wishlists: lists.map((w) => {
      const extra = w as typeof w & MockListExtras;
      return {
        id: w.id,
        title: w.title,
        description: w.description,
        slug: w.slug,
        cover_image: w.cover_image,
        cover_video_url: extra.cover_video_url,
        total_sats_goal: w.total_sats_goal,
        total_sats_raised: w.total_sats_raised,
        subscriber_count: extra.subscriber_count,
        country: w.country,
        city: w.city,
        country_flag: w.country_flag,
      };
    }),
    fromMock: true,
  };
}

function mapWishlistRow(w: WishlistRow): ProfileWishlist {
  return {
    id: w.id,
    title: w.title,
    description: w.description,
    slug: w.slug,
    cover_image: w.cover_image,
    cover_video_url: w.cover_video_url ?? null,
    total_sats_goal: w.total_sats_goal,
    total_sats_raised: w.total_sats_raised,
    country: w.country,
    city: w.city,
    country_flag: w.country_flag,
  };
}

async function fetchLiveProfileRow(username: string): Promise<LiveProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .ilike('username', escapeIlikePattern(username))
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  const row = asRow<LiveProfileRow>(data);
  if (!row?.id || !row.username) return null;
  return row;
}

async function fetchCreatorWishlists(creatorId: string): Promise<ProfileWishlist[]> {
  type VisMode = 'public_unlisted' | 'public' | 'none';
  let columns = WISHLIST_COLUMNS_WITH_VIDEO;
  let vis: VisMode = 'public_unlisted';

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const base = supabase.from('wishlists').select(columns).eq('creator_id', creatorId);
    const query =
      vis === 'public_unlisted'
        ? base.or('visibility.eq.public,visibility.eq.unlisted')
        : vis === 'public'
          ? base.eq('visibility', 'public')
          : base;

    const { data, error } = await query;

    if (!error) {
      return asRows<WishlistRow>(data)
        .filter((w) => isPublicOrUnlistedVisibility(w.visibility))
        .map(mapWishlistRow);
    }

    if (isMissingColumnError(error, 'cover_video_url') && columns === WISHLIST_COLUMNS_WITH_VIDEO) {
      columns = WISHLIST_COLUMNS_NO_VIDEO;
      continue;
    }
    if (vis === 'public_unlisted' && isUnsupportedVisibilityError(error)) {
      vis = 'public';
      continue;
    }
    if (vis !== 'none' && isMissingColumnError(error, 'visibility')) {
      vis = 'none';
      continue;
    }
    return [];
  }

  return [];
}

/**
 * Live Supabase profile when a row exists (even with 0 wishlists).
 * No row / lookup failure / unconfigured → mock creator, else null.
 */
export async function loadCreatorProfile(username: string): Promise<CreatorProfile | null> {
  const cleaned = sanitizeUsername(username);
  if (!cleaned) return null;

  let live: CreatorProfile | null = null;
  if (isSupabaseConfigured()) {
    try {
      const row = await fetchLiveProfileRow(cleaned);
      if (row) {
        const wishlists = await fetchCreatorWishlists(row.id);
        live = liveProfileFromRow(row, wishlists);
      }
    } catch {
      live = null;
    }
  }

  return selectCreatorProfileSource(cleaned, live);
}
