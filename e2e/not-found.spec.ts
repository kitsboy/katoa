import { test, expect } from '@playwright/test';

test.describe('not found', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('katoa_changelog_seen', JSON.stringify('1.1.0'));
    });
  });

  test('unknown routes show the in-app 404 page', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    await expect(page.getByRole('heading', { name: /page not found/i })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('link', { name: /back to home/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /explore/i }).first()).toBeVisible();
  });
});
