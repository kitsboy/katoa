import { ReactNode } from 'react';

interface GlassCalloutProps {
  children: ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'bitcoin';
  className?: string;
}

const variantStyles = {
  info: 'bg-white/[0.04] border-white/10 text-gray-300',
  success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100',
  warning: 'bg-amber-500/10 border-amber-500/30 text-amber-100',
  bitcoin: 'bg-bitcoin-orange-500/10 border-bitcoin-orange-500/30 text-gray-300',
};

export function GlassCallout({ children, variant = 'info', className = '' }: GlassCalloutProps) {
  return (
    <div
      className={`rounded-2xl border p-4 sm:p-6 backdrop-blur-md text-sm sm:text-base leading-relaxed ${variantStyles[variant]} ${className}`}
    >
      {children}
    </div>
  );
}