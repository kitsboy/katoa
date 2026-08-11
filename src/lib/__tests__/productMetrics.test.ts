import { describe, it, expect } from 'vitest';
import { homeStatsFromMetrics, type ProductMetricsEnvelope } from '../productMetrics';

const sample: ProductMetricsEnvelope = {
  schema: 'gab.product-metrics.v1',
  productId: 'katoa',
  name: 'Katoa',
  updatedAt: '2026-08-11T00:00:00.000Z',
  kpis: [
    { key: 'creators_total', label: 'Creators', value: 11, format: 'number' },
    { key: 'sats_raised_total', label: 'Sats', value: 3_250_000, format: 'number' },
  ],
  raw: { demo: true, source: 'mock' },
};

describe('homeStatsFromMetrics', () => {
  it('formats counts and labels demo sample', () => {
    const s = homeStatsFromMetrics(sample);
    expect(s.creators).toBe('11');
    expect(s.volume).toContain('sats');
    expect(s.isDemoSample).toBe(true);
    expect(s.source).toBe('metrics');
  });

  it('formats large creator counts with K', () => {
    const s = homeStatsFromMetrics({
      ...sample,
      kpis: [{ key: 'creators_total', label: 'Creators', value: 2500, format: 'number' }],
      raw: { demo: false },
    });
    expect(s.creators).toBe('2.5K');
    expect(s.isDemoSample).toBe(false);
  });
});
