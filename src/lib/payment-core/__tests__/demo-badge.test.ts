import { describe, expect, it } from 'vitest';
import {
  DemoPaymentError,
  isLive,
  requireLive,
  resolveRailMode,
} from '../demo-badge';

describe('demo-badge', () => {
  it('defaults a rail to demo unless it is explicitly live', () => {
    expect(resolveRailMode(false, false).mode).toBe('demo');
    expect(resolveRailMode(false, true).mode).toBe('demo');
    expect(resolveRailMode(true, false).mode).toBe('demo');
    expect(resolveRailMode(true, true).mode).toBe('live');
  });

  it('labels the badge demo vs live clearly', () => {
    expect(resolveRailMode(true, true).label).toBe('Live');
    expect(resolveRailMode(false, true).label).toBe('Demo');
  });

  it('requireLive throws in demo mode', () => {
    expect(() => requireLive('demo', 'mark paid')).toThrow(DemoPaymentError);
    expect(() => requireLive('demo', 'mark paid')).toThrow(/demo mode/i);
  });

  it('requireLive passes in live mode', () => {
    expect(() => requireLive('live', 'mark paid')).not.toThrow();
  });

  it('isLive reflects the mode', () => {
    expect(isLive('live')).toBe(true);
    expect(isLive('demo')).toBe(false);
  });
});