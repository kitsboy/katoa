/**
 * On-chain settlement matching.
 *
 * A creator publishes a receive address; supporters pay it from any wallet. This
 * decides which received output settles which pending gift, and it is deliberately
 * strict because a wrong match invents money:
 *
 * - an exact sat amount match, one payment to one row,
 * - enough confirmations before anything is called settled,
 * - a txid can settle at most one row, and never a row that already has one,
 * - a row cannot be settled twice by two outputs of the same transaction.
 */

export interface PendingGiftRow {
  id: string;
  amount_sats: number | null;
  status: string | null;
  txid: string | null;
  created_at: string | null;
  /** Needed to recompute the right campaign totals after settling. */
  wishlist_id?: string | null;
  item_id?: string | null;
}

export interface ReceivedOutput {
  txid: string;
  /** Sats received by the watched address in this output. */
  amountSats: number;
  confirmations: number;
  /** Block time, when confirmed. */
  seenAt?: string | null;
}

export interface SettlementMatch {
  transactionId: string;
  txid: string;
  amountSats: number;
  confirmations: number;
  /** Carried through so totals can be recomputed for the right campaign. */
  wishlistId: string | null;
  itemId: string | null;
  /** Reason the match is being reported, for the event ledger. */
  reason: 'exact-amount';
}

export interface RejectedMatch {
  txid: string;
  reason: string;
}

export interface MatchResult {
  matches: SettlementMatch[];
  rejected: RejectedMatch[];
}

export const REQUIRED_CONFIRMATIONS = 2;

/** A raft of sats no supporter could plausibly pay by accident. */
export const DUST_SATS = 1000;

export function isSettleableOutput(output: ReceivedOutput, required = REQUIRED_CONFIRMATIONS): boolean {
  if (!output.txid || !/^[0-9a-f]{64}$/i.test(output.txid)) return false;
  if (!Number.isFinite(output.amountSats) || output.amountSats < DUST_SATS) return false;
  // Floor of one: an unconfirmed transaction can still be replaced, so no caller
  // may settle on zero confirmations, whatever bar it asks for.
  return output.confirmations >= Math.max(1, Math.floor(required));
}

/**
 * Match confirmed outputs to pending gifts, oldest gift first so a long-standing
 * campaign is settled before a fresh one.
 */
export function matchOnchainPayments(
  pending: PendingGiftRow[],
  outputs: ReceivedOutput[],
  options: { requiredConfirmations?: number; now?: Date } = {},
): MatchResult {
  const required = options.requiredConfirmations ?? REQUIRED_CONFIRMATIONS;
  const matches: SettlementMatch[] = [];
  const rejected: RejectedMatch[] = [];

  const claimedTxids = new Set<string>();
  const byTxid = new Map<string, number>();

  const queue = [...pending]
    .filter((row) => !row.txid && !isSettled(row.status))
    .sort((a, b) => (a.created_at ?? '').localeCompare(b.created_at ?? ''));

  for (const output of outputs) {
    const txid = output.txid?.toLowerCase() ?? '';
    if (!isSettleableOutput(output, required)) {
      rejected.push({
        txid: txid || '(missing)',
        reason: `not settleable (${output.confirmations} confirmation(s), ${output.amountSats} sats)`,
      });
      continue;
    }
    if (claimedTxids.has(txid) || byTxid.has(txid)) {
      rejected.push({ txid, reason: 'txid already used for another payment' });
      continue;
    }

    const row = queue.find(
      (candidate) => (candidate.amount_sats ?? 0) === output.amountSats && !claimedTxids.has(`row:${candidate.id}`),
    );

    if (!row) {
      rejected.push({ txid, reason: 'no pending gift matches this amount' });
      continue;
    }

    claimedTxids.add(txid);
    claimedTxids.add(`row:${row.id}`);
    byTxid.set(txid, output.amountSats);
    matches.push({
      transactionId: row.id,
      txid,
      amountSats: output.amountSats,
      confirmations: output.confirmations,
      wishlistId: row.wishlist_id ?? null,
      itemId: row.item_id ?? null,
      reason: 'exact-amount',
    });
  }

  return { matches, rejected };
}

export function isSettled(status: string | null | undefined): boolean {
  if (!status) return false;
  return ['confirmed', 'completed', 'paid'].includes(status.toLowerCase());
}

/* ------------------------------------------------------------------ */
/* Proof links                                                         */
/* ------------------------------------------------------------------ */

/**
 * Per-payment proof for a settled on-chain row. Returns null for anything that is
 * not a real txid, so the UI can say "no txid recorded" instead of a dead link.
 */
export function txProofHref(txid: string | null | undefined): string | null {
  const value = txid?.trim().toLowerCase() ?? '';
  if (!/^[0-9a-f]{64}$/.test(value)) return null;
  return `https://mempool.space/tx/${value}`;
}

export function addressProofHref(address: string | null | undefined): string | null {
  const value = address?.trim() ?? '';
  if (!value) return null;
  return `https://mempool.space/address/${encodeURIComponent(value)}`;
}
