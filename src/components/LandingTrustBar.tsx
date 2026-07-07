const highlights = [
  { value: '0%', label: 'Platform fees' },
  { value: '<3s', label: 'Lightning payout' },
  { value: '195+', label: 'Countries' },
  { value: '100%', label: 'Creator earnings' },
];

export function LandingTrustBar() {
  return (
    <section className="lp-trust" aria-label="Platform highlights">
      <div className="lp-container">
        <div className="lp-trust-grid">
          {highlights.map((item) => (
            <div key={item.label} className="lp-trust-item">
              <span className="lp-trust-value">{item.value}</span>
              <span className="lp-trust-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}