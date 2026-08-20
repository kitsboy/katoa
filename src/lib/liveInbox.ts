/**
 * Live inbox sync — confirmed gifts + follows from Supabase.
 * Never marks payments complete; the BTCPay webhook is the only writer for that.
 */

import { addNotification, getNotifications, type NotificationDraft } from './notifications';
import { getStorage, setStorage, STORAGE_KEYS } from './storage';
import { isSupabaseConfigured, supabase } from './supabase';

const CONFIRMED_STATUSES = ['confirmed', 'completed'] as const;
const FETCH_LIMIT = 50;

export type InboxTransactionRow = {
  id: string;
  amount_sats: number;
  status?: string | null;
  created_at?: string | null;
  wishlist_id?: string | null;
  contributor_name?: string | null;
};

export type InboxFollowRow = {
  id: string;
  created_at?: string | null;
  href?: string;
  source?: 'profile' | 'wishlist' | 'project';
};

export function notificationsFromTransactions(
  rows: InboxTransactionRow[],
  wishlistSlugs: Record<string, string> = {},
): NotificationDraft[] {
  return rows
    .filter((row) => isConfirmedStatus(row.status))
    .map((row) => {
      const sats = Number.isFinite(row.amount_sats) ? Math.max(0, Math.round(row.amount_sats)) : 0;
      const slug = row.wishlist_id ? wishlistSlugs[row.wishlist_id] : undefined;
      const draft: NotificationDraft = {
        id: `gift:${row.id}`,
        type: 'gift',
        title: `Gift confirmed — ${sats.toLocaleString('en-US')} sats`,
        body: 'Lightning payment settled toward your wishlist.',
        href: slug ? `/wishlist/${slug}` : '/dashboard',
      };
      const createdAt = parseTime(row.created_at);
      if (createdAt != null) draft.createdAt = createdAt;
      return draft;
    });
}

export function notificationsFromFollows(rows: InboxFollowRow[]): NotificationDraft[] {
  return rows.map((row) => {
    const draft: NotificationDraft = {
      id: `follow:${row.id}`,
      type: 'follow',
      title: 'New follower',
      body: followBody(row.source),
      href: row.href ?? '/dashboard',
    };
    const createdAt = parseTime(row.created_at);
    if (createdAt != null) draft.createdAt = createdAt;
    return draft;
  });
}

/**
 * Pull recently confirmed gifts and follows for `userId` into the local inbox.
 * Returns the number of new notifications added (duplicate ids are skipped).
 */
export async function syncLiveInbox(userId: string): Promise<number> {
  if (!userId || !isSupabaseConfigured()) return 0;

  try {
    const cursor = readCursor();
    const { data: wishlists, error: wishlistError } = await supabase
      .from('wishlists')
      .select('id, slug')
      .eq('creator_id', userId);

    if (wishlistError) return 0;

    const list = (wishlists ?? []) as Array<{ id: string; slug: string }>;
    const slugs: Record<string, string> = {};
    for (const row of list) slugs[row.id] = row.slug;
    const wishlistIds = list.map((row) => row.id);

    const drafts: NotificationDraft[] = [];

    if (wishlistIds.length > 0) {
      const { data: txs, error: txError } = await supabase
        .from('transactions')
        .select('id, amount_sats, status, created_at, wishlist_id, contributor_name')
        .in('wishlist_id', wishlistIds)
        .in('status', [...CONFIRMED_STATUSES])
        .order('created_at', { ascending: false })
        .limit(FETCH_LIMIT);

      if (!txError) {
        drafts.push(
          ...notificationsFromTransactions((txs ?? []) as InboxTransactionRow[], slugs),
        );
      }
    }

    drafts.push(...(await fetchFollowNotifications(userId, wishlistIds, slugs, cursor)));

    const added = applyDrafts(drafts);
    setStorage(STORAGE_KEYS.inboxSyncCursor, new Date().toISOString());
    return added;
  } catch {
    return 0;
  }
}

