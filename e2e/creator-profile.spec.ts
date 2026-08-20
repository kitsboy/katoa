import { test, expect } from '@playwright/test';

test.describe('creator profile', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('katoa_changelog_seen', JSON.stringify('1.1.0'));
    });
  });

  test('luna_vip public profile shows heading and a wishlist link', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/u/luna_vip');

    await expect(page.getByRole('heading', { name: '@luna_vip', exact: true })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator('a[href="/wishlist/luna-exclusive-videos"]')).toBeVisible();
  });
});
