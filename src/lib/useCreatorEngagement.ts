import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  addPostComment,
  commentAuthor,
  engagementGateMode,
  fetchLikedPostKeys,
  fetchPostComments,
  type PostCommentRow,
  fetchUnlockedPostKeys,
  groupCommentsByPost,
  setPostLike,
  type EngagementGateMode,
} from './engagementGate';
import {
  addPostComment as addLocalComment,
  getLocalComments,
  isPostLiked,
  isPpvUnlocked,
  togglePostLike,
  unlockPpv,
} from './creatorEngagement';
import type { CreatorPost, CreatorPostComment } from '../data/mockCreatorPosts';

const DB_COMMENT_RATELIMIT_TITLE = 'Too many comments right now';
const DB_COMMENT_RATELIMIT_PREFIX = 'Too many comments lately';

function isCommentRateLimited(err: string): boolean {
  return err.includes(DB_COMMENT_RATELIMIT_TITLE) || err.includes(DB_COMMENT_RATELIMIT_PREFIX);
}

export interface CreatorEngagement {
  mode: EngagementGateMode;
  liked: Record<string, boolean>;
  ppvUnlocked: Record<string, boolean>;
  /** Newest last, per post key. */
  comments: Record<string, CreatorPostComment[]>;
  /** True while a write is in flight, so the UI can stay honest about state. */
  saving: boolean;
  toggleLike: (post: { id: string }) => Promise<void>;
  /** Demo seam only; paid unlocks in a real build go through an invoice. */
  unlockPpvLocally: (post: { id: string }) => void;
  postComment: (post: { id: string }, body: string) => Promise<boolean>;
}

/**
 * Single source of truth for post likes, comments and PPV unlocks.
 *
 * With Supabase configured (`mode: 'db'`) the only truth is the rows the fan
 * owns — a browser value cannot like, comment or unlock anything. Without a
 * backend (`mode: 'demo'`) the labelled device seam is used, because the preview
 * has no authoritative source.
 */
export function useCreatorEngagement(posts: CreatorPost[]): CreatorEngagement {
  const { user, profile, loading } = useAuth();
  const mode = useMemo(() => engagementGateMode(), []);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [ppvUnlocked, setUnlocked] = useState<Record<string, boolean>>({});
  const [dbComments, setDbComments] = useState<Record<string, CreatorPostComment[]>>({});
  const [localComments, setLocalComments] = useState<Record<string, CreatorPostComment[]>>({});
  const [saving, setSaving] = useState(false);
  const postKeys = useMemo(() => posts.map((post) => post.id).join('|'), [posts]);

  const displayName = profile?.username ?? 'You';

  useEffect(() => {
    const keys = postKeys ? postKeys.split('|') : [];

    if (mode === 'demo') {
      const localLikes: Record<string, boolean> = {};
      const localUnlocks: Record<string, boolean> = {};
      const local: Record<string, CreatorPostComment[]> = {};
      for (const key of keys) {
        if (isPostLiked(key)) localLikes[key] = true;
        if (isPpvUnlocked(key)) localUnlocks[key] = true;
        const comments = getLocalComments(key);
        if (comments.length) local[key] = comments;
      }
      setLiked(localLikes);
      setUnlocked(localUnlocks);
      setLocalComments(local);
      return;
    }

    if (loading) return;
    if (!user) {
      setLiked({});
      setUnlocked({});
      setDbComments({});
      return;
    }

    let cancelled = false;
    void (async () => {
      const [likes, unlocks, rows] = await Promise.all([
        fetchLikedPostKeys(),
        fetchUnlockedPostKeys(),
        fetchPostComments(keys),
      ]);
      if (cancelled) return;
      setLiked(likes);
      setUnlocked(unlocks);
      setDbComments(groupDbComments(rows));
    })();

    return () => {
      cancelled = true;
    };
  }, [mode, loading, user, postKeys]);

  const toggleLike = useCallback(
    async (post: { id: string }) => {
      const key = post.id;
      if (mode === 'demo') {
        const next = togglePostLike(key);
        setLiked((prev) => ({ ...prev, [key]: next }));
        return;
      }
      if (!user) return;
      const next = !liked[key];
      setLiked((prev) => ({ ...prev, [key]: next }));
      setSaving(true);
      const result = await setPostLike(user.id, key, next);
      setSaving(false);
      if (!result.ok) {
        // Roll back rather than show a like that was never recorded.
        setLiked((prev) => ({ ...prev, [key]: !next }));
      }
    },
    [mode, user, liked]
  );

  const unlockPpvLocally = useCallback((post: { id: string }) => {
    unlockPpv(post.id);
    setUnlocked((prev) => ({ ...prev, [post.id]: true }));
  }, []);

  const postComment = useCallback(
    async (post: { id: string }, body: string) => {
      const key = post.id;
      if (mode === 'demo') {
        const comment = addLocalComment(key, displayName, body);
        setLocalComments((prev) => ({ ...prev, [key]: [...(prev[key] ?? []), comment] }));
        return true;
      }
      if (!user) return false;
      setSaving(true);
      const result = await addPostComment(user.id, key, body);
      setSaving(false);
      if (!result.ok) {
        if (isCommentRateLimited(result.error ?? '')) {
          throw new Error('Too many comments — wait a moment and try again.');
        }
        return false;
      }
          const result = await addPostComment(user.id, key, body);
      setSaving(false);
      if (!result.ok) {
        if (isCommentRateLimited(result.error ?? '')) {
          throw new Error('Too many comments — wait a moment and try again.');
        }
        return false;
      }
      if (!result.body) return false;
      const comment: CreatorPostComment = { user: displayName, text: result.body };
      setDbComments((prev) => ({ ...prev, [key]: [...(prev[key] ?? []), comment] }));
      return true;
    },
    [mode, user, displayName]
  );

  const comments = mode === 'demo' ? localComments : dbComments;

  return { mode, liked, ppvUnlocked, comments, saving, toggleLike, unlockPpvLocally, postComment };
}

/** DB rows → UI comment shape, with a public alias instead of a raw uuid. */
function groupDbComments(rows: PostCommentRow[]): Record<string, CreatorPostComment[]> {
  const grouped = groupCommentsByPost(rows);
  const out: Record<string, CreatorPostComment[]> = {};
  for (const [key, list] of Object.entries(grouped)) {
    out[key] = list.map((row) => ({
      user: commentAuthor(row.author?.username),
      text: row.body,
    }));
  }
  return out;
}
