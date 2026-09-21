import { Check, Circle, Clock3, LockKeyhole } from 'lucide-react';
import type { PaymentRail, PaymentState } from '../lib/paymentCore';

export type PaymentStatus = PaymentState | 'invoice-created' | 'paid-waiting' | 'creator-received' | 'demo';
export type PaymentEnvironment = 'demo' | 'staged' | 'live';

const steps: Array<{ id: PaymentState; label: string; detail: string }> = [
  { id: 'intent', label: 'Intent recorded', detail: 'The supporter chose an amount and destination.' },
  { id: 'pending', label: 'Pending', detail: 'The provider or wallet still needs to confirm payment.' },
  { id: 'confirming', label: 'Confirming', detail: 'The payment is detected and confirmations are being checked.' },
  { id: 'settled', label: 'Settled', detail: 'The trusted backend recorded settlement.' },
];

const order: Record<PaymentState, number> = {
  intent: 0,
  pending: 1,
  confirming: 2,
  settled: 3,
  expired: 1,
  failed: 1,
};

function canonicalStatus(status: PaymentStatus): PaymentState {
  if (status === 'invoice-created') return 'pending';
  if (status === 'paid-waiting') return 'pending';
  if (status === 'creator-received') return 'settled';
  if (status === 'demo') return 'pending';
  return status;
}

export function PaymentStatusStepper({
  status,
  rail = 'lightning',
  environment = status === 'demo' ? 'demo' : 'staged',
  compact = false,
}: {
  status: PaymentStatus;
  rail?: PaymentRail;
  environment?: PaymentEnvironment;
  compact?: boolean;
}) {
  const state = canonicalStatus(status);
  const activeIndex = order[state];
  const terminalLabel = state === 'expired' ? 'Expired' : state === 'failed' ? 'Failed' : null;

  return (
    <section
      aria-label="Payment status"
      data-testid="payment-status-stepper"
      data-payment-status={state}
      data-payment-rail={rail}
      data-payment-environment={environment}
      className={`rounded-2xl border border-white/10 bg-black/20 ${compact ? 'p-3' : 'p-4'}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-bitcoin-orange-400">Payment status</p>
          <p className="text-xs text-gray-400 mt-1">
            {environment === 'demo'
              ? 'Demo only — no real payment is being claimed.'
              : environment === 'staged'
                ? 'Staged flow — settlement still requires the trusted backend.'
                : 'Settlement comes only from trusted backend data.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/15 bg-white/[0.04] px-2 py-1 text-[10px] font-bold uppercase text-gray-300">
            {rail === 'onchain' ? 'Bitcoin' : 'Lightning'}
          </span>
          <span className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase ${environment === 'live' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : environment === 'staged' ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200' : 'border-bitcoin-orange-500/30 bg-bitcoin-orange-500/10 text-bitcoin-orange-300'}`}>
            {environment}
          </span>
        </div>
      </div>

      {terminalLabel ? <p className="mb-3 text-sm font-bold text-rose-200">Payment {terminalLabel.toLowerCase()}</p> : null}
      <ol className="grid gap-2 sm:grid-cols-4">
        {steps.map((step, index) => {
          const complete = index < activeIndex;
          const active = index === activeIndex && !terminalLabel;
          const locked = index === 3 && activeIndex < 3;
          return (
            <li key={step.id} className={`flex items-start gap-2 rounded-xl border p-3 ${active ? 'border-bitcoin-orange-500/40 bg-bitcoin-orange-500/10' : complete ? 'border-emerald-500/25 bg-emerald-500/10' : 'border-white/10 bg-white/[0.02]'}`}>
              <span className="mt-0.5 shrink-0" aria-hidden>
                {complete ? <Check size={16} className="text-emerald-400" /> : locked ? <LockKeyhole size={15} className="text-gray-500" /> : active ? <Clock3 size={15} className="text-bitcoin-orange-300" /> : <Circle size={15} className="text-gray-600" />}
              </span>
              <span className="min-w-0">
                <span className={`block text-xs font-bold ${active ? 'text-bitcoin-orange-200' : complete ? 'text-emerald-200' : 'text-gray-400'}`}>{step.label}</span>
                <span className="block text-[10px] leading-relaxed text-gray-500 mt-0.5">{step.detail}</span>
              </span>
            </li>
          );
        })}
      </ol>
      {rail === 'onchain' ? <p className="mt-3 text-[11px] text-gray-500">On-chain progress: detected → 1 confirmation → 2 confirmations → 6+ confirmations.</p> : null}
    </section>
  );
}
