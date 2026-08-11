import { ReactNode } from 'react';
import { Button } from './Button';
import { Link } from './Link';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  secondaryHref?: string;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryLabel,
  secondaryHref,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`text-center py-12 sm:py-16 px-4 max-w-lg mx-auto ${className}`}
      role="region"
      aria-label={title}
    >
      <div
        className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/5 border border-white/10 mb-4 text-gray-500"
        aria-hidden="true"
      >
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-display font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto mb-6 leading-relaxed">{description}</p>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
        {actionLabel && actionHref && (
          <Link href={actionHref} className="w-full sm:w-auto">
            <Button variant="primary" className="w-full min-h-[48px]">
              {actionLabel}
            </Button>
          </Link>
        )}
        {actionLabel && onAction && !actionHref && (
          <Button variant="primary" onClick={onAction} className="w-full sm:w-auto min-h-[48px]">
            {actionLabel}
          </Button>
        )}
        {secondaryLabel && secondaryHref && (
          <Link href={secondaryHref} className="w-full sm:w-auto">
            <Button variant="outline" className="w-full min-h-[48px]">
              {secondaryLabel}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}