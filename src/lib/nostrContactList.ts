/**
 * NIP-02 contact list (kind 3) tag helpers.
 *
 * A kind-3 event is a *whole-list* replaceable event: publishing one that only
 * contains the new follow deletes every other follow. These helpers exist so a
 * follow/unfollow merges into the list we read first, and they are pure so the
 * merge rule is testable without relays or a browser extension.
 */

/** Pubkeys from a contact list's `p` tags, de-duplicated, in list order. */
export function contactPubkeys(tags: string[][]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const tag of tags) {
    if (tag[0] !== 'p') continue;
    const pk = tag[1]?.trim();
    if (!pk || seen.has(pk)) continue;
    seen.add(pk);
    out.push(pk);
  }
  return out;
}

function isHexPubkey(value: string): boolean {
  return /^[0-9a-f]{64}$/i.test(value);
}

/**
 * Merge follows into an existing contact list.
 *
 * Non-`p` tags (for example `relays`) are preserved in place, `remove` wins over
 * `add`, duplicated `p` entries collapse to the first occurrence, and every
 * added pubkey is appended as `['p', <hex>]`. Empty or malformed pubkeys are
 * ignored rather than written into a signed event.
 */
export function mergeContactTags(
  existing: string[][],
  add: string[] = [],
  remove: string[] = []
): string[][] {
  const addSet = new Set(add.map((pk) => pk.trim().toLowerCase()).filter(isHexPubkey));
  const removeSet = new Set(remove.map((pk) => pk.trim().toLowerCase()).filter(isHexPubkey));

  const out: string[][] = [];
  const emitted = new Set<string>();

  for (const tag of existing) {
    if (tag[0] !== 'p') {
      out.push([...tag]);
      continue;
    }
    const pk = (tag[1] ?? '').trim().toLowerCase();
    if (!pk) continue;
    if (removeSet.has(pk)) continue;
    if (emitted.has(pk)) continue;
    emitted.add(pk);
    // Canonical lowercase pubkey, with any relay hint / petname kept in place.
    out.push(['p', pk, ...tag.slice(2)]);
  }

  for (const pk of addSet) {
    if (removeSet.has(pk) || emitted.has(pk)) continue;
    emitted.add(pk);
    out.push(['p', pk]);
  }

  return out;
}

/** What changed when a contact list was merged (for honest UI copy). */
export interface ContactListDelta {
  tags: string[][];
  followed: boolean;
  total: number;
}

export function applyFollow(
  existing: string[][],
  targetPubkey: string
): ContactListDelta {
  const tags = mergeContactTags(existing, [targetPubkey], []);
  const followed = contactPubkeys(tags).includes(targetPubkey.trim().toLowerCase());
  return { tags, followed, total: contactPubkeys(tags).length };
}

export function applyUnfollow(
  existing: string[][],
  targetPubkey: string
): ContactListDelta {
  const tags = mergeContactTags(existing, [], [targetPubkey]);
  const followed = contactPubkeys(tags).includes(targetPubkey.trim().toLowerCase());
  return { tags, followed, total: contactPubkeys(tags).length };
}
