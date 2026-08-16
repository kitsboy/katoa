/**
 * BTC Map integration layer (staged — connections wired when API keys are live).
 * @see https://github.com/teambtcmap/btcmap.org
 * @see https://github.com/teambtcmap/btcmap-api
 * @see https://gitea.btcmap.org/teambtcmap/btcmap-general/wiki/API-Overview
 */

export const BTCMAP_ATTRIBUTION =
  'Map data © BTC Map · © OpenStreetMap · © CARTO';

/**
 * Free dark raster basemap for Leaflet (no API key).
 * Note: OpenFreeMap is vector-only (MapLibre styles) — do NOT use
 * tiles.openfreemap.org/osm/{z}/{x}/{y}.png (403 / broken tiles).
 */
export const LEAFLET_BASEMAP_URL =
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

export const LEAFLET_BASEMAP_OPTIONS = {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 20,
} as const;

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

export interface BTCMapPlace {
  id: number;
  name: string;
  lat: number;
  lon: number;
  icon?: string;
  address?: string;
  website?: string;
  verified_at?: string;
  boosted_until?: string;
  phone?: string;
  opening_hours?: string;
  comments?: number;
  osm_id?: string;
  description?: string;
}

/** Result row from GET /v4/search/?q= */
export type BTCMapSearchResult =
  | {
      type: 'place';
      id: number;
      name: string;
      lat: number;
      lon: number;
      icon?: string;
      address?: string;
    }
  | {
      type: 'area';
      id: number;
      name: string;
      alias?: string;
      bbox?: [number, number, number, number];
    };

const PLACE_SEARCH_FIELDS = 'id,name,lat,lon,icon,address,website,verified_at,boosted_until,phone,opening_hours,comments';
const PLACE_DETAIL_FIELDS =
  'id,name,lat,lon,icon,address,website,verified_at,boosted_until,phone,opening_hours,comments,description,osm_id';
const PLACES_CACHE_TTL_MS = 90_000;
const PLACE_DETAIL_CACHE_TTL_MS = 120_000;

/** Material Icons id → compact emoji for Leaflet pin (no external font needed). */
const MATERIAL_ICON_GLYPH: Record<string, string> = {
  local_cafe: '☕',
  cafe: '☕',
  coffee: '☕',
  restaurant: '🍽',
  lunch_dining: '🍽',
  dinner_dining: '🍽',
  fastfood: '🍔',
  store: '🏪',
  storefront: '🏪',
  shopping_bag: '🛍',
  shopping_cart: '🛒',
  hotel: '🏨',
  bed: '🛏',
  local_bar: '🍸',
  wine_bar: '🍷',
  sports_bar: '🍺',
  fitness_center: '💪',
  sports: '⚽',
  content_cut: '✂',
  spa: '💆',
  local_gas_station: '⛽',
  ev_station: '🔌',
  local_pharmacy: '💊',
  medical_services: '🏥',
  school: '📚',
  menu_book: '📖',
  museum: '🏛',
  palette: '🎨',
  music_note: '🎵',
  theater_comedy: '🎭',
  laptop: '💻',
  devices: '📱',
  atm: '🏧',
  account_balance: '🏦',
  apartment: '🏢',
  home: '🏠',
  directions_car: '🚗',
  local_taxi: '🚕',
  flight: '✈',
  directions_bike: '🚲',
  hiking: '🥾',
  park: '🌳',
  pets: '🐾',
  smoking_rooms: '🚬',
  bakery_dining: '🥐',
  icecream: '🍦',
  liquor: '🥃',
  question_mark: '?',
};

export function materialIconGlyph(icon?: string | null): string {
  if (!icon) return '₿';
  const key = icon.toLowerCase().trim();
  return MATERIAL_ICON_GLYPH[key] || '₿';
}

/** Coarse merchant category for filter chips, derived from the place icon. */
export interface BTCMapMerchantCategory {
  key: string;
  glyph: string;
  labelKey: string;
  icons: string[];
}

