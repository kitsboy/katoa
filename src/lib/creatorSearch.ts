import type { CreatorVideoWishlist } from '../components/CreatorVideoCard';
import { CREATOR_VERTICALS } from '../data/creatorVerticals';

export interface CreatorSearchFilters {
  /** Free-text query — matched against username, title, bio, city, country. */
  query?: string;
  /** Creator vertical id (model / fitness / music / …). */
  verticalId?: string;
}

/**
 * Every keyword a creator could be found by, drawn from its own profile
 * fields only (username, bio, title, description, country, city, category).
 */
export function creatorSearchTerms(
  wishlist: CreatorVideoWishlist
): string[] {
  const creator = wishlist.creator;
  const w = wishlist as CreatorVideoWishlist & { category?: string };
  return [
    creator.username,
    creator.bio ?? '',
    wishlist.title,
    wishlist.description,
    wishlist.country ?? '',
    wishlist.city ?? '',
    w.category ?? '',
  ]
    .filter(Boolean)
    .map((s) => s.toLowerCase());
}

/**
 * Filter creator wishlists by free-text query + vertical. A creator matches a
 * vertical when one of its own profile terms is one of that vertical's tags.
 * Returns the matched vertical label (for result headers), if vertical-scoped.
 */
export function filterCreators(
  wishlists: CreatorVideoWishlist[],
  filters: CreatorSearchFilters
): { results: CreatorVideoWishlist[]; verticalTag?: string } {
  const q = filters.query?.trim().toLowerCase() ?? '';
  const vertical = filters.verticalId
    ? CREATOR_VERTICALS.find((v) => v.id === filters.verticalId)
    : undefined;

  let results = wishlists;
  if (vertical) {
    results = results.filter((w) =>
      creatorSearchTerms(w).some((term) => vertical.tags.includes(term))
    );
  }
  if (q) {
    results = results.filter((w) =>
      creatorSearchTerms(w).some((term) => term.includes(q))
    );
  }

  return { results, verticalTag: vertical?.label };
}
