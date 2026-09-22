import { ChevronDown, Clock3, FileCheck2, Info, ShieldCheck, Wallet } from 'lucide-react';
import { useState } from 'react';

export function PaymentDetailDisclosure({
  method,
  destination,
  amountSats,
  isDemo,
  rail,
}: {
  method: string;
  destination: string | null;
  amountSats?: number;
  isDemo: boolean;
  rail: 'lightning' | 'onchain' | 'nostr';
}) {
  const [open, setOpen] = useState(false);
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03]" data-testid="payment-detail-disclosure">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="flex min-h-[48px] w-full items-center justify-between gap-3 px-4 py-3 text-left">
        <span className="flex items-center gap-2 text-sm font-bold text-white"><Info size={16} className="text-neon-cyan-300" /> Payment details</span>
        <ChevronDown size={17} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open && <div className="grid gap-2 border-t border-white/10 p-4 sm:grid-cols-2">
        <Detail icon={<Wallet size={14} />} label="Method" value={method} />
        <Detail icon={<Info size={14} />} label="Amount" value={amountSats ? `${amountSats.toLocaleString()} sats` : 'Selected amount'} />
        <Detail icon={<Clock3 size={14} />} label="Timing" value={rail === 'onchain' ? 'Wait for confirmations' : 'Wallet-dependent' } />
        <Detail icon={<ShieldCheck size={14} />} label="Fees" value="KATOA platform fee: 0%" />
        <Detail icon={<FileCheck2 size={14} />} label="Receipt" value="Backend confirmation required" />
        <Detail icon={<Info size={14} />} label="Destination" value={destination || 'No public destination'} mono />
        <p className="sm:col-span-2 text-[11px] leading-relaxed text-gray-500">{isDemo ? 'Demo preview: this panel explains the flow only. No real payment is being claimed.' : 'Routing, miner, or wallet fees may still apply. The browser never invents settlement or changes funding totals.'}</p>
      </div>}
    </section>
  );
}

function Detail({ icon, label, value, mono = false }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return <div className="rounded-xl border border-white/10 bg-black/20 p-3"><p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-gray-500">{icon}{label}</p><p className={`mt-1 truncate text-xs text-gray-200 ${mono ? 'font-mono' : ''}`}>{value}</p></div>;
}
