/**
 * Family Payment Core — provider-neutral payment contract.
 *
 * The browser may create an intent, but only a trusted server/provider adapter
 * may apply settlement events. Provider names stay behind this boundary so the
 * family apps can change infrastructure without rewriting their UI.
 */

export const PAYMENT_STATES = [
  'intent',
  'pending',
  'confirming',
  'settled',
  'expired',
  'failed',
] as const;

export type PaymentState = (typeof PAYMENT_STATES)[number];

export type PaymentRail = 'lightning' | 'onchain';

export type PaymentProvider =
  | 'lnaddress'
  | 'satohash'
  | 'btcpay'
  | 'lnbits'
  | 'lnd'
  | 'zap'
  | 'silent';

export type PaymentMetadata = Record<string, string | number | boolean | null>;

export type PaymentKind = 'gift' | 'tip' | 'subscription' | 'ppv' | 'zap';

export interface PaymentMatchExpectations {
  amountSats: number;
  kind?: PaymentKind;
  creatorId?: string;
  wishlistId?: string;
  itemId?: string;
  tierId?: string;
}

export interface CreateIntentParams {
  amountSats: number;
  memo?: string;
  metadata: PaymentMetadata;
  rail: PaymentRail;
}

export interface PaymentIntent {
  id: string;
  amountSats: number;
  memo?: string;
  metadata: PaymentMetadata;
  rail: PaymentRail;
  provider: PaymentProvider;
  state: PaymentState;
  createdAt: string;
  expiresAt?: string;
  externalId?: string;
  paymentHash?: string;
}

export function paymentMetadataValue(
  metadata: PaymentMetadata,
  key: string,
): string | number | boolean | null | undefined {
  return metadata[key];
}

/**
 * Validate provider data against the original intent before settlement.
 * Missing optional context is allowed; present context must match exactly.
 */
export function assertPaymentMatch(
  intent: PaymentIntent,
  expected: PaymentMatchExpectations,
): void {
  validateAmount(expected.amountSats);
  if (intent.amountSats !== expected.amountSats) {
    throw new PaymentInvariantError('Payment amount does not match the intent');
  }

  const checks: Array<[string, string | undefined]> = [
    ['kind', expected.kind],
    ['creator_id', expected.creatorId],
    ['wishlist_id', expected.wishlistId],
    ['item_id', expected.itemId],
    ['tier_id', expected.tierId],
  ];
  for (const [key, value] of checks) {
    if (value == null) continue;
    if (String(paymentMetadataValue(intent.metadata, key) ?? '') !== value) {
      throw new PaymentInvariantError(`Payment ${key} does not match the intent`);
    }
  }
}

export interface PaymentEvent {
  /** Provider event ID. It is the idempotency key. */
  id: string;
  intentId: string;
  provider: PaymentProvider;
  type: string;
  state: PaymentState;
  amountSats?: number;
  confirmations?: number;
  externalId?: string;
  receivedAt: string;
  /** Raw provider payload is retained server-side for audit/replay. */
  raw?: unknown;
}

export interface PaymentEventLedger {
  events: PaymentEvent[];
  has(eventId: string): boolean;
  append(event: PaymentEvent): boolean;
}

export interface PaymentProviderPlug {
  readonly name: PaymentProvider;
  createIntent(params: CreateIntentParams): Promise<PaymentIntent>;
  getStatus(id: string): Promise<PaymentIntent>;
  listEvents(id: string): Promise<PaymentEvent[]>;
}

export interface PaymentCore {
  createIntent(params: CreateIntentParams): Promise<PaymentIntent>;
  getStatus(id: string): Promise<PaymentIntent>;
  listEvents(id: string): Promise<PaymentEvent[]>;
}

export class PaymentInvariantError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentInvariantError';
  }
}

const VALID_TRANSITIONS: Record<PaymentState, readonly PaymentState[]> = {
  intent: ['pending', 'failed', 'expired'],
  pending: ['confirming', 'settled', 'failed', 'expired'],
  confirming: ['settled', 'failed', 'expired'],
  settled: [],
  expired: [],
  failed: [],
};

/** Lightning may settle directly; on-chain must pass through confirming. */
export function canTransition(
  from: PaymentState,
  to: PaymentState,
  rail: PaymentRail,
): boolean {
  if (rail === 'onchain' && to === 'settled' && from !== 'confirming') return false;
  return VALID_TRANSITIONS[from].includes(to);
}

export function assertTransition(
  from: PaymentState,
  to: PaymentState,
  rail: PaymentRail,
): void {
  if (!canTransition(from, to, rail)) {
    throw new PaymentInvariantError(`Invalid payment transition: ${from} → ${to}`);
  }
}

export function validateAmount(amountSats: number): void {
  if (!Number.isSafeInteger(amountSats) || amountSats <= 0) {
    throw new PaymentInvariantError('Payment amount must be a positive whole number of sats');
  }
}

export function createMemoryEventLedger(): PaymentEventLedger {
  const events: PaymentEvent[] = [];
  const ids = new Set<string>();

  return {
    events,
    has(eventId) {
      return ids.has(eventId);
    },
    append(event) {
      if (ids.has(event.id)) return false;
      ids.add(event.id);
      events.push(event);
      return true;
    },
  };
}

export interface AppliedPayment {
  intent: PaymentIntent;
  appended: boolean;
}

/**
 * Append-first event application. A real adapter must persist the event before
 * changing its payment row; this pure helper mirrors that rule for tests.
 */
export function applyPaymentEvent(
  intent: PaymentIntent,
  event: PaymentEvent,
  ledger: PaymentEventLedger,
): AppliedPayment {
  if (event.intentId !== intent.id) {
    throw new PaymentInvariantError('Payment event belongs to a different intent');
  }
  if (event.provider !== intent.provider) {
    throw new PaymentInvariantError('Payment event provider does not match intent');
  }
  if (event.amountSats != null && event.amountSats !== intent.amountSats) {
    throw new PaymentInvariantError('Payment event amount does not match intent');
  }
  if (ledger.has(event.id)) return { intent, appended: false };

  assertTransition(intent.state, event.state, intent.rail);
  const appended = ledger.append(event);
  if (!appended) return { intent, appended: false };

  return {
    appended: true,
    intent: {
      ...intent,
      state: event.state,
      externalId: event.externalId ?? intent.externalId,
    },
  };
}

export function createIntentRecord(
  id: string,
  provider: PaymentProvider,
  params: CreateIntentParams,
  now = new Date(),
): PaymentIntent {
  validateAmount(params.amountSats);
  if (!id.trim()) throw new PaymentInvariantError('Payment intent ID is required');

  return {
    id,
    amountSats: params.amountSats,
    memo: params.memo,
    metadata: { ...params.metadata },
    rail: params.rail,
    provider,
    state: 'intent',
    createdAt: now.toISOString(),
  };
}
