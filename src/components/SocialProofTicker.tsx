import { useLanguage } from '../contexts/LanguageContext';

export function SocialProofTicker() {
  const { t } = useLanguage();
  const wins = [
    t('ticker.1'),
    t('ticker.2'),
    t('ticker.3'),
    t('ticker.4'),
    t('ticker.5'),
  ];

  return (
    <div className="overflow-hidden border-y border-white/5 bg-charcoal-900/50 py-2.5" aria-hidden>
      <div className="flex motion-safe:animate-[ticker_40s_linear_infinite] motion-reduce:animate-none gap-8 whitespace-nowrap">
        {[...wins, ...wins].map((text, i) => (
          <span key={`${text}-${i}`} className="text-xs sm:text-sm text-gray-400 font-medium px-2">
            <span className="text-bitcoin-orange-400 mr-2">✦</span>
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}