import { getStorage, setStorage, STORAGE_KEYS } from './storage';

export interface FollowState {
  username: string;
  followedAt: number;
  /**
   * How this follow exists:
   * - `nostr` — a NIP-02 kind-3 contact list event carries it.
   * - `local` — this device only (no extension, or the target has no Nostr key).
   */
  source: 'local' | 'nostr';
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

export function followLocal(username: string, source: FollowState['source'] = 'local'): FollowState | null {
  const key = normalizeKey(username);
  if (!key) return null;
  const follows = getFollows();
  const state: FollowState = {
    username: key,
    followedAt: Date.now(),
    source,
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

export function getFollow(username: string): FollowState | undefined {
  const key = normalizeKey(username);
  if (!key) return undefined;
  return getFollows()[key];
}

/** True when a Nostr kind-3 contact list (not just this device) carries the follow. */
export function isFollowingOnNostr(username: string): boolean {
  return getFollow(username)?.source === 'nostr';
}

export function toggleFollowLocal(username: string): boolean {
  if (isFollowing(username)) {
    unfollowLocal(username);
    return false;
  }
  followLocal(username);
  return true;
}