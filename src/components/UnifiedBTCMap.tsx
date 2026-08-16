import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import {
  Crosshair,
  ExternalLink,
  Layers,
  Loader2,
  MapPin,
  Maximize2,
  Minimize2,
  Plus,
  Search,
  Share2,
  X,
} from 'lucide-react';
import { Link } from './Link';
import { Button } from './Button';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from './Toast';
import { getStorage, setStorage, STORAGE_KEYS } from '../lib/storage';
import { copyToClipboard } from '../lib/clipboard';
import { formatRelativeTime } from '../lib/i18nFormat';
import {
  BTCMAP_ATTRIBUTION,
  LEAFLET_BASEMAP_OPTIONS,
  LEAFLET_BASEMAP_URL,
  MERCHANT_CATEGORIES,
  type BTCMapActivityItem,
  type BTCMapAreaAt,
  type BTCMapComment,
  type BTCMapCoordinates,
  type BTCMapEvent,
  type BTCMapPlace,
  type BTCMapPopupStrings,
  type BTCMapSearchResult,
  type KatoaMapPin,
  buildBTCMapPlaceUrl,
  buildDirectionsUrl,
  buildOSMNoteUrl,
  buildOsmPlaceUrl,
  buildShareMapUrl,
  escapeMapPopupText,
  fetchAreasAt,
  fetchBTCMapActivity,
  fetchBTCMapEvents,
  fetchPlaceById,
  fetchPlaceComments,
  fetchPlacesNearby,
  getAppBaseUrl,
  haversineKm,
  isPlaceBoosted,
  isBTCMapEnabled,
  katoaPinColor,
  materialIconGlyph,
  merchantCategoryFor,
  mergePlaces,
  parseMapViewParams,
  sanitizeImageUrl,
  searchBTCMap,
  zoomToRadiusKm,
} from '../lib/btcmap';
import 'leaflet/dist/leaflet.css';

interface UnifiedBTCMapProps {
  center: BTCMapCoordinates;
  katoaPins: KatoaMapPin[];
  height?: string;
  className?: string;
}

function formatSats(n: number): string {
  return new Intl.NumberFormat().format(n);
}

/** Render cap for merchant markers — "load more here" raises it. */
const MERCHANT_CAP_STEP = 200;
const MERCHANT_CAP_MIN = 400;

