import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mockWishlistItems } from '../../data/mockWishlists';
import { STORAGE_KEYS } from '../storage';
import {
  DEMO_PROJECT_SLUGS,
  DEMO_SEED_PROJECTS,
  findDemoProjectBySlug,
  getDemoWishlistsForProject,
  seedWishlistsForSlug,
  setDemoWishlistsForProject,
} from '../demoProjectStore';

describe('demoProjectStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('exposes the demo wishlists storage key', () => {
    expect(STORAGE_KEYS.demoProjectWishlists).toBe('katoa_demo_project_wishlists');
  });

  it('supports skate-colombia and studio-drops slugs', () => {
    expect(DEMO_PROJECT_SLUGS).toEqual(['skate-colombia', 'studio-drops']);
    expect(DEMO_SEED_PROJECTS.map((p) => p.slug)).toEqual(['skate-colombia', 'studio-drops']);
  });

  it('seeds Medellín skate wishlists from mock-featured items', () => {
    const seeded = seedWishlistsForSlug('demo-proj-skate', 'skate-colombia');
    const featured = mockWishlistItems['mock-featured'];
    expect(seeded.length).toBe(featured.length);
    expect(seeded[0]?.title).toBe('Professional Concrete Ramps');
    expect(seeded.every((w) => w.visibility === 'public')).toBe(true);
  });

  it('seeds studio-drops wishlists from luna video items', () => {
    const seeded = seedWishlistsForSlug('demo-proj-studio', 'studio-drops');
    const luna = mockWishlistItems['mock-video-001'];
    expect(seeded.length).toBe(luna.length);
    expect(seeded[0]?.title).toBe('Studio Session — Vol. 3');
    expect(seeded.every((w) => w.visibility === 'draft')).toBe(true);
  });

  it('finds seed projects by slug and persists wishlists locally', () => {
    const skate = findDemoProjectBySlug('skate-colombia');
    expect(skate?.title).toBe('Skate Colombia');

    const list = getDemoWishlistsForProject(skate!.id, skate!.slug);
    expect(list.length).toBeGreaterThan(0);

    const next = list.slice(1);
    setDemoWishlistsForProject(skate!.id, next);
    expect(getDemoWishlistsForProject(skate!.id, skate!.slug)).toHaveLength(next.length);
  });
});
