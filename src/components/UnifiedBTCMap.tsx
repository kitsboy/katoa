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
  Search,
  X,
} from 'lucide-react';
import { Link } from './Link';
import { Button } from './Button';
import { useLanguage } from '../contexts/LanguageContext';
import { getStorage, setStorage, STORAGE_KEYS } from '../lib/storage';
import {
  BTCMAP_ATTRIBUTION,
  LEAFLET_BASEMAP_OPTIONS,
  LEAFLET_BASEMAP_URL,
  MERCHANT_CATEGORIES,
  type BTCMapCoordinates,
  type BTCMapPlace,
  type BTCMapPopupStrings,
  type BTCMapSearchResult,
  type KatoaMapPin,
  buildMerchantPopupHtml,
  escapeMapPopupText,
  fetchPlaceById,
  fetchPlacesNearby,
  getAppBaseUrl,
  isPlaceBoosted,
  isBTCMapEnabled,
  materialIconGlyph,
  merchantCategoryFor,
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

/** Clean orange teardrop — no brand logo image (avoids logo smear on basemap). */
function createKatoaIcon(L: typeof import('leaflet'), coverImage?: string | null) {
  const photo = sanitizeImageUrl(coverImage);
  if (photo) {
    return L.divIcon({
      className: 'katoa-pin-marker leaflet-div-icon',
      html: `<div class="katoa-map-pin katoa-map-pin--photo" style="background-image:url(&quot;${escapeMapPopupText(photo)}&quot;)" aria-hidden="true"></div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -18],
    });
  }
  return L.divIcon({
    className: 'katoa-pin-marker leaflet-div-icon',
    html: `<div class="katoa-map-pin" aria-hidden="true"><span class="katoa-map-pin__dot">K</span></div>`,
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

function bindMerchantPopup(
  marker: import('leaflet').Marker,
  place: BTCMapPlace,
  strings: BTCMapPopupStrings
) {
  marker.bindPopup(buildMerchantPopupHtml(place, { strings }), {
    className: 'btcmap-leaflet-popup',
    maxWidth: 280,
  });

  marker.on('popupopen', () => {
    // Hydrate with GET /v4/places/{id} for phone/hours/comments
    void (async () => {
      try {
        const detail = await fetchPlaceById(place.id);
        if (!detail) return;
        marker.setPopupContent(buildMerchantPopupHtml(detail, { strings }));
      } catch {
        /* keep list-level popup */
      }
    })();
  });
}

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
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { t, language } = useLanguage();

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

  useEffect(() => {
    setStorage(STORAGE_KEYS.mapShowMerchants, showMerchants);
  }, [showMerchants]);

  useEffect(() => {
    setStorage(STORAGE_KEYS.mapShowKatoa, showKatoa);
  }, [showKatoa]);

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

  const renderMerchantLayer = useCallback(
    (map: import('leaflet').Map, L: typeof import('leaflet')) => {
      const layer = merchantLayerRef.current;
      if (!layer) return;

      layer.clearLayers();
      merchantMarkersRef.current.clear();

      const allPlaces = merchantPlacesRef.current;
      if (allPlaces.length === 0) return;

      const category = merchantCategoryRef.current;
      const places =
        category === 'all'
          ? allPlaces
          : allPlaces.filter((place) => merchantCategoryFor(place.icon) === category);
      if (places.length === 0) return;

      const { clusters, singles } = clusterPlaces(places, map);

      singles.forEach((place) => {
        const marker = L.marker([place.lat, place.lon], {
          icon: createMerchantIcon(L, place),
        });
        bindMerchantPopup(marker, place, popupStringsRef.current);
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
    []
  );

  const revealPlace = useCallback(async (placeId: number) => {
    const map = mapRef.current;
    if (!map) return;
    setShowMerchants(true);

    const detail = await fetchPlaceById(placeId).catch(() => null);
    if (!detail) return;

    map.flyTo([detail.lat, detail.lon], 15, { duration: 0.7 });

    const L = await import('leaflet');
    let marker = merchantMarkersRef.current.get(placeId);
    if (!marker && merchantLayerRef.current) {
      marker = L.marker([detail.lat, detail.lon], { icon: createMerchantIcon(L, detail) });
      bindMerchantPopup(marker, detail, popupStringsRef.current);
      merchantLayerRef.current.addLayer(marker);
      merchantMarkersRef.current.set(placeId, marker);
    }
    if (marker) {
      marker.setPopupContent(buildMerchantPopupHtml(detail, { strings: popupStringsRef.current }));
      setTimeout(() => marker?.openPopup(), 350);
    }

    const url = new URL(window.location.href);
    url.searchParams.set('lat', detail.lat.toFixed(5));
    url.searchParams.set('lon', detail.lon.toFixed(5));
    url.searchParams.set('zoom', '15');
    url.searchParams.set('place', String(placeId));
    window.history.replaceState(null, '', url);
  }, []);

  useEffect(() => {
    merchantCategoryRef.current = merchantCategory;
    if (mapReady && showMerchants && mapRef.current) {
      import('leaflet').then((L) => renderMerchantLayer(mapRef.current!, L));
    }
  }, [merchantCategory, mapReady, showMerchants, renderMerchantLayer]);

  const loadMerchants = useCallback(async (map: import('leaflet').Map, L: typeof import('leaflet')) => {
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

      merchantPlacesRef.current = places;
      renderMerchantLayer(map, L);

      setMerchantCount(places.length);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setMerchantError(err instanceof Error ? err.message : 'Failed to load merchants');
      setMerchantCount(0);
    } finally {
      setLoadingMerchants(false);
    }
  }, [showMerchants, renderMerchantLayer]);

  const renderKatoaPins = useCallback((L: typeof import('leaflet')) => {
    if (!katoaLayerRef.current) return;
    katoaLayerRef.current.clearLayers();

    katoaPins.forEach((pin) => {
      const marker = L.marker([pin.latitude, pin.longitude], {
        icon: createKatoaIcon(L, pin.cover_image),
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

      const map = L.map(containerRef.current, {
        center: [urlView.lat ?? center.latitude, urlView.lon ?? center.longitude],
        zoom: urlView.zoom ?? center.zoom ?? 4,
        zoomControl: false,
        scrollWheelZoom: true,
      });

      L.tileLayer(LEAFLET_BASEMAP_URL, { ...LEAFLET_BASEMAP_OPTIONS }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      merchantLayerRef.current = L.layerGroup().addTo(map);
      katoaLayerRef.current = L.layerGroup().addTo(map);

      renderKatoaPins(L);
      await loadMerchants(map, L);

      const onMoveEnd = () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => loadMerchants(map, L), 450);
        const c = map.getCenter();
        const url = new URL(window.location.href);
        url.searchParams.set('lat', c.lat.toFixed(5));
        url.searchParams.set('lon', c.lng.toFixed(5));
        url.searchParams.set('zoom', String(Math.round(map.getZoom())));
        url.searchParams.delete('place');
        window.history.replaceState(null, '', url);
      };
      map.on('moveend', onMoveEnd);
      map.on('zoomend', () => renderMerchantLayer(map, L));

      if (!hasUrlView && katoaPins.length > 0) {
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
      import('leaflet').then((L) => loadMerchants(map, L));
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

  // Re-render KATOA pins when data changes
  useEffect(() => {
    if (!mapReady || !showKatoa) return;
    import('leaflet').then((L) => renderKatoaPins(L));
  }, [katoaPins, mapReady, showKatoa, renderKatoaPins]);

  const bothOff = !showMerchants && !showKatoa;

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

        <div
          ref={containerRef}
          className="unified-btcmap__canvas"
          role="region"
          aria-label={t('map.title')}
          tabIndex={0}
        />

        <div className="unified-btcmap__legend">
          <span>
            <span className="unified-btcmap__legend-swatch unified-btcmap__legend-swatch--merchant" aria-hidden />
            ₿ {t('map.legendMerchant')}
          </span>
          <span>
            <span className="unified-btcmap__legend-swatch unified-btcmap__legend-swatch--katoa" aria-hidden />
            {t('map.legendKatoa')}
          </span>
        </div>
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