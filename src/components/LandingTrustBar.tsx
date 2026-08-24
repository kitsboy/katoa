import { useLanguage } from '../contexts/LanguageContext';

export function LandingTrustBar() {
  const { t } = useLanguage();

  const highlights = [
    {
      value: '0%',
      labelKey: 'trust.fees',
      tip: "Platform fee is 0% forever — Katoa takes no cut. Lightning network routing fees still exist and are not paid to Katoa.",
    },
    {
      value: '<3s',
      labelKey: 'trust.payout',
      tip: "Katoa does not run a payout queue. When a supporter pays your Lightning invoice, sats settle to your wallet — typically in seconds, not banking days.",
    },
    {
      value: '195+',
      labelKey: 'trust.countries',
      tip: "Bitcoin is global wherever the internet reaches. Katoa does not geo-block creators. Follow the law where you operate. No fake traction — 195+ is the Bitcoin map, not a Katoa user count.",
    },
    {
      value: '100%',
      labelKey: 'trust.earnings',
      tip: "0% platform fee, non-custodial: sats go to your wallet, not Katoa's. You still pay whatever your wallet or Lightning path charges.",
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