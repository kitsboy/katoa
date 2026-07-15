import { describe, expect, it } from 'vitest';

const SORT_OPTIONS = new Set(['recent', 'trending', 'funded', 'goal']);

function readExploreFiltersFromUrl(search: string) {
  const params = new URLSearchParams(search);
  const sort = params.get('sort');
  return {
    searchTerm: params.get('search') ?? '',
    selectedCountry: params.get('country') ?? '',
    selectedCategory: params.get('category') ?? '',
    sortBy: sort && SORT_OPTIONS.has(sort) ? sort : 'recent',
    showMap: params.get('map') === '1' || params.get('map') === 'true',
    favoritesOnly: params.get('favorites') === '1' || params.get('favorites') === 'true',
    videosOnly: params.get('videos') === '1' || params.get('videos') === 'true',
  };
}

describe('readExploreFiltersFromUrl', () => {
  it('reads search param (not q)', () => {
    const f = readExploreFiltersFromUrl('?search=skate');
    expect(f.searchTerm).toBe('skate');
  });

  it('defaults sort to recent for invalid values', () => {
    expect(readExploreFiltersFromUrl('?sort=invalid').sortBy).toBe('recent');
  });

  it('parses boolean flags', () => {
    const f = readExploreFiltersFromUrl('?map=1&videos=true&favorites=1');
    expect(f.showMap).toBe(true);
    expect(f.videosOnly).toBe(true);
    expect(f.favoritesOnly).toBe(true);
  });
});