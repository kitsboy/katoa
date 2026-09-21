import { describe, expect, it } from 'vitest';
import {
  applyPaymentEvent,
  assertTransition,
  createIntentRecord,
  createMemoryEventLedger,
  PaymentInvariantError,
} from '../paymentCore';
import {
  fakeBtcpaySettledPayload,
  fakeLightningSettledEvent,
  fakeLnbitsPaidPayload,
  fakeLndSettledPayload,
  fakeOnchainConfirmingEvent,
} from '../paymentFixtures';

describe('Family Payment Core', () => {
  it('allows Lightning to settle directly from pending', () => {
    const intent = createIntentRecord(
      'fake-intent-btcpay-001',
      'btcpay',
      { amountSats: 21_000, memo: 'test', metadata: { kind: 'gift' }, rail: 'lightning' },
      new Date('2026-09-21T00:00:00.000Z'),
    );
    const ledger = createMemoryEventLedger();
    const pending = applyPaymentEvent(intent, {
      ...fakeLightningSettledEvent,
      id: 'fake-event-pending-001',
      state: 'pending',
    }, ledger);
    const settled = applyPaymentEvent(pending.intent, fakeLightningSettledEvent, ledger);

    expect(settled.intent.state).toBe('settled');
    expect(ledger.events).toHaveLength(2);
  });

  it('requires on-chain payments to pass through confirming', () => {
    const intent = createIntentRecord(
      'fake-intent-onchain-001',
      'btcpay',
      { amountSats: 50_000, metadata: { kind: 'gift' }, rail: 'onchain' },
    );
    const ledger = createMemoryEventLedger();

    expect(() => applyPaymentEvent(intent, {
      ...fakeOnchainConfirmingEvent,
      state: 'settled',
      id: 'fake-event-invalid-direct-settle',
    }, ledger)).toThrow('Invalid payment transition');

    const pending = applyPaymentEvent(intent, {
      ...fakeOnchainConfirmingEvent,
      id: 'fake-event-onchain-pending-001',
      state: 'pending',
    }, ledger);
    const confirming = applyPaymentEvent(pending.intent, fakeOnchainConfirmingEvent, ledger);
    const settled = applyPaymentEvent(confirming.intent, {
      ...fakeOnchainConfirmingEvent,
      id: 'fake-event-onchain-settled-001',
      state: 'settled',
      confirmations: 6,
    }, ledger);

    expect(settled.intent.state).toBe('settled');
  });

  it('does not apply the same provider event twice', () => {
    const intent = createIntentRecord(
      'fake-intent-btcpay-001',
      'btcpay',
      { amountSats: 21_000, metadata: {}, rail: 'lightning' },
    );
    const ledger = createMemoryEventLedger();
    const pending = applyPaymentEvent(intent, {
      ...fakeLightningSettledEvent,
      id: 'fake-event-pending-002',
      state: 'pending',
    }, ledger);
    const first = applyPaymentEvent(pending.intent, fakeLightningSettledEvent, ledger);
    const duplicate = applyPaymentEvent(first.intent, fakeLightningSettledEvent, ledger);

    expect(first.appended).toBe(true);
    expect(duplicate.appended).toBe(false);
    expect(duplicate.intent.state).toBe('settled');
    expect(ledger.events).toHaveLength(2);
  });

  it('rejects a mismatched amount before changing state', () => {
    const intent = createIntentRecord(
      'fake-intent-btcpay-001',
      'btcpay',
      { amountSats: 21_000, metadata: {}, rail: 'lightning' },
    );
    const ledger = createMemoryEventLedger();

    expect(() => applyPaymentEvent(intent, {
      ...fakeLightningSettledEvent,
      amountSats: 22_000,
    }, ledger)).toThrow('amount does not match');
    expect(intent.state).toBe('intent');
    expect(ledger.events).toHaveLength(0);
  });

  it('keeps terminal states terminal', () => {
    expect(() => assertTransition('settled', 'pending', 'lightning'))
      .toThrow(PaymentInvariantError);
    expect(() => assertTransition('expired', 'settled', 'lightning'))
      .toThrow(PaymentInvariantError);
  });

  it('accepts fake payload shapes without treating them as live payments', () => {
    expect(fakeBtcpaySettledPayload.invoiceStatus).toBe('Settled');
    expect(fakeLnbitsPaidPayload.pending).toBe(false);
    expect(fakeLndSettledPayload.settled).toBe(true);
    expect(fakeLndSettledPayload.value).toBe('21000');
  });

  it('rejects invalid intent amounts', () => {
    expect(() => createIntentRecord(
      'fake-invalid',
      'lnbits',
      { amountSats: 0, metadata: {}, rail: 'lightning' },
    )).toThrow('positive whole number');
  });
});
