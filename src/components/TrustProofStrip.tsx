import { Shield, Zap, Code2, ExternalLink } from 'lucide-react';
import { Link } from './Link';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Compact proof row: 0% fees · non-custodial · open source.
 * Shown under heroes and above pay CTAs for trust without hype.
 */
export function TrustProofStrip({
  compact = false,
  className = '',
}: {
  compact?: boolean;
  className?: string;
}) {
  const { t } = useLanguage();

  const items = [
    {
      icon: Zap,
      label: t('trust.proof.zeroFees'),
      href: '/comparison',
      external: false,
    },
    {
      icon: Shield,
      label: t('trust.proof.nonCustodial'),
      href: '/security',
      external: false,
    },
    {
      icon: Code2,
      label: t('trust.proof.openSource'),
      href: 'https://github.com/kitsboy/katoa',
      external: true,
    },
  ];

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-2 sm:gap-3 ${className}`}
      role="list"
      aria-label={t('trust.proof.aria')}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const inner = (
          <>
            <Icon size={compact ? 12 : 14} className="text-neon-cyan-400 shrink-0" aria-hidden />
            <span>{item.label}</span>
            {item.external && <ExternalLink size={10} className="opacity-50" aria-hidden />}
          </>
        );
        const cls = `inline-flex items-center gap-1.5 ${
          compact ? 'text-[10px] px-2 py-1' : 'text-xs sm:text-sm px-2.5 py-1.5'
        } rounded-full bg-white/[0.06] border border-white/15 text-gray-200 shadow-[0_0_0_1px_rgba(247,147,26,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] hover:border-neon-cyan-500/40 hover:text-white transition-colors touch-manipulation min-h-[36px]`;

        if (item.external) {
          return (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cls}
              role="listitem"
            >
              {inner}
            </a>
          );
        }
        return (
          <Link key={item.label} href={item.href} className={cls} role="listitem">
            {inner}
          </Link>
        );
      })}
    </div>
  );
}
