import { useLanguage } from '../contexts/LanguageContext';

const PRESETS = [1_000, 5_000, 21_000, 100_000] as const;

interface TipAmountPickerProps {
  value: number | null;
  onChange: (sats: number | null) => void;
  className?: string;
}

/** Quick sats presets + custom for donate flows (mobile-friendly). */
export function TipAmountPicker({ value, onChange, className = '' }: TipAmountPickerProps) {
  const { t } = useLanguage();

  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
        {t('donate.tipAmount')}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {PRESETS.map((sats) => {
          const selected = value === sats;
          return (
            <button
              key={sats}
              type="button"
              onClick={() => onChange(selected ? null : sats)}
              className={`min-h-[44px] rounded-xl border text-sm font-semibold transition-colors touch-manipulation ${
                selected
                  ? 'bg-bitcoin-orange-500/20 border-bitcoin-orange-500/50 text-bitcoin-orange-300'
                  : 'bg-white/5 border-white/10 text-gray-200 hover:border-white/25'
              }`}
              aria-pressed={selected}
            >
              {sats.toLocaleString()} sats
            </button>
          );
        })}
      </div>
      <label className="block mt-3">
        <span className="sr-only">{t('donate.customAmount')}</span>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          placeholder={t('donate.customAmount')}
          value={value && !PRESETS.includes(value as (typeof PRESETS)[number]) ? value : ''}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10);
            onChange(Number.isFinite(n) && n > 0 ? n : null);
          }}
          className="w-full min-h-[44px] rounded-xl bg-white/5 border border-white/10 px-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-neon-cyan-500/50"
        />
      </label>
    </div>
  );
}
