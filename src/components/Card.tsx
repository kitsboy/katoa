import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'glass' | 'solid' | 'outline';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantStyles = {
  glass:
    'bg-white/[0.05] border-white/15 backdrop-blur-xl shadow-[0_0_0_1px_rgba(247,147,26,0.22),inset_0_1px_0_rgba(255,255,255,0.12),0_12px_36px_rgba(0,0,0,0.45)]',
  solid: 'bg-charcoal-900 border-white/10 shadow-lg',
  outline: 'bg-transparent border-white/15',
};

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  children,
  className = '',
  variant = 'glass',
  hover = false,
  padding = 'none',
  ...props
}: CardProps) {
  return (
    <div
      className={[
        'rounded-2xl overflow-hidden relative border',
        variantStyles[variant],
        paddingStyles[padding],
        hover
          ? 'transition-all duration-300 hover:border-neon-cyan/30 hover:shadow-[0_16px_48px_rgba(0,0,0,0.5),0_0_40px_rgba(20,230,255,0.08)] hover:-translate-y-1'
          : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}