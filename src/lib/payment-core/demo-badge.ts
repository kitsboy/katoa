/**
 * Demo vs live badge for payment rails.
 *
 * Canonical rule #5: every rail carries a demo-vs-live badge; a demo payment
 * must never look like a real one. `requireLive()` is the enforcement gate —
 * any code path that must only run for real payments throws when the rail is
 * in demo mode.
 */

export type PaymentMode = 'demo' | 'live';

export class DemoPaymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DemoPaymentError';
  }
}

export interface RailMode {
  mode: PaymentMode;
  /** Short badge label shown in the UI, e.g. "Demo" or "Live". */
  label: string;
  /** Human-readable note rendered with the badge. */
  note?: string;
}

/**
 * Resolve the mode for a rail. A rail is demo unless it is explicitly
 * configured as live AND backed by real infrastructure. We default to demo so
 * misconfiguration fails safe (never looks real by accident).
 *
 * `isLive` is provided by the caller (e.g. an env flag or vault secret); we
 * never trust a bare browser-supplied value.
 */
export function resolveRailMode(isLive: boolean, configuredLive: boolean): RailMode {
  const mode: PaymentMode = isLive && configuredLive ? 'live' : 'demo';
  return {
    mode,
    label: mode === 'live' ? 'Live' : 'Demo',
    note:
      mode === 'live'
        ? 'Real payment — funds move on-chain / over Lightning.'
        : 'Demo mode — no real funds move. Never settle a real balance from this rail.',
  };
}

/**
 * Gate: throws when the rail is in demo mode. Use for any operation that must
 * never happen against a demo rail (e.g. marking a real subscription settled,
 * or stamping a real receipt).
 */
export function requireLive(mode: PaymentMode, action = 'this action'): void {
  if (mode !== 'live') {
    throw new DemoPaymentError(
      `Cannot ${action} in demo mode. Demo rails never mark paid or settle real funds.`,
    );
  }
}

/** Convenience: true only of a live rail. */
export function isLive(mode: PaymentMode): boolean {
  return mode === 'live';
}
