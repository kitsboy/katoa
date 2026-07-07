import { ReactNode } from 'react';

interface HeroOverlayCardProps {
  children: ReactNode;
  className?: string;
}

export function HeroOverlayCard({ children, className = '' }: HeroOverlayCardProps) {
  return (
    <div className={`relative group ${className}`}>
      {/* Ambient glow behind card */}
      <div
        className="absolute -inset-px rounded-[1.75rem] sm:rounded-[2rem] bg-gradient-to-br from-neon-cyan-500/25 via-transparent to-bitcoin-orange-500/20 blur-2xl opacity-70 group-hover:opacity-90 transition-opacity duration-700 motion-reduce:opacity-50"
        aria-hidden
      />

      <div className="hero-overlay-card relative overflow-hidden rounded-[1.75rem] sm:rounded-[2rem] px-5 py-8 sm:px-10 sm:py-12 md:px-12 md:py-14">
        {/* Corner accents */}
        <div className="pointer-events-none absolute top-0 left-0 w-32 h-32 bg-neon-cyan-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" aria-hidden />
        <div className="pointer-events-none absolute bottom-0 right-0 w-40 h-40 bg-bitcoin-orange-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" aria-hidden />

        {/* Subtle grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04] hero-overlay-grid"
          aria-hidden
        />

        {/* Top edge highlight */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" aria-hidden />

        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}