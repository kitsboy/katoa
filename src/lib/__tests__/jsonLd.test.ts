import { describe, expect, it } from 'vitest';
import { breadcrumbList, toJsonLdScript } from '../jsonLd';

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

describe('breadcrumbList', () => {
  it('builds BreadcrumbList with 1-based positions', () => {
    const schema = breadcrumbList([
      { name: 'Home', item: '/' },
      { name: 'FAQ', item: '/faq' },
    ]);
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('BreadcrumbList');
    expect(schema.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://katoa.org/' },
      { '@type': 'ListItem', position: 2, name: 'FAQ', item: 'https://katoa.org/faq' },
    ]);
  });

  it('preserves absolute item URLs', () => {
    const schema = breadcrumbList([{ name: 'Home', item: 'https://example.com/' }]);
    expect(schema.itemListElement[0].item).toBe('https://example.com/');
  });

  it('escapes < in names when serialized for a script tag', () => {
    const out = toJsonLdScript(breadcrumbList([{ name: 'A <script>', item: '/x' }]));
    expect(out).not.toContain('<script');
    expect(out).toContain('\\u003c');
  });
});
