import { test, expect } from '@playwright/test';

/**
 * Smoke: /explore map surface mounts and the map chrome is interactive
 * (layer toggles + share button present, no render crash).
 */
test.describe('explore map', () => {
  test('map frame mounts with layer toggles and share', async ({ page }) => {
    await page.goto('/explore?map=1');

    const canvas = page.locator('.unified-btcmap__canvas');
    await expect(canvas).toBeVisible({ timeout: 30_000 });

    // MapLibre GL initialized: the vector canvas element exists inside the frame
    // (proves the OpenFreeMap style loaded and WebGL didn't bail).
    await expect(page.locator('.unified-btcmap__canvas .maplibregl-canvas')).toBeVisible({ timeout: 30_000 });

    // Layer toggles
    await expect(page.getByRole('button', { name: /merchants/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /KATOA/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /events|eventos|événements|veranstaltungen|活动|イベント/i }).first()).toBeVisible();

    // Share button present and clickable
    const share = page.getByRole('button', { name: /share map view|compartir vista|compartilhar vista|kartenansicht teilen|分享地图视图|地図ビューを共有/i });
    await expect(share).toBeVisible();
    await share.click();

    // No fatal page error: heading still present
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/explore|explorar|explorar|explorer|entdecken|探索|探す/i);
  });

  test('map search box is reachable', async ({ page }) => {
    await page.goto('/explore?map=1');

    const search = page.getByRole('combobox');
    await expect(search).toBeVisible({ timeout: 30_000 });
    await search.focus();
    await expect(search).toBeFocused();
  });
});