export const MERCHANT_CATEGORIES: BTCMapMerchantCategory[] = [
  {
    key: 'food',
    glyph: '🍽',
    labelKey: 'map.categoryFood',
    icons: [
      'local_cafe', 'cafe', 'coffee', 'restaurant', 'lunch_dining', 'dinner_dining',
      'fastfood', 'bakery_dining', 'icecream', 'liquor', 'local_bar', 'wine_bar', 'sports_bar',
    ],
  },
  {
    key: 'shopping',
    glyph: '🛍',
    labelKey: 'map.categoryShopping',
    icons: ['store', 'storefront', 'shopping_bag', 'shopping_cart'],
  },
  {
    key: 'stay',
    glyph: '🏨',
    labelKey: 'map.categoryStay',
    icons: ['hotel', 'bed'],
  },
  {
    key: 'services',
    glyph: '🛠',
    labelKey: 'map.categoryServices',
    icons: [
      'content_cut', 'spa', 'laptop', 'devices', 'fitness_center', 'medical_services',
      'local_pharmacy', 'local_gas_station', 'ev_station', 'atm', 'account_balance',
      'school', 'menu_book',
    ],
  },
  {
    key: 'fun',
    glyph: '🎨',
    labelKey: 'map.categoryFun',
    icons: [
      'sports', 'museum', 'palette', 'music_note', 'theater_comedy', 'park', 'pets',
      'hiking', 'directions_bike',
    ],
  },
  {
    key: 'travel',
    glyph: '✈',
    labelKey: 'map.categoryTravel',
    icons: ['directions_car', 'local_taxi', 'flight'],
  },
];

/** Return the category key for a place icon, or 'other' when unmatched. */
export function merchantCategoryFor(icon?: string | null): string {
  if (!icon) return 'other';
  const key = icon.toLowerCase().trim();
  for (const category of MERCHANT_CATEGORIES) {
    if (category.icons.includes(key)) return category.key;
  }
  return 'other';
}

export function isPlaceBoosted(place: Pick<BTCMapPlace, 'boosted_until'>): boolean {
  return Boolean(place.boosted_until && new Date(place.boosted_until) > new Date());
}

interface PlacesCacheEntry {
  key: string;
  places: BTCMapPlace[];
  fetchedAt: number;
}

let placesCache: PlacesCacheEntry | null = null;
const placeDetailCache = new Map<number, { place: BTCMapPlace; fetchedAt: number }>();

function placesCacheKey(lat: number, lon: number, radiusKm: number): string {
  return `${lat.toFixed(3)}:${lon.toFixed(3)}:${radiusKm}`;
}

function parsePlace(raw: unknown): BTCMapPlace | null {
  if (!raw || typeof raw !== 'object') return null;
  const p = raw as Record<string, unknown>;
  if (typeof p.id !== 'number' || typeof p.lat !== 'number' || typeof p.lon !== 'number') {
    return null;
  }
  const name = typeof p.name === 'string' ? p.name : '';
  if (!name) return null;
  return {
    id: p.id,
    name,
    lat: p.lat,
    lon: p.lon,
    icon: typeof p.icon === 'string' ? p.icon : undefined,
    address: typeof p.address === 'string' ? p.address : undefined,
    website: typeof p.website === 'string' ? p.website : undefined,
    verified_at: typeof p.verified_at === 'string' ? p.verified_at : undefined,
    boosted_until: typeof p.boosted_until === 'string' ? p.boosted_until : undefined,
    phone: typeof p.phone === 'string' ? p.phone : undefined,
    opening_hours: typeof p.opening_hours === 'string' ? p.opening_hours : undefined,
    comments: typeof p.comments === 'number' ? p.comments : undefined,
    osm_id: typeof p.osm_id === 'string' ? p.osm_id : undefined,
    description: typeof p.description === 'string' ? p.description : undefined,
  };
}

export function escapeMapPopupText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_BTCMAP_API_URL;
  if (configured) return configured;
  // Dev: route through Vite proxy to avoid CORS (see vite.config.ts)
  if (import.meta.env.DEV) return '/btcmap-api-proxy';
  return PRODUCTION_API;
}

