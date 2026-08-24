import { getStorage, setStorage, STORAGE_KEYS } from './storage';

export interface FollowState {
  username: string;
  followedAt: number;
  /** Local device seam — not Nostr kind-3. Optional live `follows` row write is best-effort. */
  source: 'local';
}

function normalizeKey(username: string): string {
  return username.trim().replace(/^@/, '').toLowerCase();
}

export function getFollows(): Record<string, FollowState> {
  return getStorage<Record<string, FollowState>>(STORAGE_KEYS.creatorFollows, {});
}

export function isFollowing(username: string): boolean {
  const key = normalizeKey(username);
  if (!key) return false;
  return Boolean(getFollows()[key]);
}

export function followLocal(username: string): FollowState | null {
  const key = normalizeKey(username);
  if (!key) return null;
  const follows = getFollows();
  const state: FollowState = {
    username: key,
    followedAt: Date.now(),
    source: 'local',
  };
  follows[key] = state;
  setStorage(STORAGE_KEYS.creatorFollows, follows);
  return state;
}

export function unfollowLocal(username: string): void {
  const key = normalizeKey(username);
  if (!key) return;
  const follows = getFollows();
  delete follows[key];
  setStorage(STORAGE_KEYS.creatorFollows, follows);
}

export function toggleFollowLocal(username: string): boolean {
  if (isFollowing(username)) {
    unfollowLocal(username);
    return false;
  }
  followLocal(username);
  return true;
}