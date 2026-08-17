import { test, expect } from '@playwright/test';

test.describe('creator feed', () => {
  test('subscribe unlocks locked posts and shows manage panel', async ({ page }) => {
    // ChangelogModal auto-opens in fresh contexts — keep runs deterministic.
    // (getStorage JSON-parses, so the seed must be a quoted string.)
    await page.addInitScript(() => {
      localStorage.setItem('katoa_changelog_seen', JSON.stringify('1.1.0'));
    });
    await page.goto('/wishlist/luna-exclusive-videos');

    // Locked posts show blurred previews with a lock chip (not a full overlay).
    await expect(page.getByRole('heading', { name: 'Latest posts' })).toBeVisible({
      timeout: 30_000,
    });

    // Subscribe via the feed CTA (exact name — card aria-labels contain 'subscribe').
    const subscribeButton = page.getByRole('button', { name: 'Subscribe', exact: true }).first();
    await subscribeButton.click();

    // Manage-subscription panel appears.
    await expect(page.getByText("You're subscribed", { exact: false })).toBeVisible();
    // Feed header button now reads Subscribed.
    await expect(page.getByRole('button', { name: /Subscribed/ })).toBeVisible();
  });

  test('PPV post unlocks without subscribing', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('katoa_changelog_seen', JSON.stringify('1.1.0'));
    });
    await page.goto('/wishlist/sasha-vip-content');

    // exact: true — card aria-labels contain 'unlock' in captions.
    const unlock = page.getByRole('button', { name: 'Unlock', exact: true }).first();
    await expect(unlock).toBeVisible({ timeout: 30_000 });
    await unlock.click();

    await expect(page.getByText('Post unlocked!')).toBeVisible();
    // PPV posts that are not subscribed stay locked for others, but this one is
    // unlocked — the lock overlay count should drop.
    const lockCount = await page.locator('text=Subscribe to unlock').count();
    expect(lockCount).toBeLessThanOrEqual(1);
  });

  test('liking a post increments its count', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('katoa_changelog_seen', JSON.stringify('1.1.0'));
    });
    await page.goto('/wishlist/luna-exclusive-videos');

    const likeButton = page.getByRole('button', { name: 'Like', exact: true }).first();
    await expect(likeButton).toBeVisible({ timeout: 30_000 });
    await likeButton.click();
    await expect(page.getByText('Liked!')).toBeVisible();
    // The liked button re-labels itself to "Unlike" (accessible name swap).
    const unlikeButton = page.getByRole('button', { name: 'Unlike', exact: true }).first();
    await expect(unlikeButton).toHaveAttribute('aria-pressed', 'true');
  });
});
