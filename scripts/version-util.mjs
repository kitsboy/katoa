/**
 * Shared build-version helpers used by scripts/write-version.mjs (compile-time
 * app-version.ts) and scripts/fill-dist-artifacts.mjs (post-vite dist copies).
 *
 * The tracked public/ seeds NEVER mutate: build-stamped artifacts are written
 * to dist/ only (see scripts/fill-dist-artifacts.mjs).
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export function bumpPatch(version) {
  const parts = String(version || '0.0.0').split('.').map((n) => parseInt(n, 10) || 0);
  while (parts.length < 3) parts.push(0);
  parts[2] += 1;
  return parts.slice(0, 3).join('.');
}

/**
 * Version facts for the current tree. Mirrors the original write-version.mjs
 * semantics: label is v{version}; buildId is run.{GITHUB_RUN_NUMBER} on CI,
 * else CF_PAGES_COMMIT_SHA (7 chars) when set, else {commitCount}.{shortSha}.
 * KATOA_VERSION_OVERRIDE wins over package.json version.
 */
export function getVersionInfo(root) {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const version = process.env.KATOA_VERSION_OVERRIDE || pkg.version || '1.0.0';

  let gitSha = 'unknown';
  let gitCount = '0';
  try {
    gitSha = execSync('git rev-parse --short HEAD', { cwd: root, encoding: 'utf8' }).trim();
  } catch {
    /* ignore */
  }
  try {
    gitCount = execSync('git rev-list --count HEAD', { cwd: root, encoding: 'utf8' }).trim();
  } catch {
    /* ignore */
  }

  const builtAt = new Date().toISOString();
  const runNumber = process.env.GITHUB_RUN_NUMBER || '';
  const buildId = runNumber
    ? `run.${runNumber}`
    : process.env.CF_PAGES_COMMIT_SHA?.slice(0, 7) || `${gitCount}.${gitSha}`;

  const label = `v${version}`;
  // Unique every deploy: semver + build id (commit count / GH run)
  const fullLabel = `${label}+${buildId}`;

  return { pkg, version, gitSha, gitCount, builtAt, runNumber, buildId, label, fullLabel };
}
