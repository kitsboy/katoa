import { beforeEach, describe, expect, it } from 'vitest';
import {
  blockPubkey,
  countUnread,
  getBlockedPubkeys,
  getCreatorTipPresets,
  isBlocked,
  markMessagesRead,
  setCreatorTipPresets,
  unblockPubkey,
} from '../dmPrefs';
import { STORAGE_KEYS } from '../storage';

describe('dmPrefs', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEYS.dmBlocked);
    localStorage.removeItem(STORAGE_KEYS.dmReadIds);
    localStorage.removeItem(STORAGE_KEYS.creatorTipPresets);
  });

  it('blocks and unblocks pubkeys (case-insensitive)', () => {
    blockPubkey('ABCDEF');
    expect(isBlocked('abcdef')).toBe(true);
    expect(getBlockedPubkeys()).toEqual(['abcdef']);
    unblockPubkey('ABCDEF');
    expect(isBlocked('abcdef')).toBe(false);
  });

  it('counts unread against local read set', () => {
    expect(countUnread(['a', 'b', 'c'])).toBe(3);
    markMessagesRead(['a', 'c']);
    expect(countUnread(['a', 'b', 'c'])).toBe(1);
  });

  it('stores tip presets', () => {
    setCreatorTipPresets([21000, 50000]);
    expect(getCreatorTipPresets()).toEqual([21000, 50000]);
  });
});
