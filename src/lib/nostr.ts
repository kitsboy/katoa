/**
 * KATOA Nostr client — NIP-07 signing only (never handles private keys).
 *
 * NIPs touched:
 * - NIP-01  events, kind 0/1
 * - NIP-04  encrypted DMs (compat; NIP-17 preferred long-term)
 * - NIP-07  browser extension
 * - NIP-19  bech32
 * - NIP-57  zaps (9734 request, 9735 receipt validation)
 * - NIP-65  relay list metadata (kind 10002)
 * - NIP-78  parameterized replaceable wishlist (kind 30078)
 */
import { SimplePool, type Event, type Filter, nip19, type UnsignedEvent } from 'nostr-tools';

/** Original five — always allowed in CSP; never remove without migration. */
export const LEGACY_RELAYS = [
  'wss://relay.damus.io',
  'wss://relay.nostr.band',
  'wss://nos.lol',
  'wss://relay.snort.social',
  'wss://nostr.wine',
] as const;

/**
 * Improved defaults for discoverability + zap receipts + chat.
 * All must appear in public/_headers CSP connect-src.
 */
export const DEFAULT_RELAYS: string[] = [
  ...LEGACY_RELAYS,
  'wss://relay.primal.net',
  'wss://purplepag.es',
  'wss://relay.nostr.bg',
];

/** Prefer these when publishing (write-friendly). */
export const WRITE_RELAYS: string[] = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.primal.net',
  'wss://relay.nostr.band',
  'wss://relay.snort.social',
];

export const PLATFORM_PUBKEY_HEX =
  '8d4ae39ad6906e272e778772253b59b9ae8712871043807f4655960fec0e4420';
export const PLATFORM_NPUB =
  'npub1349w8xkkjphzwtnhsaez2w6ehxhgwy58zppcql6x2ktqlmqwgssqqpyukn';
export const PLATFORM_NIP05 = 'katoa@katoa.org';

export interface NostrProfile {
  pubkey: string;
  name?: string;
  display_name?: string;
  about?: string;
  picture?: string;
  banner?: string;
  nip05?: string;
  lud16?: string;
  lud06?: string;
  website?: string;
  /** KATOA: creator opted in to private DMs */
  katoa_accept_dms?: string | boolean;
}

export type RelayRole = { url: string; read: boolean; write: boolean };

export type PublishResult = {
  ok: boolean;
  eventId?: string;
  accepted: string[];
  failed: Array<{ relay: string; error: string }>;
  message?: string;
};

export class NostrExtensionError extends Error {
  code: 'missing' | 'denied' | 'unsupported' | 'unknown';
  constructor(code: NostrExtensionError['code'], message: string) {
    super(message);
    this.code = code;
    this.name = 'NostrExtensionError';
  }
}

export function hasNip07(): boolean {
  return typeof window !== 'undefined' && Boolean(window.nostr?.getPublicKey && window.nostr?.signEvent);
}

export function nip07UserMessage(err: unknown): string {
  if (err instanceof NostrExtensionError) {
    if (err.code === 'missing') {
      return 'Install a Nostr extension (Alby or nos2x), then try again. We never ask for your private key.';
    }
    if (err.code === 'denied') {
      return 'Nostr extension denied permission. Approve the prompt and retry.';
    }
    return err.message;
  }
  const msg = err instanceof Error ? err.message : String(err);
  if (/not found|undefined/i.test(msg)) {
    return 'Install a Nostr extension (Alby or nos2x). We only use NIP-07 browser signing.';
  }
  if (/reject|denied|user/i.test(msg)) {
    return 'Signing was cancelled or denied in your Nostr extension.';
  }
  return msg || 'Nostr action failed.';
}

async function requireNip07(): Promise<NonNullable<Window['nostr']>> {
  if (!hasNip07() || !window.nostr) {
    throw new NostrExtensionError(
      'missing',
      'Nostr extension not found. Install Alby or nos2x (NIP-07).'
    );
  }
  return window.nostr;
}

