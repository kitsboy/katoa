import { useCallback, useEffect, useRef, useState } from 'react';
import { Crosshair, ExternalLink, Layers, Loader2, MapPin, Maximize2, Minimize2 } from 'lucide-react';
import { Link } from './Link';
import { Button } from './Button';
import { useLanguage } from '../contexts/LanguageContext';
import { getStorage, setStorage, STORAGE_KEYS } from '../lib/storage';
import {
  BTCMAP_ATTRIBUTION,
  type BTCMapCoordinates,
  type KatoaMapPin,
  buildBTCMapPlaceUrl,
  escapeMapPopupText,
  fetchPlacesNearby,
  getAppBaseUrl,
  isBTCMapEnabled,
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

function createKatoaIcon(L: typeof import('leaflet')) {
  return L.divIcon({
    className: 'katoa-logo-marker',
    html: `<div class="katoa-logo-pin" aria-hidden="true">
      <img src="/logo2.png" alt="" width="22" height="22" />
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -32],
  });
}

function createMerchantIcon(L: typeof import('leaflet'), boosted = false) {
  return L.divIcon({
    className: 'btc-merchant-marker',
    html: `<div class="btc-merchant-pin${boosted ? ' btc-merchant-pin--boosted' : ''}" aria-hidden="true">₿</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -22],
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

  const { t } = useLanguage();
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
  const [mapReady, setMapReady] = useState(false);

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

      merchantLayerRef.current.clearLayers();
      places.forEach((place) => {
        const boosted = Boolean(place.boosted_until && new Date(place.boosted_until) > new Date());
        const marker = L.marker([place.lat, place.lon], {
          icon: createMerchantIcon(L, boosted),
        });

        const popup = `
          <div class="btcmap-popup">
            <p class="btcmap-popup__eyebrow">BTC Map merchant${boosted ? ' · Boosted' : ''}</p>
            <strong class="btcmap-popup__title">${escapeMapPopupText(place.name)}</strong>
            ${place.address ? `<p class="btcmap-popup__meta">${escapeMapPopupText(place.address)}</p>` : ''}
            <a href="${buildBTCMapPlaceUrl(place.id)}" target="_blank" rel="noopener noreferrer" class="btcmap-popup__link">
              View on BTC Map →
            </a>
          </div>
        `;
        marker.bindPopup(popup, { className: 'btcmap-leaflet-popup', maxWidth: 260 });
        merchantLayerRef.current!.addLayer(marker);
      });

      setMerchantCount(places.length);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setMerchantError(err instanceof Error ? err.message : 'Failed to load merchants');
      setMerchantCount(0);
    } finally {
      setLoadingMerchants(false);
    }
  }, [showMerchants]);

  const renderKatoaPins = useCallback((L: typeof import('leaflet')) => {
    if (!katoaLayerRef.current) return;
    katoaLayerRef.current.clearLayers();

    katoaPins.forEach((pin) => {
      const marker = L.marker([pin.latitude, pin.longitude], {
        icon: createKatoaIcon(L),
      });

      const popup = `
        <div class="btcmap-popup btcmap-popup--katoa">
          <p class="btcmap-popup__eyebrow">KATOA creator project</p>
          <strong class="btcmap-popup__title">${escapeMapPopupText(pin.title)}</strong>
          <p class="btcmap-popup__meta">${formatSats(pin.total_sats_raised)} sats raised</p>
          <a href="/wishlist/${pin.slug}" class="btcmap-popup__link btcmap-popup__link--katoa">
            View wishlist →
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

      const map = L.map(containerRef.current, {
        center: [center.latitude, center.longitude],
        zoom: center.zoom ?? 4,
        zoomControl: false,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://tiles.openfreemap.org/osm/{z}/{x}/{y}.png', {
        attribution: '© OpenFreeMap · © OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      merchantLayerRef.current = L.layerGroup().addTo(map);
      katoaLayerRef.current = L.layerGroup().addTo(map);

      renderKatoaPins(L);
      await loadMerchants(map, L);

      const onMoveEnd = () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => loadMerchants(map, L), 450);
      };
      map.on('moveend', onMoveEnd);

      if (katoaPins.length > 0) {
        const bounds = L.latLngBounds(katoaPins.map((p) => [p.latitude, p.longitude] as [number, number]));
        if (katoaPins.length > 1) {
          map.fitBounds(bounds, { padding: [48, 48], maxZoom: 10 });
        }
      }

      mapRef.current = map;
      setMapReady(true);
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
            <img src="/logo2.png" alt="" width={16} height={16} className="rounded-sm" aria-hidden />
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

        <div ref={containerRef} className="unified-btcmap__canvas" />

        <div className="unified-btcmap__legend">
          <span><span className="unified-btcmap__legend-swatch unified-btcmap__legend-swatch--merchant" /> ₿ {t('map.legendMerchant')}</span>
          <span><img src="/logo2.png" alt="" width={14} height={14} className="rounded-sm" aria-hidden /> {t('map.legendKatoa')}</span>
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