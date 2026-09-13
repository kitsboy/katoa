#!/usr/bin/env node
/**
 * Warm the legal/trust route chunks so a cold direct load resolves them fast.
 *
 * Same root cause as tadbuy (verified live 2026-09-13): the legal pages
 * (TermsPage/PrivacyPage) are React.lazy() and NOT modulepreloaded. Katoa DOES
 * prerender static HTML for them, but on a real user's browser React's
 * createRoot().render() wipes the prerendered #root on hydration and shows the
 * app shell until the lazy legal chunk downloads+compiles — a 380-word shell
 * flash (h1=None) before the full policy paints ~1-3s later.
 *
 * Fix: inject <link rel="modulepreload"> for the legal chunks into dist/index.html
 * after build so the browser fetches AND compiles them in parallel with the main
 * bundle. When React mounts and fires the lazy import(), the module is already in
 * the module map — the route resolves immediately, no post-boot cold fetch.
 *
 * Run after `vite build` (see package.json "build": ... && node scripts/warm-legal-chunks.mjs).
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dist = join(process.cwd(), 'dist');
const assets = join(dist, 'assets');
const indexPath = join(dist, 'index.html');

// Legal/trust route chunks + shared page-meta dep. These are the pages the
// family actually gets audited on — warm them always.
const WARM_PATTERNS = [/^TermsPage-/, /^PrivacyPage-/, /^usePageMeta-/, /^ThankYouPage-/, /^TrustCenter-/];

if (!existsSync(assets) || !existsSync(indexPath)) {
  console.error('warm-legal-chunks: dist/assets or dist/index.html missing — run vite build first');
  process.exit(1);
}

const files = readdirSync(assets).filter((f) => f.endsWith('.js'));
const warm = files.filter((f) => WARM_PATTERNS.some((re) => re.test(f)));

if (warm.length === 0) {
  console.error('warm-legal-chunks: no legal/trust chunks found in dist/assets');
  process.exit(1);
}

let html = readFileSync(indexPath, 'utf8');

const links = warm
  .map((f) => `<link rel="modulepreload" crossorigin href="/assets/${f}">`)
  .join('\n    ');

const entryIdx = html.lastIndexOf('<script type="module"');
if (entryIdx === -1) {
  console.error('warm-legal-chunks: could not find entry <script type="module"> in index.html');
  process.exit(1);
}

const alreadyWarmed = warm.every((f) => html.includes(`href="/assets/${f}"`));
if (alreadyWarmed) {
  console.log(`warm-legal-chunks: already warmed (${warm.length} chunks) — nothing to do`);
  process.exit(0);
}

html = html.slice(0, entryIdx) + links + '\n    ' + html.slice(entryIdx);
writeFileSync(indexPath, html);

console.log(`warm-legal-chunks: preloaded ${warm.length} chunks into index.html:`);
for (const f of warm) console.log(`  /assets/${f}`);
