import { test, expect } from '@playwright/test';

test.describe('faq', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('katoa_changelog_seen', JSON.stringify('1.1.0'));
    });
  });

  test('shows h1 and is not beige', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/faq');

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible({ timeout: 30_000 });
    await expect(heading).toContainText(/frequently asked questions|preguntas frecuentes|perguntas frequentes|questions fréquentes/i);

    const bg = await page.locator('body').evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).not.toContain('223, 212, 200');

    const headingColor = await heading.evaluate((el) => getComputedStyle(el).color);
    expect(headingColor).not.toContain('223, 212, 200');
    expect(headingColor.toLowerCase()).not.toContain('#dfd4c8');

    const crumbs = page.getByRole('navigation', { name: /breadcrumb/i });
    if ((await crumbs.count()) > 0) {
      await expect(crumbs.first()).toBeVisible();
    }
  });

  test('mobile heading is not covered by the header', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/faq');

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible({ timeout: 30_000 });

    const header = page.locator('header').first();
    await expect(header).toBeVisible();

    const headerBox = await header.boundingBox();
    const headingBox = await heading.boundingBox();
    expect(headerBox).toBeTruthy();
    expect(headingBox).toBeTruthy();
    if (!headerBox || !headingBox) return;

    expect(headingBox.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height - 2);
  });
});
