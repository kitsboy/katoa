import { Link } from './Link';
import { ArrowRight } from 'lucide-react';

interface LandingHeroProps {
  badge: string;
  keepLabel: string;
  percentLabel: string;
  earningsLabel: string;
  subtitle: string;
  subtitle2: string;
  ctaStart: string;
  ctaCompare: string;
  stats: {
    volume: string;
    countries: string;
    feesLabel: string;
    processedLabel: string;
    countriesLabel: string;
    creators?: string;
  };
}

function ProductPreview() {
  return (
    <div className="lp-preview">
      <div className="lp-preview-chrome">
        <span className="lp-preview-dot" />
        <span className="lp-preview-dot" />
        <span className="lp-preview-dot" />
        <span className="lp-preview-label">Creator dashboard</span>
      </div>
      <div className="lp-preview-body">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-gray-500 mb-1">Wishlist</p>
            <p className="text-lg font-semibold text-white">Medellín Skate Park</p>
          </div>
          <span className="lp-preview-pill">Live</span>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Funded</span>
            <span className="text-white font-medium">65%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div className="h-full w-[65%] rounded-full bg-white" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="lp-preview-stat">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Raised</span>
            <span className="text-base font-semibold text-white font-mono">₿ 0.42</span>
          </div>
          <div className="lp-preview-stat">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Fee taken</span>
            <span className="text-base font-semibold text-emerald-400 font-mono">0%</span>
          </div>
        </div>

        <div className="lp-preview-footer">
          <span>Payout</span>
          <span className="text-white font-medium">Instant · Lightning</span>
        </div>
      </div>
    </div>
  );
}

export function LandingHero({
  badge,
  keepLabel,
  percentLabel,
  earningsLabel,
  subtitle,
  subtitle2,
  ctaStart,
  ctaCompare,
  stats,
}: LandingHeroProps) {
  return (
    <section className="lp-hero">
      <div className="lp-hero-bg" aria-hidden>
        <div className="lp-hero-gradient" />
      </div>

      <div className="lp-hero-inner">
        <div className="lp-hero-grid">
          <div className="lp-hero-copy">
            <p className="lp-eyebrow">{badge}</p>

            <h1 className="lp-headline">
              <span className="block text-gray-400 text-lg sm:text-xl font-medium mb-3 tracking-tight">
                {keepLabel}
              </span>
              <span className="lp-headline-accent">{percentLabel}</span>
              <span className="block mt-4 text-2xl sm:text-3xl font-medium text-white tracking-tight">
                {earningsLabel}
              </span>
            </h1>

            <p className="lp-lead">
              {subtitle}
              <span className="text-gray-500"> {subtitle2}</span>
            </p>

            <div className="lp-cta-row">
              <Link href="/dashboard" className="lp-btn-primary">
                {ctaStart}
                <ArrowRight size={18} strokeWidth={2} />
              </Link>
              <Link href="/comparison" className="lp-btn-secondary">
                {ctaCompare}
              </Link>
            </div>
          </div>

          <div className="lp-hero-visual">
            <ProductPreview />
          </div>
        </div>

        <div className="lp-metrics">
          {[
            { value: stats.volume, label: stats.processedLabel },
            { value: stats.countries, label: stats.countriesLabel },
            { value: '0%', label: stats.feesLabel },
          ].map((item) => (
            <div key={item.label} className="lp-metric">
              <span className="lp-metric-value">{item.value}</span>
              <span className="lp-metric-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}