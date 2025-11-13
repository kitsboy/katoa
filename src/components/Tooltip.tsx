import { useState, ReactNode, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  children?: ReactNode;
  icon?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, icon = false, position = 'bottom' }: TooltipProps) {
  const [show, setShow] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      let top = 0;
      let left = 0;

      // Calculate initial position based on preference
      if (position === 'bottom') {
        top = triggerRect.bottom + 8;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
      } else if (position === 'top') {
        top = triggerRect.top - tooltipRect.height - 8;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
      } else if (position === 'left') {
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.left - tooltipRect.width - 8;
      } else {
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.right + 8;
      }

      // Adjust if tooltip goes out of viewport
      if (left < 8) left = 8;
      if (left + tooltipRect.width > viewport.width - 8) {
        left = viewport.width - tooltipRect.width - 8;
      }
      if (top < 8) top = 8;
      if (top + tooltipRect.height > viewport.height - 8) {
        top = viewport.height - tooltipRect.height - 8;
      }

      setTooltipStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 9999,
      });
    }
  }, [show, position]);

  return (
    <>
      <div ref={triggerRef} className="relative inline-flex items-center">
        <div
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
          onClick={() => setShow(!show)}
          className="inline-flex items-center cursor-help"
        >
          {children}
          {icon && (
            <HelpCircle size={16} className="text-night-blue-300 hover:text-emerald-400 transition-colors ml-1" />
          )}
        </div>
      </div>

      {show && (
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setShow(false)}
          />
          <div
            ref={tooltipRef}
            style={tooltipStyle}
            className="px-5 py-3.5 bg-night-blue-shadow-700 border border-emerald-500/30 rounded-xl shadow-2xl text-sm text-white max-w-[min(90vw,380px)] animate-fade-in leading-relaxed"
          >
            {content}
          </div>
        </>
      )}
    </>
  );
}
