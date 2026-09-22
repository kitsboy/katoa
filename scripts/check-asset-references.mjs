#!/usr/bin/env node
/**
 * scripts/check-asset-references.mjs — Katoa asset-reference guard (build gate)
 *
 * Fails the build when src/ code references public/ assets that do not exist.
 *
 * Background: on 2026-09-22 FeeComparison.tsx referenced /pngwing.com.png, an
 * asset that was never committed. Cloudflare's SPA fallback served HTML with
 * HTTP 200 for the missing file, so the OnlyFans logo silently rendered broken
 * for every visitor while all deploy checks stayed green. This guard runs at
 * the start of `npm run build` (local + GitHub Actions) to catch that class of
 * bug before anything deploys.
 *
 * Scope: absolute-path asset references (src="/x.png", url(/x.webp), '/f.mp4')
 * in src/** and index.html for common binary/asset extensions. A reference
 * must open in code context (quote, paren, bracket, whitespace, =, :, ,) —
 * so placeholder text like "https://…/preview.mp4" and template-literal
 * tails like `${cdn}/logo.png` are not flagged. Query strings and
 * percent-encoded path segments are handled. Escapes:
 *   KATOA_ASSET_ALLOWLIST=/a.png,/b/c.svg   comma-separated paths to skip
 */
import { existsSync, statSync, readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC_DIR = join(ROOT, 'public');
const SCAN_DIRS = ['src'];
const SCAN_FILES = ['index.html'];
const SCAN_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.css', '.html']);
const ASSET_RE =
  /(?<=[\s"'`([{=:,>])\/(?:[A-Za-z0-9._~-]+\/)*[A-Za-z0-9._~-]+\.(?:png|jpe?g|gif|webp|svg|avif|ico|bmp|mp4|webm|mp3|ogg|wav|m4a|woff2?|ttf)(?:\?[^\s"'`)\]]*)?/g;
const ALLOWLIST = new Set(
  (process.env.KATOA_ASSET_ALLOWLIST || '')
    .split(',')
    .map((s) => s.trim().replace(/^\//, ''))
    .filter(Boolean),
);

function listSourceFiles() {
  const files = [];
  for (const dir of SCAN_DIRS) {
    const base = join(ROOT, dir);
    for (const rel of readdirSync(base, { recursive: true })) {
      files.push(join(base, rel));
    }
  }
  for (const rel of SCAN_FILES) files.push(join(ROOT, rel));
  return files.filter(
    (f) => statSync(f, { throwIfNoEntry: false })?.isFile() && SCAN_EXT.has(f.slice(f.lastIndexOf('.'))),
  );
}

function assetExists(refPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(refPath);
  } catch {
    return false; // malformed encoding — treat as missing
  }
  if (decoded.includes('..')) return false; // traversal is never a real asset
  const target = join(PUBLIC_DIR, decoded);
  return existsSync(target) && statSync(target).isFile();
}

const violations = [];
let checked = 0;
for (const file of listSourceFiles()) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    for (const match of line.matchAll(ASSET_RE)) {
      const ref = match[0].split('?')[0];
      const publicPath = ref.replace(/^\//, '');
      checked += 1;
      if (!ALLOWLIST.has(publicPath) && !assetExists(ref)) {
        violations.push({ file: file.replace(`${ROOT}/`, ''), line: i + 1, ref });
      }
    }
  });
}

if (violations.length > 0) {
  console.error(`✗ asset-reference check FAILED: ${violations.length} missing asset(s):`);
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line} references ${v.ref} — no such file in public/`);
  }
  console.error('Fix: commit the asset into public/, or correct/remove the reference.');
  console.error('Escape hatch (use sparingly): KATOA_ASSET_ALLOWLIST=<paths> node scripts/check-asset-references.mjs');
  process.exit(1);
}
console.log(`asset-reference check passed: ${checked} asset reference(s) verified against public/`);
