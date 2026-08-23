import { useEffect, useState } from 'react';
import { Zap, BadgeCheck } from 'lucide-react';
import { nostrService } from '../lib/nostr';
import { Tooltip } from './Tooltip';

/** Fetch recent NIP-57 zap receipts for a pubkey and show total sats. */
export function ZapTotals({
  pubkey,
  className = '',
}: {
  /** npub or hex */
  pubkey?: string | null;
  className?: string;
}) {
  const [total, setTotal] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pubkey?.trim()) {
      setTotal(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const hex = nostrService.normalizePubkey(pubkey.trim());
        const receipts = await nostrService.getZapReceipts({
          recipientPubkey: hex,
          limit: 80,
        });
        if (cancelled) return;
        const sum = receipts.reduce((s, r) => s + r.amountSats, 0);
        setTotal(sum);
        setCount(receipts.length);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not load zaps');
          setTotal(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pubkey]);

  if (!pubkey?.trim()) return null;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs ${className}`}
    >
      <Zap size={14} className="text-amber-400 shrink-0" aria-hidden />
      {loading ? (
        <span className="text-gray-400">Loading zaps…</span>
      ) : error ? (
        <span className="text-gray-500">Zaps unavailable</span>
      ) : (
        <span className="text-amber-100 font-semibold tabular-nums">
          {total?.toLocaleString() ?? 0} sats zapped
          <span className="text-gray-500 font-normal"> · {count} receipts</span>
        </span>
      )}
      <Tooltip
        position="top"
        content="These are real NIP-57 zap receipts pulled from public relays — proof of the sats this creator has already received. No trust required: you can check each receipt yourself on any Nostr client. Every zap lands straight in the creator's wallet (non-custodial), and Katoa takes 0%."
      >
        <BadgeCheck size={14} className="text-violet-300 hover:text-violet-100 transition-colors shrink-0" aria-label="Proof: verified NIP-57 zap receipts on public relays" />
      </Tooltip>
    </div>
  );
}
