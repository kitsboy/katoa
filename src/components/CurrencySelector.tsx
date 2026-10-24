import { useState, useEffect, useCallback, useRef, useId } from 'react';
import { Coins } from 'lucide-react';
import { useCurrency, CURRENCY_OPTIONS, DisplayCurrency } from '../contexts/CurrencyContext';

export function CurrencySelector({ compact = false }: { compact?: boolean }) {
  const { displayCurrency, setDisplayCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>('button:not([disabled])');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  const current = CURRENCY_OPTIONS.find((c) => c.code === displayCurrency) ?? CURRENCY_OPTIONS[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        ref={triggerRef}
        className={`flex items-center gap-1.5 text-gray-200 hover:text-neon-cyan transition-colors touch-manipulation ${
          compact ? 'text-sm px-2 py-1' : 'px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-neon-cyan/30'
        }`}
        aria-label="Select display currency"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? panelId : undefined}
        aria-labelledby={panelId}
      >
        <Coins size={compact ? 16 : 18} className="text-bitcoin-orange-500" />
        <span className="font-mono font-semibold">{current.symbol}</span>
        {!compact && <span className="text-xs text-gray-500 hidden sm:inline">{current.code}</span>}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={close} />
          <div
            role="listbox"
            id={panelId}
            aria-label="Display currency"
            className="absolute right-0 mt-2 w-48 bg-charcoal-950 border border-white/10 backdrop-blur-sm rounded-xl shadow-2xl py-2 z-50"
            ref={panelRef}
          >
            {CURRENCY_OPTIONS.map((opt) => (
              <button
                key={opt.code}
                type="button"
                role="option"
                aria-selected={displayCurrency === opt.code}
                onClick={() => {
                  setDisplayCurrency(opt.code as DisplayCurrency);
                  close();
                }}                className={
                  `w-full px-4 py-2.5 text-left flex items-center gap-3 transition-colors cursor-pointer ${
                    displayCurrency === opt.code
                      ? 'text-neon-cyan-400 bg-neon-cyan-500/10'
                      : 'text-gray-100 hover:bg-white/8'
                  }`
                }
              >
                <span className="font-mono text-base">{opt.symbol}</span>
                <span className="text-sm font-medium">{opt.label}</span>
                {displayCurrency === opt.code && (
                  <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-neon-cyan-500">
                    selected
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}