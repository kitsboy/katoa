import {
  createIntentRecord,
  type CreateIntentParams,
  type PaymentEvent,
  type PaymentIntent,
  type PaymentProviderPlug,
  type PaymentState,
} from './paymentCore';

/**
 * BTCPay client helpers — public config only.
 * API keys and webhook secrets MUST live on the server (Edge Function / Worker).
 * Never put secrets in VITE_* env vars.
 */

export interface BTCPayConfig {
  serverUrl: string;
  storeId: string;
  /** Set only when calling through a server proxy that injects credentials. */
  apiBaseUrl?: string;
}

export interface BTCPayInvoice {
  id: string;
  amount: number;
  currency: string;
  status: 'New' | 'Processing' | 'Settled' | 'Invalid' | 'Expired';
  checkoutLink: string;
  orderId?: string;
  metadata?: Record<string, string>;
}

export interface PaymentMethod {
  type: 'BTC' | 'BTC_LightningNetwork' | 'BTC_LightningLike';
  cryptoCode: string;
  destination: string;
  paymentLink: string;
  rate: number;
  amount: string;
}

export interface BTCPayInvoiceClient {
  createInvoice(
    amount: number,
    currency?: string,
    orderId?: string,
    metadata?: Record<string, string>,
  ): Promise<BTCPayInvoice>;
  getInvoice(invoiceId: string): Promise<BTCPayInvoice | null>;
}

export class BTCPayService {
  private config: BTCPayConfig;

  constructor(config: BTCPayConfig) {
    this.config = config;
  }

  /**
   * Create invoice via backend proxy (VITE_API_BASE_URL). Never calls BTCPay with a browser API key.
   */
  async createInvoice(
    amount: number,
    currency: string = 'USD',
    orderId?: string,
    metadata?: Record<string, string>
  ): Promise<BTCPayInvoice> {
    const proxyBase = this.config.apiBaseUrl || import.meta.env.VITE_API_BASE_URL;
    if (!proxyBase) {
      throw new Error(
        'BTCPay invoice creation requires a server proxy. Set VITE_API_BASE_URL to your Edge Function that holds the store API key.'
      );
    }

    const response = await fetch(`${proxyBase.replace(/\/$/, '')}/btcpay/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        amount: amount.toString(),
        currency,
        orderId,
        metadata: { ...metadata, platform: 'Katoa', version: '1.0' },
        storeId: this.config.storeId,
      }),
    });

    if (!response.ok) {
      throw new Error(`BTCPay proxy error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      amount: parseFloat(data.amount),
      currency: data.currency,
      status: data.status,
      checkoutLink: data.checkoutLink,
      orderId: data.orderId,
      metadata: data.metadata,
    };
  }

  async getInvoice(invoiceId: string): Promise<BTCPayInvoice | null> {
    const proxyBase = this.config.apiBaseUrl || import.meta.env.VITE_API_BASE_URL;
    if (!proxyBase) {
      throw new Error('BTCPay requires VITE_API_BASE_URL server proxy');
    }

    const response = await fetch(
      `${proxyBase.replace(/\/$/, '')}/btcpay/invoices/${encodeURIComponent(invoiceId)}`,
      { headers: { Accept: 'application/json' } }
    );

    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`BTCPay proxy error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      amount: parseFloat(data.amount),
      currency: data.currency,
      status: data.status,
      checkoutLink: data.checkoutLink,
      orderId: data.orderId,
      metadata: data.metadata,
    };
  }

  /**
   * Webhook verification is server-only. This always returns false in the browser.
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    void payload;
    void signature;
    console.warn('[KATOA] Webhook signatures must be verified server-side only');
    return false;
  }

  openCheckout(invoiceId: string): void {
    const checkoutUrl = `${this.config.serverUrl.replace(/\/$/, '')}/i/${encodeURIComponent(invoiceId)}`;
    window.open(checkoutUrl, '_blank', 'noopener,noreferrer,width=800,height=600');
  }
}

const BTCPAY_STATUS_TO_STATE: Record<BTCPayInvoice['status'], PaymentState> = {
  New: 'pending',
  Processing: 'pending',
  Settled: 'settled',
  Invalid: 'failed',
  Expired: 'expired',
};

export function paymentStateFromBTCPayStatus(status: BTCPayInvoice['status']): PaymentState {
  return BTCPAY_STATUS_TO_STATE[status];
}

function metadataToStrings(metadata: CreateIntentParams['metadata']): Record<string, string> {
  return Object.fromEntries(
    Object.entries(metadata).map(([key, value]) => [key, value == null ? '' : String(value)]),
  );
}

function intentIdFor(params: CreateIntentParams): string {
  const explicit = params.metadata.katoa_tx_id ?? params.metadata.transactionId;
  if (typeof explicit === 'string' && explicit.trim()) return explicit.trim();
  return `katoa-intent-${crypto.randomUUID()}`;
}

/**
 * Family Payment Core plug around the existing BTCPay client.
 *
 * This adapter creates and reads provider intents only. Settlement still enters
 * Katoa through the existing signed webhook; this class never writes a DB row.
 */
export class BTCPayPaymentPlug implements PaymentProviderPlug {
  readonly name = 'btcpay' as const;
  private readonly intents = new Map<string, PaymentIntent>();

  constructor(private readonly client: BTCPayInvoiceClient) {}

  async createIntent(params: CreateIntentParams): Promise<PaymentIntent> {
    const id = intentIdFor(params);
    const created = createIntentRecord(id, this.name, params);
    const invoice = await this.client.createInvoice(
      params.amountSats,
      'SATS',
      id,
      {
        ...metadataToStrings(params.metadata),
        katoa_tx_id: id,
        katoa_rail: params.rail,
      },
    );
    const intent: PaymentIntent = {
      ...created,
      state: 'pending',
      externalId: invoice.id,
      expiresAt: invoice.status === 'Expired' ? new Date().toISOString() : undefined,
    };
    this.intents.set(id, intent);
    return intent;
  }

  async getStatus(id: string): Promise<PaymentIntent> {
    const current = this.intents.get(id);
    if (!current?.externalId) throw new Error(`Unknown BTCPay payment intent: ${id}`);

    const invoice = await this.client.getInvoice(current.externalId);
    if (!invoice) throw new Error(`BTCPay invoice not found: ${current.externalId}`);

    const next: PaymentIntent = {
      ...current,
      state: paymentStateFromBTCPayStatus(invoice.status),
      expiresAt: invoice.status === 'Expired' ? new Date().toISOString() : current.expiresAt,
    };
    this.intents.set(id, next);
    return next;
  }

  /** The existing webhook is the event-ledger source; the client has no event API. */
  async listEvents(id: string): Promise<PaymentEvent[]> {
    if (!this.intents.has(id)) throw new Error(`Unknown BTCPay payment intent: ${id}`);
    return [];
  }
}

export async function initializeBTCPay(): Promise<BTCPayService | null> {
  const serverUrl = import.meta.env.VITE_BTCPAY_SERVER_URL;
  const storeId = import.meta.env.VITE_BTCPAY_STORE_ID;

  if (!serverUrl || !storeId) {
    return null;
  }

  return new BTCPayService({
    serverUrl,
    storeId,
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  });
}

export const btcPayService = await initializeBTCPay();
