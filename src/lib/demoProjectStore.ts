import { mockWishlistItems, type MockWishlistItem } from '../data/mockWishlists';
import type { Project as DbProject, Visibility } from '../types/database';
import { DEMO_USER_ID } from './demoAuth';
import { getStorage, setStorage, STORAGE_KEYS } from './storage';

export type DemoProject = DbProject & {
  wishlist_count?: number;
  settings?: Record<string, unknown>;
};

export type DemoWishlistItem = {
  id: string;
  title: string;
  description: string;
  price_sats: number;
  sats_raised: number;
  product_url: string;
  merchant: string;
  image_url: string;
  is_funded: boolean;
  sort_order: number;
};

export type DemoWishlist = {
  id: string;
  project_id: string;
  title: string;
  description: string;
  slug: string;
  visibility: Visibility;
  total_sats_raised: number;
  total_sats_goal: number;
  created_at: string;
  items: DemoWishlistItem[];
};

export const DEMO_PROJECT_SLUGS = ['skate-colombia', 'studio-drops'] as const;

export const DEMO_SEED_PROJECTS: DemoProject[] = [
  {
    id: 'demo-proj-skate',
    creator_id: DEMO_USER_ID,
    title: 'Skate Colombia',
    description:
      'A community skatepark and youth program in Medellín — ramps, safety gear, and after-school sessions.',
    slug: 'skate-colombia',
    background_url: '/images/mock/pexels-2a6bfc8ddf.jpeg',
    wallet_address: null,
    lightning_address: 'demo@getalby.com',
    nostr_pubkey: null,
    visibility: 'public',
    created_at: '2026-06-01T00:00:00Z',
    wishlist_count: 5,
  },
  {
    id: 'demo-proj-studio',
    creator_id: DEMO_USER_ID,
    title: 'Studio drops',
    description:
      'Members-only video series funded directly in sats. Draft until you’re ready to publish.',
    slug: 'studio-drops',
    background_url: '/images/mock/pexels-7867fa1faf.jpeg',
    wallet_address: null,
    lightning_address: 'demo@getalby.com',
    nostr_pubkey: null,
    visibility: 'draft',
    created_at: '2026-07-12T00:00:00Z',
    wishlist_count: 2,
  },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function toItem(item: MockWishlistItem): DemoWishlistItem {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    price_sats: item.price_sats,
    sats_raised: item.sats_raised,
    product_url: item.product_url,
    merchant: item.merchant,
    image_url: item.image_url,
    is_funded: item.is_funded,
    sort_order: item.sort_order,
  };
}

function wishlistFromItem(
  projectId: string,
  item: MockWishlistItem,
  visibility: Visibility,
  idPrefix: string,
  createdAt: string
): DemoWishlist {
  return {
    id: `${idPrefix}-${item.id}`,
    project_id: projectId,
    title: item.title,
    description: item.description,
    slug: slugify(item.title) || item.id,
    visibility,
    total_sats_raised: item.sats_raised,
    total_sats_goal: item.price_sats,
    created_at: createdAt,
    items: [toItem(item)],
  };
}

export function seedWishlistsForSlug(projectId: string, slug: string): DemoWishlist[] {
  if (slug === 'skate-colombia') {
    return (mockWishlistItems['mock-featured'] || []).map((item) =>
      wishlistFromItem(projectId, item, 'public', 'demo-wl-skate', '2026-06-01T00:00:00Z')
    );
  }
  if (slug === 'studio-drops') {
    return (mockWishlistItems['mock-video-001'] || []).map((item) =>
      wishlistFromItem(projectId, item, 'draft', 'demo-wl-studio', '2026-07-12T00:00:00Z')
    );
  }
  return [];
}

export function getDemoProjects(): DemoProject[] {
  const stored = getStorage<DemoProject[]>(STORAGE_KEYS.demoDashboardProjects, []);
  if (stored.length > 0) return stored;
  setStorage(STORAGE_KEYS.demoDashboardProjects, DEMO_SEED_PROJECTS);
  return DEMO_SEED_PROJECTS;
}

export function persistDemoProjects(next: DemoProject[]): void {
  setStorage(STORAGE_KEYS.demoDashboardProjects, next);
}

export function findDemoProjectBySlug(slug: string): DemoProject | null {
  return getDemoProjects().find((p) => p.slug === slug) ?? null;
}

export function upsertDemoProject(project: DemoProject): DemoProject {
  const list = getDemoProjects();
  const idx = list.findIndex((p) => p.id === project.id);
  const next =
    idx >= 0 ? list.map((p) => (p.id === project.id ? { ...p, ...project } : p)) : [...list, project];
  persistDemoProjects(next);
  return project;
}

function getWishlistsStore(): Record<string, DemoWishlist[]> {
  return getStorage<Record<string, DemoWishlist[]>>(STORAGE_KEYS.demoProjectWishlists, {});
}

function persistWishlistsStore(store: Record<string, DemoWishlist[]>): void {
  setStorage(STORAGE_KEYS.demoProjectWishlists, store);
}

function syncWishlistCount(projectId: string, count: number) {
  persistDemoProjects(
    getDemoProjects().map((p) => (p.id === projectId ? { ...p, wishlist_count: count } : p))
  );
}

export function getDemoWishlistsForProject(projectId: string, projectSlug: string): DemoWishlist[] {
  const store = getWishlistsStore();
  if (Object.prototype.hasOwnProperty.call(store, projectId)) {
    return store[projectId] ?? [];
  }
  const seeded = seedWishlistsForSlug(projectId, projectSlug);
  store[projectId] = seeded;
  persistWishlistsStore(store);
  syncWishlistCount(projectId, seeded.length);
  return seeded;
}

export function setDemoWishlistsForProject(
  projectId: string,
  wishlists: DemoWishlist[]
): DemoWishlist[] {
  const store = getWishlistsStore();
  store[projectId] = wishlists;
  persistWishlistsStore(store);
  syncWishlistCount(projectId, wishlists.length);
  return wishlists;
}
