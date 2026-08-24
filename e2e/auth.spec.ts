import { test, expect } from '@playwright/test';

test.describe('auth', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('katoa_changelog_seen', JSON.stringify('1.1.0'));
    });
  });

  test('email, Google, and Nostr-check are present — Nostr is not a session login', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/auth');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Check Nostr extension/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Continue with Nostr/i })).toHaveCount(0);
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByText(/server challenge missing/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /^Terms$/i })).toHaveCount(0);
  });

  test('sign up shows terms and privacy links', async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem('katoa_auth_tab', 'signup');
    });
    await page.goto('/auth');
    const toggle = page.getByRole('button', { name: /Don't have an account/i });
    if (await toggle.count()) await toggle.click();
    await expect(page.getByRole('heading', { name: /Create your creator account/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /^Terms$/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /^Privacy$/i })).toBeVisible();
    await expect(page.getByText(/does not KYC/i).first()).toBeVisible();
  });
});
