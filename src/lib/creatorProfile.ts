import { mockWishlists } from '../data/mockWishlists';
import { asRow, asRows, isSupabaseConfigured, supabase } from './supabase';
import { usablePaymentAddress } from './validateAddress';

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
  /** Live `profiles.id` when loaded from Supabase; null for mock creators. */
  id: string | null;
  username: string;
  avatar_url: string | null;
  bio?: string;
  lightning_address?: string | null;
  nostr_pubkey?: string | null;
  /** On-chain receive address from public `wallet_addresses` (never a demo placeholder). */
  bitcoin_address?: string | null;
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

export function liveProfileFromRow(
  row: LiveProfileRow,
  wishlists: ProfileWishlist[],
  bitcoin_address: string | null = null
): CreatorProfile {
  return {
    id: row.id,
    username: row.username,
    avatar_url: row.avatar_url,
    bio: row.bio || undefined,
    lightning_address: usablePaymentAddress(row.lightning_address),
    nostr_pubkey: row.nostr_pubkey,
    bitcoin_address: usablePaymentAddress(bitcoin_address),
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
  const extras = creators as Array<typeof first.creator & MockCreatorExtras & { bitcoin_address?: string | null }>;
  const withOnchain = extras.find((c) => c.bitcoin_address);
  return {
    id: null,
    username: first.creator.username,
    avatar_url: first.creator.avatar_url,
    bio: withBio?.bio,
    lightning_address: usablePaymentAddress(withLn?.lightning_address ?? null),
    nostr_pubkey: creators.find((c) => c.nostr_pubkey)?.nostr_pubkey ?? null,
    bitcoin_address: usablePaymentAddress(withOnchain?.bitcoin_address ?? null),
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

export type WalletReceiveRow = {
  address_value: string | null;
  address_type: string;
  is_active?: boolean | null;
};

/**
 * Gift/tip destinations: active wallet_addresses win over a stale profiles.lightning_address.
 * Dummy/placeholder values never win.
 */
export function pickReceiveDestinations(
  profileLightning: string | null | undefined,
  wallets: WalletReceiveRow[]
): { lightning: string | null; onchain: string | null } {
  const active = wallets.filter((w) => w.is_active !== false);
  const lnWallet = active.find((w) => w.address_type === 'lightning');
  const onWallet = active.find((w) => w.address_type === 'onchain');
  return {
    lightning:
      usablePaymentAddress(lnWallet?.address_value) ?? usablePaymentAddress(profileLightning),
    onchain: usablePaymentAddress(onWallet?.address_value),
  };
}

async function fetchCreatorWalletRows(userId: string): Promise<WalletReceiveRow[]> {
  const { data, error } = await supabase
    .from('wallet_addresses')
    .select('address_value, address_type, is_active')
    .eq('user_id', userId);
  if (error || !data) return [];
  return asRows<WalletReceiveRow>(data);
}

/** Lightning + on-chain a supporter should pay. Wallet Lightning overrides profile lud16. */
export async function fetchCreatorReceiveDestinations(
  userId: string | null | undefined,
  profileLightning?: string | null
): Promise<{ lightning: string | null; onchain: string | null }> {
  if (!userId || !isSupabaseConfigured()) {
    return { lightning: usablePaymentAddress(profileLightning), onchain: null };
  }
  try {
    const rows = await fetchCreatorWalletRows(userId);
    return pickReceiveDestinations(profileLightning, rows);
  } catch {
    return { lightning: usablePaymentAddress(profileLightning), onchain: null };
  }
}

/** Public on-chain receive address, if the creator published one. Never invents a placeholder. */
export async function fetchCreatorOnchainAddress(userId: string | null | undefined): Promise<string | null> {
  const dest = await fetchCreatorReceiveDestinations(userId, null);
  return dest.onchain;
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
        const [wishlists, dest] = await Promise.all([
          fetchCreatorWishlists(row.id),
          fetchCreatorReceiveDestinations(row.id, row.lightning_address),
        ]);
        live = {
          ...liveProfileFromRow(row, wishlists, dest.onchain),
          lightning_address: dest.lightning,
        };
      }
    } catch {
      live = null;
    }
  }

  return selectCreatorProfileSource(cleaned, live);
}
