import { memo } from 'react';
import { Heart, Lock, Play, Sparkles, User } from 'lucide-react';
import { Link } from './Link';
import { Card } from './Card';
import { MediaCard } from './MediaCard';
import { ProgressBar } from './ProgressBar';
import { SatsDisplay } from './SatsDisplay';

export interface CreatorVideoWishlist {
  id: string;
  title: string;
  description: string;
  slug: string;
  cover_image: string | null;
  cover_video_url?: string | null;
  total_sats_goal: number;
  total_sats_raised: number;
  country?: string;
  country_flag?: string;
  city?: string;
  created_at?: string;
  creator: {
    username: string;
    avatar_url?: string | null;
    bio?: string;
  };
  subscriber_count?: number;
}

interface CreatorVideoCardProps {
  wishlist: CreatorVideoWishlist;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  t: (key: string) => string;
  compact?: boolean;
}

/** Subscription-platform style video preview card (OnlyFans-inspired layout). */
export const CreatorVideoCard = memo(function CreatorVideoCard({
  wishlist,
  isFavorite = false,
  onToggleFavorite,
  t,
  compact = false,
}: CreatorVideoCardProps) {
  const progress =
    wishlist.total_sats_goal > 0
      ? (wishlist.total_sats_raised / wishlist.total_sats_goal) * 100
      : 0;
  const subscribers = wishlist.subscriber_count ?? Math.floor(wishlist.total_sats_raised / 1200) + 42;

  return (
    <Link href={`/u/${wishlist.creator.username}`} className="group block h-full min-h-0" data-testid="creator-video-card">
      <Card
        hover
        className={`creator-video-card explore-wishlist-card h-full min-h-0 flex flex-col ${
          compact ? 'creator-video-card--compact' : ''
        }`}
      >
        <div className="shrink-0 overflow-hidden rounded-t-2xl">
          <MediaCard
          media={{
            imageUrl: wishlist.cover_image,
            videoUrl: wishlist.cover_video_url,
            alt: wishlist.title,
          }}
          aspect="tall"
          className={compact ? '!aspect-[4/3] sm:!aspect-[5/4]' : '!aspect-[3/4] sm:!aspect-[4/5]'}
          variant="creator"
          topLeft={
            <span className="creator-video-card__badge">
              <Sparkles size={10} className="inline mr-1" />
              {t('explore.exclusive')}
            </span>
          }
          topRight={
            <div className="flex items-center gap-2">
              {wishlist.country_flag && (
                <span className="text-xl drop-shadow-lg">{wishlist.country_flag}</span>
              )}
              {onToggleFavorite && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleFavorite(wishlist.id);
                  }}
                  className="p-2 rounded-full bg-black/45 backdrop-blur-md border border-white/15 hover:border-katoa-violet-400/70 hover:bg-black/65 transition-colors touch-manipulation"
                  aria-label={isFavorite ? t('explore.removeFavorite') : t('explore.addFavorite')}
                  aria-pressed={isFavorite}
                >
                  <Heart
                    size={18}
                    className={isFavorite ? 'fill-katoa-fuchsia-400 text-katoa-fuchsia-400' : 'text-white'}
                  />
                </button>
              )}
            </div>
          }
          bottomRight={
            wishlist.cover_video_url ? (
              <span className="creator-video-card__video-pill">
                <Play size={10} className="fill-white" />
                {t('explore.video')}
              </span>
            ) : undefined
          }
          />
        </div>

        <div className="p-4 pb-5 flex flex-col flex-1 min-h-0 bg-gradient-to-b from-[#1a1428] to-[#150d22] border-t border-katoa-violet/25">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative shrink-0">
              {wishlist.creator.avatar_url ? (
                <img
                  src={wishlist.creator.avatar_url}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover border-2 border-katoa-violet-400/70 ring-2 ring-katoa-fuchsia-400/25 ring-offset-2 ring-offset-[#1a1428]"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-katoa-violet-500/50 to-katoa-fuchsia-500/45 border-2 border-katoa-violet-400/60 flex items-center justify-center">
                  <User size={18} className="text-white" />
                </div>
              )}
              <span className="creator-video-card__online" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white font-bold text-sm truncate">@{wishlist.creator.username}</p>
              <p className="text-katoa-violet-300 text-xs font-semibold tracking-tight">
                {subscribers.toLocaleString()} {t('explore.supporters')}
              </p>
            </div>
            {!compact && <Lock size={14} className="text-[#8b7fa5] shrink-0" aria-hidden />}
          </div>

          <h3 className="text-white font-bold text-base sm:text-lg mb-1 leading-snug tracking-[-0.012em] line-clamp-2 group-hover:text-katoa-violet-200 transition-colors">
            {wishlist.title}
          </h3>
          {!compact && (
            <p className="text-[#a899c0] text-sm line-clamp-2 mb-3 flex-1 min-h-0">{wishlist.description}</p>
          )}

          <div className="shrink-0 mt-auto pb-0.5">
            <ProgressBar
              current={wishlist.total_sats_raised}
              goal={wishlist.total_sats_goal}
              showPercentage={false}
              showValues={false}
              height="sm"
              gradient="from-katoa-violet-400 to-katoa-fuchsia-400"
            />
            <div className="flex items-center justify-between mt-2 text-xs text-[#a899c0]">
              <span>{Math.round(progress)}% {t('explore.raised')}</span>
              <SatsDisplay sats={wishlist.total_sats_raised} size="sm" className="text-katoa-violet-200" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
});