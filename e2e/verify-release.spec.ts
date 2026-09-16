import { test, expect, type Page } from '@playwright/test';

/**
 * "Released & Bitcoin-anchored" — one-click verify surface.
 *
 * The chain check hits https://api.satohash.io; in the deterministic spec we
 * stub the network so the honesty rules are pinned without depending on a live
 * block: confirmed shows method + block, forged shows "Not proven", and the
 * .ots download is present with every verdict. A separate live smoke against
 * the deployed URL is run by the lane owner after push (real API).
 */

const CONFIRMED_VERDICT = {
  verified: true,
  verified_method: 'bitcoind',
  bitcoin_block_height: 967273,
  ots_download_url: 'https://api.satohash.io/api/stamps/real-proof?download=true',
  explainer: 'Verified against a Bitcoin node.',
};

const RELEASE = {
  id: 'katoa-trust-ui-v1',
  creator: 'katoa',
  title: 'Released & Bitcoin-anchored trust UI (v1)',
  kind: 'platform-release',
  released_at: '2026-09-16',
  artifact_url: '/attestations/katoa-trust-ui-v1.txt',
  hash: '7960c231da6cd9f810140c24920a5563606ba71aadd2f8a4db80876b279ed668',
  ots_url: 'https://api.satohash.io/api/stamps/claimed-copy?download=true',
  demo: false,
};

function stubApi(page: Page, verdict: unknown) {
  return page.route('**/api/verify', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(verdict),
    });
  });
}

test.describe('verify release surface', () => {
  test('renders the Katoa platform release with one-click verify → confirmed + method + .ots', async ({ page }) => {
    await stubApi(page, CONFIRMED_VERDICT);
    await page.goto('/verify');

    const panel = page.getByTestId('release-attestation').first();
    await expect(panel).toBeVisible({ timeout: 30_000 });

    await panel.getByTestId('verify-release-button').click();

    const badge = panel.getByTestId('proof-state-badge');
    await expect(badge).toContainText(/anchored to bitcoin/i, { timeout: 15_000 });
    await expect(panel.getByTestId('verify-method')).toHaveAttribute('data-method', 'bitcoind');
    await expect(panel.getByText(/967,273/)).toBeVisible();
    const ots = panel.getByTestId('release-ots-download');
    await expect(ots).toHaveAttribute('href', CONFIRMED_VERDICT.ots_download_url);
    await expect(panel.getByTestId('release-artifact')).toHaveAttribute(
      'href',
      /attestations\/katoa-trust-ui-v1\.txt$/
    );
  });

  test('forged hash renders "Not proven" and never a block', async ({ page }) => {
    // The live API answers unknown/forged hashes with HTTP 404 + a structured
    // body. That is a VERDICT (not-proven), never a transport error.
    await page.route('**/api/verify', async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ verified: false, error: 'Hash not found in registry.' }),
      });
    });
    await page.goto('/verify');

    const input = page.getByTestId('release-hash-input');
    await expect(input).toBeVisible({ timeout: 30_000 });
    await input.fill('0'.repeat(64));
    await page.getByTestId('release-hash-submit').click();

    const panel = page.getByTestId('release-attestation').first();
    await expect(panel.getByTestId('proof-state-badge')).toContainText(/not proven/i, {
      timeout: 15_000,
    });
    await expect(panel.getByTestId('how-proof-works')).toHaveAttribute('data-proof-state', 'not-proven');
    await expect(panel.getByTestId('verify-method')).toHaveCount(0);
  });

  test('deep link /verify/<hash> checks on load without a click', async ({ page }) => {
    await stubApi(page, CONFIRMED_VERDICT);
    await page.goto(`/verify/${RELEASE.hash}`);

    const panel = page.getByTestId('release-attestation').first();
    await expect(panel.getByTestId('proof-state-badge')).toContainText(/anchored to bitcoin/i, {
      timeout: 20_000,
    });
  });

  test('invalid input is called out, nothing is checked', async ({ page }) => {
    await page.goto('/verify');
    const input = page.getByTestId('release-hash-input');
    await expect(input).toBeVisible({ timeout: 30_000 });
    await input.fill('not-a-hash');
    await page.getByTestId('release-hash-submit').click();
    await expect(page.getByTestId('verify-hash-invalid')).toBeVisible();
    // The known-releases panel may still be present; the manual check must not be.
    await expect(page.getByTestId('release-attestation').filter({ hasText: 'Pasted hash' })).toHaveCount(0);
  });
});
