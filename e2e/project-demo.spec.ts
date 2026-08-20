import { test, expect } from '@playwright/test';

test.describe('demo project manage', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem('katoa-demo-session', '1');
      localStorage.setItem('katoa_changelog_seen', JSON.stringify('1.1.0'));
    });
  });

  test('skate-colombia manage page shows title and wishlist cards', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/project/skate-colombia');

    await expect(page.getByRole('heading', { name: 'Skate Colombia' })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator('[data-testid="wishlist-card"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="wishlist-card"]')).toHaveCount(5);
  });
});
