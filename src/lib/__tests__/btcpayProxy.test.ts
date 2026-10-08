import { describe, it, expect, vi } from 'vitest';

import { BTCPayService, BTCPayConfig } from '../btcpay';
import {
  fakeBtcpayProxyInvoiceResponse,
  fakeBtcpayProxyInvoiceReadResponse,
} from '../paymentFixtures';

describe('BTCPay client proxy path', () => {
  const config: BTCPayConfig = {
    serverUrl: 'https://proxy.example',
    storeId: 'fake-store',
    apiBaseUrl: 'https://proxy.example',
  };

  function fakeFetchResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    });
  }

  it('creates an invoice through the server proxy shape', async () => {
    const fetchSpy = vi
      .spyOn(globalThis as unknown as { fetch: typeof fetch }, 'fetch')
      .mockResolvedValueOnce(fakeFetchResponse(fakeBtcpayProxyInvoiceResponse));

    const service = new BTCPayService(config);
    const invoice = await service.createInvoice(21000, 'SATS', 'katoa-intent-001', {
      product: 'katoa-test',
    });

    expect(invoice).toMatchObject({
      id: 'fake-proxy-invoice-001',
      amount: 21000,
      currency: 'SATS',
      status: 'New',
      orderId: 'katoa-intent-001',
    });

    const createCall = fetchSpy.mock.calls[0];
    if (!createCall) throw new Error('mock never called');
    const requestInit = createCall[1];
    if (!requestInit) throw new Error('mock never called with a request init');
    expect((createCall[0] as string).endsWith('/btcpay/invoices')).toBe(true);
    expect(requestInit).toHaveProperty('method', 'POST');
    expect(requestInit).toHaveProperty('headers');

    const sentBody = JSON.parse(requestInit.body as string);
    expect(sentBody).toMatchObject({
      amount: '21000',
      currency: 'SATS',
      orderId: 'katoa-intent-001',
      storeId: 'fake-store',
    });
  });

  it('reads an invoice through the server proxy shape', async () => {
    const fetchSpy = vi
      .spyOn(globalThis as unknown as { fetch: typeof fetch }, 'fetch')
      .mockResolvedValueOnce(fakeFetchResponse(fakeBtcpayProxyInvoiceReadResponse));

    const service = new BTCPayService(config);
    const invoice = await service.getInvoice('fake-proxy-invoice-001');

    expect(invoice).toMatchObject({
      id: 'fake-proxy-invoice-001',
      amount: 21000,
      currency: 'SATS',
      status: 'Settled',
      orderId: 'katoa-intent-001',
    });

    const readCall = fetchSpy.mock.calls[0];
    expect((readCall[0] as string).endsWith('/btcpay/invoices/fake-proxy-invoice-001')).toBe(
      true,
    );
    expect(readCall[1]).toHaveProperty('headers');
  });

  it('returns null when the proxy read endpoint is not found', async () => {
    vi.spyOn(globalThis as unknown as { fetch: typeof fetch }, 'fetch').mockResolvedValueOnce(
      new Response('not found', { status: 404 }),
    );

    const service = new BTCPayService(config);
    const invoice = await service.getInvoice('missing-proxy-invoice-999');

    expect(invoice).toBeNull();
  });
});
