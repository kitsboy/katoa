import { Heart, Lock, MessageCircle, Sparkles, Zap } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { MediaCard } from './MediaCard';
import { SatsDisplay } from './SatsDisplay';
import { formatCompactCount } from '../lib/i18nFormat';
import type { CreatorPost } from '../data/mockCreatorPosts';

interface CreatorPostModalProps {
  post: CreatorPost | null;
  onClose: () => void;
  subscribed?: boolean;
  onSubscribe?: () => void;
  onTip?: () => void;
  t: (key: string) => string;
}

/** Full-size post view: media + caption + comments + Tip / Subscribe actions. */
export function CreatorPostModal({
  post,
  onClose,
  subscribed = false,
  onSubscribe,
  onTip,
  t,
}: CreatorPostModalProps) {
  if (!post) return null;
  const locked = post.isLocked && !subscribed;

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
            className="h-full min-h-[240px] sm:min-h-[320px]"
            showPlayIndicator={post.mediaType === 'video'}
          />
          {locked && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/70 backdrop-blur-[3px] p-6 text-center">
              <div className="p-3 rounded-full bg-white/10 border border-white/20">
                <Lock size={22} className="text-white" />
              </div>
              <p className="text-sm font-bold text-white">
                {post.priceSats !== undefined ? t('creator.unlockFor') : t('creator.locked')}
              </p>
              {post.priceSats !== undefined && (
                <SatsDisplay sats={post.priceSats} showBtc={false} size="sm" className="items-center" />
              )}
              <Button size="sm" variant="bitcoin" onClick={onSubscribe}>
                {t('creator.subscribe')}
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {!locked && <p className="text-white/90 leading-relaxed">{post.caption}</p>}

          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="inline-flex items-center gap-1.5">
              <Heart size={16} className="text-pink-500" />
              {formatCompactCount(post.likeCount)} {t('creator.likes')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle size={16} />
              {post.commentCount} {t('creator.comments')}
            </span>
          </div>

          {!locked && (post.comments ?? []).length > 0 && (
            <div className="space-y-2 border-t border-white/10 pt-4">
              {(post.comments ?? []).map((comment, i) => (
                <p key={i} className="text-sm">
                  <span className="font-semibold text-white">{comment.user}</span>{' '}
                  <span className="text-gray-300">{comment.text}</span>
                </p>
              ))}
            </div>
          )}

          <div className="mt-auto flex flex-wrap gap-2 pt-2">
            {!locked && onTip && (
              <Button variant="secondary" size="sm" onClick={onTip}>
                <Zap size={16} className="mr-1.5" />
                {t('creator.tip')}
              </Button>
            )}
            <Button variant="bitcoin" size="sm" onClick={onSubscribe}>
              <Sparkles size={16} className="mr-1.5" />
              {t('creator.subscribe')}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
