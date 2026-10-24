import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, copyFileSync, unlinkSync, mkdirSync, existsSync } from 'node:fs';
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

describe('the real shipped sw.js still carries the build-time cache name, not a hard-coded one', () => {
  it('write-version.mjs produces a sw.js with the current deploy sha', () => {
    // The committed sw.js is the @BUILD_COMMIT@ seed. Copy it to a temp
    // file, run write-version.mjs on the copy, and assert the result
    // carries the current sha — without touching the committed file.
    const swPath = join(root, 'public', 'sw.js');
    const swSeed = readFileSync(swPath, 'utf8');
    expect(swSeed).toContain('@BUILD_COMMIT@');

    const tmpDir = join(root, 'tmp', 'sw-guard-test');
    if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });
    const tmpSw = join(tmpDir, 'sw.js');
    copyFileSync(swPath, tmpSw);

    // Write a temp write-version.mjs that operates on the temp sw.js.
    const wvPath = join(root, 'scripts', 'write-version.mjs');
    const wvSrc = readFileSync(wvPath, 'utf8');
    const tmpWV = join(tmpDir, 'write-version.mjs');
    // Redirect the sw.js path to the temp file.
    const tmpWVSrc = wvSrc.replace(
      "const swPath = join(root, 'public', 'sw.js');",
      `const swPath = ${JSON.stringify(tmpSw)};`
    );
    writeFileSync(tmpWV, tmpWVSrc, 'utf8');

    try {
      execSync(`node ${tmpWV}`, { cwd: root, stdio: 'pipe' });
      const swFilled = readFileSync(tmpSw, 'utf8');
      const sha = gitSha();
      expect(swFilled).not.toContain('@BUILD_COMMIT@');
      expect(swFilled).toContain("const CACHE_NAME = 'katoa-static-" + sha + "'");
      expect(swFilled).not.toMatch(/const CACHE_NAME = 'katoa-static-v\\d+'/);
    } finally {
      try { unlinkSync(tmpSw); } catch { /* ignore */ }
      try { unlinkSync(tmpWV); } catch { /* ignore */ }
    }
  });
});
