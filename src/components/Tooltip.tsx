import { useState, ReactNode } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  children?: ReactNode;
  icon?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, icon = false }: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-flex items-center group/tooltip">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="inline-flex items-center cursor-help relative z-10"
      >
        {children}
        {icon && (
          <HelpCircle size={16} className="text-night-blue-300 hover:text-emerald-400 transition-colors ml-1" />
        )}
      </div>

      {show && (
        <>
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => setShow(false)}
          />
          <div className="fixed inset-0 z-[101] pointer-events-none flex items-center justify-center p-4">
            <div className="pointer-events-auto px-5 py-4 bg-night-blue-shadow-700 border-2 border-emerald-500/40 rounded-xl shadow-2xl text-sm text-white max-w-md w-full animate-fade-in leading-relaxed">
              {content}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
