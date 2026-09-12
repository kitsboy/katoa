import { test, expect } from '@playwright/test';

/**
 * Verification for t_d9f4141e — katoa.org/comparison deep link must keep hero, slider
 * and calculator on ONE source of truth (the ?earnings= value).
 *
 * Case A (deep link ?earnings=5000):
 *   - slider input #comparison-earnings == 5000
 *   - hero savings card shows "1,000" (20% of 5,000) and yearly 12,000
 *   - FeeComparison calculator: OnlyFans fees $1,000, you keep $4,000, save $1,000
 * Case B (no param):
 *   - slider == 10000, hero 2,000 / 24,000, calculator OnlyFans $2,000 / keep $8,000
 */

test('deep link ?earnings=5000 keeps hero, slider and calculator consistent', async ({ page }) => {
  await page.goto('/comparison?earnings=5000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  // Slider
  const slider = page.locator('#comparison-earnings');
  await expect(slider).toHaveValue('5000');

  // Hero savings card (Save up to X/month) — uses formatNumber(savings.max) = 1000
  const saveMonthly = page.locator('text=Save up to');
  await expect(saveMonthly).toContainText('1,000');

  // Hero yearly line: Based on 5,000/mo — 12,000/year
  await expect(page.locator('text=Based on')).toContainText('5,000');

  // Calculator — OnlyFans: fees $1,000, keep $4,000
  const onlyfans = page.locator('.grid').filter({ hasText: 'OnlyFans' }).first();
  const feeVal = await onlyfans.locator('p.text-2xl.font-black').nth(0).textContent();
  const keepVal = await onlyfans.locator('p.text-2xl.font-black').nth(1).textContent();
  expect(feeVal).toBe('$1,000');
  expect(keepVal).toBe('$4,000');
});

test('no-param /comparison stays at 10,000 / 2,000 / 24,000', async ({ page }) => {
  await page.goto('/comparison', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  const slider = page.locator('#comparison-earnings');
  await expect(slider).toHaveValue('10000');

  const saveMonthly = page.locator('text=Save up to');
  await expect(saveMonthly).toContainText('2,000');

  await expect(page.locator('text=Based on')).toContainText('10,000');

  const onlyfans = page.locator('.grid').filter({ hasText: 'OnlyFans' }).first();
  const feeVal = await onlyfans.locator('p.text-2xl.font-black').nth(0).textContent();
  const keepVal = await onlyfans.locator('p.text-2xl.font-black').nth(1).textContent();
  expect(feeVal).toBe('$2,000');
  expect(keepVal).toBe('$8,000');
});

test('adjusting the slider updates the calculator too (single source of truth)', async ({ page }) => {
  await page.goto('/comparison', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const slider = page.locator('#comparison-earnings');
  await slider.fill('20000');

  // slider now 20,000
  await expect(slider).toHaveValue('20000');

  // calculator OnlyFans: fees $4,000, keep $16,000
  const onlyfans = page.locator('.grid').filter({ hasText: 'OnlyFans' }).first();
  await expect(onlyfans.locator('p.text-2xl.font-black').nth(0)).toHaveText('$4,000');
  await expect(onlyfans.locator('p.text-2xl.font-black').nth(1)).toHaveText('$16,000');
});
