import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'glass' | 'solid' | 'outline';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantStyles = {
  glass:
    'bg-[#1a1428]/70 border-white/10 backdrop-blur-xl shadow-[0_0_0_1px_rgba(167,139,250,0.22),inset_0_1px_0_rgba(255,255,255,0.14),0_16px_44px_rgba(6,3,12,0.48)]',
  solid: 'bg-[#160e24] border-white/10 shadow-[0_0_0_1px_rgba(167,139,250,0.12),0_12px_32px_rgba(6,3,12,0.4)]',
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
          ? 'transition-[transform,border-color,box-shadow] duration-300 ease-out hover:border-katoa-violet/45 hover:shadow-[0_0_0_1px_rgba(167,139,250,0.4),inset_0_1px_0_rgba(255,255,255,0.18),0_20px_56px_rgba(6,3,12,0.55),0_0_44px_rgba(139,92,246,0.16)] hover:-translate-y-1'
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