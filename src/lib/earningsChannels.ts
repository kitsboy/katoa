/**
 * Creator earnings per payout channel, with what can actually be proved.
 *
 * Katoa never holds the sats, so the dashboard can only report what a trusted
 * server wrote into `transactions` and how a supporter can check a payment
 * themselves. Two rules keep it honest:
 *
 * 1. Only a row the server marked confirmed counts as settled — pending gift
 *    intents are shown separately and never folded into the total.
 * 2. A rail Katoa cannot confirm can never be settled here, even if a row claims
 *    `confirmed`. A BIP352 silent payment reaches nobody's webhook, so counting
 *    one would be inventing money.
 */

import { LIVE_EARNINGS_STATUSES } from './earnings';

export type PayoutChannel = 'lightning' | 'onchain' | 'nostr' | 'silent' | 'unknown';

export const PAYOUT_CHANNELS: readonly PayoutChannel[] = [
  'lightning',
  'onchain',
  'nostr',
  'silent',
  'unknown',
];

/** Channels a server-side settlement source can actually confirm. */
const CONFIRMABLE_CHANNELS: readonly PayoutChannel[] = ['lightning', 'onchain', 'nostr'];

/**
 * Rails with no settlement notification at all. `nostr` sits in the confirmable
 * set because a NIP-57 zap receipt is a real signed proof; a silent payment has
 * no equivalent.
 */
const UNVERIFIABLE_CHANNELS: readonly PayoutChannel[] = ['silent', 'unknown'];

export interface ChannelTransactionRow {
  id?: string;
  amount_sats: number | null;
  status?: string | null;
  payment_method?: string | null;
  payment_hash?: string | null;
  created_at?: string | null;
}

export interface ChannelProof {
  kind: 'hash' | 'address' | 'none';
  label: string;
  note: string;
  /** Only set when the link really shows the payments (an address page, not a guess). */
  href?: string | null;
}

export interface ChannelBreakdown {
  channel: PayoutChannel;
  label: string;
  settledSats: number;
  settledCount: number;
  /** Server-recorded intents still waiting on settlement. */
  pendingSats: number;
  pendingCount: number;
  /** Rows this rail can never settle in Katoa's records. */
  unverifiableSats: number;
  unverifiableCount: number;
  /** Payment hashes we hold for settled Lightning rows (copyable proof). */
  paymentHashes: string[];
  proof: ChannelProof;
}

export interface ChannelBreakdownOptions {
  /** Creator's published receive address per channel, for the proof link. */
  addresses?: Partial<Record<PayoutChannel, string | null>>;
}

const CHANNEL_LABELS: Record<PayoutChannel, string> = {
  lightning: 'Lightning',
  onchain: 'On-chain Bitcoin',
  nostr: 'Nostr zaps',
  silent: 'Silent payments (BIP352)',
  unknown: 'Unclassified',
};

/** Map a stored `payment_method` / wallet kind onto a payout channel. */
export function channelFor(paymentMethod: string | null | undefined): PayoutChannel {
  const value = (paymentMethod ?? '').trim().toLowerCase();
  if (!value) return 'unknown';
  if (value.includes('silent') || value === 'sp1') return 'silent';
  if (value.includes('lightning') || value === 'bolt11' || value === 'lnurl') return 'lightning';
  if (value.includes('nostr') || value === 'zap') return 'nostr';
  if (value.includes('onchain') || value.includes('bitcoin') || value === 'xpub') return 'onchain';
  return 'unknown';
}

export function isSettledStatus(status: string | null | undefined): boolean {
  if (!status) return false;
  return (LIVE_EARNINGS_STATUSES as readonly string[]).includes(status.toLowerCase());
}

