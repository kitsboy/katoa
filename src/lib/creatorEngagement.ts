import { getStorage, setStorage, STORAGE_KEYS } from './storage';
import type { CreatorPostComment } from '../data/mockCreatorPosts';

/**
 * Client-side creator engagement state — localStorage seam only (same posture
 * as `src/lib/subscriptions.ts`). Real likes/zaps/comments will come from the
 * Nostr + backend rails; this module lets the demo feel interactive end-to-end
 * until those ship.
 */

type PostIdSet = Record<string, true>;
type CommentStore = Record<string, CreatorPostComment[]>;

function readLikes(): PostIdSet {
  return getStorage<PostIdSet>(STORAGE_KEYS.creatorPostLikes, {});
}

function writeLikes(likes: PostIdSet): void {
  setStorage(STORAGE_KEYS.creatorPostLikes, likes);
}

export function isPostLiked(postId: string): boolean {
  return Boolean(readLikes()[postId]);
}

export function getLikedPostCount(): number {
  return Object.keys(readLikes()).length;
}

/** Toggle like state; returns the new liked state. */
export function togglePostLike(postId: string): boolean {
  const likes = readLikes();
  if (likes[postId]) {
    delete likes[postId];
    writeLikes(likes);
    return false;
  }
  likes[postId] = true;
  writeLikes(likes);
  return true;
}

function readComments(): CommentStore {
  return getStorage<CommentStore>(STORAGE_KEYS.creatorPostComments, {});
}

function writeComments(comments: CommentStore): void {
  setStorage(STORAGE_KEYS.creatorPostComments, comments);
}

/** Locally posted comments for a post (mock comments are merged by the UI). */
export function getLocalComments(postId: string): CreatorPostComment[] {
  return readComments()[postId] ?? [];
}

export function addPostComment(postId: string, user: string, text: string): CreatorPostComment {
  const comments = readComments();
  const list = comments[postId] ?? [];
  const comment: CreatorPostComment = { user, text };
  comments[postId] = [...list, comment];
  writeComments(comments);
  return comment;
}

function readPpvUnlocks(): PostIdSet {
  return getStorage<PostIdSet>(STORAGE_KEYS.creatorPpvUnlocks, {});
}

export function isPpvUnlocked(postId: string): boolean {
  return Boolean(readPpvUnlocks()[postId]);
}

/** Persist a one-off PPV purchase (demo — real flow is Lightning invoice). */
export function unlockPpv(postId: string): void {
  const unlocks = readPpvUnlocks();
  unlocks[postId] = true;
  setStorage(STORAGE_KEYS.creatorPpvUnlocks, unlocks);
}

function readSeenPosts(): PostIdSet {
  return getStorage<PostIdSet>(STORAGE_KEYS.creatorSeenPosts, {});
}

export function isPostSeen(postId: string): boolean {
  return Boolean(readSeenPosts()[postId]);
}

/** Mark a post as seen so it stops counting toward the unread badge. */
export function markPostSeen(postId: string): void {
  const seen = readSeenPosts();
  seen[postId] = true;
  setStorage(STORAGE_KEYS.creatorSeenPosts, seen);
}

export function markPostsSeen(postIds: string[]): void {
  const seen = readSeenPosts();
  let changed = false;
  for (const id of postIds) {
    if (!seen[id]) {
      seen[id] = true;
      changed = true;
    }
  }
  if (changed) setStorage(STORAGE_KEYS.creatorSeenPosts, seen);
}

/**
 * Count posts that are flagged new (`isNew`) and have not been seen yet.
 * Used for the creator-feed unread badge (mock "new drop" notifications).
 */
export function countUnseenNewPosts(
  posts: Array<{ id: string; isNew?: boolean }>
): number {
  const seen = readSeenPosts();
  return posts.filter((post) => post.isNew && !seen[post.id]).length;
}
