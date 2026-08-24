import { test, expect } from '@playwright/test';

test.describe('landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('katoa_changelog_seen', JSON.stringify('1.1.0'));
    });
  });

  test('home uses dark ember background with trimmed cards', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');

    const root = page.locator('.lp-page');
    await expect(root).toBeVisible({ timeout: 30_000 });

    const bg = await root.evaluate((el) => getComputedStyle(el).backgroundColor);
    // Dark night-jewel, not beige #dfd4c8 (rgb 223, 212, 200)
    expect(bg).not.toContain('223, 212, 200');
    const heroBg = await page.locator('.lp-hero-gradient').evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(heroBg.toLowerCase()).not.toContain('223, 212, 200');
    expect(heroBg.toLowerCase()).not.toContain('#dfd4c8');

    const leadColor = await page.locator('.lp-lead').first().evaluate((el) => getComputedStyle(el).color);
    // Lead text must stay light on the dark hero (not dark-violet-on-beige)
    expect(leadColor).not.toContain('109, 40, 217');

    const card = page.locator('.lp-bento-card').first();
    await expect(card).toBeVisible();
    const shadow = await card.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(shadow).not.toBe('none');

    await page.screenshot({ path: 'test-results/landing-desktop.png', fullPage: true });
  });

  test('home is readable on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('.lp-headline-accent')).toBeVisible({ timeout: 30_000 });
    await page.screenshot({ path: 'test-results/landing-mobile.png', fullPage: true });
  });
});
