export type ReadinessStatus = 'pass' | 'blocked' | 'staged' | 'unknown';

export interface ReadinessCheck {
  id: string;
  label: string;
  status: ReadinessStatus;
  detail: string;
  blocking: boolean;
}

export const SOLO_READINESS_CHECKS: ReadinessCheck[] = [
  { id: 'intent', label: 'Intent contract', status: 'pass', detail: 'Family Payment Core contract exists.', blocking: true },
  { id: 'matching', label: 'Strict server matching', status: 'staged', detail: 'Validation and schema exist; deployment is still required.', blocking: true },
  { id: 'ledger', label: 'Event ledger and atomic totals', status: 'staged', detail: 'Migration and server path are staged; production migration is not deployed.', blocking: true },
  { id: 'webhook', label: 'Signed settlement webhook', status: 'staged', detail: 'Existing endpoint is implemented; live provider configuration is not confirmed.', blocking: true },
  { id: 'reconcile', label: 'Provider reconciliation', status: 'blocked', detail: 'Needs a deployed provider connector and scheduled worker.', blocking: true },
  { id: 'secrets', label: 'Server-only secrets', status: 'pass', detail: 'No payment secrets are in the browser or repository.', blocking: true },
  { id: 'ui', label: 'Shared state UI', status: 'pass', detail: 'Canonical states, rails, and environment labels are visible.', blocking: false },
];

export function isMvpReady(checks: ReadinessCheck[] = SOLO_READINESS_CHECKS): boolean {
  return checks.every((check) => !check.blocking || check.status === 'pass');
}
