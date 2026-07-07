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

export function CardSkeleton({ label = 'Loading card' }: { label?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 p-4 space-y-3" aria-label={label} role="status">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}