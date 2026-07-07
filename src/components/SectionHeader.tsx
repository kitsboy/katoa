interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
  variant?: 'default' | 'landing';
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  variant = 'default',
  className = '',
}: SectionHeaderProps) {
  const alignClass = align === 'center' ? 'text-center' : 'text-left';
  const isLanding = variant === 'landing';

  return (
    <div className={`${alignClass} mb-10 sm:mb-14 ${className}`}>
      {eyebrow && (
        <p className={isLanding ? 'lp-section-eyebrow' : 'text-[10px] uppercase tracking-[0.2em] text-neon-cyan-500 font-semibold mb-3'}>
          {eyebrow}
        </p>
      )}
      <h2
        className={
          isLanding
            ? 'lp-section-title'
            : 'font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight'
        }
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`${isLanding ? 'lp-section-subtitle' : 'text-base sm:text-lg leading-relaxed text-gray-400'} ${
            align === 'center' ? 'mx-auto max-w-2xl' : ''
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}