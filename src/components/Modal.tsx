import { ReactNode, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-labelledby={title ? 'modal-title' : undefined}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md animate-fade-in" onClick={onClose} aria-hidden="true" />
      <div
        className={`relative w-full ${sizes[size]} bg-charcoal-900 border border-white/10 rounded-t-[1.75rem] sm:rounded-2xl shadow-2xl max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto animate-sheet-up sm:animate-scale-in pb-safe`}
      >
        {title && (
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 sticky top-0 bg-charcoal-900/95 backdrop-blur-md z-10">
            <h2 id="modal-title" className="text-lg sm:text-2xl font-display font-bold text-white">{title}</h2>
            <button
              ref={closeRef}
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="text-gray-400 hover:text-white transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-white/10 rounded-xl touch-manipulation"
              type="button"
              aria-label="Close dialog"
            >
              <X size={22} />
            </button>
          </div>
        )}
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}