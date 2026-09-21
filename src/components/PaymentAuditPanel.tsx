import { AlertCircle, CheckCircle2, Clock3, FileText, ShieldCheck, XCircle } from 'lucide-react';
import type { PaymentEnvironment, PaymentHealth } from '../lib/paymentHealth';
import type { PaymentEvent, PaymentState } from '../lib/paymentCore';
import { paymentHealthLabel } from '../lib/paymentHealth';

export interface PaymentAuditItem {
  id: string;
  amountSats: number;
  state: PaymentState;
  rail: 'lightning' | 'onchain';
  environment: PaymentEnvironment;
  createdAt: string;
  externalId?: string;
  memo?: string;
  events?: PaymentEvent[];
}

const stateIcon: Record<PaymentState, typeof FileText> = {
  intent: FileText,
  pending: Clock3,
  confirming: Clock3,
  settled: CheckCircle2,
  expired: XCircle,
  failed: AlertCircle,
};

export function PaymentAuditPanel({
  items,
  health,
}: {
  items: PaymentAuditItem[];
  health: PaymentHealth;
}) {
  return (
    <section data-testid="payment-audit-panel" className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neon-cyan-300">Payment audit</p>
          <h3 className="mt-1 text-lg font-black text-white">What happened to each payment</h3>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">Intent and settlement are separate. This list never turns a browser action into paid.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] font-bold uppercase text-gray-300">
          <ShieldCheck size={14} className="text-emerald-300" aria-hidden />
          {paymentHealthLabel(health)}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-gray-500">No payment intents yet.</p>
      ) : (
        <ul className="mt-5 space-y-2" aria-label="Payment audit entries">
          {items.map((item) => {
            const Icon = stateIcon[item.state];
            return (
              <li key={item.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <div className="flex items-start gap-3">
                  <Icon size={17} className={item.state === 'settled' ? 'mt-0.5 text-emerald-300' : item.state === 'failed' || item.state === 'expired' ? 'mt-0.5 text-rose-300' : 'mt-0.5 text-neon-cyan-300'} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-white">{item.amountSats.toLocaleString()} sats</span>
                      <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-400">{item.state}</span>
                      <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-500">{item.rail}</span>
                      <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-500">{item.environment}</span>
                    </div>
                    <p className="mt-1 truncate text-xs text-gray-500">{item.memo || 'Support payment'} · {new Date(item.createdAt).toLocaleString()}</p>
                    {item.externalId ? <p className="mt-1 truncate font-mono text-[10px] text-gray-600">Provider reference: {item.externalId}</p> : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
