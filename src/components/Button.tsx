import { ButtonHTMLAttributes, ReactNode } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'bitcoin' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const { t } = useLanguage();
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] relative overflow-hidden touch-manipulation min-h-[44px]';

  const variants = {
    primary:
      'bg-neon-cyan-500 text-charcoal-950 hover:bg-neon-cyan-400 shadow-[0_0_24px_rgba(20,230,255,0.25)] hover:shadow-[0_0_36px_rgba(20,230,255,0.4)]',
    secondary:
      'bg-white/10 text-white border border-white/15 hover:bg-white/15 hover:border-white/25',
    outline:
      'border-2 border-neon-cyan-500/60 text-neon-cyan-500 hover:bg-neon-cyan-500/10 backdrop-blur-sm',
    ghost: 'text-gray-100 hover:bg-white/10 hover:text-white',
    bitcoin:
      'bg-gradient-to-r from-bitcoin-orange-400 to-bitcoin-orange-500 text-charcoal-950 hover:from-bitcoin-orange-300 hover:to-bitcoin-orange-400 shadow-[0_0_24px_rgba(247,147,26,0.35)]',
    danger:
      'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 border border-red-400/30',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-lg min-h-[40px]',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg rounded-2xl min-h-[52px]',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-disabled={disabled || loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="sr-only">{t('common.loading')}</span>
        </>
      ) : null}
      {children}
    </button>
  );
}