function proofFor(channel: PayoutChannel, addresses: ChannelBreakdownOptions['addresses']): ChannelProof {
  const address = addresses?.[channel]?.trim() || '';
  switch (channel) {
    case 'lightning':
      return {
        kind: 'hash',
        label: 'Payment hash',
        note: 'A settled bolt11 payment hash is proof in the wallet or node you paid with. There is no public lookup for an arbitrary hash, so Katoa shows the hash it recorded instead of a link.',
      };
    case 'onchain':
      return {
        kind: address ? 'address' : 'none',
        label: address ? 'Address history' : 'No address published',
        note: address
          ? 'mempool.space shows every payment to this address — not one invoice. Use it as confirmation of activity, not proof of a specific gift.'
          : 'The creator has not published an on-chain address, so there is nothing to verify here.',
        href: address ? `https://mempool.space/address/${encodeURIComponent(address)}` : null,
      };
    case 'nostr':
      return {
        kind: 'hash',
        label: 'Zap receipt',
        note: 'A NIP-57 zap receipt signed by the creator\u2019s lightning provider is the proof on this rail. Katoa stores the gift intent only, not the receipt.',
      };
    case 'silent':
      return {
        kind: 'none',
        label: 'No proof possible',
        note: 'A BIP352 address carries no invoice, hash or receipt, so nobody can confirm a silent payment for the creator. If you were paid this way, only your own wallet shows it.',
      };
    default:
      return {
        kind: 'none',
        label: 'Unclassified',
        note: 'This row has no usable payment method, so it cannot be attributed to a payout channel or verified.',
      };
  }
}

/**
 * Group transactions by channel. Every row lands in exactly one bucket, so the
 * totals add up to the rows given (nothing silently dropped).
 */
export function buildChannelBreakdown(
  rows: ChannelTransactionRow[],
  options: ChannelBreakdownOptions = {},
): ChannelBreakdown[] {
  const byChannel = new Map<PayoutChannel, ChannelBreakdown>();

  for (const channel of PAYOUT_CHANNELS) {
    byChannel.set(channel, {
      channel,
      label: CHANNEL_LABELS[channel],
      settledSats: 0,
      settledCount: 0,
      pendingSats: 0,
      pendingCount: 0,
      unverifiableSats: 0,
      unverifiableCount: 0,
      paymentHashes: [],
      proof: proofFor(channel, options.addresses),
    });
  }

  for (const row of rows) {
    const bucket = byChannel.get(channelFor(row.payment_method));
    if (!bucket) continue;
    const sats = Number.isFinite(row.amount_sats) ? Math.max(0, row.amount_sats as number) : 0;

    if (UNVERIFIABLE_CHANNELS.includes(bucket.channel)) {
      // Includes a row the database claims is confirmed: this rail has no source
      // that could have confirmed it.
      bucket.unverifiableCount += 1;
      bucket.unverifiableSats += sats;
      continue;
    }

    if (isSettledStatus(row.status)) {
      bucket.settledCount += 1;
      bucket.settledSats += sats;
      const hash = row.payment_hash?.trim();
      if (hash) bucket.paymentHashes.push(hash);
      continue;
    }

    bucket.pendingCount += 1;
    bucket.pendingSats += sats;
  }

  return PAYOUT_CHANNELS.map((channel) => byChannel.get(channel)!);
}

export interface ChannelTotals {
  settledSats: number;
  pendingSats: number;
  unverifiableSats: number;
}

export function channelTotals(breakdown: ChannelBreakdown[]): ChannelTotals {
  return breakdown.reduce<ChannelTotals>(
    (acc, row) => ({
      settledSats: acc.settledSats + row.settledSats,
      pendingSats: acc.pendingSats + row.pendingSats,
      unverifiableSats: acc.unverifiableSats + row.unverifiableSats,
    }),
    { settledSats: 0, pendingSats: 0, unverifiableSats: 0 }
  );
}

/**
 * Channels worth showing, in payout order: rails with rows, plus a rail whose
 * proof is a real link the creator can open even before anything settled (their
 * on-chain address history). A rail with nothing to show and nothing to click is
 * left out rather than listed as an empty row.
 */
export function channelsWithActivity(breakdown: ChannelBreakdown[]): ChannelBreakdown[] {
  return breakdown.filter(
    (row) =>
      row.settledCount > 0 ||
      row.pendingCount > 0 ||
      row.unverifiableCount > 0 ||
      Boolean(row.proof.href)
  );
}

/** True when the rail can never be settled in Katoa's own records. */
export function isUnverifiableChannel(channel: PayoutChannel): boolean {
  return UNVERIFIABLE_CHANNELS.includes(channel);
}

export function isConfirmableChannel(channel: PayoutChannel): boolean {
  return CONFIRMABLE_CHANNELS.includes(channel);
}
