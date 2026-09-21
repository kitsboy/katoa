/**
 * In-memory FakeBTCPayRail — a reference rail with NO real node.
 *
 * This is the fixtures rung of the Family Payment Core: it lets the whole
 * intent → pending → confirming → settled|expired|failed machine be exercised
 * without touching THOR sats, a BTCPay server, or any network. It is a test
 * double, never a production gateway.
 */
import {
  applyPaymentEvent,
  createEventId,
  createIntentId,
  createIntentRecord,
  createMemoryEventLedger,
  type CreateIntentParams,
  type PaymentEvent,
  type PaymentEventLedger,
  type PaymentIntent,
  type PaymentProviderPlug,
} from './provider-interface';

export interface FakeBTCPayRailOptions {
  /** When true, on-chain intents must pass through confirming before settling. */
  simulateOnchainConfirmations?: boolean;
}

/**
 * A BTCPay-shaped rail that keeps everything in memory. `settleIntent`,
 * `expireIntent` and `failIntent` are the test hooks that drive the state
 * machine the way a real webhook would.
 */
export class FakeBTCPayRail implements PaymentProviderPlug {
  readonly name = 'btcpay' as const;

  private readonly intents = new Map<string, PaymentIntent>();
  private readonly ledger: PaymentEventLedger = createMemoryEventLedger();
  private readonly simulateOnchain: boolean;

  constructor(options: FakeBTCPayRailOptions = {}) {
    this.simulateOnchain = options.simulateOnchainConfirmations ?? true;
  }

  async createIntent(params: CreateIntentParams): Promise<PaymentIntent> {
    const id = createIntentId(this.name, params);
    const created = createIntentRecord(id, this.name, params);
    const intent: PaymentIntent = {
      ...created,
      // A real rail returns a checkout-ready intent; here it is pending.
      state: 'pending',
      externalId: `fake-btcpay-invoice-${id}`,
    };
    this.intents.set(id, intent);
    return intent;
  }

  async getStatus(id: string): Promise<PaymentIntent> {
    const intent = this.intents.get(id);
    if (!intent) throw new Error(`Unknown BTCPay payment intent: ${id}`);
    return intent;
  }

  async listEvents(id: string): Promise<PaymentEvent[]> {
    if (!this.intents.has(id)) throw new Error(`Unknown BTCPay payment intent: ${id}`);
    return this.ledger.events.filter((event) => event.intentId === id);
  }

  /** Test hook: mark an intent settled (lightning settles directly). */
  async settleIntent(id: string, confirmations?: number): Promise<PaymentIntent> {
    const current = this.intents.get(id);
    if (!current) throw new Error(`Unknown BTCPay payment intent: ${id}`);

    let next = current;
    if (this.simulateOnchain && current.rail === 'onchain' && current.state !== 'confirming') {
      next = this.apply(next, {
        id: createEventId(this.name, id, 'TransactionDetected'),
        intentId: id,
        provider: this.name,
        type: 'TransactionDetected',
        state: 'confirming',
        amountSats: current.amountSats,
        confirmations: confirmations ?? 1,
        externalId: current.externalId,
        receivedAt: new Date().toISOString(),
      });
    }

    return this.apply(next, {
      id: createEventId(this.name, id, 'InvoiceSettled'),
      intentId: id,
      provider: this.name,
      type: 'InvoiceSettled',
      state: 'settled',
      amountSats: current.amountSats,
      confirmations: confirmations ?? (current.rail === 'onchain' ? 6 : undefined),
      externalId: current.externalId,
      receivedAt: new Date().toISOString(),
    });
  }

  /** Test hook: mark an intent expired. */
  async expireIntent(id: string): Promise<PaymentIntent> {
    const current = this.intents.get(id);
    if (!current) throw new Error(`Unknown BTCPay payment intent: ${id}`);

    return this.apply(current, {
      id: createEventId(this.name, id, 'InvoiceExpired'),
      intentId: id,
      provider: this.name,
      type: 'InvoiceExpired',
      state: 'expired',
      amountSats: current.amountSats,
      externalId: current.externalId,
      receivedAt: new Date().toISOString(),
    });
  }

  /** Test hook: mark an intent failed. */
  async failIntent(id: string): Promise<PaymentIntent> {
    const current = this.intents.get(id);
    if (!current) throw new Error(`Unknown BTCPay payment intent: ${id}`);

    return this.apply(current, {
      id: createEventId(this.name, id, 'InvoiceInvalid'),
      intentId: id,
      provider: this.name,
      type: 'InvoiceInvalid',
      state: 'failed',
      amountSats: current.amountSats,
      externalId: current.externalId,
      receivedAt: new Date().toISOString(),
    });
  }

  private apply(intent: PaymentIntent, event: PaymentEvent): PaymentIntent {
    const result = applyPaymentEvent(intent, event, this.ledger);
    this.intents.set(intent.id, result.intent);
    return result.intent;
  }
}