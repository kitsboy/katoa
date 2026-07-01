import { useState } from 'react';
import { ExternalLink, MapPin, Maximize2, Minimize2 } from 'lucide-react';
import { buildBTCMapEmbedUrl, BTCMAP_ATTRIBUTION } from '../lib/btcmap';
import { Button } from './Button';

interface BTCMapEmbedProps {
  latitude?: number;
  longitude?: number;
  zoom?: number;
  height?: string;
  className?: string;
  showAttribution?: boolean;
  title?: string;
}

export function BTCMapEmbed({
  latitude = 20,
  longitude = 0,
  zoom = 2,
  height = 'min(70vh, 520px)',
  className = '',
  showAttribution = true,
  title = 'Bitcoin merchants near you',
}: BTCMapEmbedProps) {
  const [expanded, setExpanded] = useState(false);
  const embedUrl = buildBTCMapEmbedUrl({ latitude, longitude, zoom });

  return (
    <div className={`relative ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <MapPin size={20} className="text-bitcoin-orange-500" />
          <h3 className="text-lg sm:text-xl font-bold text-white">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded((e) => !e)}
            className="text-gray-300"
          >
            {expanded ? <Minimize2 size={16} className="mr-1" /> : <Maximize2 size={16} className="mr-1" />}
            {expanded ? 'Collapse' : 'Expand'}
          </Button>
          <a
            href={embedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-neon-cyan-500 hover:text-neon-cyan-400 font-medium transition-colors"
          >
            Open on BTC Map
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      <div
        className={`relative rounded-2xl overflow-hidden border border-white/10 bg-charcoal-900 shadow-[0_0_40px_rgba(247,147,26,0.08)] transition-all duration-300 ${
          expanded ? 'fixed inset-4 z-[100] sm:inset-8' : ''
        }`}
        style={{ height: expanded ? 'calc(100vh - 2rem)' : height }}
      >
        {expanded && (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="absolute top-3 right-3 z-20 p-2 rounded-xl bg-black/70 text-white border border-white/20 hover:bg-black/90"
            aria-label="Close expanded map"
          >
            <Minimize2 size={18} />
          </button>
        )}
        <iframe
          src={embedUrl}
          title="BTC Map — Bitcoin merchants worldwide"
          className="w-full h-full border-0"
          loading="lazy"
          allow="geolocation"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-charcoal-950/90 to-transparent pointer-events-none" />
      </div>

      {showAttribution && (
        <p className="mt-3 text-xs text-gray-500 text-center sm:text-left">
          {BTCMAP_ATTRIBUTION}{' '}
          <span className="text-gray-600">· Staged for full API integration</span>
        </p>
      )}
    </div>
  );
}