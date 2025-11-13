import { useState, ReactNode, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

interface TooltipProps {
  content: string;
  children?: ReactNode;
  icon?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, icon = false, position = 'bottom' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const tooltipWidth = 360;
      const tooltipHeight = 150;
      const gap = 12;

      let top = 0;
      let left = 0;

      if (position === 'bottom') {
        top = rect.bottom + gap + window.scrollY;
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2) + window.scrollX;
      } else if (position === 'top') {
        top = rect.top - tooltipHeight - gap + window.scrollY;
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2) + window.scrollX;
      } else if (position === 'left') {
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2) + window.scrollY;
        left = rect.left - tooltipWidth - gap + window.scrollX;
      } else if (position === 'right') {
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2) + window.scrollY;
        left = rect.right + gap + window.scrollX;
      }

      if (left < 10) left = 10;
      if (left + tooltipWidth > window.innerWidth - 10) {
        left = window.innerWidth - tooltipWidth - 10;
      }

      if (top < 10) {
        top = rect.bottom + gap + window.scrollY;
      }

      if (top + tooltipHeight > window.innerHeight + window.scrollY - 10) {
        top = rect.top - tooltipHeight - gap + window.scrollY;
        if (top < 10) {
          top = rect.bottom + gap + window.scrollY;
        }
      }

      setCoords({ top, left });
    }
  }, [isVisible, position]);

  const tooltipContent = isVisible && (
    <div
      style={{
        position: 'absolute',
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        zIndex: 999999,
        width: '360px',
        pointerEvents: 'auto',
      }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <div className="bg-gradient-to-br from-night-blue-shadow-900 to-night-blue-shadow-800 border-2 border-emerald-400 rounded-xl px-6 py-5 shadow-2xl">
        <p className="text-white text-sm leading-relaxed font-medium">
          {content}
        </p>
      </div>
    </div>
  );

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
        className="inline-flex items-center cursor-help z-50 relative"
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

      {isVisible && createPortal(tooltipContent, document.body)}
    </>
  );
}
