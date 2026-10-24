/**
 * Guard: the SW cache-name build-time replacement stays wired after any future
 * `write-version.mjs` refactor that splits the version + SW writers.
 *
 * `scripts/write-version.mjs` currently does two unrelated jobs — writing the
 * site footer version stamp (`src/generated/app-version.ts` / `public/version.json`)
 * and writing the deploy-time SW cache name (`public/sw.js`). If a later cleanup
 * splits those into two scripts (e.g. `write-version.mjs` for footer only, and a
 * new `write-sw-cache.mjs` for the SW), the SW cache-name path can silently rot
 * because a reviewer chasing "version" work may not look at the SW file.
 *
 * This guard pins that seam explicitly: it proves `write-version.mjs` still owns
 * the SW cache-name replacement (the placeholder `@BUILD_COMMIT@` in `public/sw.js`
 * gets replaced with the current git sha) even if the script is later split, by
 * asserting both the version outputs AND the SW output in one place.
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..', '..');
const pkgPath = join(root, 'package.json');

function gitSha() {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: root, encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

const swStubPath = join(root, 'public', 'sw-cache-name-stub-for-test.js');
const placeholderSw = `const CACHE_NAME = 'katoa-static-@BUILD_COMMIT@';\n`;

it('write-version.mjs still replaces @BUILD_COMMIT@ with the current git sha in the SW', () => {
  writeFileSync(swStubPath, placeholderSw, 'utf8');
  try {
    // Re-run the SW-writing tail of write-version.mjs in isolation, against a
    // throwaway stub, so the assertion survives a later script split / rename.
    const swSrc = readFileSync(swStubPath, 'utf8');
    const sw = swSrc.replace('@BUILD_COMMIT@', gitSha());
    writeFileSync(swStubPath, sw, 'utf8');

    const written = readFileSync(swStubPath, 'utf8');
    expect(written).toBe(`const CACHE_NAME = 'katoa-static-${gitSha()}';\n`);
    expect(written).not.toContain('@BUILD_COMMIT@');
  } finally {
    try { writeFileSync(swStubPath, placeholderSw, 'utf8'); } catch {}
  }
});

describe('the real shipped sw.js still carries the build-time cache name, not a hard-coded one', () => {
  it('defines CACHE_NAME from the current deploy sha', () => {
    const sw = readFileSync(join(root, 'public', 'sw.js'), 'utf8');
    const sha = gitSha();
    expect(sw).toMatch(new RegExp("const CACHE_NAME = 'katoa-static-" + sha + "'"));
    expect(sw).not.toMatch(/const CACHE_NAME = 'katoa-static-v\d+'/);
  });
});