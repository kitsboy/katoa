#!/usr/bin/env node
/**
 * scripts/fill-dist-artifacts.mjs — Katoa post-vite artifact fill
 *
 * Reads the committed public/ seeds, fills the real build stamps (git sha,
 * timestamps), and writes the shipped copies into dist/. Must run AFTER
 * `vite build` (vite copies public -> dist first, so these writes win).
 *
 * The tracked seeds never mutate:
 *   public/sw.js        -> dist/sw.js        (CACHE_NAME filled with git sha)
 *   public/version.json -> dist/version.json (full metadata for this build)
 *   public/metrics.json -> dist/metrics.json (regenerated via generate-metrics)
 *   public/feed.xml     -> dist/feed.xml     (regenerated via build-rss)
 *   public/sitemap.xml  -> dist/sitemap.xml  (regenerated via generate-sitemap)
 */
import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getVersionInfo } from './version-util.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dist = join(root, 'dist');
const publicDir = join(root, 'public');

const { version, gitSha, gitCount, builtAt, buildId, label, fullLabel } = getVersionInfo(root);

mkdirSync(dist, { recursive: true });

// 1) dist/sw.js — fill the @BUILD_COMMIT@ placeholder from the committed seed.
//    Line-level rewrite (not a bare placeholder replace) so an already-filled
//    seed from a previous run is still refreshed with the current sha.
const swSeed = readFileSync(join(publicDir, 'sw.js'), 'utf8');
const sw = swSeed.replace(
  /^const CACHE_NAME = '.*?';\n/,
  `const CACHE_NAME = 'katoa-static-${gitSha}';\n`
);
writeFileSync(join(dist, 'sw.js'), sw, 'utf8');

// 2) dist/version.json — full version metadata for this build.
writeFileSync(
  join(dist, 'version.json'),
  JSON.stringify(
    {
      name: 'katoa',
      version,
      label,
      fullLabel,
      buildId: String(buildId),
      gitSha,
      commitCount: gitCount,
      builtAt,
    },
    null,
    2
  ) + '\n',
  'utf8'
);

// 3-5) Regenerate the timestamped artifacts straight into dist/. Each
//     generator defaults to dist/ and never touches public/.
const run = (cmd) => execSync(cmd, { cwd: root, stdio: 'inherit', encoding: 'utf8' });
run('npx tsx scripts/generate-metrics.ts --out dist');
run('node scripts/build-rss.mjs --out dist');
run('node scripts/generate-sitemap.mjs --out dist');

console.log(
  `fill-dist-artifacts: sw katoa-static-${gitSha}  version ${fullLabel}  metrics/feed/sitemap refreshed`
);
