import { Check, Circle, Clock3, FileText, LockKeyhole, XCircle } from 'lucide-react';

export type PaymentActivityStatus = 'intent' | 'pending' | 'confirmed' | 'expired' | 'demo';

const activities = [
  { id: 'intent', label: 'Gift intent recorded', detail: 'The supporter chose an amount and destination.', icon: FileText },
  { id: 'pending', label: 'Waiting for payment confirmation', detail: 'The wallet or server still needs to confirm payment.', icon: Clock3 },
  { id: 'confirmed', label: 'Creator received', detail: 'Only a confirmed backend event can show this.', icon: Check },
] as const;

export function PaymentActivityTimeline({ status, compact = false }: { status: PaymentActivityStatus; compact?: boolean }) {
  const activeIndex = status === 'intent' ? 0 : status === 'pending' || status === 'demo' ? 1 : 2;
  const isExpired = status === 'expired';
  const isDemo = status === 'demo';

  return (
    <section
      aria-label="Payment activity timeline"
      data-testid="payment-activity-timeline"
      data-activity-status={status}
      className={`rounded-2xl border border-white/10 bg-black/20 ${compact ? 'p-3' : 'p-4'}`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neon-cyan-300">Payment activity</p>
          <p className="mt-1 text-xs text-gray-500">{isExpired ? 'This request is closed. Nothing was marked received.' : isDemo ? 'Preview activity — not a live settlement.' : 'The browser never invents a confirmation.'}</p>
        </div>
        {isExpired ? <XCircle size={17} className="text-rose-300" aria-hidden /> : null}
      </div>

      <ol className="space-y-2">
        {activities.map((activity, index) => {
          const complete = !isExpired && index < activeIndex;
          const active = !isExpired && index === activeIndex;
          const locked = index === 2 && !complete && !active;
          const Icon = activity.icon;
          return (
            <li key={activity.id} className={`flex items-start gap-3 rounded-xl border p-3 ${active ? 'border-neon-cyan-500/35 bg-neon-cyan-500/10' : complete ? 'border-emerald-500/25 bg-emerald-500/10' : 'border-white/10 bg-white/[0.02]'}`}>
              <span className="mt-0.5 shrink-0" aria-hidden>
                {isExpired && index === activeIndex ? <XCircle size={16} className="text-rose-300" /> : complete ? <Check size={16} className="text-emerald-400" /> : locked ? <LockKeyhole size={15} className="text-gray-600" /> : active ? <Icon size={15} className="text-neon-cyan-300" /> : <Circle size={15} className="text-gray-600" />}
              </span>
              <span>
                <span className={`block text-xs font-bold ${isExpired && index === activeIndex ? 'text-rose-200' : active ? 'text-neon-cyan-200' : complete ? 'text-emerald-200' : 'text-gray-400'}`}>{isExpired && index === activeIndex ? 'Payment request expired' : activity.label}</span>
                <span className="mt-0.5 block text-[10px] leading-relaxed text-gray-500">{isExpired && index === activeIndex ? 'Generate a new request if you still want to pay.' : activity.detail}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
