import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { STORAGE_KEYS } from '../storage';
import { addNotification, getNotifications } from '../notifications';
import {
  notificationsFromFollows,
  notificationsFromTransactions,
  syncLiveInbox,
} from '../liveInbox';

vi.mock('../supabase', () => ({
  isSupabaseConfigured: vi.fn(() => false),
  supabase: {
    from: vi.fn(),
  },
}));

import { isSupabaseConfigured, supabase } from '../supabase';

describe('notificationsFromTransactions', () => {
  it('maps confirmed gifts to stable gift:id notifications', () => {
    const notes = notificationsFromTransactions(
      [
        {
          id: 'tx-1',
          amount_sats: 21_000,
          status: 'confirmed',
          created_at: '2026-08-20T10:00:00.000Z',
          wishlist_id: 'wl-1',
        },
        {
          id: 'tx-2',
          amount_sats: 5_000,
          status: 'completed',
          created_at: '2026-08-19T08:00:00.000Z',
        },
        {
          id: 'tx-pending',
          amount_sats: 9_999,
          status: 'pending',
        },
      ],
      { 'wl-1': 'skate-colombia' },
    );

    expect(notes).toHaveLength(2);
    expect(notes[0]).toMatchObject({
      id: 'gift:tx-1',
      type: 'gift',
      title: 'Gift confirmed — 21,000 sats',
      href: '/wishlist/skate-colombia',
    });
    expect(notes[0].createdAt).toBe(Date.parse('2026-08-20T10:00:00.000Z'));
    expect(notes[1].id).toBe('gift:tx-2');
    expect(notes[1].title).toBe('Gift confirmed — 5,000 sats');
    expect(notes[1].href).toBe('/dashboard');
  });
});

describe('notificationsFromFollows', () => {
  it('maps rows to New follower with follow:id', () => {
    const notes = notificationsFromFollows([
      { id: 'f-1', created_at: '2026-08-20T10:00:00.000Z' },
      { id: 'wf-2', source: 'wishlist', href: '/wishlist/studio-drops' },
    ]);
    expect(notes).toHaveLength(2);
    expect(notes[0]).toMatchObject({
      id: 'follow:f-1',
      type: 'follow',
      title: 'New follower',
      href: '/dashboard',
    });
    expect(notes[0].body).toMatch(/following you/i);
    expect(notes[1].id).toBe('follow:wf-2');
    expect(notes[1].href).toBe('/wishlist/studio-drops');
    expect(notes[1].body).toMatch(/wishlist/i);
  });
});

describe('syncLiveInbox', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEYS.notifications);
    localStorage.removeItem(STORAGE_KEYS.inboxSyncCursor);
  });

  afterEach(() => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(false);
    vi.mocked(supabase.from).mockReset();
  });

  it('returns 0 when Supabase is not configured', async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(false);
    await expect(syncLiveInbox('user-1')).resolves.toBe(0);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('adds gift and follow notifications once, then skips duplicates', async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'wishlists') {
        return thenable({ data: [{ id: 'wl-1', slug: 'skate-colombia' }], error: null });
      }
      if (table === 'transactions') {
        return thenable({
          data: [
            {
              id: 'tx-live',
              amount_sats: 21_000,
              status: 'confirmed',
              created_at: '2026-08-20T10:00:00.000Z',
              wishlist_id: 'wl-1',
              contributor_name: 'Anonymous',
            },
          ],
          error: null,
        });
      }
      if (table === 'follows') {
        return thenable({
          data: [{ id: 'fol-1', created_at: '2026-08-20T09:00:00.000Z' }],
          error: null,
        });
      }
      if (table === 'wishlist_follows') {
        return thenable({ data: [], error: null });
      }
      if (table === 'project_follows') {
        return thenable({ data: [], error: null });
      }
      return thenable({ data: [], error: null });
    });

    const first = await syncLiveInbox('user-1');
    expect(first).toBe(2);
    const ids = getNotifications().map((n) => n.id);
    expect(ids).toEqual(expect.arrayContaining(['gift:tx-live', 'follow:fol-1']));
    expect(getNotifications().find((n) => n.id === 'gift:tx-live')?.title).toBe(
      'Gift confirmed — 21,000 sats',
    );
    expect(localStorage.getItem(STORAGE_KEYS.inboxSyncCursor)).toBeTruthy();

    const second = await syncLiveInbox('user-1');
    expect(second).toBe(0);
    expect(getNotifications().filter((n) => n.id === 'gift:tx-live')).toHaveLength(1);

    addNotification({
      id: 'gift:tx-live',
      type: 'gift',
      title: 'Gift confirmed — 21,000 sats',
      body: 'should skip',
    });
    expect(getNotifications().filter((n) => n.id.startsWith('gift:'))).toHaveLength(1);
  });
});

function thenable<T>(result: T) {
  const chain: Record<string, unknown> = {};
  const self = () => chain;
  chain.select = vi.fn(self);
  chain.eq = vi.fn(self);
  chain.in = vi.fn(self);
  chain.gte = vi.fn(self);
  chain.order = vi.fn(self);
  chain.limit = vi.fn(self);
  chain.then = (resolve: (value: T) => unknown, reject?: (reason: unknown) => unknown) =>
    Promise.resolve(result).then(resolve, reject);
  return chain;
}
