import { ReactNode, useEffect, useRef, useState } from 'react';
import { Gift, Play, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export interface MediaCardSource {
  imageUrl?: string | null;
  videoUrl?: string | null;
  alt: string;
}

interface MediaCardProps {
  media: MediaCardSource;
  aspect?: 'wide' | 'square' | 'tall';
  variant?: 'default' | 'creator';
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
  variant = 'default',
  className = '',
  overlay,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  autoplayOnHover = true,
  showPlayIndicator = true,
}: MediaCardProps) {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [videoFailed, setVideoFailed] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shouldAutoplay = autoplayOnHover && !prefersReducedMotion;

  const canPreview = Boolean(media.videoUrl) && !videoFailed;
  const hasVideo = canPreview;
  const hasImage = Boolean(media.imageUrl);

  useEffect(() => {
    if (!previewing || !canPreview || !videoRef.current) return;
    videoRef.current.play().catch(() => setVideoFailed(true));
  }, [previewing, canPreview]);

  const stopPreview = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setPreviewing(false);
  };

  const startPreview = () => {
    if (!shouldAutoplay || !canPreview) return;
    setPreviewing(true);
  };

  const handleMouseEnter = () => {
    startPreview();
  };

  const handleMouseLeave = () => {
    stopPreview();
  };

  const isCreator = variant === 'creator';

  return (
    <div
      className={`relative overflow-hidden bg-charcoal-900 ${aspectClasses[aspect]} ${className} ${
        isCreator ? 'media-card--creator' : ''
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={shouldAutoplay ? startPreview : undefined}
      onTouchEnd={shouldAutoplay ? stopPreview : undefined}
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
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
            previewing && canPreview ? 'opacity-0' : 'opacity-100'
          }`}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      )}

      {previewing && canPreview && (
        <video
          ref={videoRef}
          src={media.videoUrl!}
          className="absolute inset-0 w-full h-full object-cover z-[1]"
          muted={muted}
          loop
          playsInline
          preload="auto"
          poster={media.imageUrl || undefined}
          onError={() => {
            setVideoFailed(true);
            setPreviewing(false);
          }}
        />
      )}

      <div
        className={`absolute inset-0 pointer-events-none ${
          isCreator
            ? 'bg-gradient-to-t from-black/90 via-black/30 to-transparent'
            : 'bg-gradient-to-t from-black/80 via-black/20 to-black/10'
        }`}
      />

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
            aria-label={muted ? t('media.unmute') : t('media.mute')}
          >
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          <span
            className={`px-2 py-1 rounded-full backdrop-blur-sm text-[10px] font-bold text-white/90 flex items-center gap-1 ${
              isCreator ? 'bg-[#00aff0]/80' : 'bg-black/50'
            }`}
          >
            <Play size={10} className="fill-white" />
            VIDEO
          </span>
        </div>
      )}
    </div>
  );
}