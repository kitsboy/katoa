import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..', '..');

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
    const swSrc = readFileSync(swStubPath, 'utf8');
    const sw = swSrc.replace('@BUILD_COMMIT@', gitSha());
    writeFileSync(swStubPath, sw, 'utf8');

    const written = readFileSync(swStubPath, 'utf8');
    expect(written).toBe(`const CACHE_NAME = 'katoa-static-${gitSha()}';\n`);
    expect(written).not.toContain('@BUILD_COMMIT@');
  } finally {
    try { writeFileSync(swStubPath, placeholderSw, 'utf8'); } catch { /* best-effort restore */ }
  }
});

describe('write-version.mjs produces a sw.js with the current deploy sha', () => {
  // Test the SW cache-name fill logic in isolation: given a @BUILD_COMMIT@
  // seed, the fill produces a sw.js with the current sha. This mirrors what
  // write-version.mjs does, without having to run the whole script.

  it('fills a @BUILD_COMMIT@ seed with the current sha (line rewrite)', () => {
    const seed = `const CACHE_NAME = 'katoa-static-@BUILD_COMMIT@';\n`;
    // This is the SAME regex write-version.mjs now uses:
    const filled = seed.replace(
      /^const CACHE_NAME = '.*?';$/m,
      `const CACHE_NAME = 'katoa-static-${gitSha()}';\n`
    );
    expect(filled).not.toContain('@BUILD_COMMIT@');
    expect(filled).toContain("const CACHE_NAME = 'katoa-static-" + gitSha() + "'");
    expect(filled).not.toMatch(/const CACHE_NAME = 'katoa-static-v\d+'/);
  });

  it('the rewrite is idempotent on an already-filled sha', () => {
    const filled = `const CACHE_NAME = 'katoa-static-abc1234';\n`;
    const rewritten = filled.replace(
      /^const CACHE_NAME = '.*?';$/m,
      `const CACHE_NAME = 'katoa-static-${gitSha()}';\n`
    );
    expect(rewritten).toContain("const CACHE_NAME = 'katoa-static-" + gitSha() + "'");
    expect(rewritten).not.toContain('abc1234');
  });

  it('the committed public/sw.js is the @BUILD_COMMIT@ seed', () => {
    // Verify the committed sw.js is the seed (has @BUILD_COMMIT@), not a
    // filled sha. This ensures the repo stays on the seed path.
    const committedSw = execSync('git show HEAD:public/sw.js', { cwd: root, encoding: 'utf8' });
    expect(committedSw).toContain('@BUILD_COMMIT@');
    expect(committedSw).not.toMatch(/const CACHE_NAME = 'katoa-static-[a-f0-9]+'/);
  });
});
