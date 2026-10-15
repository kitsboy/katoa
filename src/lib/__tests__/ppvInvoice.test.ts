import { describe, expect, it } from 'vitest';
import { ppvInvoiceMetadata } from '../ppvInvoice';

const CREATOR = '11111111-1111-4111-8111-111111111111';
const FAN = '33333333-3333-4333-8333-333333333333';

const request = (overrides: Partial<Parameters<typeof ppvInvoiceMetadata>[0]> = {}) => ({
  creatorId: CREATOR,
  fanId: FAN,
  postKey: 'luna-post-9',
  priceSats: 25_000,
  ...overrides,
});

describe('ppvInvoiceMetadata', () => {
  it('builds the metadata the webhook needs to unlock one post', () => {
    const built = ppvInvoiceMetadata(request());
    expect(built.ok).toBe(true);
    if (!built.ok) return;
    expect(built.amountSats).toBe(25_000);
    expect(built.metadata).toMatchObject({
      kind: 'ppv',
      post_key: 'luna-post-9',
      creator_id: CREATOR,
      subscriber_id: FAN,
      price_sats: '25000',
      amount_sats: '25000',
    });
    expect(built.orderId).toMatch(/^ppv-luna-post-9-/);
  });

  it('requires a signed-in fan and a payable creator id', () => {
    const noFan = ppvInvoiceMetadata(request({ fanId: null }));
    expect(noFan.ok).toBe(false);
    if (!noFan.ok) expect(noFan.error).toContain('Sign in');

    const badCreator = ppvInvoiceMetadata(request({ creatorId: 'luna_vip' }));
    expect(badCreator.ok).toBe(false);
    if (!badCreator.ok) expect(badCreator.error).toContain('payable profile id');
  });

  it('refuses a post with no price or no key', () => {
    expect(ppvInvoiceMetadata(request({ priceSats: 0 })).ok).toBe(false);
    expect(ppvInvoiceMetadata(request({ priceSats: null })).ok).toBe(false);
    expect(ppvInvoiceMetadata(request({ postKey: '   ' })).ok).toBe(false);
    expect(ppvInvoiceMetadata(request({ postKey: 'x'.repeat(201) })).ok).toBe(false);
  });

  it('rounds a fractional price to whole sats', () => {
    const built = ppvInvoiceMetadata(request({ priceSats: 25_000.6 }));
    expect(built.ok).toBe(true);
    if (built.ok) expect(built.amountSats).toBe(25_001);
  });
});
