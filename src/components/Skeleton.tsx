interface SkeletonProps {
  className?: string;
  label?: string;
}

export function Skeleton({ className = '', label }: SkeletonProps) {
  return (
    <div
      className={`animate-shimmer bg-white/5 rounded-xl ${className}`}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'status' : undefined}
    />
  );
}

export function CardSkeleton({
  label = 'Loading card',
  variant = 'default',
}: {
  label?: string;
  variant?: 'default' | 'tall';
}) {
  const mediaClass = variant === 'tall' ? 'h-64 sm:h-80 w-full' : 'h-40 w-full';

  return (
    <div className="rounded-2xl border border-white/10 p-4 space-y-3" aria-label={label} role="status">
      <Skeleton className={mediaClass} />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}