/** Clean orange teardrop — no brand logo image (avoids logo smear on basemap). */
function createKatoaIcon(L: typeof import('leaflet'), coverImage?: string | null, ringColor?: string) {
  const photo = sanitizeImageUrl(coverImage);
  const ring = ringColor || '#f7931a';
  if (photo) {
    return L.divIcon({
      className: 'katoa-pin-marker leaflet-div-icon',
      html: `<div class="katoa-map-pin katoa-map-pin--photo" style="--katoa-ring:${ring};background-image:url(&quot;${escapeMapPopupText(photo)}&quot;)" aria-hidden="true"></div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -18],
    });
  }
  return L.divIcon({
    className: 'katoa-pin-marker leaflet-div-icon',
    html: `<div class="katoa-map-pin" style="--katoa-ring:${ring}" aria-hidden="true"><span class="katoa-map-pin__dot">K</span></div>`,
    iconSize: [28, 36],
    iconAnchor: [14, 34],
    popupAnchor: [0, -30],
  });
}

function createMerchantIcon(L: typeof import('leaflet'), place: BTCMapPlace) {
  const boosted = isPlaceBoosted(place);
  const glyph = materialIconGlyph(place.icon);
  return L.divIcon({
    className: 'btc-merchant-marker leaflet-div-icon',
    html: `<div class="btc-merchant-pin${boosted ? ' btc-merchant-pin--boosted' : ''}" aria-hidden="true"><span class="btc-merchant-pin__glyph">${glyph}</span></div>`,
    iconSize: [28, 34],
    iconAnchor: [14, 32],
    popupAnchor: [0, -28],
  });
}

/** Event pin — distinct purple calendar glyph. */
function createEventIcon(L: typeof import('leaflet')) {
  return L.divIcon({
    className: 'btc-merchant-marker leaflet-div-icon',
    html: `<div class="btc-event-pin" aria-hidden="true"><span class="btc-event-pin__glyph">📅</span></div>`,
    iconSize: [30, 36],
    iconAnchor: [15, 34],
    popupAnchor: [0, -30],
  });
}

/** Cluster badge — shows a count and zooms into its members on click. */
function createClusterIcon(L: typeof import('leaflet'), count: number) {
  return L.divIcon({
    className: 'btc-merchant-marker leaflet-div-icon',
    html: `<div class="btc-merchant-cluster" aria-hidden="true"><span class="btc-merchant-cluster__count">${count}</span></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

const CLUSTER_GRID_PX = 64;

interface ClusterCell {
  lat: number;
  lon: number;
  places: BTCMapPlace[];
}

/** Group nearby places into grid cells so dense areas render as a single count badge. */
function clusterPlaces(
  places: BTCMapPlace[],
  map: import('leaflet').Map
): { clusters: ClusterCell[]; singles: BTCMapPlace[] } {
  const grid = new Map<string, ClusterCell>();
  const zoom = map.getZoom();
  for (const place of places) {
    const pt = map.project([place.lat, place.lon], zoom);
    const key = `${Math.floor(pt.x / CLUSTER_GRID_PX)}:${Math.floor(pt.y / CLUSTER_GRID_PX)}`;
    const cell = grid.get(key);
    if (cell) cell.places.push(place);
    else grid.set(key, { lat: place.lat, lon: place.lon, places: [place] });
  }

  const clusters: ClusterCell[] = [];
  const singles: BTCMapPlace[] = [];
  for (const cell of grid.values()) {
    if (cell.places.length > 1) {
      const lat = cell.places.reduce((sum, p) => sum + p.lat, 0) / cell.places.length;
      const lon = cell.places.reduce((sum, p) => sum + p.lon, 0) / cell.places.length;
      clusters.push({ lat, lon, places: cell.places });
    } else {
      singles.push(cell.places[0]);
    }
  }
  return { clusters, singles };
}

const ACTIVITY_TYPE_META: Record<string, { glyph: string; labelKey: string }> = {
  place_added: { glyph: '➕', labelKey: 'map.activityAdded' },
  place_updated: { glyph: '✏️', labelKey: 'map.activityUpdated' },
  place_deleted: { glyph: '🗑', labelKey: 'map.activityDeleted' },
  place_commented: { glyph: '💬', labelKey: 'map.activityCommented' },
  place_boosted: { glyph: '⚡', labelKey: 'map.activityBoosted' },
};

export function UnifiedBTCMap({
  center,
  katoaPins,
  height = 'min(60vh, 480px)',
  className = '',
}: UnifiedBTCMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const merchantLayerRef = useRef<import('leaflet').LayerGroup | null>(null);
  const katoaLayerRef = useRef<import('leaflet').LayerGroup | null>(null);
  const eventsLayerRef = useRef<import('leaflet').LayerGroup | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const areasAbortRef = useRef<AbortController | null>(null);
  const activityAbortRef = useRef<AbortController | null>(null);
  const drawerAbortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { t, language } = useLanguage();
  const { toast } = useToast();

  const popupStrings = useMemo<BTCMapPopupStrings>(
    () => ({
      merchant: t('map.popupMerchant'),
      boosted: t('map.popupBoosted'),
      hours: t('map.popupHours'),
      verified: t('map.popupVerified'),
      website: t('map.popupWebsite'),
      viewOnMap: t('map.popupViewOnMap'),
      loading: t('map.popupLoading'),
      comment: (count: number) =>
        `${count} ${count === 1 ? t('map.popupComment') : t('map.popupComments')}`,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language]
  );

  const popupStringsRef = useRef(popupStrings);
  useEffect(() => {
    popupStringsRef.current = popupStrings;
  }, [popupStrings]);

  const katoaPopupTextRef = useRef({
    eyebrow: t('map.popupKatoa'),
    satsRaised: t('map.popupSatsRaised'),
    viewWishlist: t('map.popupViewWishlist'),
  });
  useEffect(() => {
    katoaPopupTextRef.current = {
      eyebrow: t('map.popupKatoa'),
      satsRaised: t('map.popupSatsRaised'),
      viewWishlist: t('map.popupViewWishlist'),
    };
  });

  const [showMerchants, setShowMerchants] = useState(() =>
    getStorage(STORAGE_KEYS.mapShowMerchants, true)
  );
  const [showKatoa, setShowKatoa] = useState(() =>
    getStorage(STORAGE_KEYS.mapShowKatoa, true)
  );
  const [showEvents, setShowEvents] = useState(() =>
    getStorage(STORAGE_KEYS.mapShowEvents, false)
  );

  useEffect(() => {
    setStorage(STORAGE_KEYS.mapShowMerchants, showMerchants);
  }, [showMerchants]);

  useEffect(() => {
    setStorage(STORAGE_KEYS.mapShowKatoa, showKatoa);
  }, [showKatoa]);

  useEffect(() => {
    setStorage(STORAGE_KEYS.mapShowEvents, showEvents);
  }, [showEvents]);

  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expanded]);
  const [merchantCount, setMerchantCount] = useState<number | null>(null);
  const [loadingMerchants, setLoadingMerchants] = useState(false);
  const [merchantError, setMerchantError] = useState<string | null>(null);
  const [merchantCategory, setMerchantCategory] = useState<string>('all');
  const [mapReady, setMapReady] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState<BTCMapSearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchAbortRef = useRef<AbortController | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const merchantMarkersRef = useRef<Map<number, import('leaflet').Marker>>(new Map());
  const merchantPlacesRef = useRef<BTCMapPlace[]>([]);
  const merchantCategoryRef = useRef('all');
  const [merchantCap, setMerchantCap] = useState(MERCHANT_CAP_MIN);
  const merchantCapRef = useRef(MERCHANT_CAP_MIN);
  useEffect(() => {
    merchantCapRef.current = merchantCap;
  }, [merchantCap]);

  // ---- Events layer ----
  const [events, setEvents] = useState<BTCMapEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const eventsFetchedRef = useRef(false);

  const renderEventsLayer = useCallback(
    (map: import('leaflet').Map, L: typeof import('leaflet')) => {
      const layer = eventsLayerRef.current;
      if (!layer || events.length === 0) return;
      layer.clearLayers();
      const bounds = map.getBounds().pad(0.2);
      events.forEach((event) => {
        if (!bounds.contains([event.lat, event.lon])) return;
        const marker = L.marker([event.lat, event.lon], { icon: createEventIcon(L) });
        const start = new Date(event.starts_at);
        const dateLabel = Number.isNaN(start.getTime())
          ? ''
          : new Intl.DateTimeFormat(language, {
              dateStyle: 'medium',
              timeStyle: 'short',
            }).format(start);
        const html = `
          <div class="btcmap-popup btcmap-popup--event">
            <p class="btcmap-popup__eyebrow">📅 ${escapeMapPopupText(t('map.events'))}</p>
            <strong class="btcmap-popup__title">${escapeMapPopupText(event.name)}</strong>
            ${dateLabel ? `<p class="btcmap-popup__meta">${escapeMapPopupText(dateLabel)}</p>` : ''}
            ${event.website ? `<a href="${escapeMapPopupText(event.website)}" target="_blank" rel="noopener noreferrer" class="btcmap-popup__link">${escapeMapPopupText(t('map.popupWebsite'))} →</a>` : ''}
          </div>
        `;
        marker.bindPopup(html, { className: 'btcmap-leaflet-popup', maxWidth: 280 });
        layer.addLayer(marker);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [events, language]
  );

  const loadEvents = useCallback(async () => {
    if (!showEvents || eventsFetchedRef.current) return;
    eventsFetchedRef.current = true;
    setEventsLoading(true);
    setEventsError(null);
    try {
      const items = await fetchBTCMapEvents();
      setEvents(items);
    } catch (err) {
      eventsFetchedRef.current = false;
      setEventsError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setEventsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showEvents]);

  // ---- Areas here chips ----
  const [areasAt, setAreasAt] = useState<BTCMapAreaAt[]>([]);
  const [areasLoading, setAreasLoading] = useState(false);

  const loadAreasAt = useCallback(async (map: import('leaflet').Map) => {
    areasAbortRef.current?.abort();
    const controller = new AbortController();
    areasAbortRef.current = controller;
    const c = map.getCenter();
    setAreasLoading(true);
    try {
      const areas = await fetchAreasAt(c.lat, c.lng, controller.signal);
      if (controller.signal.aborted) return;
      setAreasAt(areas);
    } catch {
      if (!controller.signal.aborted) setAreasAt([]);
    } finally {
      if (!controller.signal.aborted) setAreasLoading(false);
    }
  }, []);

  // ---- Place detail drawer ----
  const [selectedPlace, setSelectedPlace] = useState<BTCMapPlace | null>(null);
  const [placeDetail, setPlaceDetail] = useState<BTCMapPlace | null>(null);
  const [placeComments, setPlaceComments] = useState<BTCMapComment[]>([]);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const openPlaceDrawer = useCallback((place: BTCMapPlace) => {
    setSelectedPlace(place);
    setPlaceDetail(place);
    setPlaceComments([]);
    setDrawerLoading(true);
    drawerAbortRef.current?.abort();
    const controller = new AbortController();
    drawerAbortRef.current = controller;
    void Promise.all([
      fetchPlaceById(place.id, controller.signal).catch(() => null),
      fetchPlaceComments(place.id, controller.signal).catch(() => []),
    ]).then(([detail, comments]) => {
      if (controller.signal.aborted) return;
      if (detail) setPlaceDetail(detail);
      setPlaceComments(comments);
      setDrawerLoading(false);
    });
  }, []);

  const closeDrawer = useCallback(() => {
    drawerAbortRef.current?.abort();
    setSelectedPlace(null);
    setPlaceDetail(null);
    setPlaceComments([]);
    setDrawerLoading(false);
  }, []);

  useEffect(() => {
    if (!selectedPlace) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedPlace, closeDrawer]);

  // ---- Activity strip ----
  const [activity, setActivity] = useState<BTCMapActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  const loadActivity = useCallback(async () => {
    const ids = merchantPlacesRef.current.map((p) => p.id).slice(0, 500);
    if (ids.length === 0) {
      setActivity([]);
      return;
    }
    activityAbortRef.current?.abort();
    const controller = new AbortController();
    activityAbortRef.current = controller;
    setActivityLoading(true);
    try {
      const items = await fetchBTCMapActivity({ places: ids, days: 7, signal: controller.signal });
      if (controller.signal.aborted) return;
      setActivity(items.slice(0, 6));
    } catch {
      if (!controller.signal.aborted) setActivity([]);
    } finally {
      if (!controller.signal.aborted) setActivityLoading(false);
    }
  }, []);

  const renderMerchantLayer = useCallback(
    (map: import('leaflet').Map, L: typeof import('leaflet')) => {
      const layer = merchantLayerRef.current;
      if (!layer) return;

      layer.clearLayers();
      merchantMarkersRef.current.clear();

      const allPlaces = merchantPlacesRef.current;
      if (allPlaces.length === 0) return;

      const category = merchantCategoryRef.current;
      const filtered =
        category === 'all'
          ? allPlaces
          : allPlaces.filter((place) => merchantCategoryFor(place.icon) === category);
      const places = filtered.slice(0, merchantCapRef.current);
      if (places.length === 0) return;

      const { clusters, singles } = clusterPlaces(places, map);

      singles.forEach((place) => {
        const marker = L.marker([place.lat, place.lon], {
          icon: createMerchantIcon(L, place),
        });
        marker.on('click', () => openPlaceDrawer(place));
        layer.addLayer(marker);
        merchantMarkersRef.current.set(place.id, marker);
      });

      clusters.forEach((cluster) => {
        const marker = L.marker([cluster.lat, cluster.lon], {
          icon: createClusterIcon(L, cluster.places.length),
        });
        marker.on('click', () => {
          const bounds = L.latLngBounds(
            cluster.places.map((p) => [p.lat, p.lon] as [number, number])
          );
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: Math.min(map.getZoom() + 2, 18) });
        });
        layer.addLayer(marker);
      });
    },
    [openPlaceDrawer]
  );

  const revealPlace = useCallback(async (placeId: number) => {
    const map = mapRef.current;
    if (!map) return;
    setShowMerchants(true);

    const detail = await fetchPlaceById(placeId).catch(() => null);
    if (!detail) return;

    map.flyTo([detail.lat, detail.lon], 15, { duration: 0.7 });
    openPlaceDrawer(detail);

    const L = await import('leaflet');
    let marker = merchantMarkersRef.current.get(placeId);
    if (!marker && merchantLayerRef.current) {
      marker = L.marker([detail.lat, detail.lon], { icon: createMerchantIcon(L, detail) });
      marker.on('click', () => openPlaceDrawer(detail));
      merchantLayerRef.current.addLayer(marker);
      merchantMarkersRef.current.set(placeId, marker);
    }

    const url = new URL(window.location.href);
    url.searchParams.set('lat', detail.lat.toFixed(5));
    url.searchParams.set('lon', detail.lon.toFixed(5));
    url.searchParams.set('zoom', '15');
    url.searchParams.set('place', String(placeId));
    window.history.replaceState(null, '', url);
  }, [openPlaceDrawer]);

  useEffect(() => {
    merchantCategoryRef.current = merchantCategory;
    if (mapReady && showMerchants && mapRef.current) {
      import('leaflet').then((L) => renderMerchantLayer(mapRef.current!, L));
    }
  }, [merchantCategory, mapReady, showMerchants, renderMerchantLayer, merchantCap]);

  const loadMerchants = useCallback(
    async (map: import('leaflet').Map, L: typeof import('leaflet'), opts?: { capReset?: boolean }) => {
      if (!showMerchants || !isBTCMapEnabled()) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const c = map.getCenter();
      const zoom = map.getZoom();
      const radiusKm = zoomToRadiusKm(zoom);

      setLoadingMerchants(true);
      setMerchantError(null);

      try {
        const places = await fetchPlacesNearby(c.lat, c.lng, radiusKm, controller.signal);

        if (controller.signal.aborted || !merchantLayerRef.current) return;

        // Incremental merge — keep previously fetched places within a generous halo
        // instead of clearing and refetching everything on every pan.
        merchantPlacesRef.current = mergePlaces(merchantPlacesRef.current, places);
        const haloKm = radiusKm * 1.5;
        merchantPlacesRef.current = merchantPlacesRef.current.filter(
          (place) => haversineKm(c.lat, c.lng, place.lat, place.lon) <= haloKm
        );

        if (opts?.capReset) setMerchantCap(MERCHANT_CAP_MIN);

        renderMerchantLayer(map, L);
        setMerchantCount(merchantPlacesRef.current.length);
        void loadActivity();
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setMerchantError(err instanceof Error ? err.message : 'Failed to load merchants');
        setMerchantCount(0);
      } finally {
        setLoadingMerchants(false);
      }
    },
    [showMerchants, renderMerchantLayer, loadActivity]
  );

  const renderKatoaPins = useCallback((L: typeof import('leaflet')) => {
    if (!katoaLayerRef.current) return;
    katoaLayerRef.current.clearLayers();

    katoaPins.forEach((pin) => {
      const marker = L.marker([pin.latitude, pin.longitude], {
        icon: createKatoaIcon(L, pin.cover_image, katoaPinColor(pin.category)),
      });

      const popup = `
        <div class="btcmap-popup btcmap-popup--katoa">
          <p class="btcmap-popup__eyebrow">${escapeMapPopupText(katoaPopupTextRef.current.eyebrow)}</p>
          <strong class="btcmap-popup__title">${escapeMapPopupText(pin.title)}</strong>
          <p class="btcmap-popup__meta">${formatSats(pin.total_sats_raised)} ${escapeMapPopupText(katoaPopupTextRef.current.satsRaised)}</p>
          <a href="/wishlist/${pin.slug}" class="btcmap-popup__link btcmap-popup__link--katoa">
            ${escapeMapPopupText(katoaPopupTextRef.current.viewWishlist)} →
          </a>
        </div>
      `;
      marker.bindPopup(popup, { className: 'btcmap-leaflet-popup', maxWidth: 260 });
      katoaLayerRef.current!.addLayer(marker);
    });
  }, [katoaPins]);

  // Init map once
  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;

    (async () => {
      const L = await import('leaflet');
      if (cancelled || !containerRef.current) return;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const urlView = parseMapViewParams(window.location.search);
      const hasUrlView = urlView.lat !== undefined && urlView.lon !== undefined;
      const savedView = !hasUrlView
        ? getStorage<{ lat: number; lon: number; zoom: number } | null>(
            STORAGE_KEYS.mapLastView,
            null
          )
        : null;

      const map = L.map(containerRef.current, {
        center: [urlView.lat ?? savedView?.lat ?? center.latitude, urlView.lon ?? savedView?.lon ?? center.longitude],
        zoom: urlView.zoom ?? savedView?.zoom ?? center.zoom ?? 4,
        zoomControl: false,
        scrollWheelZoom: true,
      });

      L.tileLayer(LEAFLET_BASEMAP_URL, { ...LEAFLET_BASEMAP_OPTIONS }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      merchantLayerRef.current = L.layerGroup().addTo(map);
      katoaLayerRef.current = L.layerGroup().addTo(map);
      eventsLayerRef.current = L.layerGroup().addTo(map);

      renderKatoaPins(L);
      await loadMerchants(map, L);
      if (showEvents) await loadEvents();
      await loadAreasAt(map);

      const onMoveEnd = () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          void loadMerchants(map, L);
          void loadAreasAt(map);
          renderEventsLayerRef.current(map, L);
        }, 450);
        const c = map.getCenter();
        const url = new URL(window.location.href);
        url.searchParams.set('lat', c.lat.toFixed(5));
        url.searchParams.set('lon', c.lng.toFixed(5));
        url.searchParams.set('zoom', String(Math.round(map.getZoom())));
        url.searchParams.delete('place');
        window.history.replaceState(null, '', url);
        setStorage(STORAGE_KEYS.mapLastView, {
          lat: c.lat,
          lon: c.lng,
          zoom: map.getZoom(),
        });
      };
      map.on('moveend', onMoveEnd);
      map.on('zoomend', () => {
        renderMerchantLayer(map, L);
        renderEventsLayerRef.current(map, L);
      });

      if (!hasUrlView && !savedView && katoaPins.length > 0) {
        const bounds = L.latLngBounds(katoaPins.map((p) => [p.latitude, p.longitude] as [number, number]));
        if (katoaPins.length > 1) {
          map.fitBounds(bounds, { padding: [48, 48], maxZoom: 10 });
        }
      }

      mapRef.current = map;
      setMapReady(true);

      if (urlView.place !== undefined) {
        void revealPlace(urlView.place);
      }
    })();

    return () => {
      cancelled = true;
      abortRef.current?.abort();
      areasAbortRef.current?.abort();
      activityAbortRef.current?.abort();
      drawerAbortRef.current?.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setMapReady(false);
    };
  }, [center.latitude, center.longitude, center.zoom]); // eslint-disable-line react-hooks/exhaustive-deps

  // Toggle merchant layer visibility
  useEffect(() => {
    if (!mapRef.current || !merchantLayerRef.current) return;
    const map = mapRef.current;
    if (showMerchants) {
      if (!map.hasLayer(merchantLayerRef.current)) {
        merchantLayerRef.current.addTo(map);
      }
      import('leaflet').then((L) => loadMerchants(map, L, { capReset: true }));
    } else {
      map.removeLayer(merchantLayerRef.current);
      setMerchantCount(null);
    }
  }, [showMerchants, loadMerchants]);

  // Toggle KATOA layer + re-render pins
  useEffect(() => {
    if (!mapRef.current || !katoaLayerRef.current) return;
    const map = mapRef.current;
    if (showKatoa) {
      if (!map.hasLayer(katoaLayerRef.current)) {
        katoaLayerRef.current.addTo(map);
      }
      import('leaflet').then((L) => renderKatoaPins(L));
    } else {
      map.removeLayer(katoaLayerRef.current);
    }
  }, [showKatoa, renderKatoaPins]);

  // Toggle events layer
  useEffect(() => {
    if (!mapRef.current || !eventsLayerRef.current) return;
    const map = mapRef.current;
    if (showEvents) {
      if (!map.hasLayer(eventsLayerRef.current)) {
        eventsLayerRef.current.addTo(map);
      }
      import('leaflet').then(async (L) => {
        await loadEvents();
        renderEventsLayer(map, L);
      });
    } else {
      map.removeLayer(eventsLayerRef.current);
      eventsLayerRef.current.clearLayers();
    }
  }, [showEvents, loadEvents, renderEventsLayer]);

  // Re-render KATOA pins when data changes
  useEffect(() => {
    if (!mapReady || !showKatoa) return;
    import('leaflet').then((L) => renderKatoaPins(L));
  }, [katoaPins, mapReady, showKatoa, renderKatoaPins]);

  const bothOff = !showMerchants && !showKatoa && !showEvents;

  const flyToPin = (pin: KatoaMapPin) => {
    mapRef.current?.flyTo([pin.latitude, pin.longitude], 14, { duration: 0.8 });
  };

  const fitAllPins = () => {
    if (!mapRef.current || katoaPins.length === 0) return;
    import('leaflet').then((L) => {
      const bounds = L.latLngBounds(katoaPins.map((p) => [p.latitude, p.longitude] as [number, number]));
      mapRef.current?.fitBounds(bounds, { padding: [48, 48], maxZoom: 12 });
    });
  };

  const locateMe = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapRef.current?.flyTo([pos.coords.latitude, pos.coords.longitude], 13, { duration: 0.8 });
      },
      () => setMerchantError('Location permission denied'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const shareView = async () => {
    const map = mapRef.current;
    if (!map) return;
    const c = map.getCenter();
    const url = buildShareMapUrl({
      lat: c.lat,
      lon: c.lng,
      zoom: map.getZoom(),
      place: selectedPlace?.id,
    });
    const result = await copyToClipboard(url);
    toast(
      result === 'success' ? t('map.shareCopied') : t('map.shareFailed'),
      result === 'success' ? 'success' : 'error'
    );
  };

  const addPlaceHere = () => {
    const map = mapRef.current;
    if (!map) return;
    const c = map.getCenter();
    window.open(buildOSMNoteUrl(c.lat, c.lng), '_blank', 'noopener,noreferrer');
  };

  const merchantOverCap = (merchantCount ?? 0) > merchantCap;

  const renderEventsLayerRef = useRef(renderEventsLayer);
  useEffect(() => {
    renderEventsLayerRef.current = renderEventsLayer;
  }, [renderEventsLayer]);

  // Debounced BTC Map search (GET /v4/search/?q=)
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    const q = searchQ.trim();
    if (q.length < 3) {
      setSearchResults([]);
      setSearchError(null);
      setSearchLoading(false);
      setActiveIndex(-1);
      return;
    }
    setSearchLoading(true);
    searchTimerRef.current = setTimeout(() => {
      searchAbortRef.current?.abort();
      const controller = new AbortController();
      searchAbortRef.current = controller;
      const map = mapRef.current;
      const center = map?.getCenter();
      void searchBTCMap(q, {
        lat: center?.lat,
        lon: center?.lng,
        limit: 12,
        signal: controller.signal,
      })
        .then((rows) => {
          if (controller.signal.aborted) return;
          setSearchResults(rows);
          setSearchError(null);
          setSearchOpen(true);
          setActiveIndex(-1);
        })
        .catch((err) => {
          if (err instanceof Error && err.name === 'AbortError') return;
          setSearchError(err instanceof Error ? err.message : 'Search failed');
          setSearchResults([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setSearchLoading(false);
        });
    }, 320);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchQ]);

  const focusSearchResult = async (row: BTCMapSearchResult) => {
    const map = mapRef.current;
    if (!map) return;
    setSearchOpen(false);

    if (row.type === 'area') {
      if (row.bbox && row.bbox.length === 4) {
        const [west, south, east, north] = row.bbox;
        const L = await import('leaflet');
        map.fitBounds(L.latLngBounds([south, west], [north, east]), {
          padding: [40, 40],
          maxZoom: 12,
        });
      }
      return;
    }

    await revealPlace(row.id);
  };

  const handleSearchKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    const count = searchResults.length;
    if (count === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSearchOpen(true);
      setActiveIndex((i) => (i + 1) % count);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSearchOpen(true);
      setActiveIndex((i) => (i <= 0 ? count - 1 : i - 1));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && searchResults[activeIndex]) {
        e.preventDefault();
        void focusSearchResult(searchResults[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setSearchOpen(false);
      setActiveIndex(-1);
    }
  };

  useEffect(() => {
    if (activeIndex < 0) return;
    document
      .getElementById(`btcmap-search-result-${activeIndex}`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const detail = selectedPlace ? (placeDetail ?? selectedPlace) : null;

  return (
    <div className={`unified-btcmap ${className}`}>
      <div className="unified-btcmap__header">
        <div className="unified-btcmap__title-block">
          <MapPin size={20} className="text-bitcoin-orange-500 shrink-0" />
          <div>
            <h3 className="unified-btcmap__title">{t('map.title')}</h3>
            <p className="unified-btcmap__subtitle">{t('map.subtitle')}</p>
          </div>
        </div>
        <a
          href={getAppBaseUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="unified-btcmap__external"
        >
          btcmap.org
          <ExternalLink size={14} />
        </a>
      </div>

      <div
        className={`unified-btcmap__frame ${expanded ? 'unified-btcmap__frame--expanded' : ''}`}
        style={{ height: expanded ? 'calc(100vh - 2rem)' : height }}
      >
        {expanded && (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="unified-btcmap__expand-close"
            aria-label="Close expanded map"
          >
            <Minimize2 size={18} />
          </button>
        )}

        <div className="unified-btcmap__search">
          <label className="sr-only" htmlFor="btcmap-search">
            {t('map.search')}
          </label>
          <Search size={16} className="unified-btcmap__search-icon" aria-hidden />
          <input
            id="btcmap-search"
            type="search"
            role="combobox"
            aria-expanded={searchOpen && searchResults.length > 0}
            aria-controls="btcmap-search-results"
            aria-activedescendant={activeIndex >= 0 ? `btcmap-search-result-${activeIndex}` : undefined}
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
            onKeyDown={handleSearchKeyDown}
            placeholder={t('map.searchPlaceholder')}
            className="unified-btcmap__search-input"
            autoComplete="off"
            enterKeyHint="search"
          />
          {searchLoading && <Loader2 size={14} className="unified-btcmap__search-spinner animate-spin" aria-hidden />}
          {searchQ && (
            <button
              type="button"
              className="unified-btcmap__search-clear"
              onClick={() => {
                setSearchQ('');
                setSearchResults([]);
                setSearchOpen(false);
                setActiveIndex(-1);
              }}
              aria-label={t('map.searchClear')}
            >
              <X size={14} />
            </button>
          )}
          {searchOpen && (searchResults.length > 0 || searchError) && (
            <ul id="btcmap-search-results" className="unified-btcmap__search-results" role="listbox" aria-label={t('map.search')}>
              {searchError && (
                <li className="unified-btcmap__search-empty">{searchError}</li>
              )}
              {!searchError &&
                searchResults.map((row, i) => (
                  <li
                    key={`${row.type}-${row.id}`}
                    id={`btcmap-search-result-${i}`}
                    role="option"
                    aria-selected={i === activeIndex}
                  >
                    <button
                      type="button"
                      className={`unified-btcmap__search-item ${i === activeIndex ? 'unified-btcmap__search-item--active' : ''}`}
                      onClick={() => void focusSearchResult(row)}
                      onMouseEnter={() => setActiveIndex(i)}
                      tabIndex={-1}
                    >
                      <span className="unified-btcmap__search-item-icon" aria-hidden>
                        {row.type === 'area' ? '🗺' : materialIconGlyph(row.icon)}
                      </span>
                      <span className="min-w-0">
                        <span className="unified-btcmap__search-item-name">{row.name}</span>
                        <span className="unified-btcmap__search-item-meta">
                          {row.type === 'area'
                            ? t('map.searchArea')
                            : row.address || t('map.searchPlace')}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div className="unified-btcmap__toolbar" role="toolbar" aria-label="Map layers">
          <button
            type="button"
            className={`unified-btcmap__layer ${showMerchants ? 'unified-btcmap__layer--on' : ''}`}
            onClick={() => setShowMerchants((v) => !v)}
            aria-pressed={showMerchants}
          >
            <span className="unified-btcmap__layer-dot unified-btcmap__layer-dot--merchant" />
            <span>₿ {t('map.merchants')}</span>
            {merchantCount !== null && showMerchants && (
              <span className="unified-btcmap__layer-count">{merchantCount}</span>
            )}
            {loadingMerchants && <Loader2 size={14} className="animate-spin opacity-70" />}
          </button>

          <button
            type="button"
            className={`unified-btcmap__layer ${showKatoa ? 'unified-btcmap__layer--on unified-btcmap__layer--katoa' : ''}`}
            onClick={() => setShowKatoa((v) => !v)}
            aria-pressed={showKatoa}
          >
            <span className="unified-btcmap__layer-dot unified-btcmap__layer-dot--katoa" aria-hidden />
            <span>{t('map.katoa')}</span>
            <span className="unified-btcmap__layer-count">{katoaPins.length}</span>
          </button>

          <button
            type="button"
            className={`unified-btcmap__layer ${showEvents ? 'unified-btcmap__layer--on unified-btcmap__layer--events' : ''}`}
            onClick={() => setShowEvents((v) => !v)}
            aria-pressed={showEvents}
          >
            <span className="unified-btcmap__layer-dot unified-btcmap__layer-dot--events" aria-hidden />
            <span>{t('map.events')}</span>
            {eventsLoading && <Loader2 size={14} className="animate-spin opacity-70" />}
          </button>

          <button
            type="button"
            className="unified-btcmap__layer unified-btcmap__layer--icon"
            onClick={locateMe}
            aria-label={t('map.locateMe')}
            title={t('map.locateMe')}
          >
            <Crosshair size={16} />
          </button>

          {katoaPins.length > 1 && (
            <button
              type="button"
              className="unified-btcmap__layer unified-btcmap__layer--icon"
              onClick={fitAllPins}
              aria-label={t('map.fitAll')}
              title={t('map.fitAll')}
            >
              <Layers size={16} />
            </button>
          )}

          <button
            type="button"
            className="unified-btcmap__layer unified-btcmap__layer--icon"
            onClick={() => void shareView()}
            aria-label={t('map.shareView')}
            title={t('map.shareView')}
          >
            <Share2 size={16} />
          </button>

          <button
            type="button"
            className="unified-btcmap__layer unified-btcmap__layer--icon"
            onClick={addPlaceHere}
            aria-label={t('map.addPlace')}
            title={t('map.addPlace')}
          >
            <Plus size={16} />
          </button>

          <button
            type="button"
            className="unified-btcmap__layer unified-btcmap__layer--icon"
            onClick={() => setExpanded((e) => !e)}
            aria-label={expanded ? t('map.collapse') : t('map.expand')}
          >
            {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>

        {showMerchants && (
          <div className="unified-btcmap__categories" role="group" aria-label={t('map.categoryLabel')}>
            <button
              type="button"
              className={`unified-btcmap__category ${merchantCategory === 'all' ? 'unified-btcmap__category--on' : ''}`}
              onClick={() => setMerchantCategory('all')}
              aria-pressed={merchantCategory === 'all'}
            >
              {t('map.categoryAll')}
            </button>
            {MERCHANT_CATEGORIES.map((category) => (
              <button
                key={category.key}
                type="button"
                className={`unified-btcmap__category ${merchantCategory === category.key ? 'unified-btcmap__category--on' : ''}`}
                onClick={() => setMerchantCategory(category.key)}
                aria-pressed={merchantCategory === category.key}
              >
                <span aria-hidden>{category.glyph}</span>
                {t(category.labelKey)}
              </button>
            ))}
            {merchantOverCap && merchantCount !== null && (
              <button
                type="button"
                className="unified-btcmap__category unified-btcmap__category--more"
                onClick={() => setMerchantCap((c) => c + MERCHANT_CAP_STEP)}
              >
                {t('map.loadMore')}
              </button>
            )}
          </div>
        )}

        {bothOff && (
          <div className="unified-btcmap__empty-overlay">
            <Layers size={28} className="text-gray-500 mb-2" />
            <p className="text-gray-400 text-sm">{t('map.turnOnLayer')}</p>
          </div>
        )}

        {merchantError && showMerchants && (
          <div className="unified-btcmap__error-banner" role="status">
            <span>{t('map.merchantsUnavailable')} · {merchantError}</span>
            <button
              type="button"
              className="unified-btcmap__error-retry"
              onClick={() => {
                const map = mapRef.current;
                if (map) import('leaflet').then((L) => loadMerchants(map, L));
              }}
            >
              Retry
            </button>
          </div>
        )}

        {eventsError && showEvents && (
          <div className="unified-btcmap__error-banner" role="status">
            <span>{t('map.events')} · {eventsError}</span>
          </div>
        )}

        <div
          ref={containerRef}
          className="unified-btcmap__canvas"
          role="region"
          aria-label={t('map.title')}
          tabIndex={0}
        />

        {/* Place detail drawer */}
        {detail && (
          <div className="unified-btcmap__drawer" role="dialog" aria-label={t('map.details')}>
            <button
              type="button"
              className="unified-btcmap__drawer-close"
              onClick={closeDrawer}
              aria-label={t('map.drawerClose')}
            >
              <X size={16} />
            </button>
            <div className="unified-btcmap__drawer-body">
              <p className="btcmap-popup__eyebrow">
                {materialIconGlyph(detail.icon)} {t('map.popupMerchant')}
                {isPlaceBoosted(detail) ? ` · ${t('map.popupBoosted')}` : ''}
              </p>
              <h4 className="unified-btcmap__drawer-title">{detail.name}</h4>
              {detail.address && (
                <p className="btcmap-popup__meta">{detail.address}</p>
              )}
              {detail.phone && (
                <p className="btcmap-popup__meta">
                  <a href={`tel:${detail.phone}`}>{detail.phone}</a>
                </p>
              )}
              {detail.opening_hours && (
                <p className="btcmap-popup__meta">
                  {t('map.popupHours')}: {detail.opening_hours}
                </p>
              )}
              {detail.verified_at && (
                <p className="btcmap-popup__meta">
                  {t('map.popupVerified')} {detail.verified_at.slice(0, 10)}
                </p>
              )}
              {detail.description && (
                <p className="unified-btcmap__drawer-desc">{detail.description}</p>
              )}

              {drawerLoading && (
                <p className="btcmap-popup__meta btcmap-popup__loading">
                  <Loader2 size={12} className="inline animate-spin mr-1" />
                  {t('map.loading')}
                </p>
              )}

              {placeComments.length > 0 && (
                <div className="unified-btcmap__drawer-comments">
                  <p className="unified-btcmap__drawer-section-title">
                    {t('map.drawerComments')}
                  </p>
                  {placeComments.slice(0, 2).map((comment) => (
                    <blockquote key={comment.id} className="unified-btcmap__drawer-comment">
                      “{comment.text}”
                    </blockquote>
                  ))}
                </div>
              )}

              <div className="unified-btcmap__drawer-links">
                <a
                  href={buildDirectionsUrl(detail.lat, detail.lon)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="unified-btcmap__drawer-link"
                >
                  {t('map.drawerDirections')} →
                </a>
                {buildOsmPlaceUrl(detail.osm_id) && (
                  <a
                    href={buildOsmPlaceUrl(detail.osm_id) ?? ''}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="unified-btcmap__drawer-link"
                  >
                    {t('map.drawerViewOsm')} →
                  </a>
                )}
                <a
                  href={buildOSMNoteUrl(detail.lat, detail.lon, `Issue at ${detail.name}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="unified-btcmap__drawer-link"
                >
                  {t('map.drawerReport')} →
                </a>
                {detail.website && (
                  <a
                    href={detail.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="unified-btcmap__drawer-link"
                  >
                    {t('map.popupWebsite')} →
                  </a>
                )}
                <a
                  href={buildBTCMapPlaceUrl(detail.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="unified-btcmap__drawer-link"
                >
                  {t('map.popupViewOnMap')} →
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="unified-btcmap__legend">
          <span>
            <span className="unified-btcmap__legend-swatch unified-btcmap__legend-swatch--merchant" aria-hidden />
            ₿ {t('map.legendMerchant')}
          </span>
          <span>
            <span className="unified-btcmap__legend-swatch unified-btcmap__legend-swatch--katoa" aria-hidden />
            {t('map.legendKatoa')}
          </span>
          {showEvents && (
            <span>
              <span className="unified-btcmap__legend-swatch unified-btcmap__legend-swatch--events" aria-hidden />
              {t('map.events')}
            </span>
          )}
        </div>

        {/* Areas here chips */}
        {(areasAt.length > 0 || areasLoading) && (
          <div className="unified-btcmap__areas" role="group" aria-label={t('map.areasHere')}>
            <span className="unified-btcmap__areas-label">{t('map.areasHere')}:</span>
            {areasLoading && areasAt.length === 0 && (
              <Loader2 size={12} className="animate-spin text-gray-500" />
            )}
            {areasAt.map((area) => (
              <a
                key={area.id}
                href={area.website_url ?? getAppBaseUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="unified-btcmap__areas-chip"
              >
                {area.icon ? (
                  <img src={area.icon} alt="" className="unified-btcmap__areas-icon" loading="lazy" />
                ) : (
                  <span aria-hidden>🗺</span>
                )}
                {area.name}
              </a>
            ))}
          </div>
        )}
      </div>

      {katoaPins.length > 0 && showKatoa && (
        <div className="unified-btcmap__chips">
          {katoaPins.slice(0, 6).map((pin) => (
            <Link
              key={pin.id}
              href={`/wishlist/${pin.slug}`}
              className="unified-btcmap__chip"
              title="Click to fly to pin · ⌘/Ctrl-click to open wishlist"
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey) return;
                e.preventDefault();
                flyToPin(pin);
              }}
            >
              {pin.title.length > 32 ? `${pin.title.slice(0, 32)}…` : pin.title}
            </Link>
          ))}
          {katoaPins.length > 6 && (
            <span className="text-xs text-gray-500 self-center">+{katoaPins.length - 6} more</span>
          )}
        </div>
      )}

      {/* Recent activity for visible places */}
      {(activity.length > 0 || activityLoading) && showMerchants && (
        <div className="unified-btcmap__activity" role="region" aria-label={t('map.activity')}>
          <span className="unified-btcmap__activity-title">
            {t('map.activity')}
            {activityLoading && <Loader2 size={12} className="inline animate-spin ml-1" />}
          </span>
          {activity.length === 0 && activityLoading && (
            <span className="text-xs text-gray-500">{t('map.loading')}</span>
          )}
          {activity.length > 0 && (
            <ul className="unified-btcmap__activity-list">
              {activity.map((item) => {
                const meta = ACTIVITY_TYPE_META[item.type] ?? { glyph: '🔵', labelKey: '' };
                return (
                  <li key={`${item.type}-${item.place_id}-${item.date}`}>
                    <button
                      type="button"
                      className="unified-btcmap__activity-item"
                      onClick={() => void revealPlace(item.place_id)}
                    >
                      <span className="unified-btcmap__activity-glyph" aria-hidden>
                        {meta.glyph}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-medium text-gray-200">
                          {item.place_name ?? t('map.popupMerchant')}
                        </span>
                        <span className="block text-[10px] text-gray-500">
                          {meta.labelKey ? t(meta.labelKey) : ''}
                          {' · '}
                          {formatRelativeTime(new Date(item.date), language)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {activity.length === 0 && !activityLoading && (
            <span className="text-xs text-gray-500">{t('map.noActivity')}</span>
          )}
        </div>
      )}

      <p className="unified-btcmap__attribution">
        {BTCMAP_ATTRIBUTION}
        <Button
          variant="ghost"
          size="sm"
          className="ml-2 text-gray-500 hover:text-neon-cyan-400 h-auto py-0 px-1"
          onClick={() => {
            setShowMerchants(true);
            setShowKatoa(true);
          }}
        >
          {t('map.showAllLayers')}
        </Button>
      </p>
    </div>
  );
}
