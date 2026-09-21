import { Sparkles } from 'lucide-react';

interface DemoPreviewBadgeProps {
  className?: string;
  compact?: boolean;
}

/** Consistent, honest visual language for sample content. */
export function DemoPreviewBadge({ className = '', compact = false }: DemoPreviewBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-bitcoin-orange-300/30 bg-[#24152f]/80 font-bold text-bitcoin-orange-100 shadow-[0_4px_18px_rgba(0,0,0,0.25)] backdrop-blur-md ${
        compact ? 'px-2 py-1 text-[9px] uppercase tracking-[0.14em]' : 'px-3 py-1.5 text-[10px] uppercase tracking-[0.16em]'
      } ${className}`}
      data-testid="demo-preview-badge"
    >
      <Sparkles size={compact ? 10 : 11} className="text-bitcoin-orange-300" aria-hidden />
      Demo preview
    </span>
  );
}
