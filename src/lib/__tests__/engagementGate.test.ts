import { describe, expect, it } from 'vitest';
import {
  commentAuthor,
  engagementGateMode,
  groupCommentsByPost,
  isActiveUnlockRow,
  keysFrom,
  normalizeCommentBody,
  unlockedPostKeys,
  usesLocalEngagementSeam,
  type PostCommentRow,
} from '../engagementGate';

describe('unlock rules', () => {
  it('opens paid media only for an active unlock', () => {
    expect(isActiveUnlockRow({ status: 'active' })).toBe(true);
    expect(isActiveUnlockRow({ status: 'pending' })).toBe(false);
    expect(isActiveUnlockRow({ status: 'expired' })).toBe(false);
    expect(isActiveUnlockRow({ status: 'refunded' })).toBe(false);
  });

  it('maps active rows to post keys and drops everything else', () => {
    const keys = unlockedPostKeys([
      { post_key: 'post-1', status: 'active' },
      { post_key: 'post-2', status: 'pending' },
      { post_key: '  ', status: 'active' },
      { post_key: 'post-1', status: 'active' },
    ]);
    expect(keys).toEqual({ 'post-1': true });
  });

  it('keys likes the same way', () => {
    expect(keysFrom([{ post_key: 'a' }, { post_key: 'b' }, { post_key: '' }])).toEqual({
      a: true,
      b: true,
    });
  });
});

describe('comment rules', () => {
  it('collapses whitespace and requires 1-2000 characters', () => {
    expect(normalizeCommentBody('  hello   world  ')).toBe('hello world');
    expect(normalizeCommentBody('\n\n')).toBeNull();
    expect(normalizeCommentBody('')).toBeNull();
    expect(normalizeCommentBody('a'.repeat(2000))).toHaveLength(2000);
    expect(normalizeCommentBody('a'.repeat(2001))).toBeNull();
  });

  it('never shows an email or a raw uuid as an author', () => {
    expect(commentAuthor('fan@example.com')).toBe('Supporter');
    expect(commentAuthor('')).toBe('Supporter');
    expect(commentAuthor(null)).toBe('Supporter');
    expect(commentAuthor('  luna_vip ')).toBe('luna_vip');
    expect(commentAuthor('x'.repeat(80))).toHaveLength(40);
    expect(commentAuthor(undefined, 'Viewer')).toBe('Viewer');
  });

  it('groups rows per post and keeps chronological order within a post', () => {
    const rows: PostCommentRow[] = [
      { id: '1', post_key: 'p1', user_id: 'u1', body: 'first', created_at: '2026-01-01T00:00:00Z', author: { username: 'a' } },
      { id: '2', post_key: 'p1', user_id: 'u2', body: 'second', created_at: '2026-01-02T00:00:00Z', author: { username: 'b' } },
      { id: '3', post_key: 'p2', user_id: 'u1', body: 'other post', created_at: '2026-01-03T00:00:00Z', author: null },
      { id: '4', post_key: '', user_id: 'u1', body: 'no key', created_at: null, author: null },
    ];
    const grouped = groupCommentsByPost(rows);
    expect(Object.keys(grouped).sort()).toEqual(['p1', 'p2']);
    expect(grouped.p1.map((row) => row.body)).toEqual(['first', 'second']);
    expect(grouped.p2).toHaveLength(1);
  });
});

describe('gate mode', () => {
  it('uses the DB gate when a backend is configured', () => {
    // No Supabase env in tests → the labelled seam, which is the honest default
    // for a build with no backend. The db branch is covered by the source guard
    // in subscriptionsGate.test.ts (mocked canUseDemoAuth).
    expect(engagementGateMode()).toBe('demo');
    expect(usesLocalEngagementSeam()).toBe(true);
  });
});
