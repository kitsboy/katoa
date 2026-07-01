/**
 * BTC Map integration layer (staged — connections wired when API keys are live).
 * @see https://github.com/teambtcmap/btcmap.org
 * @see https://github.com/teambtcmap/btcmap-api
 * @see https://gitea.btcmap.org/teambtcmap/btcmap-general/wiki/API-Overview
 */

export const BTCMAP_ATTRIBUTION =
  'Map data © BTC Map · OpenStreetMap contributors · OpenFreeMap';

const PRODUCTION_API = 'https://api.btcmap.org';
const PRODUCTION_APP = 'https://btcmap.org';

export interface BTCMapCoordinates {
  latitude: number;
  longitude: number;
  zoom?: number;
}

export interface BTCMapArea {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  merchant_count?: number;
}

export interface KatoaMapPin {
  id: string;
  title: string;
  slug: string;
  latitude: number;
  longitude: number;
  total_sats_raised: number;
  cover_image?: string | null;
}

function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_BTCMAP_API_URL;
  if (configured) return configured;
  // Dev: route through Vite proxy to avoid CORS (see vite.config.ts)
  if (import.meta.env.DEV) return '/btcmap-api-proxy';
  return PRODUCTION_API;
}

function getAppBaseUrl(): string {
  return import.meta.env.VITE_BTCMAP_APP_URL || PRODUCTION_APP;
}

/** Build embed URL for btcmap.org map view (ready for wiki embed params). */
export function buildBTCMapEmbedUrl(coords?: Partial<BTCMapCoordinates>): string {
  const base = getAppBaseUrl();
  const params = new URLSearchParams();

  if (coords?.latitude !== undefined) params.set('lat', String(coords.latitude));
  if (coords?.longitude !== undefined) params.set('lon', String(coords.longitude));
  if (coords?.zoom !== undefined) params.set('zoom', String(coords.zoom));

  const query = params.toString();
  return query ? `${base}/map?${query}` : `${base}/map`;
}

/** Staged: fetch areas from btcmap-api v2 (requires live API / proxy). */
export async function fetchBTCMapAreas(): Promise<BTCMapArea[]> {
  const base = getApiBaseUrl();
  const response = await fetch(`${base}/v2/areas`, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`BTC Map API error: ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : data.areas ?? [];
}

/** Staged: merge Katoa wishlist pins with BTC Map for future overlay layer. */
export function mergeKatoaPinsWithMap(
  wishlists: KatoaMapPin[],
  center?: BTCMapCoordinates
): { pins: KatoaMapPin[]; mapCenter: BTCMapCoordinates } {
  const withCoords = wishlists.filter((w) => w.latitude && w.longitude);

  if (withCoords.length === 0) {
    return {
      pins: [],
      mapCenter: center ?? { latitude: 20, longitude: 0, zoom: 2 },
    };
  }

  const avgLat = withCoords.reduce((s, w) => s + w.latitude, 0) / withCoords.length;
  const avgLon = withCoords.reduce((s, w) => s + w.longitude, 0) / withCoords.length;

  return {
    pins: withCoords,
    mapCenter: center ?? {
      latitude: avgLat,
      longitude: avgLon,
      zoom: withCoords.length === 1 ? 12 : 4,
    },
  };
}

/** Feature flag — flip when btcmap-api proxy is configured in production. */
export function isBTCMapEnabled(): boolean {
  return import.meta.env.VITE_BTCMAP_ENABLED !== 'false';
}