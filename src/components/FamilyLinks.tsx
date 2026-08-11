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
      <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Give A Bit family</p>
      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {FAMILY.map((item) => (
          <li key={item.name}>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 min-h-[48px] rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 hover:border-neon-cyan-500/35 transition-colors touch-manipulation"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white flex items-center gap-1">
                  {item.name}
                  <ExternalLink size={12} className="opacity-40 shrink-0" aria-hidden />
                </p>
                <p className="text-[11px] text-gray-500 leading-snug">{item.blurb}</p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
