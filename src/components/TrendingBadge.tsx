import { TrendingUp, Flame, Star, Zap } from 'lucide-react';

interface TrendingBadgeProps {
  type?: 'trending' | 'hot' | 'featured' | 'new';
  animated?: boolean;
}

export function TrendingBadge({ type = 'trending', animated = true }: TrendingBadgeProps) {
  const badges = {
    trending: {
      icon: TrendingUp,
      label: 'Trending',
      gradient: 'from-emerald-500 to-cyan-600',
      color: 'text-emerald-400',
    },
    hot: {
      icon: Flame,
      label: 'Hot',
      gradient: 'from-orange-500 to-red-600',
      color: 'text-orange-400',
    },
    featured: {
      icon: Star,
      label: 'Featured',
      gradient: 'from-yellow-400 to-orange-500',
      color: 'text-yellow-400',
    },
    new: {
      icon: Zap,
      label: 'New',
      gradient: 'from-blue-500 to-indigo-600',
      color: 'text-blue-400',
    },
  };

  const badge = badges[type];
  const Icon = badge.icon;

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
        bg-charcoal-900/90 backdrop-blur-sm border border-white/10
        ${animated ? 'animate-pulse' : ''}
      `}
    >
      <Icon size={14} className={badge.color} />
      <span className={`text-xs font-bold ${badge.color}`}>
        {badge.label}
      </span>
    </div>
  );
}
