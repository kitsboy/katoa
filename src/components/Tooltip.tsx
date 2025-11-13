import { useState, ReactNode } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  children?: ReactNode;
  icon?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, icon = false, position = 'top' }: TooltipProps) {
  const [show, setShow] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-flex items-center">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="inline-flex items-center cursor-help"
      >
        {children}
        {icon && (
          <HelpCircle size={16} className="text-night-blue-300 hover:text-emerald-400 transition-colors ml-1" />
        )}
      </div>

      {show && (
        <div
          className={`absolute z-50 px-6 py-4 bg-night-blue-shadow-700 border border-emerald-500/30 rounded-xl shadow-2xl text-sm text-white w-[min(90vw,400px)] ${positionClasses[position]} animate-fade-in`}
        >
          <div className="relative">
            {content}
            <div
              className={`absolute w-2 h-2 bg-night-blue-shadow-700 border-emerald-500/30 transform rotate-45 ${
                position === 'top' ? 'bottom-[-5px] left-1/2 -translate-x-1/2 border-b border-r' :
                position === 'bottom' ? 'top-[-5px] left-1/2 -translate-x-1/2 border-t border-l' :
                position === 'left' ? 'right-[-5px] top-1/2 -translate-y-1/2 border-t border-r' :
                'left-[-5px] top-1/2 -translate-y-1/2 border-b border-l'
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
