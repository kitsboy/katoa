import { useEffect, useId, useMemo, useState } from 'react';
import { Zap } from 'lucide-react';
import { Card } from './Card';
import { DemoBadge } from './DemoBadge';
import { Skeleton } from './Skeleton';
import {
  demoEarnings,
  emptyEarnings,
  fetchLiveEarnings,
  formatSparkline,
  sumSats,
  type EarningsSnapshot,
} from '../lib/earnings';

const SPARK_W = 240;
const SPARK_H = 48;

const DEMO_CAPTION = 'Sample — live totals update after confirmed Lightning payments';
const LIVE_CAPTION = 'Live totals update after confirmed Lightning payments';

export function EarningsPanel({
  isDemo = false,
  userId = null,
  snapshot,
  className = '',
}: {
  isDemo?: boolean;
  userId?: string | null;
  snapshot?: EarningsSnapshot;
  className?: string;
}) {
  const rawId = useId();
  const uid = rawId.replace(/:/g, '');
  const fillId = `earnings-fill-${uid}`;
  const strokeId = `earnings-stroke-${uid}`;

  const [live, setLive] = useState<EarningsSnapshot | null | undefined>(
    isDemo || snapshot ? null : undefined,
  );

  useEffect(() => {
    if (isDemo || snapshot) return;
    let cancelled = false;
    (async () => {
      const result = await fetchLiveEarnings(userId);
      if (!cancelled) setLive(result);
    })();
    return () => {
      cancelled = true;
    };
  }, [isDemo, snapshot, userId]);

  const demo = useMemo(() => (isDemo && !snapshot ? demoEarnings() : null), [isDemo, snapshot]);

  const data: EarningsSnapshot = snapshot ?? demo ?? live ?? emptyEarnings();
  const loading = !isDemo && !snapshot && live === undefined;
  const total = sumSats(data.series);
  const line = formatSparkline(data.series, SPARK_W, SPARK_H);
  const area = line ? `${line} ${SPARK_W},${SPARK_H} 0,${SPARK_H}` : '';
  const caption = isDemo ? DEMO_CAPTION : LIVE_CAPTION;

  return (
    <Card variant="glass" className={`p-5 bg-charcoal-900/40 ${className}`} aria-labelledby={`earnings-title-${uid}`}>
      <div className="flex items-center justify-between gap-3 mb-2">
        <h3 id={`earnings-title-${uid}`} className="text-sm font-bold uppercase tracking-wider text-gray-400">
          Earnings
        </h3>
        {isDemo && (
          <DemoBadge title="Sample earnings until Lightning webhooks confirm payments" />
        )}
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mb-4">{caption}</p>

      {loading ? (
        <div className="space-y-3" role="status" aria-label="Loading earnings">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <>
          <div className="mb-3">
            <p className="text-3xl sm:text-4xl font-black text-white font-mono tabular-nums leading-none">
              {total.toLocaleString()}
              <span className="ml-2 text-lg font-bold text-bitcoin-orange-500">sats</span>
            </p>
            <p className="text-[11px] text-emerald-400/90 mt-1.5 font-medium">Last 14 days</p>
          </div>

          <svg
            viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
            className="w-full h-12 mb-4 overflow-visible"
            preserveAspectRatio="none"
            role="img"
            aria-label="Fourteen-day earnings sparkline"
          >
            <defs>
              <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F7931A" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id={strokeId} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#F7931A" />
              </linearGradient>
            </defs>
            {area && <polygon points={area} fill={`url(#${fillId})`} />}
            {line && (
              <polyline
                points={line}
                fill="none"
                stroke={`url(#${strokeId})`}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}
          </svg>

          {data.gifts.length > 0 ? (
            <ul className="space-y-2" aria-label="Recent gifts">
              {data.gifts.map((gift) => (
                <li
                  key={gift.id}
                  className="flex items-center gap-3 min-h-[44px] rounded-xl bg-black/20 border border-white/5 px-3 py-2"
                >
                  <div className="w-9 h-9 rounded-full bg-bitcoin-orange-500/15 border border-bitcoin-orange-500/25 flex items-center justify-center shrink-0">
                    <Zap size={16} className="text-bitcoin-orange-400" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white font-medium truncate">
                      {gift.from}
                      {isDemo && (
                        <span className="ml-2 text-[9px] uppercase font-bold text-bitcoin-orange-400/80">demo</span>
                      )}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {gift.ago}
                      {gift.wishlistTitle ? ` · ${gift.wishlistTitle}` : ''}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-semibold text-emerald-400 shrink-0">
                    +{gift.sats.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-500">No confirmed Lightning gifts yet.</p>
          )}
        </>
      )}
    </Card>
  );
}
