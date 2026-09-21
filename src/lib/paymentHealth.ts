import type { PaymentProvider } from './paymentCore';

export type PaymentEnvironment = 'demo' | 'staged' | 'live';
export type PaymentHealthStatus = 'healthy' | 'degraded' | 'down' | 'unconfigured';

export interface PaymentHealth {
  provider: PaymentProvider | 'none';
  environment: PaymentEnvironment;
  status: PaymentHealthStatus;
  checkedAt: string;
  lastSettleAt?: string;
  lastError?: string;
  details?: string;
}

export function createPaymentHealth(
  input: Partial<PaymentHealth> & Pick<PaymentHealth, 'provider' | 'environment'>,
  now = new Date(),
): PaymentHealth {
  return {
    provider: input.provider,
    environment: input.environment,
    status: input.status ?? 'unconfigured',
    checkedAt: input.checkedAt ?? now.toISOString(),
    lastSettleAt: input.lastSettleAt,
    lastError: input.lastError,
    details: input.details,
  };
}

export function paymentHealthLabel(health: PaymentHealth): string {
  if (health.environment === 'demo') return 'Demo';
  if (health.environment === 'staged') return 'Staged';
  if (health.status === 'healthy') return 'Live';
  if (health.status === 'unconfigured') return 'Not connected';
  return health.status === 'down' ? 'Unavailable' : 'Degraded';
}
