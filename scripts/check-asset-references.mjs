#!/usr/bin/env node
/**
 * scripts/check-asset-references.mjs — Katoa asset-reference guard (build gate)
 *
 * Phase 1 (default): scan src/** and index.html for absolute-path asset
 *   references and fail when the referenced file does not exist in public/.
 *   Also fails on dynamically-built local asset paths — template literals
 *   like `/images/mock/${hash}.jpeg` or concatenations like '/images/' + n +
 *   '.png' — whenever the static prefix directory exists under public/ (the
 *   only case that can 404 at runtime; CDN/S3 templates are ignored).
 *
 * Phase 2 (--dist): after `vite build` + prerender, validate every url()
 *   reference in dist/assets/*.css and every absolute asset reference in
 *   dist/*.html against dist/ — catching anything Tailwind or minification
 *   relocated after the source scan.
 *
 * Background: on 2026-09-22 FeeComparison.tsx referenced /pngwing.com.png, an
 * asset that was never committed. Cloudflare's SPA fallback served HTML with
 * HTTP 200 for the missing file, so the OnlyFans logo silently rendered broken
 * for every visitor while all deploy checks stayed green. This guard runs in
 * `npm run build` (local + GitHub Actions) to catch that class of bug before
 * anything deploys.
 *
 * A reference must open in code context (quote, paren, bracket, whitespace,
 * =, :, ,) so placeholder text like "https://…/preview.mp4" is not flagged.
 * Query strings and percent-encoded path segments are handled. Escapes:
 *   KATOA_ASSET_ALLOWLIST=/a.png,/b/c.svg   comma-separated public paths to skip
 */
import { existsSync, statSync, readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC_DIR = join(ROOT, 'public');
const DIST_DIR = join(ROOT, 'dist');
const SCAN_DIRS = ['src'];
const SCAN_FILES = ['index.html'];
const SCAN_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.css', '.html']);
const EXT_PATTERN = '(?:png|jpe?g|gif|webp|svg|avif|ico|bmp|mp4|webm|mp3|ogg|wav|m4a|woff2?|ttf)';
const ASSET_RE = new RegExp(
  `(?<=[\\s"'` + '`' + `([{=:,>])\\/(?:[A-Za-z0-9._~-]+\\/)*[A-Za-z0-9._~-]+\\.${EXT_PATTERN}(?:\\?[^\\s"'` + '`' + `)\\]]*)?`,
  'g',
);
// /existing/dir/${...}.ext  — local prefix dir + dynamic filename
const DYNAMIC_TEMPLATE_RE = new RegExp(
  '`\\/(?!\\/)((?:[A-Za-z0-9._~-]+\\/)+)\\$\\{[^`]*\\}\\.' + EXT_PATTERN + '`',
  'g',
);
// '/existing/dir/' + ... + '.ext'  — concatenation of a local prefix dir with a dynamic name
const DYNAMIC_CONCAT_RE = new RegExp(
  `["']\\/(?!\\/)((?:[A-Za-z0-9._~-]+\\/)+)["']\\s*\\+`,
  'g',
);
const CSS_URL_RE = new RegExp(`url\\(\\s*['"]?(\\/(?:[^)'"]+)\\.${EXT_PATTERN})[^)]*\\)`, 'g');
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

function listDistFiles() {
  const files = [];
  const assetsDir = join(DIST_DIR, 'assets');
  if (existsSync(assetsDir)) {
    for (const rel of readdirSync(assetsDir)) {
      if (rel.endsWith('.css')) files.push(join(assetsDir, rel));
    }
  }
  if (existsSync(DIST_DIR)) {
    for (const rel of readdirSync(DIST_DIR, { recursive: true })) {
      const full = join(DIST_DIR, rel);
      if (statSync(full, { throwIfNoEntry: false })?.isFile() && rel.endsWith('.html')) {
        files.push(full);
      }
    }
  }
  return files;
}

function existsIn(baseDir, refPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(refPath);
  } catch {
    return false; // malformed encoding — treat as missing
  }
  if (decoded.includes('..')) return false; // traversal is never a real asset
  const target = join(baseDir, decoded);
  return existsSync(target) && statSync(target).isFile();
}

function prefixIsPublicDir(prefixWithSlash) {
  // '/images/mock/' -> public/images/mock must exist as a directory
  const decoded = decodeURIComponent(prefixWithSlash);
  return existsSync(join(PUBLIC_DIR, decoded)) &&
    statSync(join(PUBLIC_DIR, decoded)).isDirectory();
}

