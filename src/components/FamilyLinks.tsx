import { ExternalLink } from 'lucide-react';

const FAMILY = [
  { name: 'Give A Bit', href: 'https://giveabit.io', blurb: 'Bitcoin education & family hub' },
  { name: 'Satohash', href: 'https://satohash.io', blurb: 'Timestamp proofs on Bitcoin' },
  { name: 'HQ', href: 'https://hq.giveabit.io', blurb: 'Ops glass for the suite' },
] as const;

/** Cross-links to Give A Bit family products. */
export function FamilyLinks({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs font-bold uppercase tracking-wider text-gray-200 mb-3">Give A Bit family</p>
      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {FAMILY.map((item) => (
          <li key={item.name}>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 min-h-[48px] rounded-xl border border-white/15 bg-white/[0.05] px-3 py-2.5 shadow-[0_0_0_1px_rgba(247,147,26,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] hover:border-neon-cyan-500/40 transition-colors touch-manipulation"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white flex items-center gap-1">
                  {item.name}
                  <ExternalLink size={12} className="opacity-40 shrink-0" aria-hidden />
                </p>
                <p className="text-xs text-gray-200 leading-snug">{item.blurb}</p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
