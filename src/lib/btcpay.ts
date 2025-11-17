export interface BTCPayConfig {
  serverUrl: string;
  storeId: string;
  apiKey?: string;
  webhookSecret?: string;
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

  async createInvoice(
    amount: number,
    currency: string = 'USD',
    orderId?: string,
    metadata?: Record<string, string>
  ): Promise<BTCPayInvoice> {
    const endpoint = `${this.config.serverUrl}/api/v1/stores/${this.config.storeId}/invoices`;

    const invoiceData = {
      amount: amount.toString(),
      currency,
      orderId,
      metadata: {
        ...metadata,
        platform: 'Katoa',
        version: '1.0',
      },
      checkout: {
        redirectURL: `${window.location.origin}/payment/success`,
        speedPolicy: 'HighSpeed',
        paymentMethods: ['BTC', 'BTC-LightningNetwork'],
      },
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${this.config.apiKey}`,
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        throw new Error(`BTCPay API error: ${response.statusText}`);
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
    } catch (error) {
      console.error('Failed to create BTCPay invoice:', error);
      throw error;
    }
  }

  async getInvoice(invoiceId: string): Promise<BTCPayInvoice | null> {
    const endpoint = `${this.config.serverUrl}/api/v1/stores/${this.config.storeId}/invoices/${invoiceId}`;

    try {
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `token ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`BTCPay API error: ${response.statusText}`);
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
    } catch (error) {
      console.error('Failed to get BTCPay invoice:', error);
      throw error;
    }
  }

  async getPaymentMethods(invoiceId: string): Promise<PaymentMethod[]> {
    const endpoint = `${this.config.serverUrl}/api/v1/stores/${this.config.storeId}/invoices/${invoiceId}/payment-methods`;

    try {
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `token ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`BTCPay API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get payment methods:', error);
      throw error;
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.config.webhookSecret) {
      console.warn('Webhook secret not configured');
      return false;
    }

    return true;
  }

  openCheckout(invoiceId: string): void {
    const checkoutUrl = `${this.config.serverUrl}/i/${invoiceId}`;
    window.open(checkoutUrl, '_blank', 'width=800,height=600');
  }
}

export async function initializeBTCPay(): Promise<BTCPayService | null> {
  const serverUrl = import.meta.env.VITE_BTCPAY_SERVER_URL;
  const storeId = import.meta.env.VITE_BTCPAY_STORE_ID;
  const apiKey = import.meta.env.VITE_BTCPAY_API_KEY;
  const webhookSecret = import.meta.env.VITE_BTCPAY_WEBHOOK_SECRET;

  if (!serverUrl || !storeId) {
    console.warn('BTCPay Server not configured. Set VITE_BTCPAY_SERVER_URL and VITE_BTCPAY_STORE_ID');
    return null;
  }

  return new BTCPayService({
    serverUrl,
    storeId,
    apiKey,
    webhookSecret,
  });
}

export const btcPayService = await initializeBTCPay();
