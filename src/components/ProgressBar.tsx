import { memo } from 'react';

interface ProgressBarProps {
  current: number;
  goal: number;
  showPercentage?: boolean;
  showValues?: boolean;
  gradient?: string;
  height?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const ProgressBar = memo(function ProgressBar({
  current,
  goal,
  showPercentage = true,
  showValues = true,
  gradient = 'from-emerald-500 to-cyan-600',
  height = 'md',
  animated = true,
}: ProgressBarProps) {
  const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;

  const heightClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const formatSats = (sats: number): string => {
    if (sats >= 100000000) {
      return `${(sats / 100000000).toFixed(2)} BTC`;
    }
    if (sats >= 1000) {
      return `${(sats / 1000).toFixed(0)}k sats`;
    }
    return `${sats} sats`;
  };

  return (
    <div className="space-y-2">
      {(showValues || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {showValues && (
            <span className="text-gray-400 font-medium">
              {formatSats(current)} / {formatSats(goal)}
            </span>
          )}
          {showPercentage && (
            <span className="text-emerald-400 font-bold">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-white/10 rounded-full overflow-hidden ${heightClasses[height]} relative`}>
        <div
          className={`
            ${heightClasses[height]} bg-gradient-to-r ${gradient} rounded-full
            transition-all duration-1000 ease-out relative overflow-hidden
            ${animated ? 'animate-shimmer' : ''}
          `}
          style={{ width: `${percentage}%` }}
        >
          {showPercentage && percentage > 12 && (
            <span className="hidden sm:block absolute inset-0 flex items-center justify-end pr-2 text-[10px] font-bold text-white/90">
              {percentage.toFixed(0)}%
            </span>
          )}
          {animated && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          )}
        </div>
      </div>
      {percentage >= 100 && (
        <div className="text-center">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold animate-scale-in">
            🎉 Goal Reached!
          </span>
        </div>
      )}
    </div>
  );
});