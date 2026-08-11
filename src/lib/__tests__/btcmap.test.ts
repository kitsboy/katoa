import { describe, expect, it } from 'vitest';
import {
  escapeMapPopupText,
  LEAFLET_BASEMAP_URL,
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