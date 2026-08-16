import { useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Eye, Heart, Lock, MessageCircle, Play, Sparkles } from 'lucide-react';
import { MediaCard } from './MediaCard';
import { Button } from './Button';
import { SatsDisplay } from './SatsDisplay';
import { CreatorPostModal } from './CreatorPostModal';
import { formatCompactCount } from '../lib/i18nFormat';
import type { CreatorPost } from '../data/mockCreatorPosts';

interface CreatorPostFeedProps {
  creatorName: string;
  subscriberCount?: number;
  posts: CreatorPost[];
  onSubscribe?: () => void;
  onTip?: () => void;
  t: (key: string) => string;
}

function openPostOnKey(e: ReactKeyboardEvent, open: () => void) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    open();
  }
}

/**
 * OnlyFans-inspired creator post feed: a stats strip + grid of posts with
 * locked (subscriber / PPV) overlays. Tasteful, Bitcoin-native (sats prices).
 */
export function CreatorPostFeed({
  creatorName,
  subscriberCount,
  posts,
  onSubscribe,
  onTip,
  t,
}: CreatorPostFeedProps) {
  const [selectedPost, setSelectedPost] = useState<CreatorPost | null>(null);
  const totalLikes = posts.reduce((sum, post) => sum + post.likeCount, 0);

  return (
    <section aria-label={`${creatorName} · ${t('creator.posts')}`} className="mb-12">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-pink-500/20 rounded-xl">
              <Play size={22} className="text-pink-500" />
            </div>
            <h2 className="text-3xl font-black text-white">{t('creator.feedTitle')}</h2>
          </div>
          <p className="text-gray-400 text-sm">
            {posts.length} {t('creator.posts')} · {formatCompactCount(totalLikes)} {t('creator.likes')}
          </p>
        </div>
        <Button onClick={onSubscribe} variant="bitcoin" size="md">
          <Sparkles size={18} className="mr-2" />
          {t('creator.subscribe')}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
          <p className="text-2xl font-black text-white">
            {subscriberCount !== undefined ? formatCompactCount(subscriberCount) : '—'}
          </p>
          <p className="text-xs text-gray-400 mt-1">{t('creator.subscribers')}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
          <p className="text-2xl font-black text-white">{posts.length}</p>
          <p className="text-xs text-gray-400 mt-1">{t('creator.posts')}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
          <p className="text-2xl font-black text-white">{formatCompactCount(totalLikes)}</p>
          <p className="text-xs text-gray-400 mt-1">{t('creator.likes')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {posts.map((post) => (
          <article
            key={post.id}
            className="group relative rounded-2xl overflow-hidden border border-white/10 bg-charcoal-900 hover:border-pink-500/40 transition-colors"
          >
            <div
              className="relative aspect-square cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label={post.caption}
              onClick={() => setSelectedPost(post)}
              onKeyDown={(e) => openPostOnKey(e, () => setSelectedPost(post))}
            >
              <MediaCard
                media={{
                  imageUrl: post.mediaUrl,
                  videoUrl: post.mediaType === 'video' ? post.mediaUrl : undefined,
                  alt: post.caption,
                }}
                aspect="square"
                className="h-full"
                showPlayIndicator={post.mediaType === 'video'}
              />
              {post.pinned && (
                <span className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 text-[10px] font-bold text-white">
                  📌 {t('creator.pinned')}
                </span>
              )}
              {post.isLocked ? (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/70 backdrop-blur-[3px] p-4 text-center">
                  <div className="p-3 rounded-full bg-white/10 border border-white/20">
                    <Lock size={22} className="text-white" />
                  </div>
                  <p className="text-sm font-bold text-white">
                    {post.priceSats !== undefined ? t('creator.unlockFor') : t('creator.locked')}
                  </p>
                  {post.priceSats !== undefined && (
                    <SatsDisplay
                      sats={post.priceSats}
                      showBtc={false}
                      size="sm"
                      className="items-center"
                    />
                  )}
                  <Button
                    size="sm"
                    variant="bitcoin"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSubscribe?.();
                    }}
                  >
                    {t('creator.subscribe')}
                  </Button>
                </div>
              ) : (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all opacity-0 group-hover:opacity-100">
                  <span className="p-2.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 text-white">
                    <Eye size={18} />
                  </span>
                </div>
              )}
            </div>

            <div className="p-3">
              <p className="text-sm text-gray-300 line-clamp-2 mb-2">{post.caption}</p>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="inline-flex items-center gap-1">
                  <Heart size={14} className="text-pink-500" />
                  {formatCompactCount(post.likeCount)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageCircle size={14} />
                  {post.commentCount}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <CreatorPostModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        onSubscribe={onSubscribe}
        onTip={onTip}
        t={t}
      />
    </section>
  );
}
