import { useState, ReactNode, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

interface TooltipProps {
  content: string;
  children?: ReactNode;
  icon?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, icon = false, position = 'bottom' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const tooltipWidth = 320;
      const tooltipHeight = 100;
      const gap = 8;

      let top = 0;
      let left = 0;

      if (position === 'bottom') {
        top = rect.bottom + gap;
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
      } else if (position === 'top') {
        top = rect.top - tooltipHeight - gap;
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
      }

      if (left < 10) left = 10;
      if (left + tooltipWidth > window.innerWidth - 10) {
        left = window.innerWidth - tooltipWidth - 10;
      }

      if (top < 10) {
        top = rect.bottom + gap;
      }
      if (top + tooltipHeight > window.innerHeight - 10) {
        top = rect.top - tooltipHeight - gap;
      }

      setStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 999999,
      });
    }
  }, [isVisible, position]);

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={(e) => {
          e.stopPropagation();
          setIsVisible(!isVisible);
        }}
        className="inline-flex items-center cursor-help"
      >
        {children}
        {icon && (
          <Info
            size={20}
            className="text-white/90 hover:text-white transition-colors ml-1 flex-shrink-0"
            strokeWidth={2.5}
          />
        )}
      </span>

      {isVisible && (
        <div
          style={style}
          className="w-[320px] pointer-events-auto"
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
        >
          <div className="bg-gradient-to-br from-night-blue-shadow-900 to-night-blue-shadow-800 border-2 border-emerald-400 rounded-xl px-5 py-4 shadow-2xl">
            <p className="text-white text-sm leading-relaxed font-medium">
              {content}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
