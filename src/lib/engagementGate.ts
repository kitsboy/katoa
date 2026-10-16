/**
 * Post engagement: likes, comments and paid PPV unlocks.
 *
 * Same posture as `subscriptions.ts`: with Supabase configured these are rows the
 * signed-in fan owns, and the two rules that matter are enforced by the database
 * and read here —
 *
 * - a like is one row per (fan, post), so a count can be told from a claim.
 * - a PPV unlock is `active` only after the settlement webhook writes it; the
 *   browser has no write policy on `post_unlocks` at all.
 *
 * The labelled local seam stays for builds with no backend, so the demo preview
 * still works end to end.
 */

import { asRows, isSupabaseConfigured, supabase } from './supabase';
import { canUseDemoAuth } from './demoAuth';

export type EngagementGateMode = 'db' | 'demo';

export function engagementGateMode(): EngagementGateMode {
  return canUseDemoAuth() ? 'demo' : 'db';
}

/** True when this build has no authoritative engagement source to consult. */
export function usesLocalEngagementSeam(): boolean {
  return engagementGateMode() === 'demo';
}

export interface PostLikeRow {
  post_key: string;
}
export interface PostUnlockRow {
  post_key: string;
  status: string;
  price_sats?: number | null;
  invoice_id?: string | null;
}
export interface PostCommentRow {
  id: string;
  post_key: string;
  user_id: string;
  body: string;
  created_at: string | null;
  /** Joined username, when the select included it. */
  author?: { username: string | null } | null;
}

const UNLOCK_ACTIVE_STATUSES = ['active'] as const;
const UNLOCK_PENDING_STATUSES = ['pending'] as const;

/** Only an active unlock opens paid media; pending is not paid. */
export function isActiveUnlockRow(row: Pick<PostUnlockRow, 'status'>): boolean {
  return (UNLOCK_ACTIVE_STATUSES as readonly string[]).includes(row.status);
}

/** Pending unlocks are not yet paid; only active can open media. */
export function isPendingUnlockRow(row: Pick<PostUnlockRow, 'status'>): boolean {
  return (UNLOCK_PENDING_STATUSES as readonly string[]).includes(row.status);
}

export function keysFrom<T extends { post_key: string }>(
  rows: T[],
  keep: (row: T) => boolean = () => true,
): Record<string, true> {
  const out: Record<string, true> = {};
  for (const row of rows) {
    const key = row.post_key?.trim();
    if (!key || !keep(row)) continue;
    out[key] = true;
  }
  return out;
}

export function unlockedPostKeys(rows: PostUnlockRow[]): Record<string, true> {
  return keysFrom(rows, isActiveUnlockRow);
}

/** Comment body rules, mirrored from the table constraint. */
export function normalizeCommentBody(raw: string): string | null {
  const body = raw.replace(/\s+/g, ' ').trim();
  if (!body || body.length > 2000) return null;
  return body;
}

/** Public alias for a comment author: never leak an email or a raw uuid. */
export function commentAuthor(name: string | null | undefined, fallback = 'Supporter'): string {
  const trimmed = name?.trim() ?? '';
  if (!trimmed || trimmed.includes('@')) return fallback;
  return trimmed.slice(0, 40);
}

export function groupCommentsByPost(
  rows: PostCommentRow[],
): Record<string, PostCommentRow[]> {
  const out: Record<string, PostCommentRow[]> = {};
  for (const row of rows) {
    const key = row.post_key?.trim();
    if (!key) continue;
    (out[key] ??= []).push(row);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Reads                                                               */
/* ------------------------------------------------------------------ */

export async function fetchLikedPostKeys(): Promise<Record<string, true>> {
  const { data, error } = await supabase.from('post_likes').select('post_key');
  if (error || !data) return {};
  return keysFrom(asRows<PostLikeRow>(data));
}

export async function fetchUnlockedPostKeys(): Promise<Record<string, true>> {
  const { data, error } = await supabase
    .from('post_unlocks')
    .select('post_key, status')
    .eq('status', 'active');
  if (error || !data) return {};
  return unlockedPostKeys(asRows<PostUnlockRow>(data));
}

export async function fetchPostComments(postKeys: string[]): Promise<PostCommentRow[]> {
  const keys = [...new Set(postKeys.map((key) => key.trim()).filter(Boolean))].slice(0, 50);
  if (!keys.length) return [];
  const { data, error } = await supabase
    .from('post_comments')
    .select('id, post_key, user_id, body, created_at, author:profiles!post_comments_user_id_fkey(username)')
    .in('post_key', keys)
    .order('created_at', { ascending: true })
    .limit(200);
  if (error || !data) return [];
  return asRows<PostCommentRow>(data);
}

/** Free follows, read from the DB so the follow state is not a browser value. */
export async function fetchFollowedUsernames(userId: string): Promise<Record<string, true>> {
  const { data, error } = await supabase
    .from('follows')
    .select('following:profiles!follows_following_id_fkey(username)')
    .eq('follower_id', userId);
  if (error || !data) return {};
  const out: Record<string, true> = {};
  for (const row of asRows<{ following?: { username: string | null } | null }>(data)) {
    const name = row.following?.username?.trim().toLowerCase();
    if (name) out[name] = true;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Writes (only where a backend exists; the caller checks the mode)     */
/* ------------------------------------------------------------------ */

export interface EngagementWriteResult {
  ok: boolean;
  error?: string;
}

/** Like or unlike as the signed-in fan. The unique constraint makes this idempotent. */
export async function setPostLike(
  userId: string,
  postKey: string,
  liked: boolean,
): Promise<EngagementWriteResult> {
  if (!isSupabaseConfigured()) return { ok: false, error: 'No backend configured' };
  const key = postKey.trim();
  if (!key) return { ok: false, error: 'Missing post key' };

  if (liked) {
    const { error } = await supabase
      .from('post_likes')
      .insert({ user_id: userId, post_key: key });
    // 23505 = already liked; that is success, not a failure.
    if (error && error.code !== '23505') return { ok: false, error: error.message };
    return { ok: true };
  }

  const { error } = await supabase
    .from('post_likes')
    .delete()
    .eq('user_id', userId)
    .eq('post_key', key);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function addPostComment(
  userId: string,
  postKey: string,
  rawBody: string,
): Promise<EngagementWriteResult & { body?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: 'No backend configured' };
  const key = postKey.trim();
  const body = normalizeCommentBody(rawBody);
  if (!key) return { ok: false, error: 'Missing post key' };
  if (!body) return { ok: false, error: 'Comment must be 1–2000 characters' };

  const { error } = await supabase
    .from('post_comments')
    .insert({ user_id: userId, post_key: key, body });
  if (error) return { ok: false, error: error.message };
  return { ok: true, body };
}

export async function deletePostComment(
  userId: string,
  commentId: string,
): Promise<EngagementWriteResult> {
  const { error } = await supabase
    .from('post_comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', userId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
