import { describe, expect, it } from 'vitest';
import { FakeBTCPayRail } from '../fake-btcpay-rail';

describe('FakeBTCPayRail', () => {
  it('creates a pending intent with no real node', async () => {
    const rail = new FakeBTCPayRail();
    const intent = await rail.createIntent({
      amountSats: 21_000,
      metadata: { kind: 'gift' },
      rail: 'lightning',
    });

    expect(intent.provider).toBe('btcpay');
    expect(intent.state).toBe('pending');
    expect(intent.externalId).toContain('fake-btcpay-invoice-');
  });

  it('settles a lightning intent directly', async () => {
    const rail = new FakeBTCPayRail();
    const intent = await rail.createIntent({
      amountSats: 21_000,
      metadata: {},
      rail: 'lightning',
    });

    const settled = await rail.settleIntent(intent.id);
    expect(settled.state).toBe('settled');
    expect(await rail.getStatus(intent.id)).toMatchObject({ state: 'settled' });
  });

  it('runs on-chain intents through confirming before settling', async () => {
    const rail = new FakeBTCPayRail();
    const intent = await rail.createIntent({
      amountSats: 50_000,
      metadata: {},
      rail: 'onchain',
    });

    const settled = await rail.settleIntent(intent.id);
    expect(settled.state).toBe('settled');
    const events = await rail.listEvents(intent.id);
    const states = events.map((event) => event.state);
    expect(states).toContain('confirming');
    expect(states).toContain('settled');
    // confirming must come before settled
    expect(states.indexOf('confirming')).toBeLessThan(states.indexOf('settled'));
  });

  it('expires an intent to a terminal state', async () => {
    const rail = new FakeBTCPayRail();
    const intent = await rail.createIntent({
      amountSats: 1_000,
      metadata: {},
      rail: 'lightning',
    });

    const expired = await rail.expireIntent(intent.id);
    expect(expired.state).toBe('expired');
    expect(await rail.listEvents(intent.id)).toHaveLength(1);
  });

  it('fails an intent to a terminal state', async () => {
    const rail = new FakeBTCPayRail();
    const intent = await rail.createIntent({
      amountSats: 1_000,
      metadata: {},
      rail: 'lightning',
    });

    const failed = await rail.failIntent(intent.id);
    expect(failed.state).toBe('failed');
  });

  it('throws for an unknown intent', async () => {
    const rail = new FakeBTCPayRail();
    await expect(rail.getStatus('nope')).rejects.toThrow('Unknown');
    await expect(rail.settleIntent('nope')).rejects.toThrow('Unknown');
  });

  it('records idempotent events in its ledger', async () => {
    const rail = new FakeBTCPayRail();
    const intent = await rail.createIntent({
      amountSats: 21_000,
      metadata: {},
      rail: 'lightning',
    });

    await rail.settleIntent(intent.id);
    const events = await rail.listEvents(intent.id);
    const ids = new Set(events.map((event) => event.id));
    expect(ids.size).toBe(events.length); // no duplicate event ids
  });
});