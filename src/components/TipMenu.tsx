import { useState } from 'react';
import { Zap } from 'lucide-react';
import { Button } from './Button';
import { useLanguage } from '../contexts/LanguageContext';
import { getCreatorTipPresets } from '../lib/dmPrefs';

const DEFAULTS = [21_000, 50_000, 100_000];

/**
 * Creator tip menu — quick sats presets (21k / 50k / custom).
 * Used on wishlist profile sidebar & gift flow.
 */
export function TipMenu({
  onSelect,
  presets,
  className = '',
}: {
  onSelect: (sats: number) => void;
  presets?: number[];
  className?: string;
}) {
  const { t } = useLanguage();
  const [custom, setCustom] = useState('');
  const list = presets?.length ? presets : getCreatorTipPresets();
  const chips = list.length ? list : DEFAULTS;

  return (
    <div className={`rounded-2xl border border-bitcoin-orange-500/25 bg-bitcoin-orange-500/5 p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Zap size={16} className="text-bitcoin-orange-400" aria-hidden />
        <p className="text-sm font-bold text-white">{t('tipMenu.title')}</p>
      </div>
      <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">{t('tipMenu.help')}</p>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {chips.slice(0, 3).map((sats) => (
          <button
            key={sats}
            type="button"
            onClick={() => onSelect(sats)}
            className="min-h-[48px] rounded-xl border border-bitcoin-orange-500/35 bg-bitcoin-orange-500/10 text-bitcoin-orange-200 font-bold text-sm hover:bg-bitcoin-orange-500/20 transition-colors touch-manipulation"
          >
            {(sats / 1000).toFixed(0)}k
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <label className="sr-only" htmlFor="tip-custom">
          {t('tipMenu.custom')}
        </label>
        <input
          id="tip-custom"
          type="number"
          inputMode="numeric"
          min={1}
          placeholder={t('tipMenu.custom')}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          className="flex-1 min-h-[48px] rounded-xl bg-black/40 border border-white/10 px-3 text-sm text-white font-mono"
        />
        <Button
          type="button"
          variant="outline"
          className="min-h-[48px] shrink-0"
          onClick={() => {
            const n = parseInt(custom, 10);
            if (Number.isFinite(n) && n > 0) onSelect(n);
          }}
        >
          {t('tipMenu.go')}
        </Button>
      </div>
    </div>
  );
}
