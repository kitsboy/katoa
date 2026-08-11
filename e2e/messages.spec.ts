import { test, expect } from '@playwright/test';

/**
 * Smoke: /messages opt-in UI is present and usable without NIP-07.
 */
test.describe('/messages opt-in', () => {
  test('shows private messages page with opt-in checkbox', async ({ page }) => {
    await page.goto('/messages');

    const optIn = page.getByTestId('messages-opt-in');
    await expect(optIn).toBeVisible({ timeout: 20_000 });
    await expect(optIn).not.toBeChecked();

    // Page title (h1) — English default
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/private messages|mensajes|mensagens|messages/i);

    // Toggle on — UI should accept (no crash; may show extension banner)
    await optIn.check();
    await expect(optIn).toBeChecked();

    // Compose area appears when opted in
    await expect(page.getByLabel(/recipient/i)).toBeVisible({ timeout: 5_000 });
    await expect(page.getByLabel(/^message$/i)).toBeVisible();

    // Toggle off again
    await optIn.uncheck();
    await expect(optIn).not.toBeChecked();
  });

  test('opt-in control is keyboard reachable', async ({ page }) => {
    await page.goto('/messages');
    const optIn = page.getByTestId('messages-opt-in');
    await expect(optIn).toBeVisible({ timeout: 20_000 });
    await optIn.focus();
    await expect(optIn).toBeFocused();
    await page.keyboard.press('Space');
    await expect(optIn).toBeChecked();
  });
});
