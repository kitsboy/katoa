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
