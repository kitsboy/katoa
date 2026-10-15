import { describe, expect, it } from 'vitest';
import {
  addressProofHref,
  DUST_SATS,
  isSettleableOutput,
  isSettled,
  matchOnchainPayments,
  REQUIRED_CONFIRMATIONS,
  txProofHref,
  type PendingGiftRow,
} from '../../../supabase/functions/_shared/onchain';

const TXID_A = 'a'.repeat(64);
const TXID_B = 'b'.repeat(64);
const TXID_C = 'c'.repeat(64);
const WISHLIST = '11111111-1111-4111-8111-111111111111';
const ITEM = '22222222-2222-4222-8222-222222222222';

const gift = (overrides: Partial<PendingGiftRow> = {}): PendingGiftRow => ({
  id: 'tx-1',
  amount_sats: 21_000,
  status: 'pending',
  txid: null,
  created_at: '2026-10-01T00:00:00.000Z',
  wishlist_id: WISHLIST,
  item_id: ITEM,
  ...overrides,
});

const received = (overrides: Partial<{ txid: string; amountSats: number; confirmations: number }> = {}) => ({
  txid: TXID_A,
  amountSats: 21_000,
  confirmations: 3,
  ...overrides,
});

describe('isSettleableOutput', () => {
  it('accepts a confirmed payment above dust', () => {
    expect(isSettleableOutput(received())).toBe(true);
  });

  it('refuses anything short of the confirmation bar', () => {
    expect(isSettleableOutput(received({ confirmations: 0 }))).toBe(false);
    expect(isSettleableOutput(received({ confirmations: REQUIRED_CONFIRMATIONS - 1 }))).toBe(false);
    expect(isSettleableOutput(received({ confirmations: REQUIRED_CONFIRMATIONS }))).toBe(true);
    // The bar is configurable, but it is never lowered to zero.
    expect(isSettleableOutput(received({ confirmations: 1 }), 1)).toBe(true);
    expect(isSettleableOutput(received({ confirmations: 0 }), 0)).toBe(false);
  });

  it('refuses dust, because a dust payment cannot be a real gift', () => {
    expect(isSettleableOutput(received({ amountSats: DUST_SATS - 1 }))).toBe(false);
    expect(isSettleableOutput(received({ amountSats: DUST_SATS }))).toBe(true);
    expect(isSettleableOutput(received({ amountSats: Number.NaN }))).toBe(false);
  });

  it('refuses a txid that is not 64 hex characters', () => {
    expect(isSettleableOutput(received({ txid: '' }))).toBe(false);
    expect(isSettleableOutput(received({ txid: 'deadbeef' }))).toBe(false);
    expect(isSettleableOutput(received({ txid: 'a'.repeat(63) }))).toBe(false);
    expect(isSettleableOutput(received({ txid: 'A'.repeat(64).toUpperCase() }))).toBe(true);
  });
});

describe('matchOnchainPayments', () => {
  it('settles the oldest pending gift of the same amount first', () => {
    const older = gift({ id: 'tx-old', created_at: '2026-09-01T00:00:00.000Z' });
    const newer = gift({ id: 'tx-new', created_at: '2026-10-01T00:00:00.000Z' });

    const { matches, rejected } = matchOnchainPayments([newer, older], [received()]);

    expect(rejected).toEqual([]);
    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({
      transactionId: 'tx-old',
      txid: TXID_A,
      amountSats: 21_000,
      confirmations: 3,
      wishlistId: WISHLIST,
      itemId: ITEM,
      reason: 'exact-amount',
    });
  });

  it('settles one gift per output and never reuses a txid', () => {
    const rows = [gift({ id: 'tx-1' }), gift({ id: 'tx-2' })];
    // The same transaction reported twice must not settle two gifts.
    const { matches, rejected } = matchOnchainPayments(rows, [received(), received()]);

    expect(matches.map((m) => m.transactionId)).toEqual(['tx-1']);
    expect(rejected).toEqual([{ txid: TXID_A, reason: 'txid already used for another payment' }]);
  });

  it('settles two gifts from two different transactions of the same amount', () => {
    const rows = [gift({ id: 'tx-1' }), gift({ id: 'tx-2' })];

    const { matches } = matchOnchainPayments(rows, [received(), received({ txid: TXID_B })]);

    expect(matches.map((m) => m.transactionId)).toEqual(['tx-1', 'tx-2']);
    expect(new Set(matches.map((m) => m.txid))).toEqual(new Set([TXID_A, TXID_B]));
  });

  it('ignores gifts that are already settled or already carry a txid', () => {
    const rows = [
      gift({ id: 'tx-confirmed', status: 'confirmed' }),
      gift({ id: 'tx-claimed', txid: TXID_C }),
      gift({ id: 'tx-pending' }),
    ];

    const { matches } = matchOnchainPayments(rows, [received()]);

    expect(matches.map((m) => m.transactionId)).toEqual(['tx-pending']);
  });

  it('refuses an output whose amount matches no pending gift', () => {
    const { matches, rejected } = matchOnchainPayments([gift()], [received({ amountSats: 50_000 })]);

    expect(matches).toEqual([]);
    expect(rejected).toEqual([{ txid: TXID_A, reason: 'no pending gift matches this amount' }]);
  });

  it('reports an under-confirmed output instead of settling on it', () => {
    const { matches, rejected } = matchOnchainPayments([gift()], [received({ confirmations: 1 })]);

    expect(matches).toEqual([]);
    expect(rejected).toHaveLength(1);
    expect(rejected[0].txid).toBe(TXID_A);
    expect(rejected[0].reason).toContain('not settleable');
  });

  it('does not invent a match for a gift with no amount recorded', () => {
    const { matches } = matchOnchainPayments([gift({ amount_sats: null })], [received({ amountSats: 0 })]);

    expect(matches).toEqual([]);
  });
});

describe('isSettled', () => {
  it('treats only server-writable statuses as settled', () => {
    expect(isSettled('confirmed')).toBe(true);
    expect(isSettled('COMPLETED')).toBe(true);
    expect(isSettled('paid')).toBe(true);
    expect(isSettled('pending')).toBe(false);
    expect(isSettled('failed')).toBe(false);
    expect(isSettled(null)).toBe(false);
  });
});

describe('proof links', () => {
  it('links a real txid, lowercased, and nothing else', () => {
    expect(txProofHref(TXID_A.toUpperCase())).toBe(`https://mempool.space/tx/${TXID_A}`);
    expect(txProofHref('not-a-txid')).toBeNull();
    expect(txProofHref(null)).toBeNull();
    expect(txProofHref('')).toBeNull();
  });

  it('links an address and encodes it', () => {
    expect(addressProofHref(' bc1qexample ')).toBe('https://mempool.space/address/bc1qexample');
    expect(addressProofHref(null)).toBeNull();
    expect(addressProofHref('   ')).toBeNull();
  });
});
