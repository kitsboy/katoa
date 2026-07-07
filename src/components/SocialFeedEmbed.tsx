import { useState } from 'react';
import { Card } from './Card';
import { X } from 'lucide-react';

interface SocialFeedEmbedProps {
  feedUrl?: string;
  title?: string;
  height?: string;
  onRemove?: () => void;
}

export function SocialFeedEmbed({
  feedUrl,
  title = 'Social Feed',
  height = '600px',
  onRemove
}: SocialFeedEmbedProps) {
  const [loading, setLoading] = useState(true);

  if (!feedUrl) return null;

  return (
    <Card className="relative overflow-hidden">
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors"
          title="Remove feed"
        >
          <X size={16} />
        </button>
      )}

      <div className="p-4 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>

      <div className="relative" style={{ height }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-charcoal-900">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        )}

        <iframe
          src={feedUrl}
          title={title}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          onLoad={() => setLoading(false)}
          loading="lazy"
        />
      </div>
    </Card>
  );
}
