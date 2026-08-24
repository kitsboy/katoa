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

  test('home copy is not hidden under the header island', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('.lp-headline-accent')).toBeVisible({ timeout: 30_000 });

    const header = page.locator('header').first();
    const firstCopy = page.locator('.lp-page [role="status"], .lp-eyebrow').first();
    await expect(firstCopy).toBeVisible();

    const headerBox = await header.boundingBox();
    const copyBox = await firstCopy.boundingBox();
    expect(headerBox).toBeTruthy();
    expect(copyBox).toBeTruthy();
    if (!headerBox || !copyBox) return;

    expect(copyBox.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height - 2);

    const island = page.locator('.nav-island');
    const bg = await island.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toMatch(/rgb\(22,\s*14,\s*36\)/);
  });

  test('home is readable on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('.lp-headline-accent')).toBeVisible({ timeout: 30_000 });
    await page.screenshot({ path: 'test-results/landing-mobile.png', fullPage: true });
  });

  test('footer copy is not hidden under the mobile nav', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('.lp-headline-accent')).toBeVisible({ timeout: 30_000 });

    const nav = page.getByRole('navigation', { name: 'Mobile navigation' });
    await expect(nav).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const copy = page.locator('footer').getByText(/katoa\.org/i).last();
    await expect(copy).toBeVisible();

    const navBox = await nav.boundingBox();
    const copyBox = await copy.boundingBox();
    expect(navBox).toBeTruthy();
    expect(copyBox).toBeTruthy();
    if (!navBox || !copyBox) return;

    expect(copyBox.y + copyBox.height).toBeLessThanOrEqual(navBox.y + 1);

    const bg = await nav.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toMatch(/rgb\(22,\s*14,\s*36\)/);
  });
});