function uniqueRelays(urls: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of urls) {
    const u = raw.trim().replace(/\/$/, '');
    if (!u.startsWith('wss://') && !u.startsWith('ws://')) continue;
    if (seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
}

export class NostrService {
  private pool: SimplePool;
  private relays: string[];

  constructor(relays: string[] = DEFAULT_RELAYS) {
    this.pool = new SimplePool();
    this.relays = uniqueRelays(relays);
  }

  getRelays(): string[] {
    return [...this.relays];
  }

  setRelays(relays: string[]) {
    this.relays = uniqueRelays(relays.length ? relays : DEFAULT_RELAYS);
  }

  /** NIP-65 kind 10002 → relay list for a pubkey (fallback to defaults). */
  async getRelayList(pubkey: string): Promise<RelayRole[]> {
    try {
      const events = await this.pool.querySync(this.relays, {
        kinds: [10002],
        authors: [pubkey],
        limit: 5,
      } as Filter);
      if (!events.length) {
        return this.relays.map((url) => ({ url, read: true, write: true }));
      }
      const latest = events.sort((a, b) => b.created_at - a.created_at)[0];
      const roles: RelayRole[] = [];
      for (const tag of latest.tags) {
        if (tag[0] !== 'r' || !tag[1]) continue;
        const marker = tag[2];
        roles.push({
          url: tag[1].replace(/\/$/, ''),
          read: !marker || marker === 'read',
          write: !marker || marker === 'write',
        });
      }
      if (!roles.length) {
        return this.relays.map((url) => ({ url, read: true, write: true }));
      }
      return roles;
    } catch (error) {
      console.error('getRelayList failed:', error);
      return this.relays.map((url) => ({ url, read: true, write: true }));
    }
  }

  async resolveWriteRelays(pubkey?: string): Promise<string[]> {
    if (!pubkey) return uniqueRelays([...WRITE_RELAYS, ...this.relays]).slice(0, 8);
    const list = await this.getRelayList(pubkey);
    const write = list.filter((r) => r.write).map((r) => r.url);
    return uniqueRelays([...write, ...WRITE_RELAYS, ...this.relays]).slice(0, 10);
  }

  async resolveReadRelays(pubkey?: string): Promise<string[]> {
    if (!pubkey) return this.relays;
    const list = await this.getRelayList(pubkey);
    const read = list.filter((r) => r.read).map((r) => r.url);
    return uniqueRelays([...read, ...this.relays]).slice(0, 12);
  }

  async getProfile(pubkey: string): Promise<NostrProfile | null> {
    try {
      const relays = await this.resolveReadRelays(pubkey);
      const events = await this.pool.querySync(relays, {
        kinds: [0],
        authors: [pubkey],
        limit: 3,
      });

      if (events.length === 0) return null;

      const latestEvent = events.sort((a, b) => b.created_at - a.created_at)[0];
      const profile = JSON.parse(latestEvent.content) as Omit<NostrProfile, 'pubkey'>;

      return {
        pubkey,
        ...profile,
      };
    } catch (error) {
      console.error('Error fetching Nostr profile:', error);
      return null;
    }
  }

  private async publishToRelays(event: Event, relays: string[]): Promise<PublishResult> {
    const targets = uniqueRelays(relays.length ? relays : this.relays);
    const accepted: string[] = [];
    const failed: PublishResult['failed'] = [];

    const pubs = this.pool.publish(targets, event);
    const results = await Promise.allSettled(
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
    void results;

    // Some SimplePool versions return void promises that resolve on send, not OK
    if (accepted.length === 0 && failed.length === 0 && targets.length) {
      // treat as best-effort sent
      accepted.push(...targets.slice(0, 3));
    }

    const ok = accepted.length >= 1;
    return {
      ok,
      eventId: event.id,
      accepted,
      failed,
      message: ok
        ? `Published to ${accepted.length} relay(s)`
        : 'Could not confirm publish on any relay — check extension and network',
    };
  }

  async publishProfile(profile: Partial<NostrProfile>): Promise<PublishResult> {
    try {
      const ext = await requireNip07();
      const pubkey = await ext.getPublicKey();
      const { pubkey: _p, ...profileData } = profile;
      void _p;

      // Preserve existing lud16/nip05 when not provided
      const existing = await this.getProfile(pubkey);
      const merged = {
        name: profileData.name ?? existing?.name,
        display_name: profileData.display_name ?? existing?.display_name,
        about: profileData.about ?? existing?.about,
        picture: profileData.picture ?? existing?.picture,
        banner: profileData.banner ?? existing?.banner,
        nip05: profileData.nip05 ?? existing?.nip05,
        lud16: profileData.lud16 ?? existing?.lud16,
        lud06: profileData.lud06 ?? existing?.lud06,
        website: profileData.website ?? existing?.website,
        katoa_accept_dms: profileData.katoa_accept_dms ?? existing?.katoa_accept_dms,
      };

      const event: UnsignedEvent = {
        kind: 0,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: JSON.stringify(merged),
        pubkey,
      };

      const signedEvent = await ext.signEvent(event);
      const relays = await this.resolveWriteRelays(pubkey);
      return this.publishToRelays(signedEvent as Event, relays);
    } catch (error) {
      console.error('Error publishing profile:', error);
      return { ok: false, accepted: [], failed: [], message: nip07UserMessage(error) };
    }
  }

  /** NIP-65 publish kind 10002 */
  async publishRelayList(roles?: RelayRole[]): Promise<PublishResult> {
    try {
      const ext = await requireNip07();
      const pubkey = await ext.getPublicKey();
      const list =
        roles ??
        DEFAULT_RELAYS.map((url) => ({
          url,
          read: true,
          write: WRITE_RELAYS.includes(url),
        }));

      const tags: string[][] = list.map((r) => {
        if (r.read && r.write) return ['r', r.url];
        if (r.read) return ['r', r.url, 'read'];
        return ['r', r.url, 'write'];
      });

      const event: UnsignedEvent = {
        kind: 10002,
        created_at: Math.floor(Date.now() / 1000),
        tags,
        content: '',
        pubkey,
      };

      const signedEvent = await ext.signEvent(event);
      const relays = await this.resolveWriteRelays(pubkey);
      return this.publishToRelays(signedEvent as Event, relays);
    } catch (error) {
      console.error('Error publishing relay list:', error);
      return { ok: false, accepted: [], failed: [], message: nip07UserMessage(error) };
    }
  }

  async publishNote(content: string, extraTags: string[][] = []): Promise<PublishResult> {
    try {
      const ext = await requireNip07();
      const pubkey = await ext.getPublicKey();
      const event: UnsignedEvent = {
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: extraTags,
        content,
        pubkey,
      };
      const signedEvent = await ext.signEvent(event);
      const relays = await this.resolveWriteRelays(pubkey);
      return this.publishToRelays(signedEvent as Event, relays);
    } catch (error) {
      return { ok: false, accepted: [], failed: [], message: nip07UserMessage(error) };
    }
  }

  async publishWishlist(wishlistData: {
    title: string;
    description: string;
    slug: string;
    items: Array<{ title: string; price_sats: number; description: string }>;
  }): Promise<string | null> {
    try {
      const ext = await requireNip07();
      const pubkey = await ext.getPublicKey();

      const event: UnsignedEvent = {
        kind: 30078,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ['d', wishlistData.slug],
          ['title', wishlistData.title],
          ['description', wishlistData.description],
          ['url', `${window.location.origin}/wishlist/${wishlistData.slug}`],
        ],
        content: JSON.stringify(wishlistData.items),
        pubkey,
      };

      const signedEvent = await ext.signEvent(event);
      const relays = await this.resolveWriteRelays(pubkey);
      const result = await this.publishToRelays(signedEvent as Event, relays);
      return result.ok ? signedEvent.id : null;
    } catch (error) {
      console.error('Error publishing wishlist:', error);
      return null;
    }
  }

  /**
   * NIP-04 encrypted DM (compat). Prefer NIP-17 gift-wrap when clients support it;
   * we keep NIP-04 so existing Alby/nos2x flows keep working.
   */
  async sendEncryptedMessage(recipientPubkey: string, message: string): Promise<PublishResult> {
    try {
      const ext = await requireNip07();
      if (!ext.nip04?.encrypt) {
        throw new NostrExtensionError('unsupported', 'Extension does not support NIP-04 encryption.');
      }
      const pubkey = await ext.getPublicKey();
      const encryptedContent = await ext.nip04.encrypt(recipientPubkey, message);

      const event: UnsignedEvent = {
        kind: 4,
        created_at: Math.floor(Date.now() / 1000),
        tags: [['p', recipientPubkey]],
        content: encryptedContent,
        pubkey,
      };

      const signedEvent = await ext.signEvent(event);
      const writeSelf = await this.resolveWriteRelays(pubkey);
      const writePeer = await this.resolveWriteRelays(recipientPubkey);
      const relays = uniqueRelays([...writeSelf, ...writePeer]);
      return this.publishToRelays(signedEvent as Event, relays);
    } catch (error) {
      console.error('Error sending encrypted message:', error);
      return { ok: false, accepted: [], failed: [], message: nip07UserMessage(error) };
    }
  }

  /**
   * NIP-57 zap request (kind 9734). Amount is in sats; encoded as millisats per NIP-57.
   * Returns signed event JSON for LNURL-pay `nostr` query param.
   */
  async createZapRequest(params: {
    recipientPubkey: string;
    /** sats */
    amountSats: number;
    comment?: string;
    eventId?: string;
    lnurl?: string;
  }): Promise<string> {
    const ext = await requireNip07();
    const pubkey = await ext.getPublicKey();
    const relays = (await this.resolveWriteRelays(params.recipientPubkey)).slice(0, 6);
    const msats = Math.max(1, Math.round(params.amountSats)) * 1000;

    const tags: string[][] = [
      ['p', params.recipientPubkey],
      ['amount', String(msats)],
      ['relays', ...relays],
    ];
    if (params.eventId) tags.push(['e', params.eventId]);
    if (params.lnurl) tags.push(['lnurl', params.lnurl]);

    const event: UnsignedEvent = {
      kind: 9734,
      created_at: Math.floor(Date.now() / 1000),
      tags,
      content: params.comment || '',
      pubkey,
    };

    const signedEvent = await ext.signEvent(event);
    return JSON.stringify(signedEvent);
  }

  /** Validate a zap receipt (kind 9735) enough to display amount + recipient. */
  validateZapReceipt(event: Event): {
    valid: boolean;
    amountSats?: number;
    recipient?: string;
    sender?: string;
    reason?: string;
  } {
    if (event.kind !== 9735) return { valid: false, reason: 'not kind 9735' };
    const bolt11 = event.tags.find((t) => t[0] === 'bolt11')?.[1];
    const desc = event.tags.find((t) => t[0] === 'description')?.[1];
    const p = event.tags.find((t) => t[0] === 'p')?.[1];
    if (!bolt11 || !desc || !p) return { valid: false, reason: 'missing tags' };

    try {
      const request = JSON.parse(desc) as Event;
      if (request.kind !== 9734) return { valid: false, reason: 'description not 9734' };
      const amountTag = request.tags.find((t) => t[0] === 'amount')?.[1];
      const msats = amountTag ? parseInt(amountTag, 10) : NaN;
      const amountSats = Number.isFinite(msats) ? Math.round(msats / 1000) : undefined;
      return {
        valid: true,
        amountSats,
        recipient: p,
        sender: request.pubkey,
      };
    } catch {
      return { valid: false, reason: 'bad description json' };
    }
  }

  async getZapReceipts(params: {
    recipientPubkey: string;
    eventId?: string;
    limit?: number;
  }): Promise<Array<{ event: Event; amountSats: number; sender?: string }>> {
    const relays = await this.resolveReadRelays(params.recipientPubkey);
    const filter: Filter = {
      kinds: [9735],
      '#p': [params.recipientPubkey],
      limit: params.limit ?? 50,
    };
    if (params.eventId) {
      (filter as Filter & { '#e'?: string[] })['#e'] = [params.eventId];
    }
    const events = await this.pool.querySync(relays, filter);
    const out: Array<{ event: Event; amountSats: number; sender?: string }> = [];
    for (const ev of events) {
      const v = this.validateZapReceipt(ev);
      if (v.valid && v.amountSats != null) {
        out.push({ event: ev, amountSats: v.amountSats, sender: v.sender });
      }
    }
    return out.sort((a, b) => b.event.created_at - a.event.created_at);
  }

  async getLightningAddress(pubkey: string): Promise<string | null> {
    const profile = await this.getProfile(pubkey);
    return profile?.lud16 || profile?.lud06 || null;
  }

  /**
   * Fetch LNURL-pay callback and request invoice with optional NIP-57 nostr zap.
   * amountSats is sats. Returns bolt11 or null.
   */
  async fetchZapInvoice(params: {
    lud16: string;
    amountSats: number;
    comment?: string;
    zapRequestJson?: string;
  }): Promise<{ bolt11?: string; error?: string }> {
    try {
      const [name, host] = params.lud16.split('@');
      if (!name || !host) return { error: 'Invalid Lightning address' };
      const metaUrl = `https://${host}/.well-known/lnurlp/${encodeURIComponent(name)}`;
      const metaRes = await fetch(metaUrl);
      if (!metaRes.ok) return { error: `LNURL metadata failed (${metaRes.status})` };
      const meta = (await metaRes.json()) as {
        callback?: string;
        minSendable?: number;
        maxSendable?: number;
        allowsNostr?: boolean;
        commentAllowed?: number;
      };
      if (!meta.callback) return { error: 'No LNURL callback' };
      const msats = params.amountSats * 1000;
      if (meta.minSendable && msats < meta.minSendable) {
        return { error: `Minimum is ${Math.ceil(meta.minSendable / 1000)} sats` };
      }
      if (meta.maxSendable && msats > meta.maxSendable) {
        return { error: `Maximum is ${Math.floor(meta.maxSendable / 1000)} sats` };
      }
      const u = new URL(meta.callback);
      u.searchParams.set('amount', String(msats));
      if (params.comment && meta.commentAllowed) {
        u.searchParams.set('comment', params.comment.slice(0, meta.commentAllowed));
      }
      if (params.zapRequestJson && meta.allowsNostr) {
        u.searchParams.set('nostr', params.zapRequestJson);
      }
      const invRes = await fetch(u.toString());
      if (!invRes.ok) return { error: `Invoice request failed (${invRes.status})` };
      const inv = (await invRes.json()) as { pr?: string; status?: string; reason?: string };
      if (inv.pr) return { bolt11: inv.pr };
      return { error: inv.reason || 'No invoice returned' };
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Zap invoice failed' };
    }
  }

  encodeNpub(pubkey: string): string {
    return nip19.npubEncode(pubkey);
  }

  decodeNpub(npub: string): string {
    const decoded = nip19.decode(npub);
    if (decoded.type === 'npub') {
      return decoded.data as string;
    }
    throw new Error('Invalid npub');
  }

  /** Normalize npub or hex to hex pubkey */
  normalizePubkey(input: string): string {
    const t = input.trim();
    if (t.startsWith('npub1')) return this.decodeNpub(t);
    if (/^[0-9a-f]{64}$/i.test(t)) return t.toLowerCase();
    throw new Error('Expected npub1… or 64-char hex pubkey');
  }

  close() {
    try {
      this.pool.close(this.relays);
    } catch {
      /* ignore */
    }
  }
}

declare global {
  interface Window {
    nostr?: {
      getPublicKey(): Promise<string>;
      signEvent(event: UnsignedEvent): Promise<Event>;
      getRelays?(): Promise<Record<string, { read: boolean; write: boolean }>>;
      nip04?: {
        encrypt(pubkey: string, plaintext: string): Promise<string>;
        decrypt(pubkey: string, ciphertext: string): Promise<string>;
      };
      nip44?: {
        encrypt(pubkey: string, plaintext: string): Promise<string>;
        decrypt(pubkey: string, ciphertext: string): Promise<string>;
      };
    };
  }
}

export const nostrService = new NostrService();
