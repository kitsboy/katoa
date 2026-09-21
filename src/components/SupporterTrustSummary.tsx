import { ExternalLink, ShieldCheck, Wallet, Zap } from 'lucide-react';
import { Link } from './Link';

export function SupporterTrustSummary({
  username,
  lightning,
  onchain,
  isDemo,
}: {
  username: string;
  lightning: string | null;
  onchain: string | null;
  isDemo: boolean;
}) {
  const destination = lightning || onchain;

  return (
    <section
      data-testid="supporter-trust-summary"
      className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-2">
          <ShieldCheck size={18} className="text-emerald-300" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">Before you pay</p>
          <h3 className="mt-1 text-sm font-black text-white">Your support goes to @{username}</h3>
          <p className="mt-1 text-xs leading-relaxed text-gray-300">KATOA does not hold the funds. Check the destination, then pay from your own wallet.</p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-200">
            <Wallet size={14} className="text-bitcoin-orange-300" aria-hidden />
            Destination
          </div>
          <p className="mt-2 truncate font-mono text-[11px] text-gray-400">{destination || 'No public wallet published'}</p>
          {lightning && <p className="mt-1 inline-flex items-center gap-1 text-[10px] text-bitcoin-orange-300"><Zap size={11} /> Lightning</p>}
          {!lightning && onchain && <p className="mt-1 text-[10px] text-gray-500">Bitcoin on-chain</p>}
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-200">
            <ShieldCheck size={14} className="text-emerald-300" aria-hidden />
            Verification
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-gray-400">Proof can be checked separately. Payment receipt still needs server confirmation.</p>
          <Link href="/verify" className="mt-1 inline-flex min-h-[32px] items-center gap-1 text-[10px] font-bold text-emerald-200">
            How proof works <ExternalLink size={11} />
          </Link>
        </div>
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-gray-500">
        {isDemo ? 'Preview only — no real payment is being claimed.' : 'After paying, choose “I paid — wait for confirmation.” This page will not mark the creator received until the backend confirms it.'}
      </p>
    </section>
  );
}
