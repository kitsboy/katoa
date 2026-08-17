import { useEffect, useRef } from 'react';
import { Link } from './Link';
import type { KatoaMapPin } from '../lib/btcmap';
import type { BTCMapCoordinates } from '../lib/btcmap';
import { mapLibreStyleUrl } from '../lib/btcmap';
import 'maplibre-gl/dist/maplibre-gl.css';

interface KatoaPinsMapProps {
  pins: KatoaMapPin[];
  center: BTCMapCoordinates;
  height?: string;
  className?: string;
  onPinSelect?: (pin: KatoaMapPin) => void;
}

export function KatoaPinsMap({
  pins,
  center,
  height = '320px',
  className = '',
  onPinSelect,
}: KatoaPinsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('maplibre-gl').Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || pins.length === 0) return;

    let cancelled = false;

    (async () => {
      const maplibregl = await import('maplibre-gl');

      if (cancelled || !containerRef.current) return;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: mapLibreStyleUrl(false),
        center: [center.longitude, center.latitude],
        zoom: center.zoom ?? 4,
        attributionControl: false,
      });

      map.addControl(
        new maplibregl.NavigationControl({ showCompass: false, visualizePitch: false }),
        'bottom-right'
      );

      const makeElement = () => {
        const el = document.createElement('div');
        el.className = 'katoa-pin-marker';
        el.style.width = '28px';
        el.style.height = '36px';
        el.innerHTML = `<div class="katoa-map-pin" aria-hidden="true"><span class="katoa-map-pin__dot">K</span></div>`;
        return el;
      };

      const lons: number[] = [];
      const lats: number[] = [];

      pins.forEach((pin) => {
        lons.push(pin.longitude);
        lats.push(pin.latitude);

        const marker = new maplibregl.Marker({ element: makeElement(), anchor: 'bottom' })
          .setLngLat([pin.longitude, pin.latitude])
          .addTo(map);

        const raised = new Intl.NumberFormat().format(pin.total_sats_raised);
        marker.setPopup(
          new maplibregl.Popup({ maxWidth: '260px', className: 'btcmap-maplibre-popup', offset: 24 }).setHTML(`
            <div style="min-width:180px;font-family:system-ui,sans-serif">
              <strong style="color:#F7931A">${pin.title}</strong>
              <p style="margin:6px 0 0;font-size:12px;color:#666">${raised} sats raised</p>
              <a href="/wishlist/${pin.slug}" style="display:inline-block;margin-top:8px;font-size:12px;color:#14E6FF;font-weight:600">View project →</a>
            </div>
          `)
        );

        marker.getElement().addEventListener('click', () => onPinSelect?.(pin));
      });

      if (pins.length > 1) {
        map.fitBounds(
          [
            [Math.min(...lons), Math.min(...lats)],
            [Math.max(...lons), Math.max(...lats)],
          ],
          { padding: 40, maxZoom: 10 }
        );
      }

      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [pins, center.latitude, center.longitude, center.zoom, onPinSelect]);

  if (pins.length === 0) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl border border-white/10 bg-charcoal-900 text-gray-500 text-sm ${className}`}
        style={{ height }}
      >
        No geolocated Katoa projects yet
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-white flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-bitcoin-orange-500 shadow-[0_0_8px_rgba(247,147,26,0.8)]" />
          Katoa Projects ({pins.length})
        </p>
        <p className="text-xs text-gray-500">Orange pins · tap for details</p>
      </div>
      <div
        ref={containerRef}
        className="rounded-2xl overflow-hidden border border-bitcoin-orange-500/30 shadow-[0_0_24px_rgba(247,147,26,0.12)] z-0"
        style={{ height, minHeight: height }}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {pins.slice(0, 5).map((pin) => (
          <Link
            key={pin.id}
            href={`/wishlist/${pin.slug}`}
            className="text-xs px-2.5 py-1 rounded-full bg-bitcoin-orange-500/15 border border-bitcoin-orange-500/30 text-bitcoin-orange-400 hover:bg-bitcoin-orange-500/25 transition-colors"
          >
            {pin.title.length > 28 ? `${pin.title.slice(0, 28)}…` : pin.title}
          </Link>
        ))}
        {pins.length > 5 && (
          <span className="text-xs text-gray-500 self-center">+{pins.length - 5} more</span>
        )}
      </div>
    </div>
  );
}
