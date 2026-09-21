import { describe, expect, it } from 'vitest';
import { isMvpReady, SOLO_READINESS_CHECKS } from '../mvpReadiness';

describe('MVP readiness', () => {
  it('stays blocked until deployed matching, ledger, webhook, and reconciliation pass', () => {
    expect(isMvpReady()).toBe(false);
    expect(SOLO_READINESS_CHECKS.find((check) => check.id === 'reconcile')?.status).toBe('blocked');
  });

  it('passes when every blocking check is complete', () => {
    expect(isMvpReady(SOLO_READINESS_CHECKS.map((check) => ({ ...check, status: 'pass' })))).toBe(true);
  });
});
