import { describe, expect, it } from 'vitest';
import { createPaymentHealth, paymentHealthLabel } from '../paymentHealth';

describe('payment health', () => {
  it('labels demo and staged environments without calling them live', () => {
    expect(paymentHealthLabel(createPaymentHealth({ provider: 'btcpay', environment: 'demo' }))).toBe('Demo');
    expect(paymentHealthLabel(createPaymentHealth({ provider: 'btcpay', environment: 'staged', status: 'healthy' }))).toBe('Staged');
  });

  it('only labels a healthy live provider as Live', () => {
    expect(paymentHealthLabel(createPaymentHealth({ provider: 'btcpay', environment: 'live', status: 'healthy' }))).toBe('Live');
    expect(paymentHealthLabel(createPaymentHealth({ provider: 'btcpay', environment: 'live', status: 'down' }))).toBe('Unavailable');
  });
});
