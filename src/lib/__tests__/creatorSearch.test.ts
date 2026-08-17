import { describe, expect, it } from 'vitest';
import { creatorSearchTerms, filterCreators } from '../creatorSearch';
import type { CreatorVideoWishlist } from '../../components/CreatorVideoCard';

type SearchableCreator = CreatorVideoWishlist & { category?: string };

function makeCreator(overrides: Partial<CreatorVideoWishlist> = {}): CreatorVideoWishlist {
  return {
    id: 'c1',
    title: 'Luna — VIP Video Wishlist',
    description: 'Studio sessions and travel diaries',
    slug: 'luna-exclusive-videos',
    cover_image: null,
    total_sats_goal: 1000000,
    total_sats_raised: 200000,
    country: 'United States',
    country_flag: '🇺🇸',
    city: 'Los Angeles',
    created_at: '2026-01-01T00:00:00Z',
    subscriber_count: 1284,
    creator: {
      username: 'luna_vip',
      avatar_url: null,
      bio: 'Video creator · VIP drops · Bitcoin-native monetization',
    },
    ...overrides,
  } as CreatorVideoWishlist;
}

describe('creatorSearch', () => {
  it('collects profile terms for search', () => {
    const terms = creatorSearchTerms(makeCreator());
    expect(terms).toContain('luna_vip');
    expect(terms).toContain('los angeles');
    expect(terms).toContain('luna — vip video wishlist');
  });

  it('matches by username query', () => {
    const { results } = filterCreators([makeCreator()], { query: 'luna' });
    expect(results).toHaveLength(1);
  });

  it('matches by city query', () => {
    const { results } = filterCreators([makeCreator()], { query: 'angeles' });
    expect(results).toHaveLength(1);
  });

  it('filters by vertical via creator category term', () => {
    const creator = makeCreator({ category: 'creator' } as SearchableCreator);
    const { results, verticalTag } = filterCreators([creator], { verticalId: 'creator' });
    expect(results).toHaveLength(1);
    expect(verticalTag).toBe('Any creator');
  });

  it('excludes creators that do not match the vertical', () => {
    const { results } = filterCreators([makeCreator()], { verticalId: 'music' });
    expect(results).toHaveLength(0);
  });

  it('returns no results for a non-matching query', () => {
    const { results } = filterCreators([makeCreator()], { query: 'zzz-nope' });
    expect(results).toHaveLength(0);
  });

  it('combines query + vertical filters', () => {
    const creator = makeCreator({ category: 'creator' } as SearchableCreator);
    const { results } = filterCreators([creator], { query: 'angeles', verticalId: 'creator' });
    expect(results).toHaveLength(1);
    const none = filterCreators([creator], { query: 'london', verticalId: 'creator' });
    expect(none.results).toHaveLength(0);
  });
});
