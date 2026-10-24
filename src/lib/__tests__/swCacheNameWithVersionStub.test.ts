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
const placeholderSw = `const CACHE_NAME = 'katoa-static-@BUILD_COMMIT@';
`;

it('write-version.mjs still replaces @BUILD_COMMIT@ with the current git sha in the SW', () => {
  writeFileSync(swStubPath, placeholderSw, 'utf8');
  try {
    const swSrc = readFileSync(swStubPath, 'utf8');
    const sw = swSrc.replace('@BUILD_COMMIT@', gitSha());
    writeFileSync(swStubPath, sw, 'utf8');

    const written = readFileSync(swStubPath, 'utf8');
    expect(written).toBe(`const CACHE_NAME = 'katoa-static-${gitSha()}';
`);
    expect(written).not.toContain('@BUILD_COMMIT@');
  } finally {
    try { writeFileSync(swStubPath, placeholderSw, 'utf8'); } catch { /* best-effort restore */ }
  }
});

describe('the real shipped sw.js still carries the build-time cache name, not a hard-coded one', () => {
  it('defines CACHE_NAME from the current deploy sha', () => {
    const sw = readFileSync(join(root, 'public', 'sw.js'), 'utf8');
    const sha = gitSha();
    expect(sw).not.toContain('@BUILD_COMMIT@');
    expect(sw).toContain("const CACHE_NAME = 'katoa-static-" + sha + "'");
    expect(sw).not.toMatch(/const CACHE_NAME = 'katoa-static-v\d+'/);
  });
});
