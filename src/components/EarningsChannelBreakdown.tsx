import { useEffect, useMemo, useState } from 'react';
import { Copy, ExternalLink, Info, ShieldAlert } from 'lucide-react';
import { Card } from './Card';
import { DemoBadge } from './DemoBadge';
import { Skeleton } from './Skeleton';
import { useToast } from './Toast';
import { copyToClipboard } from '../lib/clipboard';
import { fetchLiveChannelRows, type LiveChannelRow } from '../lib/earnings';
import { fetchCreatorReceiveDestinations } from '../lib/creatorProfile';
import {
  buildChannelBreakdown,
  channelTotals,
  channelsWithActivity,
  type ChannelBreakdown,
} from '../lib/earningsChannels';

const DEMO_ROWS: LiveChannelRow[] = [
  { id: 'demo-l1', amount_sats: 2_100_000, status: 'confirmed', payment_method: 'lightning', payment_hash: 'demo1f0a9c4e7b2d8a5f1c3e6b9d0a4f7c2e5b8d1a3f6c9e0b2d5a7f8c1e4b6d9a0f', created_at: null, wishlist_id: null },
  { id: 'demo-l2', amount_sats: 500_000, status: 'confirmed', payment_method: 'lightning', payment_hash: null, created_at: null, wishlist_id: null },
  { id: 'demo-o1', amount_sats: 480_000, status: 'confirmed', payment_method: 'onchain', payment_hash: null, created_at: null, wishlist_id: null },
  { id: 'demo-n1', amount_sats: 170_000, status: 'confirmed', payment_method: 'nostr', payment_hash: null, created_at: null, wishlist_id: null },
  { id: 'demo-p1', amount_sats: 21_000, status: 'pending', payment_method: 'lightning', payment_hash: null, created_at: null, wishlist_id: null },
  { id: 'demo-s1', amount_sats: 150_000, status: 'confirmed', payment_method: 'silent', payment_hash: null, created_at: null, wishlist_id: null },
];

/**
 * Earnings split by payout channel, with the proof each rail actually offers.
 *
 * Demo builds show the same sample as `EarningsPanel`; live builds read the
 * creator's own rows. A rail with no settlement source (silent payments) is
 * listed but never counted as settled, even when a row claims it is.
 */
