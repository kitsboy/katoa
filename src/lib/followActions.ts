import { hasNip07, nostrService } from './nostr';
import { followLocal, getFollow, isFollowing, unfollowLocal } from './follows';
import { fetchFollowedUsernames, usesLocalEngagementSeam } from './engagementGate';

/**
 * Follow vs subscribe, kept as two different things:
 *
 * - **Follow** is free. It belongs on Nostr as a NIP-02 kind-3 contact list, and
 *   the creator's own relay list decides where it lands. With no NIP-07
 *   extension (or no published key for the creator) it can only be a device-local
 *   follow, and we say exactly that.
 * - **Subscribe** is paid. It is a `subscriptions` row written after a settled
 *   Lightning invoice — see `src/lib/subscriptions.ts`.
 *
 * A follow never unlocks anything, and a subscription never writes a kind-3.
 */

export type FollowSource = 'nostr' | 'local';

export interface FollowResult {
  following: boolean;
  /** Where the follow now lives. */
  source: FollowSource;
  /** Relays that accepted the kind-3 event (0 for a device-local follow). */
  relays: number;
  /** True when the kind-3 publish succeeded. */
  ok: boolean;
  /** Honest one-liner for a toast. */
  message: string;
}

export interface FollowTarget {
  username: string;
  /** Creator's published Nostr key (npub or hex), if they have one. */
  nostrPubkey?: string | null;
}

function hexPubkeyOrNull(raw: string | null | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;
  try {
    const hex = nostrService.normalizePubkey(value);
    return /^[0-9a-f]{64}$/i.test(hex) ? hex.toLowerCase() : null;
  } catch {
    return null;
  }
}

/** Why a follow can only be device-local, or null when it can go to Nostr. */
function localOnlyReason(target: FollowTarget, hex: string | null): string | null {
  if (!hex) {
    return target.nostrPubkey?.trim()
      ? `The Nostr key published for @${target.username} could not be read, so this follow can only live on this device.`
      : `@${target.username} has not published a Nostr key, so this follow can only live on this device.`;
  }
  if (!hasNip07()) {
    return `Following @${target.username} on this device. Add a NIP-07 extension (Alby, nos2x) to publish a Nostr kind-3 follow.`;
  }
  return null;
}

export async function followCreator(target: FollowTarget): Promise<FollowResult> {
  const hex = hexPubkeyOrNull(target.nostrPubkey);
  const localOnly = localOnlyReason(target, hex);

  if (localOnly || !hex) {
    followLocal(target.username, 'local');
    return { following: true, source: 'local', relays: 0, ok: false, message: localOnly! };
  }

  const result = await nostrService.followPubkey(hex);
  if (!result.ok) {
    followLocal(target.username, 'local');
    return {
      following: true,
      source: 'local',
      relays: 0,
      ok: false,
      message: `Followed @${target.username} on this device only — the kind-3 publish failed: ${result.message}`,
    };
  }

  followLocal(target.username, 'nostr');
  const relays = result.accepted.length;
  const caveat = result.existingListFound
    ? ''
    : ' No earlier contact list was found on the reachable relays, so this one starts fresh — a copy you published elsewhere may still win if it is newer.';
  return {
    following: true,
    source: 'nostr',
    relays,
    ok: true,
    message: `Following @${target.username} on Nostr — kind-3 saved to ${relays} relay(s).${caveat}`,
  };
}

export async function unfollowCreator(target: FollowTarget): Promise<FollowResult> {
  const hex = hexPubkeyOrNull(target.nostrPubkey);
  const wasNostrFollow = getFollow(target.username)?.source === 'nostr';

  if (wasNostrFollow && hex && hasNip07()) {
    const result = await nostrService.unfollowPubkey(hex);
    if (result.ok) {
      unfollowLocal(target.username);
      return {
        following: false,
        source: 'nostr',
        relays: result.accepted.length,
        ok: true,
        message: `Unfollowed @${target.username} on Nostr — kind-3 updated on ${result.accepted.length} relay(s).`,
      };
    }
    return {
      following: true,
      source: 'nostr',
      relays: 0,
      ok: false,
      message: `Still following @${target.username}: the kind-3 update failed (${result.message}). Nothing was changed on this device.`,
    };
  }

  unfollowLocal(target.username);
  return {
    following: false,
    source: 'local',
    relays: 0,
    ok: true,
    message: wasNostrFollow
      ? `Unfollowed @${target.username} on this device. The Nostr kind-3 list was not updated — edit your contact list in your Nostr client to remove it there.`
      : `Unfollowed @${target.username} on this device.`,
  };
}

/** Follow state for a creator, for the initial render. */
export function followState(username: string): { following: boolean; source: FollowSource } {
  if (!isFollowing(username)) return { following: false, source: 'local' };
  return { following: true, source: getFollow(username)?.source ?? 'local' };
}

/**
 * Follow state from the authoritative source.
 *
 * With a backend configured the `follows` rows are the truth, so a follow made
 * on another device shows up here; the device seam is consulted only in a build
 * with no backend. Either way the kind-3 badge is only claimed when this device
 * itself published one.
 */
export async function fetchFollowState(
  username: string,
  userId: string | null | undefined,
): Promise<{ following: boolean; source: FollowSource }> {
  const local = followState(username);
  if (usesLocalEngagementSeam() || !userId) return local;

  const followed = await fetchFollowedUsernames(userId);
  const following = Boolean(followed[username.trim().toLowerCase()]);
  if (!following) return { following: false, source: 'local' };
  return { following: true, source: local.source === 'nostr' ? 'nostr' : 'local' };
}
