import { useState, ReactNode } from 'react';
import { Info } from 'lucide-react';

interface TooltipProps {
  content: string;
  children?: ReactNode;
  icon?: boolean;
}

export function Tooltip({ content, children, icon = false }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span className="relative inline-flex items-center group">
      <span
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="inline-flex items-center cursor-help"
      >
        {children}
        {icon && (
          <Info
            size={18}
            className="text-white/90 hover:text-emerald-300 transition-colors ml-1 flex-shrink-0"
            strokeWidth={2.5}
          />
        )}
      </span>

      {isVisible && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-[10000] w-[280px] pointer-events-none">
          <div
            className="bg-night-blue-shadow-800 border-2 border-emerald-500 rounded-lg px-4 py-3 shadow-2xl"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
          >
            <p className="text-white text-sm leading-relaxed font-normal">
              {content}
            </p>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-night-blue-shadow-800 border-t-2 border-l-2 border-emerald-500 rotate-45"></div>
          </div>
        </div>
      )}
    </span>
  );
}
