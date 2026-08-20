import { test, expect } from '@playwright/test';

test.describe('wishlist template', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('katoa_changelog_seen', JSON.stringify('1.1.0'));
    });
  });

  test('subscription tiers sit full-width, not squished in the sidebar', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/wishlist/medellin-skate-park');

    await expect(page.getByRole('heading', { name: /Medellín Youth/i })).toBeVisible({
      timeout: 30_000,
    });

    const subscribeHeading = page.getByRole('heading', { name: /Support skate_colombia/i });
    await expect(subscribeHeading).toBeVisible();

    const buttons = page.getByRole('button', { name: 'Subscribe with Lightning' });
    await expect(buttons).toHaveCount(3);

    const boxes = await Promise.all([0, 1, 2].map((i) => buttons.nth(i).boundingBox()));
    for (const box of boxes) {
      expect(box).toBeTruthy();
      expect(box!.width).toBeGreaterThan(220);
    }
    // Three cards in a row: similar y, spread across the page.
    const ys = boxes.map((b) => b!.y);
    expect(Math.max(...ys) - Math.min(...ys)).toBeLessThan(40);
    expect(boxes[2]!.x).toBeGreaterThan(boxes[0]!.x + 240);

    await page.screenshot({
      path: 'test-results/medellin-desktop.png',
      fullPage: true,
    });
  });

  test('subscription tiers stack cleanly on a phone viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/wishlist/medellin-skate-park');

    const buttons = page.getByRole('button', { name: 'Subscribe with Lightning' });
    await expect(buttons.first()).toBeVisible({ timeout: 30_000 });
    await expect(buttons).toHaveCount(3);

    const boxes = await Promise.all([0, 1, 2].map((i) => buttons.nth(i).boundingBox()));
    for (const box of boxes) {
      expect(box).toBeTruthy();
      expect(box!.width).toBeGreaterThan(260);
    }
    // Stacked: later cards sit below earlier ones.
    expect(boxes[1]!.y).toBeGreaterThan(boxes[0]!.y + 80);
    expect(boxes[2]!.y).toBeGreaterThan(boxes[1]!.y + 80);

    await page.screenshot({
      path: 'test-results/medellin-mobile.png',
      fullPage: true,
    });
  });
});
