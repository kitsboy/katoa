import { test, expect } from '@playwright/test';

/**
 * The creator profile is a 5-section tab strip (Story / Media / Goals / Updates /
 * Proof) with Story open by default; public wishlists live under Goals. Assert the
 * link through the tab the way a supporter reaches it, rather than assuming DOM
 * order — that assumption is what made this spec drift.
 */
test.describe('creator profile', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('katoa_changelog_seen', JSON.stringify('1.1.0'));
    });
  });

  test('luna_vip public profile shows its header, support actions, and reachable wishlist', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/u/luna_vip');

    await expect(page.getByRole('heading', { name: '@luna_vip', exact: true })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByRole('button', { name: /Support @luna_vip/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Subscribe/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /^Follow$/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Message/i }).first()).toBeVisible();

    await expect(page.getByRole('tab')).toHaveText([/Story/i, /Media/i, /Goals/i, /Updates/i, /Proof/i]);

    const wishlistLink = page.locator('a[href="/wishlist/luna-exclusive-videos"]');
    await page.getByRole('tab', { name: /^Goals$/i }).click();
    await expect(wishlistLink).toBeVisible();
    await expect(wishlistLink).toHaveAttribute('href', '/wishlist/luna-exclusive-videos');

    // The link is not decorative: it opens the wishlist.
    await wishlistLink.click();
    await expect(page).toHaveURL(/\/wishlist\/luna-exclusive-videos$/);
  });
});
