import { describe, expect, it } from 'vitest';
import {
  isDemoReference,
  paymentLabel,
  referenceCodeFor,
  siteOfReference,
} from '../payment-labelling';

describe('payment-labelling', () => {
  it('builds a unique per-site reference code', () => {
    expect(referenceCodeFor({ site: 'katoa', kind: 'gift', seq: 1 })).toBe('ka-g-000001');
    expect(referenceCodeFor({ site: 'motopass', kind: 'subscription', seq: 42 }))
      .toBe('mp-s-000042');
    expect(referenceCodeFor({ site: 'satohash', kind: 'donation', seq: 7 }))
      .toBe('sh-d-000007');
  });

  it('marks demo fixtures so they can never look like real payments', () => {
    const demo = referenceCodeFor({ site: 'katoa', kind: 'gift', seq: 1, demo: true });
    expect(demo).toBe('ka-g-000001-demo');
    expect(isDemoReference(demo)).toBe(true);
    expect(isDemoReference('ka-g-000001')).toBe(false);
  });

  it('produces distinct codes for distinct sites (Cam mandate)', () => {
    const codes = [
      referenceCodeFor({ site: 'openstrata', kind: 'gift', seq: 1 }),
      referenceCodeFor({ site: 'motopass', kind: 'gift', seq: 1 }),
      referenceCodeFor({ site: 'satohash', kind: 'gift', seq: 1 }),
      referenceCodeFor({ site: 'stranded', kind: 'gift', seq: 1 }),
      referenceCodeFor({ site: 'tadbuy', kind: 'gift', seq: 1 }),
    ];
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('produces a full on-chain/ledger label', () => {
    expect(paymentLabel({ site: 'katoa', kind: 'gift', seq: 1 })).toBe('KATOA ka-g-000001');
    expect(paymentLabel({ site: 'katoa', kind: 'gift', seq: 1, demo: true }))
      .toBe('KATOA-DEMO ka-g-000001-demo');
  });

  it('resolves a reference code back to its site', () => {
    expect(siteOfReference('ka-g-000001')).toBe('katoa');
    expect(siteOfReference('mp-s-000042')).toBe('motopass');
    expect(siteOfReference('unknown-xyz')).toBeNull();
  });
});