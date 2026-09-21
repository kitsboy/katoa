import { Check, Circle, Clock3, FileText, LockKeyhole, XCircle } from 'lucide-react';
import type { PaymentRail, PaymentState } from '../lib/paymentCore';

export type PaymentActivityStatus = PaymentState | 'confirmed' | 'demo';
export type PaymentEnvironment = 'demo' | 'staged' | 'live';

const activities: Array<{ id: PaymentState; label: string; detail: string }> = [
  { id: 'intent', label: 'Intent recorded', detail: 'The supporter chose an amount and destination.' },
  { id: 'pending', label: 'Pending', detail: 'The wallet or provider still needs to confirm payment.' },
  { id: 'confirming', label: 'Confirming', detail: 'The payment is detected and confirmations are being checked.' },
  { id: 'settled', label: 'Settled', detail: 'Only a confirmed backend event can show this.' },
];

const order: Record<PaymentState, number> = {
  intent: 0,
  pending: 1,
  confirming: 2,
  settled: 3,
  expired: 1,
  failed: 1,
};

function canonicalStatus(status: PaymentActivityStatus): PaymentState {
  return status === 'confirmed' ? 'settled' : status === 'demo' ? 'pending' : status;
}

export function PaymentActivityTimeline({
  status,
  rail = 'lightning',
  environment = status === 'demo' ? 'demo' : 'staged',
  compact = false,
}: {
  status: PaymentActivityStatus;
  rail?: PaymentRail;
  environment?: PaymentEnvironment;
  compact?: boolean;
}) {
  const state = canonicalStatus(status);
  const activeIndex = order[state];
  const isTerminalProblem = state === 'expired' || state === 'failed';

  return (
    <section
      aria-label="Payment activity timeline"
      data-testid="payment-activity-timeline"
      data-activity-status={state}
      data-payment-rail={rail}
      data-payment-environment={environment}
      className={`rounded-2xl border border-white/10 bg-black/20 ${compact ? 'p-3' : 'p-4'}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neon-cyan-300">Payment activity</p>
          <p className="mt-1 text-xs text-gray-500">{isTerminalProblem ? `Payment ${state}. Generate a new request if needed.` : environment === 'demo' ? 'Demo activity — not a live settlement.' : 'The browser never invents a confirmation.'}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/15 bg-white/[0.04] px-2 py-1 text-[10px] font-bold uppercase text-gray-300">{rail === 'onchain' ? 'Bitcoin' : 'Lightning'}</span>
          {isTerminalProblem ? <XCircle size={17} className="text-rose-300" aria-hidden /> : null}
        </div>
      </div>

      <ol className="space-y-2">
        {activities.map((activity, index) => {
          const complete = !isTerminalProblem && index < activeIndex;
          const active = !isTerminalProblem && index === activeIndex;
          const locked = index === 3 && !complete && !active;
          return (
            <li key={activity.id} className={`flex items-start gap-3 rounded-xl border p-3 ${active ? 'border-neon-cyan-500/35 bg-neon-cyan-500/10' : complete ? 'border-emerald-500/25 bg-emerald-500/10' : 'border-white/10 bg-white/[0.02]'}`}>
              <span className="mt-0.5 shrink-0" aria-hidden>
                {isTerminalProblem && index === activeIndex ? <XCircle size={16} className="text-rose-300" /> : complete ? <Check size={16} className="text-emerald-400" /> : locked ? <LockKeyhole size={15} className="text-gray-600" /> : active ? (activity.id === 'intent' ? <FileText size={15} className="text-neon-cyan-300" /> : <Clock3 size={15} className="text-neon-cyan-300" />) : <Circle size={15} className="text-gray-600" />}
              </span>
              <span>
                <span className={`block text-xs font-bold ${isTerminalProblem && index === activeIndex ? 'text-rose-200' : active ? 'text-neon-cyan-200' : complete ? 'text-emerald-200' : 'text-gray-400'}`}>{isTerminalProblem && index === activeIndex ? `Payment ${state}` : activity.label}</span>
                <span className="mt-0.5 block text-[10px] leading-relaxed text-gray-500">{isTerminalProblem && index === activeIndex ? 'This request is closed. Nothing was marked settled.' : activity.detail}</span>
              </span>
            </li>
          );
        })}
      </ol>
      {rail === 'onchain' ? <p className="mt-3 text-[11px] text-gray-500">Confirmations: 0 → 1 → 2 → 6+ before settlement.</p> : null}
    </section>
  );
}
