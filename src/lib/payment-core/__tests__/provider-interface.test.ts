import { describe, expect, it } from 'vitest';
import {
  applyPaymentEvent,
  assertTransition,
  canTransition,
  createEventId,
  createIntentId,
  createIntentRecord,
  createMemoryEventLedger,
  isTerminal,
  PaymentInvariantError,
} from '../provider-interface';

describe('provider-interface: state machine', () => {
  it('exposes the canonical states in order', () => {
    // intent → pending → confirming → settled|expired|failed
    const states = ['intent', 'pending', 'confirming', 'settled', 'expired', 'failed'];
    expect(states).toHaveLength(6);
    expect(isTerminal('settled')).toBe(true);
    expect(isTerminal('expired')).toBe(true);
    expect(isTerminal('failed')).toBe(true);
    expect(isTerminal('pending')).toBe(false);
  });

  it('allows Lightning to settle directly from pending', () => {
    expect(canTransition('pending', 'settled', 'lightning')).toBe(true);
    expect(canTransition('pending', 'settled', 'onchain')).toBe(false);
    expect(canTransition('confirming', 'settled', 'onchain')).toBe(true);
    expect(canTransition('pending', 'confirming', 'onchain')).toBe(true);
  });

  it('blocks invalid and reverse transitions', () => {
    expect(canTransition('settled', 'pending', 'lightning')).toBe(false);
    expect(canTransition('expired', 'settled', 'lightning')).toBe(false);
    expect(canTransition('failed', 'confirming', 'onchain')).toBe(false);
    expect(() => assertTransition('settled', 'pending', 'lightning'))
      .toThrow(PaymentInvariantError);
  });

  it('keeps terminal states terminal', () => {
    expect(isTerminal('settled')).toBe(true);
    expect(isTerminal('expired')).toBe(true);
    expect(isTerminal('failed')).toBe(true);
    expect(isTerminal('intent')).toBe(false);
    expect(isTerminal('pending')).toBe(false);
    expect(isTerminal('confirming')).toBe(false);
  });
});

describe('provider-interface: intent + event helpers', () => {
  it('generates a namespaced intent id when none is supplied', () => {
    const id = createIntentId('btcpay', {
      amountSats: 1000,
      metadata: {},
      rail: 'lightning',
    }, () => 'abc-123');
    expect(id).toBe('btcpay-intent-abc-123');
  });

  it('prefers an explicit reference id from metadata', () => {
    const id = createIntentId('btcpay', {
      amountSats: 1000,
      metadata: { katoa_tx_id: 'ka-g-000001' },
      rail: 'lightning',
    }, () => 'ignored');
    expect(id).toBe('ka-g-000001');
  });

  it('generates a unique event id (idempotency key)', () => {
    const a = createEventId('btcpay', 'x', 'InvoiceSettled', () => '1');
    const b = createEventId('btcpay', 'x', 'InvoiceSettled', () => '2');
    expect(a).not.toBe(b);
    expect(a).toContain('InvoiceSettled');
  });

  it('creates a validated intent record', () => {
    const intent = createIntentRecord(
      'ka-g-000001',
      'btcpay',
      { amountSats: 21_000, metadata: { kind: 'gift' }, rail: 'lightning' },
      new Date('2026-09-21T00:00:00.000Z'),
    );
    expect(intent.state).toBe('intent');
    expect(intent.amountSats).toBe(21_000);
    expect(() => createIntentRecord('x', 'btcpay', {
      amountSats: 0, metadata: {}, rail: 'lightning',
    })).toThrow('positive whole number');
  });
});

describe('provider-interface: event ledger + idempotent apply', () => {
  it('applies events and records them in the ledger', () => {
    const intent = createIntentRecord('ka-g-000001', 'btcpay', {
      amountSats: 21_000, metadata: {}, rail: 'lightning',
    });
    const ledger = createMemoryEventLedger();
    const pending = applyPaymentEvent(intent, {
      id: 'e1', intentId: 'ka-g-000001', provider: 'btcpay', type: 'InvoiceCreated',
      state: 'pending', amountSats: 21_000, receivedAt: '2026-09-21T00:00:00Z',
    }, ledger);
    const settled = applyPaymentEvent(pending.intent, {
      id: 'e2', intentId: 'ka-g-000001', provider: 'btcpay', type: 'InvoiceSettled',
      state: 'settled', amountSats: 21_000, receivedAt: '2026-09-21T00:00:01Z',
    }, ledger);

    expect(settled.intent.state).toBe('settled');
    expect(ledger.events).toHaveLength(2);
  });

  it('does not apply the same provider event twice', () => {
    const intent = createIntentRecord('ka-g-000001', 'btcpay', {
      amountSats: 21_000, metadata: {}, rail: 'lightning',
    });
    const ledger = createMemoryEventLedger();
    const pending = applyPaymentEvent(intent, {
      id: 'e1', intentId: 'ka-g-000001', provider: 'btcpay', type: 'InvoiceCreated',
      state: 'pending', amountSats: 21_000, receivedAt: '2026-09-21T00:00:00Z',
    }, ledger);
    const settled = applyPaymentEvent(pending.intent, {
      id: 'e2', intentId: 'ka-g-000001', provider: 'btcpay', type: 'InvoiceSettled',
      state: 'settled', amountSats: 21_000, receivedAt: '2026-09-21T00:00:01Z',
    }, ledger);
    const dup = applyPaymentEvent(settled.intent, {
      id: 'e2', intentId: 'ka-g-000001', provider: 'btcpay', type: 'InvoiceSettled',
      state: 'settled', amountSats: 21_000, receivedAt: '2026-09-21T00:00:01Z',
    }, ledger);

    expect(dup.appended).toBe(false);
    expect(ledger.events).toHaveLength(2);
  });

  it('rejects a mismatched amount before changing state', () => {
    const intent = createIntentRecord('ka-g-000001', 'btcpay', {
      amountSats: 21_000, metadata: {}, rail: 'lightning',
    });
    const ledger = createMemoryEventLedger();
    expect(() => applyPaymentEvent(intent, {
      id: 'e1', intentId: 'ka-g-000001', provider: 'btcpay', type: 'InvoiceSettled',
      state: 'settled', amountSats: 99_000, receivedAt: '2026-09-21T00:00:01Z',
    }, ledger)).toThrow('amount does not match');
    expect(ledger.events).toHaveLength(0);
  });
});