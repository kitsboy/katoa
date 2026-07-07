import * as Icons from 'lucide-react';

interface CategoryBadgeProps {
  name: string;
  icon?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function CategoryBadge({
  name,
  icon = 'Tag',
  color = '#f97316',
  size = 'md',
  onClick,
}: CategoryBadgeProps) {
  const IconComponent = (Icons as any)[icon] || Icons.Tag;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        bg-white/5 border border-white/10
        hover:border-neon-cyan-500/40 hover:bg-white/10
        transition-all-smooth hover-lift
        ${sizeClasses[size]}
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
      `}
      style={{
        color: color,
      }}
    >
      <IconComponent size={iconSizes[size]} />
      <span>{name}</span>
    </button>
  );
}
