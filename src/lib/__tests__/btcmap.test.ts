import { describe, expect, it } from 'vitest';
import {
  BTCMAP_POPUP_STRINGS_EN,
  buildMapViewQuery,
  buildMerchantPopupHtml,
  escapeMapPopupText,
  LEAFLET_BASEMAP_URL,
  materialIconGlyph,
  merchantCategoryFor,
  parseMapViewParams,
  sanitizeImageUrl,
  zoomToRadiusKm,
} from '../btcmap';

describe('escapeMapPopupText', () => {
  it('escapes HTML special characters', () => {
    expect(escapeMapPopupText('Tom & Jerry <shop> "best"')).toBe(
      'Tom &amp; Jerry &lt;shop&gt; &quot;best&quot;'
    );
  });

  it('returns plain text unchanged', () => {
    expect(escapeMapPopupText('Bitcoin Coffee')).toBe('Bitcoin Coffee');
  });
});

describe('zoomToRadiusKm', () => {
  it('returns 8 km at zoom 16+', () => {
    expect(zoomToRadiusKm(16)).toBe(8);
    expect(zoomToRadiusKm(18)).toBe(8);
  });

  it('returns 25 km at zoom 14-15', () => {
    expect(zoomToRadiusKm(14)).toBe(25);
    expect(zoomToRadiusKm(15)).toBe(25);
  });

  it('returns 75 km at zoom 12-13', () => {
    expect(zoomToRadiusKm(12)).toBe(75);
    expect(zoomToRadiusKm(13)).toBe(75);
  });

  it('returns 200 km at zoom 10-11', () => {
    expect(zoomToRadiusKm(10)).toBe(200);
    expect(zoomToRadiusKm(11)).toBe(200);
  });

  it('returns 500 km below zoom 10', () => {
    expect(zoomToRadiusKm(9)).toBe(500);
    expect(zoomToRadiusKm(2)).toBe(500);
  });
});

describe('LEAFLET_BASEMAP_URL', () => {
  it('uses a working raster provider (not broken openfreemap /osm/*.png)', () => {
    expect(LEAFLET_BASEMAP_URL).not.toMatch(/tiles\.openfreemap\.org\/osm/);
    expect(LEAFLET_BASEMAP_URL).toMatch(/\{z\}.*\{x\}.*\{y\}/);
  });
});

describe('materialIconGlyph', () => {
  it('maps known Material icon ids to emoji', () => {
    expect(materialIconGlyph('local_cafe')).toBe('☕');
    expect(materialIconGlyph('restaurant')).toBe('🍽');
  });

  it('defaults unknown icons to bitcoin symbol', () => {
    expect(materialIconGlyph('not_a_real_icon')).toBe('₿');
    expect(materialIconGlyph(undefined)).toBe('₿');
  });
});

describe('buildMerchantPopupHtml', () => {
  it('includes name, phone, hours and btcmap link', () => {
    const html = buildMerchantPopupHtml({
      id: 42,
      name: 'Cafe & Co',
      lat: 1,
      lon: 2,
      phone: '+123',
      opening_hours: 'Mo-Fr 09:00',
      comments: 3,
      verified_at: '2025-01-02T00:00:00Z',
    });
    expect(html).toContain('Cafe &amp; Co');
    expect(html).toContain('tel:+123');
    expect(html).toContain('Hours:');
    expect(html).toContain('3 comments');
    expect(html).toContain('/place/42');
  });

  it('uses English defaults when no strings are provided', () => {
    const html = buildMerchantPopupHtml({
      id: 1,
      name: 'Default',
      lat: 0,
      lon: 0,
      website: 'https://example.com',
    });
    expect(html).toContain('BTC Map merchant');
    expect(html).toContain('Website →');
    expect(html).toContain('View on BTC Map →');
  });

  it('uses localized strings when provided', () => {
    const html = buildMerchantPopupHtml(
      {
        id: 1,
        name: 'Cafe',
        lat: 0,
        lon: 0,
        opening_hours: 'Mo-Fr',
        comments: 1,
      },
      {
        strings: {
          merchant: 'Comercio BTC Map',
          hours: 'Horario',
          comment: (n) => `${n} comentario`,
        },
      }
    );
    expect(html).toContain('Comercio BTC Map');
    expect(html).toContain('Horario:');
    expect(html).toContain('1 comentario');
    expect(html).not.toContain('BTC Map merchant');
  });

  it('shows boosted badge when boosted', () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    const html = buildMerchantPopupHtml({
      id: 7,
      name: 'Boosted Cafe',
      lat: 0,
      lon: 0,
      boosted_until: future,
    });
    expect(html).toContain('Boosted');
  });

  it('exposes English comment helper', () => {
    expect(BTCMAP_POPUP_STRINGS_EN.comment(1)).toBe('1 comment');
    expect(BTCMAP_POPUP_STRINGS_EN.comment(3)).toBe('3 comments');
  });
});

describe('parseMapViewParams', () => {
  it('parses valid lat/lon/zoom/place', () => {
    expect(parseMapViewParams('?lat=4.60&lon=-74.08&zoom=13&place=42')).toEqual({
      lat: 4.6,
      lon: -74.08,
      zoom: 13,
      place: 42,
    });
  });

  it('ignores invalid or out-of-range values', () => {
    expect(parseMapViewParams('?lat=999&lon=abc&zoom=99&place=0')).toEqual({});
    expect(parseMapViewParams('?lat=-91')).toEqual({});
  });

  it('returns empty object for empty query', () => {
    expect(parseMapViewParams('')).toEqual({});
  });
});

describe('buildMapViewQuery', () => {
  it('serializes lat/lon/zoom to fixed precision', () => {
    expect(buildMapViewQuery({ lat: 4.6, lon: -74.08, zoom: 13 })).toBe(
      'lat=4.60000&lon=-74.08000&zoom=13'
    );
  });

  it('includes place when provided', () => {
    expect(buildMapViewQuery({ lat: 1, lon: 2, zoom: 15, place: 42 })).toContain('place=42');
  });
});

describe('merchantCategoryFor', () => {
  it('maps known icons to categories', () => {
    expect(merchantCategoryFor('local_cafe')).toBe('food');
    expect(merchantCategoryFor('store')).toBe('shopping');
    expect(merchantCategoryFor('hotel')).toBe('stay');
    expect(merchantCategoryFor('spa')).toBe('services');
    expect(merchantCategoryFor('museum')).toBe('fun');
    expect(merchantCategoryFor('flight')).toBe('travel');
  });

  it('returns other for unknown or missing icons', () => {
    expect(merchantCategoryFor('not_real')).toBe('other');
    expect(merchantCategoryFor(undefined)).toBe('other');
    expect(merchantCategoryFor(null)).toBe('other');
  });
});

describe('sanitizeImageUrl', () => {
  it('allows http(s) urls', () => {
    expect(sanitizeImageUrl('https://cdn.example.com/a.png')).toBe('https://cdn.example.com/a.png');
    expect(sanitizeImageUrl('http://example.com/b.jpg')).toBe('http://example.com/b.jpg');
  });

  it('rejects javascript:, data:, and empty values', () => {
    expect(sanitizeImageUrl('javascript:alert(1)')).toBeNull();
    expect(sanitizeImageUrl('data:image/png;base64,AAA')).toBeNull();
    expect(sanitizeImageUrl('')).toBeNull();
    expect(sanitizeImageUrl(null)).toBeNull();
    expect(sanitizeImageUrl(undefined)).toBeNull();
  });
});