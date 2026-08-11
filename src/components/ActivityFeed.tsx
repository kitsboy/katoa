import { Zap } from 'lucide-react';

export type ActivityItem = {
  id: string;
  label: string;
  amountSats?: number;
  ago: string;
  isDemo?: boolean;
};

/** Privacy-preserving activity list (aliases, no PII). */
export function ActivityFeed({
  items,
  title = 'Recent support',
  className = '',
}: {
  items: ActivityItem[];
  title?: string;
  className?: string;
}) {
  if (!items.length) return null;

  return (
    <section className={`rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 ${className}`} aria-label={title}>
      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">{title}</h3>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-3 min-h-[44px] rounded-xl bg-black/20 border border-white/5 px-3 py-2"
          >
            <div className="w-9 h-9 rounded-full bg-bitcoin-orange-500/15 border border-bitcoin-orange-500/25 flex items-center justify-center shrink-0">
              <Zap size={16} className="text-bitcoin-orange-400" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-white font-medium truncate">
                {item.label}
                {item.isDemo && (
                  <span className="ml-2 text-[9px] uppercase font-bold text-bitcoin-orange-400/80">demo</span>
                )}
              </p>
              <p className="text-[11px] text-gray-500">{item.ago}</p>
            </div>
            {typeof item.amountSats === 'number' && (
              <span className="text-xs font-mono font-semibold text-neon-cyan-400 shrink-0">
                +{item.amountSats.toLocaleString()}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
