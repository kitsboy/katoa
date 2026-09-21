import { Check, Circle, Clock3, LockKeyhole } from 'lucide-react';

export type PaymentStatus = 'invoice-created' | 'paid-waiting' | 'creator-received' | 'demo';

const steps = [
  { id: 'invoice-created', label: 'Invoice created', detail: 'Your wallet has something to pay.' },
  { id: 'paid-waiting', label: 'Payment sent', detail: 'You said you paid; the server still has to confirm it.' },
  { id: 'creator-received', label: 'Creator received', detail: 'Only confirmed backend data can unlock this.' },
] as const;

const order: Record<PaymentStatus, number> = {
  'invoice-created': 0,
  'paid-waiting': 1,
  'creator-received': 2,
  demo: 1,
};

export function PaymentStatusStepper({ status, compact = false }: { status: PaymentStatus; compact?: boolean }) {
  const activeIndex = order[status];
  const isDemo = status === 'demo';

  return (
    <section
      aria-label="Payment status"
      data-testid="payment-status-stepper"
      data-payment-status={status}
      className={`rounded-2xl border border-white/10 bg-black/20 ${compact ? 'p-3' : 'p-4'}`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-bitcoin-orange-400">Payment status</p>
          <p className="text-xs text-gray-400 mt-1">
            {isDemo ? 'Preview only — no real payment is being claimed.' : 'No browser button can declare creator receipt.'}
          </p>
        </div>
        {isDemo ? <span className="rounded-full border border-bitcoin-orange-500/30 bg-bitcoin-orange-500/10 px-2 py-1 text-[10px] font-bold text-bitcoin-orange-300">Demo</span> : null}
      </div>

      <ol className="grid gap-2 sm:grid-cols-3">
        {steps.map((step, index) => {
          const complete = index < activeIndex;
          const active = index === activeIndex;
          const locked = index === 2 && activeIndex < 2;
          return (
            <li
              key={step.id}
              className={`flex items-start gap-2 rounded-xl border p-3 ${
                active
                  ? 'border-bitcoin-orange-500/40 bg-bitcoin-orange-500/10'
                  : complete
                    ? 'border-emerald-500/25 bg-emerald-500/10'
                    : 'border-white/10 bg-white/[0.02]'
              }`}
            >
              <span className="mt-0.5 shrink-0" aria-hidden>
                {complete ? <Check size={16} className="text-emerald-400" /> : locked ? <LockKeyhole size={15} className="text-gray-500" /> : active ? <Clock3 size={15} className="text-bitcoin-orange-300" /> : <Circle size={15} className="text-gray-600" />}
              </span>
              <span className="min-w-0">
                <span className={`block text-xs font-bold ${active ? 'text-bitcoin-orange-200' : complete ? 'text-emerald-200' : 'text-gray-400'}`}>
                  {step.label}
                </span>
                <span className="block text-[10px] leading-relaxed text-gray-500 mt-0.5">{step.detail}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
