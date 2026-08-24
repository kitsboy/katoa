import { useEffect, useMemo, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Check, Eye, Heart, Lock, MessageCircle, Play, Sparkles } from 'lucide-react';
import { MediaCard } from './MediaCard';
import { Button } from './Button';
import { SatsDisplay } from './SatsDisplay';
import { CreatorPostModal } from './CreatorPostModal';
import { useToast } from './Toast';
import { formatCompactCount } from '../lib/i18nFormat';
import {
  countUnseenNewPosts,
  isPostLiked,
  isPpvUnlocked,
  markPostsSeen,
  togglePostLike,
  unlockPpv,
} from '../lib/creatorEngagement';
import type { CreatorPost } from '../data/mockCreatorPosts';

interface CreatorPostFeedProps {
  creatorName: string;
  subscriberCount?: number;
  posts: CreatorPost[];
  subscribed?: boolean;
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
 * locked (subscriber / PPV) blurred previews. Tasteful, Bitcoin-native (sats).
 */
export function CreatorPostFeed({
  creatorName,
  subscriberCount,
  posts,
  subscribed = false,
  onSubscribe,
  onTip,
  t,
}: CreatorPostFeedProps) {
  const { toast } = useToast();
  const [selectedPost, setSelectedPost] = useState<CreatorPost | null>(null);
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [ppvUnlockedIds, setPpvUnlockedIds] = useState<Record<string, boolean>>({});
  const [unseenNew, setUnseenNew] = useState(0);

  useEffect(() => {
    setUnseenNew(countUnseenNewPosts(posts));
    // Viewing the feed counts as reading the drops.
    markPostsSeen(posts.map((p) => p.id));
  }, [posts]);

  const totalLikes = useMemo(
    () =>
      posts.reduce((sum, post) => sum + post.likeCount + (likedIds[post.id] ? 1 : 0), 0),
    [posts, likedIds]
  );

  const handleLike = (post: CreatorPost) => {
    const liked = togglePostLike(post.id);
    setLikedIds((prev) => ({ ...prev, [post.id]: liked }));
    if (liked) toast(t('creator.liked'), 'success');
  };

  const handleUnlockPpv = (post: CreatorPost) => {
    if (post.priceSats === undefined) return;
    unlockPpv(post.id);
    setPpvUnlockedIds((prev) => ({ ...prev, [post.id]: true }));
    toast('Demo unlock — not a Lightning payment', 'info');
  };

  const isPostVisible = (post: CreatorPost): boolean => {
    if (!post.isLocked) return true;
    if (subscribed) return true;
    if (post.priceSats !== undefined) return isPpvUnlocked(post.id) || Boolean(ppvUnlockedIds[post.id]);
    return false;
  };

  return (
    <section aria-label={`${creatorName} · ${t('creator.posts')}`} className="mb-12">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-pink-500/20 rounded-xl">
              <Play size={22} className="text-pink-500" />
            </div>
            <h2 className="text-3xl font-black text-white">{t('creator.feedTitle')}</h2>
            {unseenNew > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-pink-500 text-white text-xs font-bold">
                {unseenNew} {t('creator.newDrops')}
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm">
            {posts.length} {t('creator.posts')} · {formatCompactCount(totalLikes)} {t('creator.likes')}
          </p>
        </div>
        <Button
          onClick={onSubscribe}
          variant={subscribed ? 'secondary' : 'bitcoin'}
          size="md"
          disabled={subscribed}
        >
          {subscribed ? <Check size={18} className="mr-2" /> : <Sparkles size={18} className="mr-2" />}
          {subscribed ? t('creator.subscribed') : t('creator.subscribe')}
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
        {posts.map((post) => {
          const visible = isPostVisible(post);
          const locked = !visible;
          const liked = Boolean(likedIds[post.id]) || isPostLiked(post.id);
          const isPpv = post.priceSats !== undefined;

          return (
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
                <div className={locked ? 'h-full' : 'h-full'}>
                  <MediaCard
                    media={{
                      imageUrl: post.mediaUrl,
                      videoUrl: post.mediaType === 'video' ? post.mediaUrl : undefined,
                      alt: post.caption,
                    }}
                    aspect="square"
                    className={`h-full ${locked ? 'blur-[6px] scale-105' : ''}`}
                    showPlayIndicator={post.mediaType === 'video' && !locked}
                  />
                </div>
                {post.pinned && (
                  <span className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 text-[10px] font-bold text-white">
                    📌 {t('creator.pinned')}
                  </span>
                )}
                {post.isNew && (
                  <span className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded-full bg-pink-500 text-white text-[10px] font-bold">
                    {t('creator.newDrop')}
                  </span>
                )}
                {locked ? (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/40 p-4 text-center">
                    <div className="p-2.5 rounded-full bg-black/70 border border-white/25">
                      <Lock size={18} className="text-white" />
                    </div>
                    <p className="text-xs font-bold text-white">
                      {isPpv ? t('creator.unlockFor') : t('creator.locked')}
                    </p>
                    {isPpv && (
                      <SatsDisplay sats={post.priceSats!} showBtc={false} size="sm" className="items-center" />
                    )}
                    {isPpv ? (
                      <div className="flex flex-col items-center gap-1">
                        <Button
                          size="sm"
                          variant="bitcoin"
                          className="min-h-[44px]"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnlockPpv(post);
                          }}
                        >
                          {t('creator.unlock')}
                        </Button>
                        <p className="text-[10px] text-gray-300">Demo unlock — not a Lightning payment</p>
                      </div>
                    ) : (
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
                    )}
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
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(post);
                    }}
                    aria-pressed={liked}
                    aria-label={liked ? t('creator.unlike') : t('creator.like')}
                    className={`inline-flex items-center gap-1 transition-colors touch-manipulation ${
                      liked ? 'text-pink-500' : 'hover:text-pink-400'
                    }`}
                  >
                    <Heart size={14} className={liked ? 'fill-pink-500' : ''} />
                    {formatCompactCount(post.likeCount + (liked ? 1 : 0))}
                  </button>
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle size={14} />
                    {post.commentCount}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <CreatorPostModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        subscribed={subscribed}
        onSubscribe={onSubscribe}
        onTip={onTip}
        t={t}
        onLiked={() => {
          if (selectedPost) handleLike(selectedPost);
        }}
        onUnlockPpv={handleUnlockPpv}
        likedIds={likedIds}
        ppvUnlockedIds={ppvUnlockedIds}
        onEngagementChange={(postId) => {
          setLikedIds((prev) => ({ ...prev, [postId]: isPostLiked(postId) }));
        }}
      />
    </section>
  );
}
