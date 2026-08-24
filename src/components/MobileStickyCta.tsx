import { ReactNode } from 'react';

/**
 * Fixed bottom CTA bar for mobile (sits above MobileNav when present).
 * Hidden on md+ — desktop uses in-page CTAs.
 */
export function MobileStickyCta({
  children,
  className = '',
  offsetForMobileNav = true,
}: {
  children: ReactNode;
  className?: string;
  offsetForMobileNav?: boolean;
}) {
  return (
    <div
      className={`fixed inset-x-0 z-[60] md:hidden pointer-events-none ${
        offsetForMobileNav
          ? 'bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))]'
          : 'bottom-0 pb-safe'
      } ${className}`}
      role="region"
      aria-label="Quick actions"
    >
      <div className="pointer-events-auto mx-3 mb-2 rounded-2xl border border-white/10 bg-charcoal-950/95 backdrop-blur-xl shadow-[0_-8px_40px_rgba(0,0,0,0.45)] px-3 py-2.5">
        {children}
      </div>
    </div>
  );
}
