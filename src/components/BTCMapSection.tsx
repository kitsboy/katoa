import { useEffect, useState } from 'react';
import { BTCMapEmbed } from './BTCMapEmbed';
import { KatoaPinsMap } from './KatoaPinsMap';
import type { KatoaMapPin, BTCMapCoordinates } from '../lib/btcmap';
import { fetchBTCMapAreas, isBTCMapEnabled } from '../lib/btcmap';

interface BTCMapSectionProps {
  mapCenter: BTCMapCoordinates;
  pins: KatoaMapPin[];
}

export function BTCMapSection({ mapCenter, pins }: BTCMapSectionProps) {
  const [merchantAreas, setMerchantAreas] = useState<number | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!isBTCMapEnabled()) return;
    fetchBTCMapAreas()
      .then((areas) => setMerchantAreas(areas.length))
      .catch((err: Error) => setApiError(err.message));
  }, []);

  if (!isBTCMapEnabled()) {
    return <p className="text-gray-400 text-center py-12">BTC Map integration disabled</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 text-xs">
        <span className="px-3 py-1.5 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan-400 font-medium">
          ₿ BTC Map merchants{merchantAreas !== null ? ` · ${merchantAreas} areas` : ''}
        </span>
        <span className="px-3 py-1.5 rounded-full bg-bitcoin-orange-500/10 border border-bitcoin-orange-500/30 text-bitcoin-orange-400 font-medium">
          ⚡ {pins.length} Katoa project{pins.length !== 1 ? 's' : ''} on map
        </span>
        {apiError && (
          <span className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
            API: using embed only
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <BTCMapEmbed
          latitude={mapCenter.latitude}
          longitude={mapCenter.longitude}
          zoom={mapCenter.zoom}
          title="Bitcoin Merchants (BTC Map)"
          height="min(55vh, 420px)"
          showAttribution={false}
        />
        <KatoaPinsMap
          pins={pins}
          center={mapCenter}
          height="min(55vh, 420px)"
        />
      </div>

      <p className="text-xs text-gray-500 text-center">
        BTC Map shows verified merchants · Orange pins are Katoa creator projects · Same region, two layers
      </p>
    </div>
  );
}