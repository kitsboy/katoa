import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; isPositive: boolean };
  gradient?: string;
  delay?: number;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  gradient = 'from-emerald-500 to-cyan-600',
  delay = 0,
}: StatsCardProps) {
  return (
    <div
      className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-6 hover:border-neon-cyan-500/30 transition-all animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className={`w-11 h-11 sm:w-14 sm:h-14 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center`}>
          <Icon size={24} className="text-white sm:w-7 sm:h-7" />
        </div>
        {trend && (
          <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold ${
            trend.isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </div>
        )}
      </div>
      <h3 className="text-gray-400 text-xs sm:text-sm font-medium mb-1 sm:mb-2">{title}</h3>
      <div className="flex items-baseline gap-2 flex-wrap">
        <p className="text-2xl sm:text-4xl font-black text-white">{value}</p>
        {subtitle && <span className="text-gray-500 text-xs sm:text-sm">{subtitle}</span>}
      </div>
    </div>
  );
}