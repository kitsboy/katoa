import { SimplePool, Event, nip19, UnsignedEvent } from 'nostr-tools';

export const DEFAULT_RELAYS = [
  'wss://relay.damus.io',
  'wss://relay.nostr.band',
  'wss://nos.lol',
  'wss://relay.snort.social',
  'wss://nostr.wine',
];

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
}

export class NostrService {
  private pool: SimplePool;
  private relays: string[];

  constructor(relays: string[] = DEFAULT_RELAYS) {
    this.pool = new SimplePool();
    this.relays = relays;
  }

  async getProfile(pubkey: string): Promise<NostrProfile | null> {
    try {
      const events = await this.pool.querySync(this.relays, {
        kinds: [0],
        authors: [pubkey],
        limit: 1,
      });

      if (events.length === 0) return null;

      const latestEvent = events.sort((a, b) => b.created_at - a.created_at)[0];
      const profile = JSON.parse(latestEvent.content);

      return {
        pubkey,
        ...profile,
      };
    } catch (error) {
      console.error('Error fetching Nostr profile:', error);
      return null;
    }
  }

  async publishProfile(profile: Partial<NostrProfile>): Promise<boolean> {
    try {
      if (!window.nostr) {
        throw new Error('Nostr extension not found');
      }

      const pubkey = await window.nostr.getPublicKey();
      const { pubkey: _, ...profileData } = profile;

      const event: UnsignedEvent = {
        kind: 0,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: JSON.stringify(profileData),
        pubkey,
      };

      const signedEvent = await window.nostr.signEvent(event);
      await this.pool.publish(this.relays, signedEvent);

      return true;
    } catch (error) {
      console.error('Error publishing profile:', error);
      return false;
    }
  }

  async publishWishlist(wishlistData: {
    title: string;
    description: string;
    slug: string;
    items: Array<{ title: string; price_sats: number; description: string }>;
  }): Promise<string | null> {
    try {
      if (!window.nostr) {
        throw new Error('Nostr extension not found');
      }

      const pubkey = await window.nostr.getPublicKey();

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

      const signedEvent = await window.nostr.signEvent(event);
      await this.pool.publish(this.relays, signedEvent);

      return signedEvent.id;
    } catch (error) {
      console.error('Error publishing wishlist:', error);
      return null;
    }
  }

  async sendEncryptedMessage(recipientPubkey: string, message: string): Promise<boolean> {
    try {
      if (!window.nostr) {
        throw new Error('Nostr extension not found');
      }

      const pubkey = await window.nostr.getPublicKey();
      const encryptedContent = await window.nostr.nip04.encrypt(recipientPubkey, message);

      const event: UnsignedEvent = {
        kind: 4,
        created_at: Math.floor(Date.now() / 1000),
        tags: [['p', recipientPubkey]],
        content: encryptedContent,
        pubkey,
      };

      const signedEvent = await window.nostr.signEvent(event);
      await this.pool.publish(this.relays, signedEvent);

      return true;
    } catch (error) {
      console.error('Error sending encrypted message:', error);
      return false;
    }
  }

  async createZapRequest(params: {
    recipientPubkey: string;
    amount: number;
    comment?: string;
    eventId?: string;
  }): Promise<string> {
    try {
      if (!window.nostr) {
        throw new Error('Nostr extension not found');
      }

      const pubkey = await window.nostr.getPublicKey();

      const tags: string[][] = [
        ['p', params.recipientPubkey],
        ['amount', params.amount.toString()],
        ['relays', ...this.relays],
      ];

      if (params.eventId) {
        tags.push(['e', params.eventId]);
      }

      const event: UnsignedEvent = {
        kind: 9734,
        created_at: Math.floor(Date.now() / 1000),
        tags,
        content: params.comment || '',
        pubkey,
      };

      const signedEvent = await window.nostr.signEvent(event);
      return JSON.stringify(signedEvent);
    } catch (error) {
      console.error('Error creating zap request:', error);
      throw error;
    }
  }

  async getLightningAddress(pubkey: string): Promise<string | null> {
    const profile = await this.getProfile(pubkey);
    return profile?.lud16 || profile?.lud06 || null;
  }

  encodeNpub(pubkey: string): string {
    return nip19.npubEncode(pubkey);
  }

  decodeNpub(npub: string): string {
    const decoded = nip19.decode(npub);
    if (decoded.type === 'npub') {
      return decoded.data;
    }
    throw new Error('Invalid npub');
  }

  close() {
    this.pool.close(this.relays);
  }
}

declare global {
  interface Window {
    nostr?: {
      getPublicKey(): Promise<string>;
      signEvent(event: UnsignedEvent): Promise<Event>;
      getRelays?(): Promise<Record<string, { read: boolean; write: boolean }>>;
      nip04: {
        encrypt(pubkey: string, plaintext: string): Promise<string>;
        decrypt(pubkey: string, ciphertext: string): Promise<string>;
      };
    };
  }
}

export const nostrService = new NostrService();
