export function getStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode */
  }
}

export function removeStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export const STORAGE_KEYS = {
  exploreFilters: 'katoa_explore_filters',
  exploreFavorites: 'katoa_explore_favorites',
  exploreFavoritesOnly: 'katoa_explore_favorites_only',
  /** Persisted /explore "Videos only" quick filter (cover_video_url creators). */
  exploreVideosOnly: 'katoa_explore_videos_only',
  recentlyViewedWishlists: 'katoa_recent_wishlists',
  giftDraft: 'katoa_gift_draft',
  authTab: 'katoa_auth_tab',
  wishlistTheme: (slug: string) => `katoa_wishlist_theme_${slug}`,
  wishlistItemOrder: (slug: string) => `katoa_wishlist_order_${slug}`,
  changelogSeen: 'katoa_changelog_seen',
  pwaInstallDismissed: 'katoa_pwa_install_dismissed',
  exploreShowMap: 'katoa_explore_show_map',
  mapShowMerchants: 'katoa_map_show_merchants',
  mapShowKatoa: 'katoa_map_show_katoa',
  mapShowEvents: 'katoa_map_show_events',
  mapLastView: 'katoa_map_last_view',
  onboardingChecklist: 'katoa-onboarding-checklist',
  dmBlocked: 'katoa_dm_blocked',
  dmReadIds: 'katoa_dm_read_ids',
  creatorTipPresets: 'katoa_creator_tip_presets',
  creatorSubscriptions: 'katoa_creator_subscriptions',
  creatorPostLikes: 'katoa_creator_post_likes',
  creatorPostComments: 'katoa_creator_post_comments',
  creatorPpvUnlocks: 'katoa_creator_ppv_unlocks',
  creatorSeenPosts: 'katoa_creator_seen_posts',
  pwaCreatorPromptDismissed: 'katoa_pwa_creator_prompt',
  demoDashboardProjects: 'katoa_demo_dashboard_projects',
} as const;