import { InputHTMLAttributes, forwardRef, ReactNode, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = '', id, required, type, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-300 mb-2">
            {label}
            {required && (
              <>
                <span className="text-red-400 ml-0.5" aria-hidden="true">*</span>
                <span className="sr-only"> (required)</span>
              </>
            )}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            required={required}
            aria-required={required || undefined}
            inputMode={type === 'email' ? 'email' : props.inputMode}
            className={`w-full px-4 py-3 min-h-[44px] bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-cyan-500/50 focus:border-neon-cyan-500/30 transition-all text-base sm:text-sm ${
              error ? 'border-red-500/50 focus:ring-red-500/50' : ''
            } ${icon ? 'pl-10' : ''} ${className}`}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
        </div>
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-400">{helperText}</p>
        )}
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-red-400" role="alert">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';