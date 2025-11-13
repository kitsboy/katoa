import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
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
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transform hover:-translate-y-0.5 relative overflow-hidden group';

  const variants = {
    primary: 'bg-gradient-to-r from-sand-tan-500 to-sand-tan-600 hover:from-sand-tan-600 hover:to-sand-tan-700 text-night-blue-shadow font-bold shadow-lg hover:shadow-2xl hover:shadow-sand-tan-600/50 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/20 before:to-white/0 before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700',
    secondary: 'bg-gradient-to-r from-night-blue-500 to-night-blue-600 hover:from-night-blue-600 hover:to-night-blue-700 text-white font-bold shadow-lg hover:shadow-2xl hover:shadow-night-blue-500/50',
    outline: 'border-2 border-night-blue-500 text-night-blue-700 hover:bg-night-blue-500 hover:text-white hover:border-night-blue-400 backdrop-blur-sm',
    ghost: 'text-night-blue-500 hover:bg-sand-tan-100 hover:text-night-blue-800',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg rounded-2xl',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : null}
      {children}
    </button>
  );
}