function applyDrafts(drafts: NotificationDraft[]): number {
  const seen = new Set(getNotifications().map((n) => n.id));
  let added = 0;
  for (const draft of drafts) {
    if (draft.id && seen.has(draft.id)) continue;
    const item = addNotification(draft);
    seen.add(item.id);
    added += 1;
  }
  return added;
}

async function fetchFollowNotifications(
  userId: string,
  wishlistIds: string[],
  slugs: Record<string, string>,
  cursor: string | null,
): Promise<NotificationDraft[]> {
  const rows: InboxFollowRow[] = [];

  {
    let q = supabase
      .from('follows')
      .select('id, created_at')
      .eq('following_id', userId)
      .order('created_at', { ascending: false })
      .limit(FETCH_LIMIT);
    if (cursor) q = q.gte('created_at', cursor);
    const { data, error } = await q;
    if (!error) {
      for (const row of (data ?? []) as Array<{ id: string; created_at?: string | null }>) {
        rows.push({
          id: row.id,
          created_at: row.created_at,
          source: 'profile',
          href: '/dashboard',
        });
      }
    }
  }

  if (wishlistIds.length > 0) {
    let q = supabase
      .from('wishlist_follows')
      .select('id, created_at, wishlist_id')
      .in('wishlist_id', wishlistIds)
      .order('created_at', { ascending: false })
      .limit(FETCH_LIMIT);
    if (cursor) q = q.gte('created_at', cursor);
    const { data, error } = await q;
    if (!error) {
      for (const row of (data ?? []) as Array<{
        id: string;
        created_at?: string | null;
        wishlist_id: string;
      }>) {
        const slug = slugs[row.wishlist_id];
        rows.push({
          id: row.id,
          created_at: row.created_at,
          source: 'wishlist',
          href: slug ? `/wishlist/${slug}` : '/dashboard',
        });
      }
    }
  }

  rows.push(...(await fetchProjectFollows(userId, cursor)));
  return notificationsFromFollows(rows);
}

async function fetchProjectFollows(userId: string, cursor: string | null): Promise<InboxFollowRow[]> {
  const mapRows = (data: unknown): InboxFollowRow[] =>
    ((data ?? []) as Array<{ id: string; created_at?: string | null }>).map((row) => ({
      id: row.id,
      created_at: row.created_at,
      source: 'project',
      href: '/dashboard',
    }));

  {
    let q = supabase
      .from('project_follows')
      .select('id, created_at, project_id')
      .eq('project_creator_id', userId)
      .order('created_at', { ascending: false })
      .limit(FETCH_LIMIT);
    if (cursor) q = q.gte('created_at', cursor);
    const { data, error } = await q;
    if (!error) return mapRows(data);
  }

  const { data: projects, error: projectError } = await supabase
    .from('projects')
    .select('id')
    .eq('creator_id', userId);
  if (projectError) return [];

  const projectIds = ((projects ?? []) as Array<{ id: string }>).map((row) => row.id);
  if (projectIds.length === 0) return [];

  let q = supabase
    .from('project_follows')
    .select('id, created_at, project_id')
    .in('project_id', projectIds)
    .order('created_at', { ascending: false })
    .limit(FETCH_LIMIT);
  if (cursor) q = q.gte('created_at', cursor);
  const { data, error } = await q;
  if (error) return [];
  return mapRows(data);
}

function readCursor(): string | null {
  const raw = getStorage<unknown>(STORAGE_KEYS.inboxSyncCursor, null);
  return typeof raw === 'string' && raw.length > 0 ? raw : null;
}

function isConfirmedStatus(status?: string | null): boolean {
  if (!status) return true;
  return status === 'confirmed' || status === 'completed';
}

function followBody(source?: InboxFollowRow['source']): string {
  if (source === 'wishlist') return 'Someone started following your wishlist.';
  if (source === 'project') return 'Someone started following your project.';
  return 'Someone started following you.';
}

function parseTime(value?: string | null): number | undefined {
  if (!value) return undefined;
  const ts = Date.parse(value);
  return Number.isFinite(ts) ? ts : undefined;
}
