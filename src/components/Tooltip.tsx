import { useState, ReactNode, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

interface TooltipProps {
  content: string;
  children?: ReactNode;
  icon?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, icon = false, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const triggerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const tooltipWidth = 280;
      const tooltipHeight = 120;
      const padding = 16;

      let newPosition = position;

      if (position === 'bottom' || position === 'top') {
        if (rect.bottom + tooltipHeight + padding > window.innerHeight) {
          newPosition = 'top';
        }
        if (rect.top - tooltipHeight - padding < 0) {
          newPosition = 'bottom';
        }
      }

      if (position === 'left' || position === 'right') {
        if (rect.right + tooltipWidth + padding > window.innerWidth) {
          newPosition = 'left';
        }
        if (rect.left - tooltipWidth - padding < 0) {
          newPosition = 'right';
        }
      }

      setAdjustedPosition(newPosition);
    }
  }, [isVisible, position]);

  const getPositionClasses = () => {
    switch (adjustedPosition) {
      case 'top':
        return 'bottom-full mb-2 left-1/2 -translate-x-1/2';
      case 'bottom':
        return 'top-full mt-2 left-1/2 -translate-x-1/2';
      case 'left':
        return 'right-full mr-2 top-1/2 -translate-y-1/2';
      case 'right':
        return 'left-full ml-2 top-1/2 -translate-y-1/2';
      default:
        return 'top-full mt-2 left-1/2 -translate-x-1/2';
    }
  };

  const getArrowClasses = () => {
    switch (adjustedPosition) {
      case 'top':
        return 'top-full left-1/2 -translate-x-1/2 -mt-1 border-t-2 border-l-2 rotate-[225deg]';
      case 'bottom':
        return 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-t-2 border-l-2 rotate-45';
      case 'left':
        return 'left-full top-1/2 -translate-y-1/2 -ml-1 border-t-2 border-l-2 rotate-[315deg]';
      case 'right':
        return 'right-full top-1/2 -translate-y-1/2 -mr-1 border-t-2 border-l-2 rotate-[135deg]';
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-t-2 border-l-2 rotate-45';
    }
  };

  return (
    <span className="relative inline-flex items-center group">
      <span
        ref={triggerRef}
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
        <div className={`absolute ${getPositionClasses()} z-[10000] w-[280px]`}>
          <div
            className="bg-night-blue-shadow-800 border-2 border-emerald-500 rounded-lg px-4 py-3 shadow-2xl"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
          >
            <p className="text-white text-sm leading-relaxed font-normal">
              {content}
            </p>
            <div className={`absolute ${getArrowClasses()} w-4 h-4 bg-night-blue-shadow-800 border-emerald-500`}></div>
          </div>
        </div>
      )}
    </span>
  );
}
