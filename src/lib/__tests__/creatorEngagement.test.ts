import { beforeEach, describe, expect, it } from 'vitest';
import { STORAGE_KEYS } from '../storage';
import {
  addPostComment,
  countUnseenNewPosts,
  getLikedPostCount,
  getLocalComments,
  isPostLiked,
  isPostSeen,
  isPpvUnlocked,
  markPostSeen,
  markPostsSeen,
  togglePostLike,
  unlockPpv,
} from '../creatorEngagement';

const KEYS = [
  STORAGE_KEYS.creatorPostLikes,
  STORAGE_KEYS.creatorPostComments,
  STORAGE_KEYS.creatorPpvUnlocks,
  STORAGE_KEYS.creatorSeenPosts,
];

describe('creatorEngagement', () => {
  beforeEach(() => {
    KEYS.forEach((k) => localStorage.removeItem(k));
  });

  describe('likes', () => {
    it('starts unliked and toggles', () => {
      expect(isPostLiked('post-1')).toBe(false);
      expect(togglePostLike('post-1')).toBe(true);
      expect(isPostLiked('post-1')).toBe(true);
      expect(getLikedPostCount()).toBe(1);
      expect(togglePostLike('post-1')).toBe(false);
      expect(isPostLiked('post-1')).toBe(false);
      expect(getLikedPostCount()).toBe(0);
    });

    it('keeps likes per post independent', () => {
      togglePostLike('post-a');
      togglePostLike('post-b');
      expect(getLikedPostCount()).toBe(2);
      togglePostLike('post-a');
      expect(isPostLiked('post-b')).toBe(true);
    });
  });

  describe('comments', () => {
    it('adds and reads local comments', () => {
      expect(getLocalComments('post-1')).toEqual([]);
      addPostComment('post-1', 'fan', 'love it');
      addPostComment('post-1', 'zapz', '🔥');
      const comments = getLocalComments('post-1');
      expect(comments).toHaveLength(2);
      expect(comments[0]).toEqual({ user: 'fan', text: 'love it' });
      expect(getLocalComments('post-2')).toEqual([]);
    });
  });

  describe('PPV unlocks', () => {
    it('unlocks a post once and persists', () => {
      expect(isPpvUnlocked('post-ppv')).toBe(false);
      unlockPpv('post-ppv');
      expect(isPpvUnlocked('post-ppv')).toBe(true);
      expect(isPpvUnlocked('post-other')).toBe(false);
    });
  });

  describe('seen / new-post badge', () => {
    const posts = [
      { id: 'p1', isNew: true },
      { id: 'p2', isNew: true },
      { id: 'p3' },
    ];

    it('counts only unseen new posts', () => {
      expect(countUnseenNewPosts(posts)).toBe(2);
      markPostSeen('p1');
      expect(countUnseenNewPosts(posts)).toBe(1);
    });

    it('marks many at once', () => {
      markPostsSeen(['p1', 'p2']);
      expect(countUnseenNewPosts(posts)).toBe(0);
      expect(isPostSeen('p1')).toBe(true);
      expect(isPostSeen('p3')).toBe(false);
    });
  });
});
