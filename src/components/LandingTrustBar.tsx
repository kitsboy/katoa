import { useLanguage } from '../contexts/LanguageContext';

export function LandingTrustBar() {
  const { t } = useLanguage();

  const highlights = [
    {
      value: '0%',
      labelKey: 'trust.fees',
      tip: "Platform fees forever: zero. Katoa never takes a cut of your earnings — no subscriptions, no hidden processing fees. 100% of what supporters send lands with you, instantly, over Bitcoin Lightning.",
    },
    {
      value: '<3s',
      labelKey: 'trust.payout',
      tip: "Payouts settle on the Bitcoin Lightning Network in under 3 seconds — worldwide, around the clock, no banking hours, no middlemen. Your money is yours the moment it's sent.",
    },
    {
      value: '195+',
      labelKey: 'trust.countries',
      tip: "Anyone, anywhere with an internet connection can support you — no bank account, no credit card, no KYC gate. That's true global access for creators and supporters alike.",
    },
    {
      value: '100%',
      labelKey: 'trust.earnings',
      tip: "You keep 100% of your earnings. Non-custodial by design: sats flow straight to your wallet. Katoa never holds your funds, so there's nothing to freeze, seize, or go bankrupt.",
    },
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
              data-tip={item.tip}
              data-tip-title={item.value}
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