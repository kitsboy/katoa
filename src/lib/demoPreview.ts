import { clearDemoAccountStorage, getStorage, removeStorage, setStorage, STORAGE_KEYS } from './storage';

export type DemoScenarioId = 'community' | 'creator' | 'music';
export type DemoDetailLevel = 'rich' | 'quick';

export interface DemoScenario {
  id: DemoScenarioId;
  label: string;
  shortLabel: string;
  description: string;
  slug: string;
  href: string;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'community',
    label: 'Community impact',
    shortLabel: 'Medellín skate park',
    description: 'A visual project story with milestones, equipment, and community outcomes.',
    slug: 'medellin-skate-park',
    href: '/wishlist/medellin-skate-park',
  },
  {
    id: 'creator',
    label: 'Creator studio',
    shortLabel: 'Luna video collection',
    description: 'A media-first creator world with posts, drops, and a clear support goal.',
    slug: 'luna-exclusive-videos',
    href: '/wishlist/luna-exclusive-videos',
  },
  {
    id: 'music',
    label: 'Independent music',
    shortLabel: 'Paul’s guitar fund',
    description: 'A personal funding journey broken into practical gear milestones.',
    slug: 'paul-artist-guitar',
    href: '/wishlist/paul-artist-guitar',
  },
];

const SCENARIO_KEY = 'katoa_demo_scenario';
const DETAIL_KEY = 'katoa_demo_detail_level';
export const DEMO_PREVIEW_EVENT = 'katoa:demo-preview-changed';

function isScenarioId(value: string): value is DemoScenarioId {
  return DEMO_SCENARIOS.some((scenario) => scenario.id === value);
}

export function getDemoScenario(): DemoScenarioId {
  const stored = getStorage<string>(SCENARIO_KEY, 'community');
  return isScenarioId(stored) ? stored : 'community';
}

export function setDemoScenario(id: DemoScenarioId): void {
  setStorage(SCENARIO_KEY, id);
  window.dispatchEvent(new CustomEvent(DEMO_PREVIEW_EVENT));
}

export function getDemoDetailLevel(): DemoDetailLevel {
  return getStorage<DemoDetailLevel>(DETAIL_KEY, 'rich') === 'quick' ? 'quick' : 'rich';
}

export function setDemoDetailLevel(level: DemoDetailLevel): void {
  setStorage(DETAIL_KEY, level);
  window.dispatchEvent(new CustomEvent(DEMO_PREVIEW_EVENT));
}

export function selectedDemoScenario(): DemoScenario {
  return DEMO_SCENARIOS.find((scenario) => scenario.id === getDemoScenario()) ?? DEMO_SCENARIOS[0];
}

/** Clears only device-local preview state. It never touches Supabase or live account data. */
export function resetDemoPreview(): void {
  clearDemoAccountStorage();
  [
    STORAGE_KEYS.exploreFilters,
    STORAGE_KEYS.exploreFavorites,
    STORAGE_KEYS.exploreFavoritesOnly,
    STORAGE_KEYS.exploreVideosOnly,
    STORAGE_KEYS.exploreShowMap,
    STORAGE_KEYS.recentlyViewedWishlists,
    STORAGE_KEYS.giftDraft,
    STORAGE_KEYS.onboardingChecklist,
    STORAGE_KEYS.creatorFollows,
    STORAGE_KEYS.changelogSeen,
    SCENARIO_KEY,
    DETAIL_KEY,
  ].forEach(removeStorage);
  window.dispatchEvent(new CustomEvent(DEMO_PREVIEW_EVENT));
}