export function EarningsChannelBreakdown({
  isDemo = false,
  userId = null,
  onchainAddress = null,
  className = '',
}: {
  isDemo?: boolean;
  userId?: string | null;
  onchainAddress?: string | null;
  className?: string;
}) {
  const { toast } = useToast();
  const [rows, setRows] = useState<LiveChannelRow[] | null | undefined>(
    isDemo ? null : undefined
  );
  const [onchain, setOnchain] = useState<string | null>(onchainAddress);

  useEffect(() => {
    setOnchain(onchainAddress);
  }, [onchainAddress]);

  useEffect(() => {
    if (isDemo) {
      setRows(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const result = await fetchLiveChannelRows(userId);
      if (!cancelled) setRows(result);
      // The on-chain address is what makes the address-history proof link real.
      if (userId && !onchainAddress) {
        const dest = await fetchCreatorReceiveDestinations(userId);
        if (!cancelled) setOnchain(dest.onchain);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isDemo, userId, onchainAddress]);

  const loading = !isDemo && rows === undefined;
  const unavailable = !isDemo && rows === null;
  const data: LiveChannelRow[] = isDemo ? DEMO_ROWS : (rows ?? []);

  const breakdown = useMemo(
    () => buildChannelBreakdown(data, { addresses: { onchain } }),
    [data, onchain]
  );
  const visible = useMemo(() => channelsWithActivity(breakdown), [breakdown]);
  const totals = channelTotals(breakdown);

  const copyHash = async (hash: string) => {
    const result = await copyToClipboard(hash);
    toast(result === 'success' ? 'Payment hash copied' : 'Could not copy the hash', result === 'success' ? 'success' : 'error');
  };

  return (
    <Card
      variant="glass"
      className={`p-5 bg-charcoal-900/40 ${className}`}
      aria-labelledby="earnings-channels-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <h3 id="earnings-channels-title" className="text-sm font-bold uppercase tracking-wider text-gray-400">
          Earnings by channel
        </h3>
        {isDemo && <DemoBadge title="Sample channel split until payments are settled server-side" />}
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mb-4">
        Katoa never holds the sats. Only rows a trusted server confirmed are counted as settled, and each rail shows
        what a supporter can check for themselves.
      </p>

      {loading ? (
        <div className="space-y-3" role="status" aria-label="Loading earnings by channel">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <ChannelTotal label="Settled" sats={totals.settledSats} tone="emerald" />
            <ChannelTotal label="Pending" sats={totals.pendingSats} tone="amber" />
            <ChannelTotal label="Unverifiable" sats={totals.unverifiableSats} tone="gray" />
          </div>

          {unavailable ? (
            <p className="text-xs text-amber-200/90" role="status">
              Channel totals are unavailable right now, so nothing is shown — this panel does not guess at zero.
            </p>
          ) : visible.length === 0 ? (
            <p className="text-xs text-gray-500">No gifts recorded yet on any channel.</p>
          ) : (
            <ul className="space-y-3">
              {visible.map((row) => (
                <ChannelRow key={row.channel} row={row} isDemo={isDemo} onCopyHash={copyHash} />
              ))}
            </ul>
          )}
        </>
      )}
    </Card>
  );
}

function ChannelTotal({
  label,
  sats,
  tone,
}: {
  label: string;
  sats: number;
  tone: 'emerald' | 'amber' | 'gray';
}) {
  const toneClass =
    tone === 'emerald'
      ? 'text-emerald-400 border-emerald-500/25 bg-emerald-500/10'
      : tone === 'amber'
        ? 'text-amber-300 border-amber-500/25 bg-amber-500/10'
        : 'text-gray-300 border-white/10 bg-white/5';
  return (
    <div className={`rounded-xl border p-3 ${toneClass}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">{label}</p>
      <p className="mt-1 font-mono text-sm font-bold tabular-nums">
        {sats.toLocaleString()}
        <span className="ml-1 text-[10px] opacity-80">sats</span>
      </p>
    </div>
  );
}

function ChannelRow({
  row,
  isDemo,
  onCopyHash,
}: {
  row: ChannelBreakdown;
  isDemo: boolean;
  onCopyHash: (hash: string) => void;
}) {
  const unverifiable = row.unverifiableCount > 0;

  return (
    <li className="rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-bold text-white">{row.label}</p>
        <p className="font-mono text-xs text-gray-300 tabular-nums">
          {row.settledCount > 0 ? (
            <span className="text-emerald-400">{row.settledSats.toLocaleString()} sats settled</span>
          ) : (
            <span className="text-gray-500">nothing settled</span>
          )}
          {row.pendingCount > 0 && (
            <span className="text-amber-300"> · {row.pendingSats.toLocaleString()} sats pending</span>
          )}
          {unverifiable && (
            <span className="text-gray-400"> · {row.unverifiableSats.toLocaleString()} sats unverifiable</span>
          )}
        </p>
      </div>

      <p className="mt-2 flex items-start gap-2 text-[11px] leading-relaxed text-gray-400">
        {unverifiable ? (
          <ShieldAlert size={13} className="mt-0.5 shrink-0 text-amber-300/90" aria-hidden />
        ) : (
          <Info size={13} className="mt-0.5 shrink-0 text-gray-500" aria-hidden />
        )}
        <span>
          <span className="font-semibold text-gray-300">{row.proof.label}:</span> {row.proof.note}
        </span>
      </p>

      {unverifiable && (
        <p className="mt-1.5 text-[11px] text-amber-200/80">
          {isDemo ? 'Sample row — ' : ''}
          {row.unverifiableCount} row(s) on this rail were excluded from settled totals.
        </p>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {row.proof.href && (
          <a
            href={row.proof.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[32px] items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 text-[11px] font-semibold text-gray-200 hover:bg-white/10"
          >
            Open address history
            <ExternalLink size={11} aria-hidden />
          </a>
        )}
        {row.paymentHashes.slice(0, 3).map((hash) => (
          <button
            key={hash}
            type="button"
            onClick={() => void onCopyHash(hash)}
            className="inline-flex min-h-[32px] max-w-full items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 font-mono text-[10px] text-gray-300 hover:bg-white/10"
            title={hash}
          >
            <Copy size={11} aria-hidden />
            <span className="truncate max-w-[140px]">{hash.slice(0, 12)}…</span>
          </button>
        ))}
        {row.paymentHashes.length > 3 && (
          <span className="text-[10px] text-gray-500">+{row.paymentHashes.length - 3} more hashes recorded</span>
        )}
      </div>
    </li>
  );
}
