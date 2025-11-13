import { useState, ReactNode } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  children?: ReactNode;
  icon?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, icon = false, position = 'bottom' }: TooltipProps) {
  const [show, setShow] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <span className="relative inline-flex items-center">
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={(e) => {
          e.stopPropagation();
          setShow(!show);
        }}
        className="inline-flex items-center cursor-help"
      >
        {children}
        {icon && (
          <HelpCircle size={16} className="text-night-blue-300 hover:text-emerald-400 transition-colors ml-1 flex-shrink-0" />
        )}
      </span>

      {show && (
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setShow(false)}
          />
          <div
            className={`absolute z-[9999] px-4 py-3 bg-night-blue-shadow text-white text-sm rounded-lg shadow-2xl border border-emerald-500/30 w-72 sm:w-80 ${positionClasses[position]}`}
            style={{
              maxWidth: 'calc(100vw - 2rem)',
            }}
          >
            <div className="leading-relaxed">{content}</div>
          </div>
        </>
      )}
    </span>
  );
}
