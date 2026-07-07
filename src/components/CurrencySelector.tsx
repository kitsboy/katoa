import { useState, useEffect } from 'react';
import { Coins } from 'lucide-react';
import { useCurrency, CURRENCY_OPTIONS, DisplayCurrency } from '../contexts/CurrencyContext';

export function CurrencySelector({ compact = false }: { compact?: boolean }) {
  const { displayCurrency, setDisplayCurrency } = useCurrency();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const current = CURRENCY_OPTIONS.find((c) => c.code === displayCurrency) ?? CURRENCY_OPTIONS[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 text-gray-200 hover:text-neon-cyan transition-colors touch-manipulation ${
          compact ? 'text-sm px-2 py-1' : 'px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-neon-cyan/30'
        }`}
        aria-label="Select display currency"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Coins size={compact ? 16 : 18} className="text-bitcoin-orange-500" />
        <span className="font-mono font-semibold">{current.symbol}</span>
        {!compact && <span className="text-xs text-gray-500 hidden sm:inline">{current.code}</span>}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div role="listbox" className="absolute right-0 mt-2 w-44 bg-charcoal-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 z-50">
            {CURRENCY_OPTIONS.map((opt) => (
              <button
                key={opt.code}
                type="button"
                role="option"
                aria-selected={displayCurrency === opt.code}
                onClick={() => {
                  setDisplayCurrency(opt.code as DisplayCurrency);
                  setOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-left hover:bg-white/5 flex items-center gap-3 transition-colors ${
                  displayCurrency === opt.code ? 'text-neon-cyan-500 bg-neon-cyan/5' : 'text-gray-200'
                }`}
              >
                <span className="font-mono w-6">{opt.symbol}</span>
                <span className="text-sm">{opt.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}