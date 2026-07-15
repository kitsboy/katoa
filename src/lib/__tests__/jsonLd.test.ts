import { describe, expect, it } from 'vitest';
import { toJsonLdScript } from '../jsonLd';

describe('toJsonLdScript', () => {
  it('escapes < to prevent script breakouts', () => {
    const out = toJsonLdScript({ html: '<script>alert(1)</script>' });
    expect(out).not.toContain('<script');
    expect(out).toContain('\\u003c');
  });

  it('serializes nested objects', () => {
    const out = toJsonLdScript({ '@type': 'WebSite', name: 'KATOA' });
    expect(JSON.parse(out)).toEqual({ '@type': 'WebSite', name: 'KATOA' });
  });
});