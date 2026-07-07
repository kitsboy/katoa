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
}

export function EmptyState({ icon, title, description, actionLabel, actionHref, onAction }: EmptyStateProps) {
  return (
    <div className="text-center py-12 sm:py-16 px-4" role="region" aria-label={title}>
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-4 text-gray-500" aria-hidden="true">
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-display font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto mb-6">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button variant="primary">{actionLabel}</Button>
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <Button variant="primary" onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}