export function getAppBaseUrl(): string {
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

/** Map view state carried in the URL query string for shareable deep-links. */
export interface MapViewParams {
  lat?: number;
  lon?: number;
  zoom?: number;
  place?: number;
}

/** Parse ?lat=&lon=&zoom=&place= from a query string, validating each value. */
export function parseMapViewParams(search: string): MapViewParams {
  const params = new URLSearchParams(search);
  const out: MapViewParams = {};

  const toNum = (raw: string | null): number => {
    if (raw === null || raw.trim() === '') return NaN;
    return Number(raw);
  };

  const lat = toNum(params.get('lat'));
  const lon = toNum(params.get('lon'));
  const zoom = toNum(params.get('zoom'));
  const place = toNum(params.get('place'));

  if (Number.isFinite(lat) && Math.abs(lat) <= 90) out.lat = lat;
  if (Number.isFinite(lon) && Math.abs(lon) <= 180) out.lon = lon;
  if (Number.isFinite(zoom) && zoom >= 1 && zoom <= 20) out.zoom = zoom;
  if (Number.isFinite(place) && place > 0 && Number.isInteger(place)) out.place = place;

  return out;
}

/** Serialize a map view into a query string (does not include leading '?'). */
export function buildMapViewQuery(view: {
  lat: number;
  lon: number;
  zoom: number;
  place?: number;
}): string {
  const params = new URLSearchParams();
  params.set('lat', view.lat.toFixed(5));
  params.set('lon', view.lon.toFixed(5));
  params.set('zoom', String(Math.round(view.zoom)));
  if (view.place !== undefined) params.set('place', String(view.place));
  return params.toString();
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

/** Map zoom → search radius (km), aligned with btcmap.org density tiers. */
export function zoomToRadiusKm(zoom: number): number {
  if (zoom >= 16) return 8;
  if (zoom >= 14) return 25;
  if (zoom >= 12) return 75;
  if (zoom >= 10) return 200;
  return 500;
}

/** Fetch Bitcoin-accepting merchants near a point (btcmap-api v4). */
export async function fetchPlacesNearby(
  lat: number,
  lon: number,
  radiusKm: number,
  signal?: AbortSignal
): Promise<BTCMapPlace[]> {
  const base = getApiBaseUrl();
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    radius_km: String(radiusKm),
    fields: PLACE_SEARCH_FIELDS,
  });

  const cacheKey = placesCacheKey(lat, lon, radiusKm);
  if (
    placesCache &&
    placesCache.key === cacheKey &&
    Date.now() - placesCache.fetchedAt < PLACES_CACHE_TTL_MS
  ) {
    return placesCache.places;
  }

  const response = await fetch(`${base}/v4/places/search/?${params}`, {
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new Error(`BTC Map places API error: ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) return [];

  const places = data.map(parsePlace).filter((p): p is BTCMapPlace => p !== null);

  placesCache = { key: cacheKey, places, fetchedAt: Date.now() };
  return places;
}

/** Fetch full place detail (richer popup). GET /v4/places/{id} */
export async function fetchPlaceById(
  placeId: number,
  signal?: AbortSignal
): Promise<BTCMapPlace | null> {
  const cached = placeDetailCache.get(placeId);
  if (cached && Date.now() - cached.fetchedAt < PLACE_DETAIL_CACHE_TTL_MS) {
    return cached.place;
  }

  const base = getApiBaseUrl();
  const params = new URLSearchParams({ fields: PLACE_DETAIL_FIELDS });
  const response = await fetch(`${base}/v4/places/${placeId}?${params}`, {
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new Error(`BTC Map place API error: ${response.status}`);
  }

  const place = parsePlace(await response.json());
  if (place) {
    placeDetailCache.set(placeId, { place, fetchedAt: Date.now() });
  }
  return place;
}

/**
 * Unified search — areas + places.
 * @see https://github.com/teambtcmap/btcmap-api/blob/master/docs/rest/v4/search.md
 */
export async function searchBTCMap(
  query: string,
  opts?: { lat?: number; lon?: number; limit?: number; signal?: AbortSignal }
): Promise<BTCMapSearchResult[]> {
  const q = query.trim();
  if (q.length < 3) return [];

  const base = getApiBaseUrl();
  const params = new URLSearchParams({
    q,
    limit: String(opts?.limit ?? 12),
  });
  if (opts?.lat !== undefined && opts?.lon !== undefined) {
    params.set('lat', String(opts.lat));
    params.set('lon', String(opts.lon));
  }

  const response = await fetch(`${base}/v4/search/?${params}`, {
    headers: { Accept: 'application/json' },
    signal: opts?.signal,
  });

  if (!response.ok) {
    throw new Error(`BTC Map search API error: ${response.status}`);
  }

  const data = await response.json();
  const rows: unknown[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.results)
      ? data.results
      : [];

  const out: BTCMapSearchResult[] = [];
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    const r = row as Record<string, unknown>;
    const type = r.type === 'area' || r.type === 'place' ? r.type : null;
    if (type === 'area' && typeof r.id === 'number' && typeof r.name === 'string') {
      out.push({
        type: 'area',
        id: r.id,
        name: r.name,
        alias: typeof r.alias === 'string' ? r.alias : undefined,
        bbox: Array.isArray(r.bbox) && r.bbox.length === 4
          ? (r.bbox as [number, number, number, number])
          : undefined,
      });
      continue;
    }
    // place, or untyped place-like object
    if (
      (type === 'place' || type === null) &&
      typeof r.id === 'number' &&
      typeof r.lat === 'number' &&
      typeof r.lon === 'number' &&
      typeof r.name === 'string'
    ) {
      out.push({
        type: 'place',
        id: r.id,
        name: r.name,
        lat: r.lat,
        lon: r.lon,
        icon: typeof r.icon === 'string' ? r.icon : undefined,
        address: typeof r.address === 'string' ? r.address : undefined,
      });
    }
  }
  return out;
}

/** Localized strings for the merchant popup (supplied by LanguageContext). */
export interface BTCMapPopupStrings {
  merchant: string;
  boosted: string;
  hours: string;
  verified: string;
  website: string;
  viewOnMap: string;
  loading: string;
  comment: (count: number) => string;
}

/** English defaults — used when no strings object is provided (e.g. tests). */
export const BTCMAP_POPUP_STRINGS_EN: BTCMapPopupStrings = {
  merchant: 'BTC Map merchant',
  boosted: 'Boosted',
  hours: 'Hours',
  verified: 'Verified',
  website: 'Website',
  viewOnMap: 'View on BTC Map',
  loading: 'Loading details…',
  comment: (count) => `${count} comment${count === 1 ? '' : 's'}`,
};

/** HTML for merchant popup (initial or after detail hydrate). */
export function buildMerchantPopupHtml(
  place: BTCMapPlace,
  opts?: { loading?: boolean; strings?: Partial<BTCMapPopupStrings> }
): string {
  const s: BTCMapPopupStrings = { ...BTCMAP_POPUP_STRINGS_EN, ...opts?.strings };
  const boosted = isPlaceBoosted(place);
  const glyph = materialIconGlyph(place.icon);
  const lines: string[] = [
    `<div class="btcmap-popup">`,
    `<p class="btcmap-popup__eyebrow">${glyph} ${escapeMapPopupText(s.merchant)}${boosted ? ` · ${escapeMapPopupText(s.boosted)}` : ''}</p>`,
    `<strong class="btcmap-popup__title">${escapeMapPopupText(place.name)}</strong>`,
  ];
  if (place.address) {
    lines.push(`<p class="btcmap-popup__meta">${escapeMapPopupText(place.address)}</p>`);
  }
  if (place.phone) {
    lines.push(
      `<p class="btcmap-popup__meta"><a href="tel:${escapeMapPopupText(place.phone)}">${escapeMapPopupText(place.phone)}</a></p>`
    );
  }
  if (place.opening_hours) {
    lines.push(
      `<p class="btcmap-popup__meta">${escapeMapPopupText(s.hours)}: ${escapeMapPopupText(place.opening_hours)}</p>`
    );
  }
  if (place.verified_at) {
    lines.push(
      `<p class="btcmap-popup__meta">${escapeMapPopupText(s.verified)} ${escapeMapPopupText(place.verified_at.slice(0, 10))}</p>`
    );
  }
  if (typeof place.comments === 'number' && place.comments > 0) {
    lines.push(`<p class="btcmap-popup__meta">${escapeMapPopupText(s.comment(place.comments))}</p>`);
  }
  if (place.website) {
    const href = escapeMapPopupText(place.website);
    lines.push(
      `<a href="${href}" target="_blank" rel="noopener noreferrer" class="btcmap-popup__link">${escapeMapPopupText(s.website)} →</a>`
    );
  }
  lines.push(
    `<a href="${buildBTCMapPlaceUrl(place.id)}" target="_blank" rel="noopener noreferrer" class="btcmap-popup__link">${escapeMapPopupText(s.viewOnMap)} →</a>`
  );
  if (opts?.loading) {
    lines.push(`<p class="btcmap-popup__meta btcmap-popup__loading">${escapeMapPopupText(s.loading)}</p>`);
  }
  lines.push(`</div>`);
  return lines.join('');
}

export function buildBTCMapPlaceUrl(placeId: number): string {
  return `${getAppBaseUrl()}/place/${placeId}`;
}

/** Feature flag — flip when btcmap-api proxy is configured in production. */
export function isBTCMapEnabled(): boolean {
  return import.meta.env.VITE_BTCMAP_ENABLED !== 'false';
}