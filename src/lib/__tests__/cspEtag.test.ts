/**
 * Guard: no route serves a JS chunk with a long-lived immutable cache tag.
 *
 * Cloudflare Pages serves static assets with a fingerprinted URL and an
 * `immutable` Cache-Control policy automatically. That works for new versions
 * of the same chunk because the URL changes on every deploy. The risk is only
 * a manual, deliberate choice to serve the *same* chunk with a long-lived
 * `immutable` value by hand — which no current route does. This guard pinpoints
 * that exact class of mistake so someone cannot re-enable it by writing
 * `Cache-Control: public, max-age=31536000, immutable` on a *.js line and
 * forget about it.
 */
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

const HEADERS = readFileSync('public/_headers', 'utf8');
const lines = HEADERS
  .split('\n')
  .filter((line) => line.trim().startsWith('Cache-Control'))
  .map((line) => line.trim());

it('does not pin any JS chunk with a long-lived immutable etag', () => {
  const offending = lines.filter((line) => {
    // Pattern: exactly the manual, long-lived, immutable policy on a JS asset.
    // normal static assets already use this pattern, but they live in the dist
    // and are not declared here by hand.
    return /(?:assets\/)?[a-zA-Z0-9-]+\.js/.test(line) &&
      line.includes(', max-age=31536000') &&
      line.includes('immutable');
  });
  expect(offending, offending.join('\n')).toEqual([]);
});
