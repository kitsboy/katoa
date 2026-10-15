import { test, expect } from '@playwright/test';

/**
 * The Nostr entry point changed from a passive "Check Nostr extension" probe to a
 * real NIP-07 challenge login. This spec pins that behaviour: the button exists,
 * it needs an extension, and without one it reports the truth instead of opening
 * a session. Rendered copy is asserted here, so keep it in sync when it changes.
 */
test.describe('auth', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('katoa_changelog_seen', JSON.stringify('1.1.0'));
    });
  });

  test('sign-in offers email, Google, and an honest NIP-07 challenge', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/auth');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible();
    const form = page.locator('form');
    await expect(form.getByLabel(/^Email$/i)).toBeVisible();
    await expect(form.getByLabel(/^Password$/i)).toBeVisible();

    // Status is truthful in a clean browser profile: no extension installed.
    await expect(page.locator('span', { hasText: /NIP-07/i })).toHaveText(/Missing/i);

    const nostrButton = page.getByRole('button', { name: /Continue with Nostr/i });
    await expect(nostrButton).toBeVisible();
    await expect(page.getByText(/never sees your private key/i)).toBeVisible();

    // No extension: the button must report that, stay on /auth, and open no session.
    await nostrButton.click();
    await expect(page.getByText(/Install a Nostr extension/i)).toBeVisible();
    await expect(page).toHaveURL(/\/auth/);

    // Terms consent is required to sign up, not to sign in.
    await expect(form.getByRole('link', { name: /^Terms$/i })).toHaveCount(0);
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
