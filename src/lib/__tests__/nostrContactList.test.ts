import { describe, expect, it } from 'vitest';
import {
  applyFollow,
  applyUnfollow,
  contactPubkeys,
  mergeContactTags,
} from '../nostrContactList';

const A = 'a'.repeat(64);
const B = 'b'.repeat(64);
const C = 'c'.repeat(64);

describe('contactPubkeys', () => {
  it('reads p tags in order and drops duplicates and blanks', () => {
    expect(
      contactPubkeys([
        ['p', A],
        ['relays', 'wss://relay.example'],
        ['p', B],
        ['p', A],
        ['p', ''],
        ['e', C],
      ])
    ).toEqual([A, B]);
  });
});

describe('mergeContactTags', () => {
  it('adds a follow without touching the others', () => {
    const merged = mergeContactTags([['p', A], ['p', B]], [C]);
    expect(contactPubkeys(merged)).toEqual([A, B, C]);
  });

  it('preserves non-p tags such as relay hints', () => {
    const merged = mergeContactTags([['relays', 'wss://relay.example'], ['p', A]], [B]);
    expect(merged[0]).toEqual(['relays', 'wss://relay.example']);
    expect(contactPubkeys(merged)).toEqual([A, B]);
  });

  it('removes a follow and keeps the rest, including its relay hint', () => {
    const merged = mergeContactTags([['p', A, 'wss://relay.example'], ['p', B]], [], [B]);
    expect(merged).toEqual([['p', A, 'wss://relay.example']]);
  });

  it('is idempotent for an existing follow', () => {
    const merged = mergeContactTags([['p', A], ['p', B]], [A]);
    expect(contactPubkeys(merged)).toEqual([A, B]);
  });

  it('normalizes case and ignores junk that must not reach a signed event', () => {
    const merged = mergeContactTags([['p', A.toUpperCase()]], [B, 'not-a-pubkey', '  ']);
    expect(merged).toEqual([['p', A], ['p', B]]);
  });

  it('lets remove win over add', () => {
    const merged = mergeContactTags([['p', A]], [A], [A]);
    expect(contactPubkeys(merged)).toEqual([]);
  });
});

describe('applyFollow / applyUnfollow', () => {
  it('reports the new list size so the UI can be honest about it', () => {
    const followed = applyFollow([['p', A]], B);
    expect(followed.followed).toBe(true);
    expect(followed.total).toBe(2);

    const unfollowed = applyUnfollow(followed.tags, B);
    expect(unfollowed.followed).toBe(false);
    expect(unfollowed.total).toBe(1);
    expect(contactPubkeys(unfollowed.tags)).toEqual([A]);
  });

  it('treats an empty existing list as a valid starting point', () => {
    const followed = applyFollow([], A);
    expect(followed.total).toBe(1);
    expect(followed.tags).toEqual([['p', A]]);
  });
});
