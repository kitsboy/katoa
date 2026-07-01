import { useEffect, useRef } from 'react';
import { Link } from './Link';
import type { KatoaMapPin } from '../lib/btcmap';
import type { BTCMapCoordinates } from '../lib/btcmap';
import 'leaflet/dist/leaflet.css';

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
  const mapRef = useRef<import('leaflet').Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || pins.length === 0) return;

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
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://tiles.openfreemap.org/osm/{z}/{x}/{y}.png', {
        attribution: '© OpenFreeMap · © OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      const icon = L.divIcon({
        className: 'katoa-pin-marker',
        html: `<div style="
          width:28px;height:28px;
          background:linear-gradient(135deg,#F7931A,#f59e0b);
          border:2px solid #fff;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          box-shadow:0 0 12px rgba(247,147,26,0.6);
        "></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28],
      });

      const bounds = L.latLngBounds([]);

      pins.forEach((pin) => {
        const marker = L.marker([pin.latitude, pin.longitude], { icon }).addTo(map);
        bounds.extend([pin.latitude, pin.longitude]);

        const raised = new Intl.NumberFormat().format(pin.total_sats_raised);
        marker.bindPopup(`
          <div style="min-width:180px;font-family:system-ui,sans-serif">
            <strong style="color:#F7931A">${pin.title}</strong>
            <p style="margin:6px 0 0;font-size:12px;color:#666">${raised} sats raised</p>
            <a href="/wishlist/${pin.slug}" style="display:inline-block;margin-top:8px;font-size:12px;color:#14E6FF;font-weight:600">View project →</a>
          </div>
        `);

        marker.on('click', () => onPinSelect?.(pin));
      });

      if (pins.length > 1) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
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