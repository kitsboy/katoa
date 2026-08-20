import { beforeEach, describe, expect, it } from 'vitest';
import { STORAGE_KEYS } from '../storage';
import {
  addNotification,
  getNotifications,
  markAllRead,
  markRead,
  seedDemoNotifications,
  subscribeNotifications,
  unreadCount,
} from '../notifications';

describe('notifications', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEYS.notifications);
  });

  it('starts empty', () => {
    expect(getNotifications()).toEqual([]);
    expect(unreadCount()).toBe(0);
  });

  it('seeds tasteful demo items when empty', () => {
    const seeded = seedDemoNotifications();
    expect(seeded.length).toBeGreaterThanOrEqual(3);
    expect(seeded.length).toBeLessThanOrEqual(5);
    expect(seeded.map((n) => n.type)).toEqual(
      expect.arrayContaining(['gift', 'follow', 'drop', 'system']),
    );
    expect(seeded.some((n) => n.title.includes('21,000'))).toBe(true);
    expect(seeded.some((n) => /luna/i.test(n.title) || /luna/i.test(n.body))).toBe(true);
    expect(seeded.some((n) => /lightning/i.test(n.title) || /lightning/i.test(n.body))).toBe(true);
    expect(getNotifications()).toHaveLength(seeded.length);
    expect(unreadCount()).toBe(seeded.length);
  });

  it('does not re-seed when the inbox already has items', () => {
    seedDemoNotifications();
    addNotification({ type: 'system', title: 'Keep me', body: 'Custom' });
    const after = seedDemoNotifications();
    expect(after.filter((n) => n.title === 'Keep me')).toHaveLength(1);
    expect(after.filter((n) => n.id.startsWith('demo-')).length).toBeGreaterThan(0);
  });

  it('counts unread and markRead clears one', () => {
    seedDemoNotifications();
    const [first, ...rest] = getNotifications();
    expect(unreadCount()).toBe(rest.length + 1);
    markRead(first.id);
    expect(getNotifications().find((n) => n.id === first.id)?.read).toBe(true);
    expect(unreadCount()).toBe(rest.length);
  });

  it('markAllRead zeros the unread count', () => {
    seedDemoNotifications();
    expect(unreadCount()).toBeGreaterThan(0);
    markAllRead();
    expect(unreadCount()).toBe(0);
    expect(getNotifications().every((n) => n.read)).toBe(true);
  });

  it('addNotification prepends an unread item', () => {
    addNotification({
      type: 'follow',
      title: 'Fresh follow',
      body: 'New supporter',
      href: '/dashboard',
    });
    const list = getNotifications();
    expect(list[0].title).toBe('Fresh follow');
    expect(list[0].read).toBe(false);
    expect(list[0].type).toBe('follow');
    expect(unreadCount()).toBe(1);
  });

  it('addNotification with the same id does not duplicate', () => {
    const first = addNotification({
      id: 'gift:tx-1',
      type: 'gift',
      title: 'Gift confirmed — 21,000 sats',
      body: 'Lightning payment settled toward your wishlist.',
      href: '/dashboard',
    });
    markRead('gift:tx-1');
    const second = addNotification({
      id: 'gift:tx-1',
      type: 'gift',
      title: 'Gift confirmed — 21,000 sats',
      body: 'Should not replace',
      href: '/dashboard',
    });
    const list = getNotifications();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('gift:tx-1');
    expect(list[0].read).toBe(true);
    expect(list[0].body).toBe('Lightning payment settled toward your wishlist.');
    expect(second.id).toBe(first.id);
    expect(unreadCount()).toBe(0);
  });

  it('notifies subscribers on write', () => {
    let hits = 0;
    const unsub = subscribeNotifications(() => {
      hits += 1;
    });
    addNotification({ type: 'system', title: 'Ping', body: 'Hello' });
    expect(hits).toBe(1);
    markAllRead();
    expect(hits).toBe(2);
    unsub();
    addNotification({ type: 'follow', title: 'After', body: 'Unsubscribed' });
    expect(hits).toBe(2);
  });
});
