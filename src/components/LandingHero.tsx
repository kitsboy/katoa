import { Link } from './Link';
import { ArrowRight, Gift, MapPin, Zap } from 'lucide-react';
import { mockWishlistItems } from '../data/mockWishlists';

const FEATURED = {
  title: 'Skateboard Park for Medellín Youth',
  description: 'Transform lives through skateboarding. Building a safe community space where 500+ youth can skate, learn, and grow.',
  cover: '/images/mock/pexels-2a6bfc8ddf.jpeg',
  creator: 'skate_colombia',
  city: 'Medellín',
  country: 'Colombia',
  flag: '🇨🇴',
  raised: 3_250_000,
  goal: 5_000_000,
};

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

function formatSats(n: number) {
  return new Intl.NumberFormat().format(n);
}

function ProductScreenshot() {
  const progress = Math.round((FEATURED.raised / FEATURED.goal) * 100);
  const items = mockWishlistItems['mock-featured'].slice(0, 2);

  return (
    <div className="lp-shot">
      <div className="lp-shot-device">
        <div className="lp-shot-chrome">
          <span className="lp-shot-dot lp-shot-dot--close" />
          <span className="lp-shot-dot lp-shot-dot--min" />
          <span className="lp-shot-dot lp-shot-dot--max" />
          <span className="lp-shot-url">katoa.org/wishlist/medellin-skate-park</span>
        </div>

        <div className="lp-shot-screen">
          <div className="lp-shot-cover">
            <img src={FEATURED.cover} alt={`${FEATURED.title} cover`} width={1260} height={750} loading="eager" fetchPriority="high" />
            <div className="lp-shot-cover-overlay" />
            <div className="lp-shot-cover-copy">
              <div className="lp-shot-title-row">
                <p className="lp-shot-title">{FEATURED.title}</p>
                <span aria-hidden>{FEATURED.flag}</span>
              </div>
              <p>{FEATURED.description}</p>
              <div className="lp-shot-location">
                <MapPin size={12} />
                <span>{FEATURED.city}, {FEATURED.country}</span>
              </div>
            </div>
          </div>

          <div className="lp-shot-body">
            <div className="lp-shot-creator">
              <div className="lp-shot-avatar">{FEATURED.creator[0].toUpperCase()}</div>
              <div>
                <p className="lp-shot-creator-name">@{FEATURED.creator}</p>
                <p className="lp-shot-creator-meta">carlos@getalby.com</p>
              </div>
              <span className="lp-shot-live">Live</span>
            </div>

            <div className="lp-shot-progress">
              <div className="lp-shot-progress-head">
                <span>{formatSats(FEATURED.raised)} sats raised</span>
                <strong>{progress}%</strong>
              </div>
              <div className="lp-shot-progress-bar">
                <div style={{ width: `${progress}%` }} />
              </div>
              <span className="lp-shot-progress-goal">of {formatSats(FEATURED.goal)} sats goal</span>
            </div>

            <button type="button" className="lp-shot-cta" tabIndex={-1} aria-hidden="true">
              <Gift size={15} />
              Send a gift
            </button>

            <div className="lp-shot-items">
              {items.map((item) => (
                <div key={item.id} className="lp-shot-item">
                  <img src={item.image_url} alt={item.title} />
                  <div>
                    <p>{item.title}</p>
                    <span>{formatSats(item.sats_raised)} / {formatSats(item.price_sats)} sats</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
  const metricItems = [
    { value: stats.volume, label: stats.processedLabel, accent: 'orange' as const },
    { value: stats.countries, label: stats.countriesLabel, accent: 'cyan' as const },
    { value: '0%', label: stats.feesLabel, accent: 'emerald' as const },
  ];

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
              <span className="lp-headline-pre">{keepLabel}</span>
              <span className="lp-headline-accent">{percentLabel}</span>
              <span className="lp-headline-sub">{earningsLabel}</span>
            </h1>

            <p className="lp-lead">
              {subtitle}
              <span className="lp-lead-muted"> {subtitle2}</span>
            </p>

            <div className="lp-cta-row">
              <Link href="/dashboard" className="lp-btn-primary">
                {ctaStart}
                <ArrowRight size={17} strokeWidth={2} />
              </Link>
              <Link href="/comparison" className="lp-btn-secondary">
                {ctaCompare}
              </Link>
            </div>

            <div className="lp-hero-proof">
              <span className="lp-proof-chip lp-proof-chip--warm">
                <strong>{stats.creators ?? '2.5K+'}</strong> creators
              </span>
              <span className="lp-proof-chip lp-proof-chip--orange">0% fees</span>
              <span className="lp-proof-chip lp-proof-chip--cyan">
                <Zap size={12} />
                Lightning
              </span>
            </div>
          </div>

          <div className="lp-hero-visual">
            <ProductScreenshot />
          </div>
        </div>

        <div className="lp-metrics">
          {metricItems.map((item) => (
            <div key={item.label} className={`lp-metric lp-metric--${item.accent}`}>
              <span className="lp-metric-value">{item.value}</span>
              <span className="lp-metric-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}