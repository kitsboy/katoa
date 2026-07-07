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
    <Link href={`/wishlist/${wishlist.slug}`} className="group block h-full" data-testid="creator-video-card">
      <Card
        hover
        className={`creator-video-card overflow-hidden h-full flex flex-col ${
          compact ? 'creator-video-card--compact' : ''
        }`}
      >
        <MediaCard
          media={{
            imageUrl: wishlist.cover_image,
            videoUrl: wishlist.cover_video_url,
            alt: wishlist.title,
          }}
          aspect="tall"
          className="!aspect-[3/4] sm:!aspect-[4/5]"
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
                  className="p-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 hover:border-[#00aff0]/50 transition-colors touch-manipulation"
                  aria-label={isFavorite ? t('explore.removeFavorite') : t('explore.addFavorite')}
                  aria-pressed={isFavorite}
                >
                  <Heart
                    size={18}
                    className={isFavorite ? 'fill-[#00aff0] text-[#00aff0]' : 'text-white'}
                  />
                </button>
              )}
            </div>
          }
          bottomRight={
            <span className="creator-video-card__video-pill">
              <Play size={10} className="fill-white" />
              {t('explore.video')}
            </span>
          }
        />

        <div className="p-4 flex-1 flex flex-col bg-gradient-to-b from-charcoal-900 to-charcoal-950 border-t border-[#00aff0]/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative shrink-0">
              {wishlist.creator.avatar_url ? (
                <img
                  src={wishlist.creator.avatar_url}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#00aff0]/60"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00aff0]/40 to-rose-500/40 border-2 border-[#00aff0]/50 flex items-center justify-center">
                  <User size={18} className="text-white" />
                </div>
              )}
              <span className="creator-video-card__online" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white font-bold text-sm truncate">@{wishlist.creator.username}</p>
              <p className="text-[#00aff0] text-xs font-medium">
                {subscribers.toLocaleString()} {t('explore.supporters')}
              </p>
            </div>
            <Lock size={14} className="text-gray-500 shrink-0" aria-hidden />
          </div>

          <h3 className="text-white font-bold text-base sm:text-lg mb-1 line-clamp-2 group-hover:text-[#00aff0] transition-colors">
            {wishlist.title}
          </h3>
          {!compact && (
            <p className="text-gray-400 text-sm line-clamp-2 mb-3 flex-1">{wishlist.description}</p>
          )}

          <ProgressBar
            current={wishlist.total_sats_raised}
            goal={wishlist.total_sats_goal}
            showPercentage={false}
            showValues={false}
            height="sm"
            gradient="from-[#00aff0] to-cyan-400"
          />
          <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
            <span>{Math.round(progress)}% {t('explore.raised')}</span>
            <SatsDisplay sats={wishlist.total_sats_raised} size="sm" className="text-[#00aff0]" />
          </div>
        </div>
      </Card>
    </Link>
  );
});