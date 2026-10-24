import { describe, expect, it } from 'vitest';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const ROOT = process.cwd();
const sw = readFileSync('public/sw.js', 'utf8');
const actualSha = (() => {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
})();

const cacheNameLine = /^\s*const CACHE_NAME\s*=\s*['"]([^'"]+)['"];/m;
const match = sw.match(cacheNameLine);

describe('SW CACHE_NAME stamp', () => {
  it('defines CACHE_NAME as katoa-static-<git-sha>', () => {
    expect(match).toBeTruthy();
    expect(match?.[1]).toBe(`katoa-static-${actualSha}`);
  });

  it('does not leave the build-time placeholder in the file', () => {
    expect(sw).not.toContain('@BUILD_COMMIT@');
  });
});
