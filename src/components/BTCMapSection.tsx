import type { KatoaMapPin, BTCMapCoordinates } from '../lib/btcmap';
import { isBTCMapEnabled } from '../lib/btcmap';
import { UnifiedBTCMap } from './UnifiedBTCMap';

interface BTCMapSectionProps {
  mapCenter: BTCMapCoordinates;
  pins: KatoaMapPin[];
}

export function BTCMapSection({ mapCenter, pins }: BTCMapSectionProps) {
  if (!isBTCMapEnabled()) {
    return (
      <p className="text-gray-400 text-center py-12 rounded-2xl border border-white/10 bg-charcoal-900/50">
        BTC Map integration disabled
      </p>
    );
  }

  return (
    <UnifiedBTCMap
      center={mapCenter}
      katoaPins={pins}
      height="min(62vh, 520px)"
    />
  );
}