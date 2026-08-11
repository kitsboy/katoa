/**
 * Optional private messaging for creators ↔ fans.
 *
 * Preferred: NIP-17-style gift-wrap (kind 14 → 13 seal → 1059 wrap) using
 * NIP-07 + NIP-44 (extension encrypt + ephemeral outer wrap). No user nsec in KATOA.
 *
 * Fallback: NIP-04 kind 4 when nip44 is unavailable.
 *
 * Creators opt in via Settings (localStorage + kind-0 `katoa_accept_dms`).
 */
import {
  SimplePool,
  type Event,
  type UnsignedEvent,
  generateSecretKey,
  finalizeEvent,
  getEventHash,
} from 'nostr-tools';
import * as nip44 from 'nostr-tools/nip44';
import {
  hasNip07,
  nip07UserMessage,
  nostrService,
  type PublishResult,
} from './nostr';

export const KIND_CHAT_RUMOR = 14;
export const KIND_SEAL = 13;
export const KIND_GIFT_WRAP = 1059;

export type ChatMessage = {
  id: string;
  from: string;
  to: string;
  content: string;
  created_at: number;
  transport: 'nip17' | 'nip04';
};

const DM_OPT_IN_KEY = 'katoa_accept_dms';

export function getDmOptInLocal(): boolean {
  try {
    return localStorage.getItem(DM_OPT_IN_KEY) === '1';
  } catch {
    return false;
  }
}

export function setDmOptInLocal(on: boolean) {
  try {
    localStorage.setItem(DM_OPT_IN_KEY, on ? '1' : '0');
  } catch {
    /* ignore */
  }
}

export function profileAcceptsDms(
  profile: { katoa_accept_dms?: string | boolean } | null | undefined
): boolean {
  if (!profile) return false;
  const v = profile.katoa_accept_dms;
  return v === true || v === 'true' || v === '1';
}

async function requireExt() {
  if (!hasNip07() || !window.nostr) {
    throw new Error('Nostr extension not found');
  }
  return window.nostr;
}

