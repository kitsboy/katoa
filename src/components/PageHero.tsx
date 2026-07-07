import { ReactNode } from 'react';

interface PageHeroProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: string;
  className?: string;
}

export function PageHero({ eyebrow, title, subtitle, className = '' }: PageHeroProps) {
  return (
    <div className={`text-center mb-10 sm:mb-12 animate-slide-up ${className}`}>
      {eyebrow && <div className="mb-4">{eyebrow}</div>}
      <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">{title}</h1>
      {subtitle && <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">{subtitle}</p>}
    </div>
  );
}