// Same-file const prefixes: const base = '/images/mock/' + template `${base}${hash}.jpeg`
// (cross-file re-exports are out of scope — documented limitation).
const CONST_PREFIX_RE =
  /(?:const|let|var)\s+(\w+)\s*=\s*['"]\/(?!\/)((?:[A-Za-z0-9._~-]+\/)+)['"]/g;

function scanConstTemplates(lines, rel, add) {
  const prefixes = new Map();
  for (const line of lines) {
    for (const m of line.matchAll(CONST_PREFIX_RE)) {
      prefixes.set(m[1], m[2]);
    }
  }
  if (prefixes.size === 0) return;
  for (const line of lines) {
    const templateUse = line.matchAll(new RegExp('`[^`]*\\.(?:' + EXT_PATTERN + ')`', 'g'));
    for (const t of templateUse) {
      for (const [name, prefix] of prefixes) {
        const useRe = new RegExp(`\\$\\{${name}\\}`);
        if (useRe.test(t[0]) && prefixIsPublicDir(prefix)) {
          add(`builds a local public/ asset path from const ${name} (public/${prefix.replace(/\/$/, '')}/) with a dynamic filename — use a static path that exists in public/`);
        }
      }
    }
  }
}

const violations = [];

function scanSource() {
  let checked = 0;
  for (const file of listSourceFiles()) {
    const lines = readFileSync(file, 'utf8').split('\n');
    const rel = file.replace(`${ROOT}/`, '');
    scanConstTemplates(lines, rel, (msg) => {
      violations.push(`${rel} ${msg}`);
      checked += 1;
    });
    lines.forEach((line, i) => {
      for (const match of line.matchAll(ASSET_RE)) {
        const ref = match[0].split('?')[0];
        const publicPath = ref.replace(/^\//, '');
        checked += 1;
        if (!ALLOWLIST.has(publicPath) && !existsIn(PUBLIC_DIR, ref)) {
          violations.push(`${rel}:${i + 1} references ${ref} — no such file in public/`);
        }
      }
      for (const match of line.matchAll(DYNAMIC_TEMPLATE_RE)) {
        const prefix = match[1];
        checked += 1;
        if (prefixIsPublicDir(prefix)) {
          violations.push(
            `${rel}:${i + 1} builds ${match[0]} dynamically against public/${prefix.replace(/\/$/, '')}/ — the guard cannot verify the generated filename; use a static import or verify the name exists in public/`,
          );
        }
      }
      for (const match of line.matchAll(DYNAMIC_CONCAT_RE)) {
        const prefix = match[1];
        const tail = line.slice(match.index + match[0].length);
        if (!new RegExp(`\\.(${EXT_PATTERN})\\b`).test(tail)) continue; // not an asset chain
        checked += 1;
        if (prefixIsPublicDir(prefix)) {
          violations.push(
            `${rel}:${i + 1} concatenates ${match[1]} with a dynamic name for a public/ asset — use a static path that exists in public/`,
          );
        }
      }
    });
  }
  return checked;
}

function scanDist() {
  let checked = 0;
  for (const file of listDistFiles()) {
    const rel = file.replace(`${ROOT}/`, '');
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      const isCss = rel.endsWith('.css');
      const regex = isCss ? CSS_URL_RE : ASSET_RE;
      for (const match of line.matchAll(regex)) {
        // CSS_URL_RE captures the path in group 1; ASSET_RE's full match is the reference
        const ref = (isCss ? match[1] : match[0]).split('?')[0];
        const distPath = ref.replace(/^\//, '');
        checked += 1;
        if (!ALLOWLIST.has(distPath) && !existsIn(DIST_DIR, ref)) {
          violations.push(`${rel}:${i + 1} references ${ref} — no such file in dist/`);
        }
      }
    });
  }
  return checked;
}

const isDist = process.argv.includes('--dist');
const checked = isDist ? scanDist() : scanSource();

if (violations.length > 0) {
  console.error(`✗ asset-reference check FAILED (${isDist ? 'dist' : 'src'} phase): ${violations.length} problem(s):`);
  for (const v of violations) console.error(`  ${v}`);
  console.error('Fix: commit the asset into public/, correct/remove the reference, or use a static import.');
  console.error('Escape hatch (use sparingly): KATOA_ASSET_ALLOWLIST=<paths> node scripts/check-asset-references.mjs');
  process.exit(1);
}
console.log(
  `asset-reference check passed (${isDist ? 'dist' : 'src'} phase): ${checked} reference(s) verified`,
);
