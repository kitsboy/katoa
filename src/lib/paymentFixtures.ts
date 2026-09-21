import type { PaymentEvent } from './paymentCore';

/** Deliberately fake payloads. These are test data, not node credentials. */
export const fakeBtcpaySettledPayload = {
  type: 'InvoiceSettled',
  invoiceId: 'fake-btcpay-invoice-001',
  invoiceStatus: 'Settled',
  metadata: {
    katoa_tx_id: 'fake-intent-btcpay-001',
    amount_sats: 21_000,
    product: 'katoa-test',
  },
};

export const fakeLnbitsPaidPayload = {
  payment_hash: 'fake-lnbits-payment-hash-001',
  checking_id: 'fake-lnbits-checking-001',
  pending: false,
  amount: 21_000_000,
  memo: 'Katoa test payment',
};

export const fakeLndSettledPayload = {
  r_hash: 'ZmFrZS1sbmQtcGF5bWVudC1oYXNo',
  settled: true,
  value: '21000',
  memo: 'Katoa test payment',
  add_index: '1',
};

export const fakeLightningSettledEvent: PaymentEvent = {
  id: 'fake-event-lightning-settled-001',
  intentId: 'fake-intent-btcpay-001',
  provider: 'btcpay',
  type: 'InvoiceSettled',
  state: 'settled',
  amountSats: 21_000,
  externalId: 'fake-btcpay-invoice-001',
  receivedAt: '2026-09-21T00:00:00.000Z',
  raw: fakeBtcpaySettledPayload,
};

export const fakeOnchainConfirmingEvent: PaymentEvent = {
  id: 'fake-event-onchain-confirming-001',
  intentId: 'fake-intent-onchain-001',
  provider: 'btcpay',
  type: 'TransactionDetected',
  state: 'confirming',
  amountSats: 50_000,
  confirmations: 1,
  externalId: 'fake-btcpay-onchain-001',
  receivedAt: '2026-09-21T00:00:00.000Z',
  raw: { invoiceId: 'fake-btcpay-onchain-001', confirmations: 1 },
};
