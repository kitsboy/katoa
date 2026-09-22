import { ReactNode, useEffect, useRef, useState } from 'react';
import { Gift, Play, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { DemoPreviewBadge } from './DemoPreviewBadge';

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
  priority?: boolean;
  /** Keep a featured video playing so the sound control is always meaningful. */
  alwaysPlay?: boolean;
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
  priority = false,
  alwaysPlay = false,
}: MediaCardProps) {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [videoFailed, setVideoFailed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [previewing, setPreviewing] = useState(alwaysPlay);
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shouldAutoplay = autoplayOnHover && !prefersReducedMotion;

  const canPreview = Boolean(media.videoUrl) && !videoFailed;
  const hasVideo = canPreview;
  const hasImage = Boolean(media.imageUrl) && !imageFailed;

  useEffect(() => {
    if (alwaysPlay) setPreviewing(true);
  }, [alwaysPlay, media.videoUrl]);

  useEffect(() => {
    if (!previewing || !canPreview || !videoRef.current) return;
    const playback = videoRef.current.play();
    if (playback && typeof playback.catch === 'function') {
      playback.catch(() => setVideoFailed(true));
    }
  }, [previewing, canPreview]);

  const stopPreview = () => {
    if (alwaysPlay) return;
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

  const isCreator = variant === 'creator';

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-[#24163b] via-charcoal-900 to-[#090912] ${aspectClasses[aspect]} ${className} ${
        isCreator ? 'media-card--creator' : ''
      }`}
      onMouseEnter={startPreview}
      onMouseLeave={stopPreview}
      onTouchStart={shouldAutoplay ? startPreview : undefined}
      onTouchEnd={shouldAutoplay && !alwaysPlay ? stopPreview : undefined}
    >
      {!hasVideo && !hasImage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_50%_35%,rgba(167,139,250,0.3),transparent_58%),linear-gradient(135deg,#211633,#0b0a12)]">
          <Gift size={38} className="text-white/25" aria-hidden />
          <DemoPreviewBadge compact />
        </div>
      )}

      {hasImage && (
        <img
          src={media.imageUrl!}
          alt={media.alt}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-500 group-hover:scale-105 ${
            previewing && canPreview ? 'opacity-0' : 'opacity-100'
          }`}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          onError={() => setImageFailed(true)}
        />
      )}

      {previewing && canPreview && (
        <video
          ref={videoRef}
          src={media.videoUrl!}
          className="absolute inset-0 w-full h-full object-cover object-center z-[1]"
          muted={muted}
          loop
          playsInline
          preload="metadata"
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
