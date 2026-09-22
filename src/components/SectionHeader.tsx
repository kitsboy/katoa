import { ReactNode } from 'react';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
  variant?: 'default' | 'landing';
  /** lg = page sections (default), md = panel headings, sm = compact column headers. */
  size?: 'lg' | 'md' | 'sm';
  /** Optional right-side control (button, link) rendered beside the title. */
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  variant = 'default',
  size = 'lg',
  action,
  className = '',
}: SectionHeaderProps) {
  const isLanding = variant === 'landing';
  const alignClass = align === 'center' ? 'text-center' : 'text-left';
  const withAction = action !== undefined && action !== null;

  const containerMargin =
    size === 'lg' ? 'mb-10 sm:mb-14' : size === 'md' ? 'mb-5' : 'mb-4';

  const titleClass = isLanding
    ? 'lp-section-title'
    : size === 'lg'
      ? 'font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight'
      : size === 'md'
        ? 'font-display text-2xl font-bold text-white leading-tight'
        : 'text-[11px] font-semibold uppercase tracking-[0.18em] text-white';

  const eyebrowClass = isLanding
    ? 'lp-section-eyebrow'
    : 'text-[10px] uppercase tracking-[0.2em] text-neon-cyan-500 font-semibold mb-2';

  const subtitleClass = isLanding
    ? 'lp-section-subtitle'
    : size === 'lg'
      ? 'text-base sm:text-lg leading-relaxed text-gray-400'
      : 'text-sm text-gray-400';

  const titleMargin = withAction ? '' : size === 'lg' ? 'mb-3 sm:mb-4' : 'mb-1';

  const titleBlock = (
    <div className={withAction ? 'min-w-0' : ''}>
      {eyebrow && <p className={eyebrowClass}>{eyebrow}</p>}
      <h2 className={`${titleClass} ${titleMargin}`}>{title}</h2>
      {subtitle && (
        <p className={`${subtitleClass} ${align === 'center' && !withAction ? 'mx-auto max-w-2xl' : ''}`}>
          {subtitle}
        </p>
      )}
    </div>
  );

  if (withAction) {
    return (
      <div
        className={`${alignClass} ${containerMargin} flex flex-col sm:flex-row sm:items-end justify-between gap-3 ${className}`}
      >
        {titleBlock}
        <div className="shrink-0">{action}</div>
      </div>
    );
  }

  return <div className={`${alignClass} ${containerMargin} ${className}`}>{titleBlock}</div>;
}