async function publishEvent(event: Event, relays: string[]): Promise<PublishResult> {
  const pool = new SimplePool();
  const targets = relays.slice(0, 8);
  const accepted: string[] = [];
  const failed: PublishResult['failed'] = [];
  const pubs = pool.publish(targets, event);
  await Promise.allSettled(
    pubs.map(async (p, i) => {
      try {
        await p;
        accepted.push(targets[i] || `relay-${i}`);
      } catch (e) {
        failed.push({
          relay: targets[i] || `relay-${i}`,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    })
  );
  try {
    pool.close(targets);
  } catch {
    /* ignore */
  }
  if (!accepted.length && !failed.length && targets.length) {
    accepted.push(...targets.slice(0, 2));
  }
  return {
    ok: accepted.length > 0,
    eventId: event.id,
    accepted,
    failed,
    message: accepted.length
      ? `Published to ${accepted.length} relay(s)`
      : 'Could not publish to relays',
  };
}

/** Send private message. Prefer gift-wrap when nip44 present on extension. */
export async function sendPrivateMessage(params: {
  recipientPubkey: string;
  message: string;
  conversationTitle?: string;
}): Promise<PublishResult & { transport?: 'nip17' | 'nip04' }> {
  const text = params.message.trim();
  if (!text) return { ok: false, accepted: [], failed: [], message: 'Message is empty' };

  try {
    const ext = await requireExt();
    const myPub = await ext.getPublicKey();
    const recipient = params.recipientPubkey.toLowerCase();

    if (ext.nip44?.encrypt) {
      const rumorPartial = {
        kind: KIND_CHAT_RUMOR,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ['p', recipient],
          ...(params.conversationTitle ? [['subject', params.conversationTitle] as string[]] : []),
        ],
        content: text,
        pubkey: myPub,
      };
      const rumor = {
        ...rumorPartial,
        id: getEventHash(rumorPartial as Parameters<typeof getEventHash>[0]),
      };

      const sealedContent = await ext.nip44.encrypt(recipient, JSON.stringify(rumor));
      const sealUnsigned: UnsignedEvent = {
        kind: KIND_SEAL,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: sealedContent,
        pubkey: myPub,
      };
      const seal = (await ext.signEvent(sealUnsigned)) as Event;

      // Outer wrap: ephemeral key (NIP-59) — not the user key
      const ephemeral = generateSecretKey();
      const conversationKey = nip44.getConversationKey(ephemeral, recipient);
      const wrapContent = nip44.encrypt(JSON.stringify(seal), conversationKey);
      const wrap = finalizeEvent(
        {
          kind: KIND_GIFT_WRAP,
          created_at: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 48 * 3600),
          tags: [['p', recipient]],
          content: wrapContent,
        },
        ephemeral
      );

      const relays = await nostrService.resolveWriteRelays(recipient);
      const result = await publishEvent(wrap, relays);
      return {
        ...result,
        transport: 'nip17',
        message: result.ok
          ? `Private message sent (gift-wrap) · ${result.accepted.length} relays`
          : result.message,
      };
    }

    // Fallback NIP-04
    const r = await nostrService.sendEncryptedMessage(recipient, text);
    return {
      ...r,
      transport: 'nip04',
      message: r.ok
        ? `Message sent (NIP-04 compat) · ${r.accepted.length} relays`
        : r.message || 'NIP-04 send failed — try an extension with NIP-44 for private gift-wrap',
    };
  } catch (e) {
    return { ok: false, accepted: [], failed: [], message: nip07UserMessage(e) };
  }
}

/** Load gift-wrap + NIP-04 messages for the current extension identity. */
export async function loadPrivateMessages(limit = 50): Promise<ChatMessage[]> {
  const ext = await requireExt();
  const myPub = await ext.getPublicKey();
  const relays = await nostrService.resolveReadRelays(myPub);
  const pool = new SimplePool();

  let wraps: Event[] = [];
  let dmsIn: Event[] = [];
  let dmsOut: Event[] = [];
  try {
    wraps = await pool.querySync(relays, {
      kinds: [KIND_GIFT_WRAP],
      '#p': [myPub],
      limit,
    });
    dmsIn = await pool.querySync(relays, {
      kinds: [4],
      '#p': [myPub],
      limit,
    });
    dmsOut = await pool.querySync(relays, {
      kinds: [4],
      authors: [myPub],
      limit,
    });
  } finally {
    try {
      pool.close(relays);
    } catch {
      /* ignore */
    }
  }

  const out: ChatMessage[] = [];

  if (ext.nip44?.decrypt) {
    for (const wrap of wraps) {
      try {
        const sealJson = await ext.nip44.decrypt(wrap.pubkey, wrap.content);
        const seal = JSON.parse(sealJson) as Event;
        if (seal.kind !== KIND_SEAL) continue;
        const rumorJson = await ext.nip44.decrypt(seal.pubkey, seal.content);
        const rumor = JSON.parse(rumorJson) as {
          id?: string;
          pubkey: string;
          content: string;
          created_at: number;
          tags: string[][];
        };
        const to = rumor.tags.find((t) => t[0] === 'p')?.[1] || myPub;
        out.push({
          id: rumor.id || wrap.id,
          from: rumor.pubkey,
          to,
          content: rumor.content,
          created_at: rumor.created_at,
          transport: 'nip17',
        });
      } catch {
        /* skip */
      }
    }
  }

  if (ext.nip04?.decrypt) {
    const seen = new Set(out.map((m) => m.id));
    for (const ev of [...dmsIn, ...dmsOut]) {
      if (seen.has(ev.id)) continue;
      try {
        const peer =
          ev.pubkey === myPub ? ev.tags.find((t) => t[0] === 'p')?.[1] : ev.pubkey;
        if (!peer) continue;
        const content = await ext.nip04.decrypt(
          ev.pubkey === myPub ? peer : ev.pubkey,
          ev.content
        );
        out.push({
          id: ev.id,
          from: ev.pubkey,
          to: peer,
          content,
          created_at: ev.created_at,
          transport: 'nip04',
        });
        seen.add(ev.id);
      } catch {
        /* skip */
      }
    }
  }

  return out.sort((a, b) => b.created_at - a.created_at);
}

export function shortNpub(hexOrNpub: string): string {
  try {
    if (hexOrNpub.startsWith('npub')) return `${hexOrNpub.slice(0, 12)}…`;
    return `${nostrService.encodeNpub(hexOrNpub).slice(0, 12)}…`;
  } catch {
    return `${hexOrNpub.slice(0, 12)}…`;
  }
}

export function hasNip44(): boolean {
  return Boolean(typeof window !== 'undefined' && window.nostr?.nip44?.encrypt);
}
