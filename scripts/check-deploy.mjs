#!/usr/bin/env node
/**
 * scripts/check-deploy.mjs — Katoa deploy watchdog (local/one-shot)
 *
 * Compares the gitSha reported by https://katoa.org/version.json against the
 * local origin/main tip. Exits 1 if production is behind, so it can gate a
 * terminal, a cron, or a THOR pulse.
 *
 * Usage:
 *   node scripts/check-deploy.mjs            # compare against origin/main tip
 *   node scripts/check-deploy.mjs <fullSha>  # compare against an explicit SHA
 *   KATOA_POLL_MINUTES=20 node scripts/check-deploy.mjs   # poll up to N minutes
 *
 * Background: on 2026-09-21 a Cloudflare build sat stuck for 27+ minutes while
 * the next commit queued; production kept serving an older-but-healthy page,
 * so asset-level checks passed. Only the version.json gitSha catches this.
 */
const { execSync } = await import('node:child_process');
const PROD = process.env.KATOA_PROD_URL || 'https://katoa.org';
const POLL_MINUTES = Number(process.env.KATOA_POLL_MINUTES || '0'); // 0 = single shot

function expectedSha() {
  const arg = process.argv[2];
  if (arg) return arg.slice(0, 7);
  return execSync('git rev-parse --short origin/main', { encoding: 'utf8' }).trim();
}

async function prodSha() {
  const res = await fetch(`${PROD}/version.json?cb=${Date.now()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`version.json -> HTTP ${res.status}`);
  const json = await res.json();
  return String(json.gitSha || '');
}

async function main() {
  const expected = expectedSha();
  const deadline = Date.now() + POLL_MINUTES * 60_000;
  for (;;) {
    try {
      const actual = await prodSha();
      if (actual === expected) {
        console.log(`OK: ${PROD} serves ${actual} (matches origin/main)`);
        return 0;
      }
      console.log(`BEHIND: ${PROD} serves ${actual || '<none>'}, expected ${expected}`);
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
    }
    if (Date.now() >= deadline) {
      console.error(`FAIL: ${PROD} did not serve ${expected} within the polling window.`);
      console.error('Fix: cancel the stuck build in the Cloudflare Pages dashboard, then redeploy.');
      return 1;
    }
    await new Promise((r) => setTimeout(r, 15_000));
  }
}

process.exit(await main());
