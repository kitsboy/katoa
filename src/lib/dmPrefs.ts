import { getStorage, setStorage, STORAGE_KEYS } from './storage';

export type BlockedPubkey = string; // hex lowercase

export function getBlockedPubkeys(): string[] {
  return getStorage<string[]>(STORAGE_KEYS.dmBlocked, []).map((p) => p.toLowerCase());
}

export function isBlocked(pubkey: string): boolean {
  return getBlockedPubkeys().includes(pubkey.toLowerCase());
}

export function blockPubkey(pubkey: string) {
  const hex = pubkey.toLowerCase();
  const list = getBlockedPubkeys();
  if (!list.includes(hex)) {
    setStorage(STORAGE_KEYS.dmBlocked, [...list, hex]);
  }
}

export function unblockPubkey(pubkey: string) {
  const hex = pubkey.toLowerCase();
  setStorage(
    STORAGE_KEYS.dmBlocked,
    getBlockedPubkeys().filter((p) => p !== hex)
  );
}

/** Unread message ids (local) */
export function getReadMessageIds(): string[] {
  return getStorage<string[]>(STORAGE_KEYS.dmReadIds, []);
}

export function markMessagesRead(ids: string[]) {
  const prev = new Set(getReadMessageIds());
  ids.forEach((id) => prev.add(id));
  // Cap storage
  const arr = [...prev].slice(-500);
  setStorage(STORAGE_KEYS.dmReadIds, arr);
}

export function countUnread(messageIds: string[]): number {
  const read = new Set(getReadMessageIds());
  return messageIds.filter((id) => !read.has(id)).length;
}

export type TipPreset = 21000 | 50000 | 'custom';

export function getCreatorTipPresets(): number[] {
  const raw = getStorage<number[]>(STORAGE_KEYS.creatorTipPresets, [21000, 50000, 100000]);
  return raw.length ? raw : [21000, 50000, 100000];
}

export function setCreatorTipPresets(presets: number[]) {
  setStorage(
    STORAGE_KEYS.creatorTipPresets,
    presets.filter((n) => n > 0).slice(0, 6)
  );
}
