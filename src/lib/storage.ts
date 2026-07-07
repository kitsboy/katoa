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
  recentlyViewedWishlists: 'katoa_recent_wishlists',
  giftDraft: 'katoa_gift_draft',
  authTab: 'katoa_auth_tab',
  wishlistTheme: (slug: string) => `katoa_wishlist_theme_${slug}`,
  wishlistItemOrder: (slug: string) => `katoa_wishlist_order_${slug}`,
  changelogSeen: 'katoa_changelog_seen',
  pwaInstallDismissed: 'katoa_pwa_install_dismissed',
} as const;