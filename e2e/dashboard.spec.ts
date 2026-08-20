import { test, expect } from '@playwright/test';

test.describe('creator dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem('katoa-demo-session', '1');
      localStorage.setItem('katoa_changelog_seen', JSON.stringify('1.1.0'));
    });
  });

  test('demo dashboard shows welcome, honest stats, and project cards', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/dashboard');

    await expect(page.getByRole('heading', { name: /demo_creator/i })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByRole('heading', { name: /Your projects/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Skate Colombia' })).toBeVisible();
    await expect(page.getByRole('button', { name: /New project/i }).first()).toBeVisible();

    // Fake "Supporters · Coming soon" is gone; following is a real count.
    await expect(page.getByText('Coming soon')).toHaveCount(0);
    await expect(page.getByText('Views')).toHaveCount(0);

    await page.screenshot({ path: 'test-results/dashboard-desktop.png', fullPage: true });
  });

  test('dashboard is usable on a phone viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dashboard');

    await expect(page.getByRole('heading', { name: /demo_creator/i })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByRole('heading', { name: 'Skate Colombia' })).toBeVisible();

    await page.screenshot({ path: 'test-results/dashboard-mobile.png', fullPage: true });
  });
});
