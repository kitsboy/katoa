import { ReactNode } from 'react';

interface GlassSectionProps {
  children: ReactNode;
  className?: string;
  glow?: 'cyan' | 'orange' | 'none';
}

export function GlassSection({ children, className = '', glow = 'none' }: GlassSectionProps) {
  const glowStyles = {
    cyan: 'shadow-[0_0_80px_rgba(20,230,255,0.15)]',
    orange: 'shadow-[0_0_80px_rgba(247,147,26,0.15)]',
    none: '',
  };

  return (
    <div
      className={`
        relative rounded-2xl p-8
        bg-white/[0.03] backdrop-blur-md
        border border-white/5
        shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset,0_8px_32px_rgba(0,0,0,0.4)]
        ${glowStyles[glow]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
