import { Bitcoin, Copy, ExternalLink, ShieldCheck, Wallet, Zap } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { Link } from './Link';
import { ReleaseAttestationsPanel } from './trust/ReleaseAttestationsPanel';

export function TrustFirstCreatorCard({
  username,
  lightning,
  onchain,
  onCopy,
  onSupport,
}: {
  username: string;
  lightning: string | null;
  onchain: string | null;
  onCopy: (value: string, label: string) => void;
  onSupport: () => void;
}) {
  const hasDestination = Boolean(lightning || onchain);

  return (
    <Card
      variant="glass"
      data-testid="trust-first-creator-card"
      data-ready-to-receive={hasDestination ? 'true' : 'false'}
      className="mb-12 overflow-visible border-bitcoin-orange-500/25 bg-gradient-to-br from-bitcoin-orange-500/[0.08] via-white/[0.04] to-neon-cyan-500/[0.04]"
    >
      <div className="p-5 sm:p-7">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-3">
              <ShieldCheck size={24} className="text-emerald-300" aria-hidden />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">Trust first</p>
              <h2 className="mt-1 text-xl sm:text-2xl font-black text-white">Support @{username} with confidence</h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-300">
                Check the proof, see exactly where sats go, then choose whether to support this creator. KATOA never holds the funds.
              </p>
            </div>
          </div>
          <Button
            variant={hasDestination ? 'bitcoin' : 'outline'}
            className="min-h-[48px] shrink-0"
            onClick={onSupport}
            disabled={!hasDestination}
            title={hasDestination ? `Support @${username}` : 'This creator has not connected a public wallet yet'}
          >
            <Zap size={17} className="mr-2" />
            {hasDestination ? `Support @${username}` : 'Not ready to receive'}
          </Button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Wallet size={16} className="text-bitcoin-orange-300" aria-hidden />
              Creator wallet destination
            </div>
            {lightning || onchain ? (
              <div className="mt-3 space-y-2">
                {lightning ? <WalletLine icon={<Zap size={13} />} label="Lightning" value={lightning} onCopy={onCopy} /> : null}
                {onchain ? <WalletLine icon={<Bitcoin size={13} />} label="Bitcoin" value={onchain} onCopy={onCopy} /> : null}
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-amber-400/25 bg-amber-500/10 p-3" role="status" aria-live="polite">
                <p className="text-sm font-bold text-amber-200">Not ready to receive yet</p>
                <p className="mt-1 text-xs leading-relaxed text-amber-100/75">This creator has not connected a public Lightning or Bitcoin address. No payment button is enabled.</p>
              </div>
            )}
            <p className="mt-3 text-[11px] leading-relaxed text-gray-500">{hasDestination ? 'This address is public so supporters can verify the destination before paying.' : 'The creator can add a wallet in Settings when ready.'}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <ShieldCheck size={16} className="text-emerald-300" aria-hidden />
              Bitcoin proof
            </div>
            <p className="mt-3 text-sm leading-relaxed text-gray-300">Release proof is a claim until a live Bitcoin check confirms it. No proof is silently treated as verified.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/verify" className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-3 text-xs font-bold text-emerald-200">
                <ShieldCheck size={14} />
                Check proof
              </Link>
              <Link href="/verify" className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-white/10 px-3 text-xs font-bold text-gray-300">
                <ExternalLink size={13} />
                How verification works
              </Link>
            </div>
          </div>
        </div>

        <ReleaseAttestationsPanel creator={username} className="mt-5" />
      </div>
    </Card>
  );
}

function WalletLine({ icon, label, value, onCopy }: { icon: React.ReactNode; label: string; value: string; onCopy: (value: string, label: string) => void }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-bitcoin-orange-300 shrink-0" aria-hidden>{icon}</span>
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 shrink-0">{label}</span>
      <span className="font-mono text-xs text-gray-300 truncate flex-1">{value}</span>
      <button type="button" onClick={() => onCopy(value, `${label} address`)} className="inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg border border-white/10 text-gray-300 hover:text-white" aria-label={`Copy ${label} address`}>
        <Copy size={14} />
      </button>
    </div>
  );
}
