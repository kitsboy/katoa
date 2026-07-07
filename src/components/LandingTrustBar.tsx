import { useLanguage } from '../contexts/LanguageContext';

export function LandingTrustBar() {
  const { t } = useLanguage();

  const highlights = [
    { value: '0%', labelKey: 'trust.fees' },
    { value: '<3s', labelKey: 'trust.payout' },
    { value: '195+', labelKey: 'trust.countries' },
    { value: '100%', labelKey: 'trust.earnings' },
  ];

  return (
    <section className="lp-trust" aria-label="Platform highlights">
      <div className="lp-container">
        <div className="lp-trust-grid">
          {highlights.map((item) => (
            <div
              key={item.labelKey}
              className="lp-trust-item"
              aria-label={`${item.value} ${t(item.labelKey)}`}
            >
              <span className="lp-trust-value">{item.value}</span>
              <span className="lp-trust-label">{t(item.labelKey)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}