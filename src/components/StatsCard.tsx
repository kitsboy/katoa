import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
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
      className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-700 rounded-2xl p-6 hover-lift animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-14 h-14 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center animate-glow`}>
          <Icon size={28} className="text-white" />
        </div>
        {trend && (
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
            trend.isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </div>
        )}
      </div>
      <h3 className="text-slate-400 text-sm font-medium mb-2">{title}</h3>
      <div className="flex items-baseline gap-2">
        <p className="text-4xl font-black text-white">{value}</p>
        {subtitle && <span className="text-slate-500 text-sm">{subtitle}</span>}
      </div>
    </div>
  );
}
