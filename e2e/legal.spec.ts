import { test, expect } from '@playwright/test';

test.describe('legal and 404', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('katoa_changelog_seen', JSON.stringify('1.1.0'));
    });
  });

  test('terms page renders policy heading', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.getByRole('heading', { name: /terms/i }).first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/KYC/i).first()).toBeVisible();
  });

  test('privacy page renders policy heading', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByRole('heading', { name: /privacy/i }).first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/does not KYC/i).first()).toBeVisible();
  });
});
