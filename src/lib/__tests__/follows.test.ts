import { beforeEach, describe, expect, it } from 'vitest';
import { STORAGE_KEYS } from '../storage';
import { followLocal, isFollowing, toggleFollowLocal, unfollowLocal } from '../follows';

describe('follows (local seam, not kind-3)', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEYS.creatorFollows);
  });

  it('starts unfollowed', () => {
    expect(isFollowing('luna_vip')).toBe(false);
  });

  it('follows locally and is case-insensitive', () => {
    followLocal('@Luna_VIP');
    expect(isFollowing('luna_vip')).toBe(true);
    expect(isFollowing('LUNA_VIP')).toBe(true);
    expect(isFollowing('sasha_vip')).toBe(false);
  });

  it('unfollows', () => {
    followLocal('luna_vip');
    unfollowLocal('luna_vip');
    expect(isFollowing('luna_vip')).toBe(false);
  });

  it('toggles', () => {
    expect(toggleFollowLocal('luna_vip')).toBe(true);
    expect(isFollowing('luna_vip')).toBe(true);
    expect(toggleFollowLocal('luna_vip')).toBe(false);
    expect(isFollowing('luna_vip')).toBe(false);
  });

  it('ignores blank usernames', () => {
    expect(followLocal('   ')).toBeNull();
    expect(isFollowing('')).toBe(false);
  });
});