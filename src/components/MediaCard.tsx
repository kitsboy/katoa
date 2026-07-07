import { ReactNode, useRef, useState } from 'react';
import { Gift, Play, Volume2, VolumeX } from 'lucide-react';

export interface MediaCardSource {
  imageUrl?: string | null;
  videoUrl?: string | null;
  alt: string;
}

interface MediaCardProps {
  media: MediaCardSource;
  aspect?: 'wide' | 'square' | 'tall';
  className?: string;
  overlay?: ReactNode;
  topLeft?: ReactNode;
  topRight?: ReactNode;
  bottomLeft?: ReactNode;
  bottomRight?: ReactNode;
  autoplayOnHover?: boolean;
  showPlayIndicator?: boolean;
}

const aspectClasses = {
  wide: 'aspect-[16/10] sm:aspect-[16/9]',
  square: 'aspect-square',
  tall: 'aspect-[4/5]',
};

export function MediaCard({
  media,
  aspect = 'wide',
  className = '',
  overlay,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  autoplayOnHover = true,
  showPlayIndicator = true,
}: MediaCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [videoFailed, setVideoFailed] = useState(false);

  const hasVideo = Boolean(media.videoUrl) && !videoFailed;
  const hasImage = Boolean(media.imageUrl);

  const handleMouseEnter = () => {
    if (!autoplayOnHover || !hasVideo || !videoRef.current) return;
    videoRef.current.play().catch(() => undefined);
  };

  const handleMouseLeave = () => {
    if (!hasVideo || !videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
  };

  return (
    <div
      className={`relative overflow-hidden bg-charcoal-900 ${aspectClasses[aspect]} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {!hasVideo && !hasImage && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-charcoal-800 to-charcoal-950">
          <Gift size={64} className="text-white/15 animate-float" />
        </div>
      )}

      {hasImage && (
        <img
          src={media.imageUrl!}
          alt={media.alt}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            hasVideo ? 'group-hover:opacity-0' : ''
          }`}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      )}

      {hasVideo && (
        <video
          ref={videoRef}
          src={media.videoUrl!}
          className="absolute inset-0 w-full h-full object-cover"
          muted={muted}
          loop
          playsInline
          preload="metadata"
          poster={media.imageUrl || undefined}
          onError={() => setVideoFailed(true)}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 pointer-events-none" />

      {overlay}

      {topLeft && <div className="absolute top-3 left-3 z-10">{topLeft}</div>}
      {topRight && <div className="absolute top-3 right-3 z-10">{topRight}</div>}
      {bottomLeft && <div className="absolute bottom-3 left-3 z-10">{bottomLeft}</div>}
      {bottomRight && <div className="absolute bottom-3 right-3 z-10 flex flex-wrap gap-1.5 justify-end max-w-[70%]">{bottomRight}</div>}

      {hasVideo && showPlayIndicator && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMuted((m) => !m);
            }}
            className="p-2 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 text-white hover:bg-black/80 transition-colors touch-manipulation"
            aria-label={muted ? 'Unmute video' : 'Mute video'}
          >
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          <span className="px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-[10px] font-bold text-white/90 flex items-center gap-1">
            <Play size={10} className="fill-white" />
            VIDEO
          </span>
        </div>
      )}
    </div>
  );
}