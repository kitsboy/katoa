import { Bitcoin, Zap } from 'lucide-react';

export function MobileCheckoutSummary({
  amountSats,
  method,
  recipient,
  isDemo,
}: {
  amountSats?: number;
  method?: 'lightning' | 'onchain' | 'nostr';
  recipient: string;
  isDemo: boolean;
}) {
  const isOnchain = method === 'onchain';
  const methodLabel = isOnchain ? 'Bitcoin on-chain' : method === 'nostr' ? 'Nostr zap' : 'Lightning';
  const Icon = isOnchain ? Bitcoin : Zap;

  return (
    <section
      data-testid="mobile-checkout-summary"
      aria-label="Checkout summary"
      className="rounded-2xl border border-bitcoin-orange-500/25 bg-gradient-to-br from-bitcoin-orange-500/10 via-white/[0.04] to-neon-cyan-500/[0.05] p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-bitcoin-orange-300">Checkout</p>
          <p className="mt-1 text-sm text-gray-300 truncate">Supporting @{recipient}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-black/20 px-2.5 py-1 text-[10px] font-bold text-gray-200">
          <Icon size={13} className="text-bitcoin-orange-300" aria-hidden />
          {methodLabel}
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-500">Amount</p>
          <p className="mt-0.5 text-2xl font-black tabular-nums text-white">
            {amountSats ? `${amountSats.toLocaleString()} sats` : 'Amount pending'}
          </p>
        </div>
        <span className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold ${isDemo ? 'border border-bitcoin-orange-500/30 bg-bitcoin-orange-500/10 text-bitcoin-orange-200' : 'border border-emerald-500/25 bg-emerald-500/10 text-emerald-200'}`}>
          {isDemo ? 'Preview only' : 'Non-custodial'}
        </span>
      </div>
    </section>
  );
}
