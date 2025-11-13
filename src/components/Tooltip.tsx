import { useState, ReactNode } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  children?: ReactNode;
  icon?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, icon = false, position = 'bottom' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(!isVisible);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-3',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-3',
    left: 'right-full top-1/2 -translate-y-1/2 mr-3',
    right: 'left-full top-1/2 -translate-y-1/2 ml-3',
  };

  return (
    <span className="relative inline-block">
      <span
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="inline-flex items-center cursor-help select-none"
      >
        {children}
        {icon && (
          <HelpCircle
            size={16}
            className="text-emerald-500 hover:text-emerald-400 transition-colors ml-1.5 flex-shrink-0"
          />
        )}
      </span>

      {isVisible && (
        <>
          <div
            className="fixed inset-0 z-[998]"
            onClick={() => setIsVisible(false)}
          />
          <div
            className={`absolute z-[999] px-5 py-4 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white text-sm rounded-xl shadow-2xl border-2 border-emerald-400 w-80 max-w-[90vw] ${positionClasses[position]}`}
          >
            <div className="leading-relaxed font-medium">{content}</div>
            <div className="absolute w-3 h-3 bg-emerald-600 border-emerald-400 transform rotate-45 -translate-x-1/2 left-1/2 ${position === 'bottom' ? '-top-1.5 border-l border-t' : '-bottom-1.5 border-r border-b'}"></div>
          </div>
        </>
      )}
    </span>
  );
}
