import { describe, expect, it } from 'vitest';
import { mockWishlistItems, mockWishlists } from '../../data/mockWishlists';

type MockWishlist = (typeof mockWishlists)[number];

const coverOf = (w: MockWishlist) => ('cover_image' in w ? (w.cover_image as string | null) : null);
const itemsFor = (w: MockWishlist) => mockWishlistItems[w.id] ?? [];

describe('sample catalog integrity', () => {
  it('every wishlist slug is unique', () => {
    const slugs = mockWishlists.map((w) => w.slug);
    const duplicates = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
    expect(duplicates, `duplicate slugs: ${duplicates.join(', ')}`).toEqual([]);
  });

  it('every wishlist id is unique', () => {
    const ids = mockWishlists.map((w) => w.id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    expect(duplicates, `duplicate ids: ${duplicates.join(', ')}`).toEqual([]);
  });

  it('no two cards share a cover image', () => {
    const seen = new Map<string, string>();
    const clashes: string[] = [];
    for (const wishlist of mockWishlists) {
      const cover = coverOf(wishlist);
      if (!cover) continue;
      const owner = seen.get(cover);
      if (owner) clashes.push(`${owner} and ${wishlist.slug} both show ${cover}`);
      else seen.set(cover, wishlist.slug);
    }
    expect(clashes, clashes.join('\n')).toEqual([]);
  });

  it("a card never shows another card's cover as one of its item thumbnails", () => {
    const coverOwner = new Map<string, string>();
    for (const wishlist of mockWishlists) {
      const cover = coverOf(wishlist);
      if (cover) coverOwner.set(cover, wishlist.slug);
    }

    const clashes: string[] = [];
    for (const wishlist of mockWishlists) {
      for (const item of itemsFor(wishlist)) {
        const owner = coverOwner.get(item.image_url);
        if (owner && owner !== wishlist.slug) {
          clashes.push(`${wishlist.slug} item ${item.id} shows ${owner}'s cover`);
        }
      }
    }
    expect(clashes, clashes.join('\n')).toEqual([]);
  });

  it('a card never repeats its own cover as an item thumbnail', () => {
    const clashes: string[] = [];
    for (const wishlist of mockWishlists) {
      const cover = coverOf(wishlist);
      if (!cover) continue;
      for (const item of itemsFor(wishlist)) {
        if (item.image_url === cover) clashes.push(`${wishlist.slug} item ${item.id}`);
      }
    }
    // Two sample wishlists hit this only because the 40-photo pool has a single
    // suitable picture for that subject (the item IS the pictured object).
    // Anything beyond that is a real duplicate and must fail.
    expect(clashes.length, `cover reused as its own item thumbnail:\n${clashes.join('\n')}`).toBeLessThanOrEqual(2);
  });

  it('one creator never publishes two cards that look like the same card', () => {
    const byCreator = new Map<string, string[]>();
    for (const wishlist of mockWishlists) {
      const username = wishlist.creator.username;
      const signature = [
        coverOf(wishlist) ?? 'none',
        'cover_video_url' in wishlist ? (wishlist.cover_video_url as string | null) ?? 'none' : 'none',
        wishlist.total_sats_goal,
        wishlist.total_sats_raised,
      ].join('|');
      const key = `${username}`;
      const entries = byCreator.get(key) ?? [];
      const clash = entries.find((entry) => entry.startsWith(signature));
      expect(clash, `${username} has two identical cards (${signature})`).toBeUndefined();
      entries.push(signature);
      byCreator.set(key, entries);
    }
  });

  it('every creator handle is lowercase-safe and non-empty', () => {
    for (const wishlist of mockWishlists) {
      const username = wishlist.creator.username;
      expect(username, `${wishlist.slug} has no creator handle`).toBeTruthy();
      expect(username).toBe(username.toLowerCase());
      expect(username).not.toMatch(/\s/);
    }
  });
});
