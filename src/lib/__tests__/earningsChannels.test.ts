import { describe, expect, it } from 'vitest';
import {
  buildChannelBreakdown,
  channelFor,
  channelsWithActivity,
  channelTotals,
  isConfirmableChannel,
  isSettledStatus,
  isUnverifiableChannel,
  PAYOUT_CHANNELS,
  type ChannelTransactionRow,
} from '../earningsChannels';

const L = 'a'.repeat(64);

describe('channelFor', () => {
  it('maps stored payment methods onto payout channels', () => {
    expect(channelFor('lightning')).toBe('lightning');
    expect(channelFor('onchain')).toBe('onchain');
    expect(channelFor('bitcoin_address')).toBe('onchain');
    expect(channelFor('nostr')).toBe('nostr');
    expect(channelFor('zap')).toBe('nostr');
    expect(channelFor('silent')).toBe('silent');
    expect(channelFor('SP1')).toBe('silent');
  });

  it('falls back to unclassified rather than guessing', () => {
    expect(channelFor(null)).toBe('unknown');
    expect(channelFor('')).toBe('unknown');
    expect(channelFor('carrier-pigeon')).toBe('unknown');
  });
});

describe('buildChannelBreakdown', () => {
  it('counts only server-confirmed rows as settled', () => {
    const rows: ChannelTransactionRow[] = [
      { amount_sats: 21_000, status: 'confirmed', payment_method: 'lightning', payment_hash: L },
      { amount_sats: 5_000, status: 'pending', payment_method: 'lightning' },
      { amount_sats: 3_000, status: 'failed', payment_method: 'lightning' },
    ];
    const [lightning] = buildChannelBreakdown(rows);
    expect(lightning.settledSats).toBe(21_000);
    expect(lightning.settledCount).toBe(1);
    // Pending and failed both wait; neither is settled.
    expect(lightning.pendingSats).toBe(8_000);
    expect(lightning.pendingCount).toBe(2);
    expect(lightning.paymentHashes).toEqual([L]);
  });

  it('never settles a silent payment, even when the row claims confirmed', () => {
    const rows: ChannelTransactionRow[] = [
      { amount_sats: 150_000, status: 'confirmed', payment_method: 'silent' },
      { amount_sats: 9_000, status: 'pending', payment_method: 'silent' },
    ];
    const breakdown = buildChannelBreakdown(rows);
    const silent = breakdown.find((row) => row.channel === 'silent')!;

    expect(silent.settledSats).toBe(0);
    expect(silent.settledCount).toBe(0);
    expect(silent.unverifiableSats).toBe(159_000);
    expect(silent.unverifiableCount).toBe(2);
    expect(channelTotals(breakdown).settledSats).toBe(0);
  });

  it('keeps unclassified rows instead of dropping them', () => {
    const rows: ChannelTransactionRow[] = [
      { amount_sats: 1_000, status: 'confirmed', payment_method: null },
      { amount_sats: 2_000, status: 'confirmed', payment_method: 'mystery-rail' },
    ];
    const unknown = buildChannelBreakdown(rows).find((row) => row.channel === 'unknown')!;
    expect(unknown.unverifiableSats).toBe(3_000);
    expect(unknown.unverifiableCount).toBe(2);
    expect(channelTotals(buildChannelBreakdown(rows)).unverifiableSats).toBe(3_000);
  });

  it('accounts for every row given', () => {
    const rows: ChannelTransactionRow[] = [
      { amount_sats: 10, status: 'confirmed', payment_method: 'lightning' },
      { amount_sats: 20, status: 'pending', payment_method: 'onchain' },
      { amount_sats: 30, status: 'confirmed', payment_method: 'nostr' },
      { amount_sats: 40, status: 'confirmed', payment_method: 'silent' },
      { amount_sats: 50, status: 'pending', payment_method: 'weird' },
    ];
    const totals = channelTotals(buildChannelBreakdown(rows));
    expect(totals.settledSats + totals.pendingSats + totals.unverifiableSats).toBe(150);
  });

  it('ignores negative and non-numeric amounts instead of crediting them', () => {
    const rows: ChannelTransactionRow[] = [
      { amount_sats: -5_000, status: 'confirmed', payment_method: 'lightning' },
      { amount_sats: Number.NaN, status: 'confirmed', payment_method: 'lightning' },
      { amount_sats: 1_000, status: 'confirmed', payment_method: 'lightning' },
    ];
    const [lightning] = buildChannelBreakdown(rows);
    expect(lightning.settledSats).toBe(1_000);
    expect(lightning.settledCount).toBe(3);
  });

  it('always returns every channel in payout order', () => {
    expect(buildChannelBreakdown([]).map((row) => row.channel)).toEqual([...PAYOUT_CHANNELS]);
  });

  it('offers an address-history link only when an address exists', () => {
    const withAddress = buildChannelBreakdown([], {
      addresses: { onchain: 'bc1qhm5ndfjhqxdk3cx0pngyps4f5nnwdckulmge6c8keyf2pk0neqtshjn8ad' },
    }).find((row) => row.channel === 'onchain')!;
    expect(withAddress.proof.href).toContain('mempool.space/address/bc1q');
    expect(withAddress.proof.note).toContain('not one invoice');

    const withoutAddress = buildChannelBreakdown([]).find((row) => row.channel === 'onchain')!;
    expect(withoutAddress.proof.href).toBeNull();
    expect(withoutAddress.proof.note).toContain('has not published');
  });

  it('says plainly that a silent rail can never be confirmed', () => {
    const silent = buildChannelBreakdown([]).find((row) => row.channel === 'silent')!;
    expect(silent.proof.kind).toBe('none');
    expect(silent.proof.note).toContain('no invoice, hash or receipt');
  });
});

describe('channelsWithActivity', () => {
  it('hides empty unclassifiable rows but keeps rails with a real proof affordance', () => {
    const breakdown = buildChannelBreakdown([], {
      addresses: { onchain: 'bc1qhm5ndfjhqxdk3cx0pngyps4f5nnwdckulmge6c8keyf2pk0neqtshjn8ad' },
    });
    const visible = channelsWithActivity(breakdown).map((row) => row.channel);
    expect(visible).toContain('onchain');
    expect(visible).not.toContain('unknown');
  });

  it('keeps a channel that has rows', () => {
    const breakdown = buildChannelBreakdown([
      { amount_sats: 1_000, status: 'pending', payment_method: 'lightning' },
    ]);
    expect(channelsWithActivity(breakdown).map((row) => row.channel)).toEqual(['lightning']);
  });
});

describe('status and channel predicates', () => {
  it('treats the webhook statuses as settled', () => {
    expect(isSettledStatus('confirmed')).toBe(true);
    expect(isSettledStatus('COMPLETED')).toBe(true);
    expect(isSettledStatus('paid')).toBe(true);
    expect(isSettledStatus('pending')).toBe(false);
    expect(isSettledStatus(null)).toBe(false);
  });

  it('separates confirmable rails from the ones Katoa can never confirm', () => {
    expect(isConfirmableChannel('lightning')).toBe(true);
    expect(isConfirmableChannel('onchain')).toBe(true);
    expect(isConfirmableChannel('silent')).toBe(false);
    expect(isUnverifiableChannel('silent')).toBe(true);
    expect(isUnverifiableChannel('unknown')).toBe(true);
    expect(isUnverifiableChannel('lightning')).toBe(false);
    // The two sets must not overlap.
    for (const channel of PAYOUT_CHANNELS) {
      expect(isConfirmableChannel(channel) && isUnverifiableChannel(channel)).toBe(false);
    }
  });
});
