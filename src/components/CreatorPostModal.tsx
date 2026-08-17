import { useState } from 'react';
import { Heart, Lock, MessageCircle, Send, Sparkles, Zap } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { MediaCard } from './MediaCard';
import { SatsDisplay } from './SatsDisplay';
import { useToast } from './Toast';
import { formatCompactCount } from '../lib/i18nFormat';
import { addPostComment, getLocalComments, isPostLiked, isPpvUnlocked } from '../lib/creatorEngagement';
import type { CreatorPost } from '../data/mockCreatorPosts';

interface CreatorPostModalProps {
  post: CreatorPost | null;
  onClose: () => void;
  subscribed?: boolean;
  onSubscribe?: () => void;
  onTip?: () => void;
  onUnlockPpv?: (post: CreatorPost) => void;
  onLiked?: (post: CreatorPost) => void;
  likedIds?: Record<string, boolean>;
  ppvUnlockedIds?: Record<string, boolean>;
  onEngagementChange?: (postId: string) => void;
  t: (key: string) => string;
}

/** Full-size post view: media + caption + comments + Tip / Subscribe / PPV actions. */
export function CreatorPostModal({
  post,
  onClose,
  subscribed = false,
  onSubscribe,
  onTip,
  onUnlockPpv,
  onLiked,
  likedIds = {},
  ppvUnlockedIds = {},
  onEngagementChange,
  t,
}: CreatorPostModalProps) {
  const { toast } = useToast();
  const [commentDraft, setCommentDraft] = useState('');

  if (!post) return null;

  const isPpv = post.priceSats !== undefined;
  const ppvUnlocked = isPpv && (isPpvUnlocked(post.id) || Boolean(ppvUnlockedIds[post.id]));
  const locked = post.isLocked && !subscribed && !ppvUnlocked;
  const liked = Boolean(likedIds[post.id]) || isPostLiked(post.id);
  const localComments = getLocalComments(post.id);
  const comments = [...localComments, ...(post.comments ?? [])];

  const handleLike = () => {
    onLiked?.(post);
  };

  const handleUnlock = () => {
    onUnlockPpv?.(post);
  };

  const handleComment = () => {
    const text = commentDraft.trim();
    if (!text) return;
    addPostComment(post.id, 'you', text);
    setCommentDraft('');
    onEngagementChange?.(post.id);
    toast(t('creator.commentPosted'), 'success');
  };

  return (
    <Modal isOpen={Boolean(post)} onClose={onClose} size="lg">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="relative rounded-xl overflow-hidden bg-charcoal-900">
          <MediaCard
            media={{
              imageUrl: post.mediaUrl,
              videoUrl: post.mediaType === 'video' ? post.mediaUrl : undefined,
              alt: post.caption,
            }}
            aspect="square"
            className={`h-full min-h-[240px] sm:min-h-[320px] ${locked ? 'blur-[6px] scale-105' : ''}`}
            showPlayIndicator={post.mediaType === 'video' && !locked}
          />
          {locked && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/40 p-6 text-center">
              <div className="p-3 rounded-full bg-black/70 border border-white/25">
                <Lock size={22} className="text-white" />
              </div>
              <p className="text-sm font-bold text-white">
                {isPpv ? t('creator.unlockFor') : t('creator.locked')}
              </p>
              {isPpv && (
                <SatsDisplay sats={post.priceSats!} showBtc={false} size="sm" className="items-center" />
              )}
              {isPpv ? (
                <Button size="sm" variant="bitcoin" onClick={handleUnlock}>
                  {t('creator.unlock')}
                </Button>
              ) : (
                <Button size="sm" variant="bitcoin" onClick={onSubscribe}>
                  {t('creator.subscribe')}
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {!locked && <p className="text-white/90 leading-relaxed">{post.caption}</p>}

          <div className="flex items-center gap-4 text-sm text-gray-400">
            <button
              type="button"
              onClick={handleLike}
              aria-pressed={liked}
              aria-label={liked ? t('creator.unlike') : t('creator.like')}
              className={`inline-flex items-center gap-1.5 transition-colors touch-manipulation ${
                liked ? 'text-pink-500' : 'hover:text-pink-400'
              }`}
            >
              <Heart size={16} className={liked ? 'fill-pink-500' : ''} />
              {formatCompactCount(post.likeCount + (liked ? 1 : 0))} {t('creator.likes')}
            </button>
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle size={16} />
              {post.commentCount + localComments.length} {t('creator.comments')}
            </span>
          </div>

          {!locked && comments.length > 0 && (
            <div className="space-y-2 border-t border-white/10 pt-4 max-h-40 overflow-y-auto">
              {comments.map((comment, i) => (
                <p key={i} className="text-sm">
                  <span className="font-semibold text-white">{comment.user}</span>{' '}
                  <span className="text-gray-300">{comment.text}</span>
                </p>
              ))}
            </div>
          )}

          {!locked && (
            <form
              className="flex gap-2 border-t border-white/10 pt-3"
              onSubmit={(e) => {
                e.preventDefault();
                handleComment();
              }}
            >
              <input
                type="text"
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                placeholder={t('creator.commentPlaceholder')}
                aria-label={t('creator.commentPlaceholder')}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50"
              />
              <Button type="submit" size="sm" variant="secondary" aria-label={t('creator.sendComment')}>
                <Send size={14} />
              </Button>
            </form>
          )}

          <div className="mt-auto flex flex-wrap gap-2 pt-2">
            {!locked && onTip && (
              <Button variant="secondary" size="sm" onClick={onTip}>
                <Zap size={16} className="mr-1.5" />
                {t('creator.tip')}
              </Button>
            )}
            {!subscribed && (
              <Button variant="bitcoin" size="sm" onClick={onSubscribe}>
                <Sparkles size={16} className="mr-1.5" />
                {t('creator.subscribe')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
