import { describe, expect, it, vi } from 'vitest';
import {
  BTCPayPaymentPlug,
  paymentStateFromBTCPayStatus,
  type BTCPayInvoice,
} from '../btcpay';

function fakeInvoice(overrides: Partial<BTCPayInvoice> = {}): BTCPayInvoice {
  return {
    id: 'fake-btcpay-invoice-001',
    amount: 21_000,
    currency: 'SATS',
    status: 'New',
    checkoutLink: 'https://fake.invalid/i/fake-btcpay-invoice-001',
    ...overrides,
  };
}

describe('BTCPay payment plug', () => {
  it('creates a pending intent through the existing client contract', async () => {
    const createInvoice = vi.fn().mockResolvedValue(fakeInvoice());
    const getInvoice = vi.fn();
    const plug = new BTCPayPaymentPlug({ createInvoice, getInvoice });

    const intent = await plug.createIntent({
      amountSats: 21_000,
      memo: 'A fake gift',
      rail: 'lightning',
      metadata: { katoa_tx_id: 'fake-intent-btcpay-001', kind: 'gift' },
    });

    expect(intent).toMatchObject({
      id: 'fake-intent-btcpay-001',
      provider: 'btcpay',
      rail: 'lightning',
      state: 'pending',
      externalId: 'fake-btcpay-invoice-001',
    });
    expect(createInvoice).toHaveBeenCalledWith(
      21_000,
      'SATS',
      'fake-intent-btcpay-001',
      expect.objectContaining({
        katoa_tx_id: 'fake-intent-btcpay-001',
        katoa_rail: 'lightning',
        kind: 'gift',
      }),
    );
  });

  it('reads provider status without writing settlement', async () => {
    const createInvoice = vi.fn().mockResolvedValue(fakeInvoice());
    const getInvoice = vi.fn().mockResolvedValue(fakeInvoice({ status: 'Settled' }));
    const plug = new BTCPayPaymentPlug({ createInvoice, getInvoice });
    await plug.createIntent({
      amountSats: 21_000,
      rail: 'lightning',
      metadata: { katoa_tx_id: 'fake-intent-btcpay-002' },
    });

    const status = await plug.getStatus('fake-intent-btcpay-002');
    expect(status.state).toBe('settled');
    expect(await plug.listEvents('fake-intent-btcpay-002')).toEqual([]);
  });

  it('maps every existing provider status to the family state names', () => {
    expect(paymentStateFromBTCPayStatus('New')).toBe('pending');
    expect(paymentStateFromBTCPayStatus('Processing')).toBe('pending');
    expect(paymentStateFromBTCPayStatus('Settled')).toBe('settled');
    expect(paymentStateFromBTCPayStatus('Expired')).toBe('expired');
    expect(paymentStateFromBTCPayStatus('Invalid')).toBe('failed');
  });

  it('does not pretend the client has a provider event ledger', async () => {
    const plug = new BTCPayPaymentPlug({
      createInvoice: vi.fn().mockResolvedValue(fakeInvoice()),
      getInvoice: vi.fn(),
    });
    await plug.createIntent({
      amountSats: 1_000,
      rail: 'onchain',
      metadata: { katoa_tx_id: 'fake-intent-btcpay-003' },
    });

    expect(await plug.listEvents('fake-intent-btcpay-003')).toEqual([]);
  });
});
