import { Link } from './Link';
import { ArrowRight, Gift, MapPin, Zap } from 'lucide-react';
import { mockWishlistItems } from '../data/mockWishlists';

const FEATURED = {
  title: 'Skateboard Park for Medellín Youth',
  description: 'Transform lives through skateboarding. Building a safe community space where 500+ youth can skate, learn, and grow.',
  cover: 'https://images.pexels.com/photos/5793678/pexels-photo-5793678.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
  creator: 'skate_colombia',
  city: 'Medellín',
  country: 'Colombia',
  flag: '🇨🇴',
  raised: 3_250_000,
  goal: 5_000_000,
};

const CREATOR_STACK = [
  'https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=120',
  'https://images.pexels.com/photos/1751731/pexels-photo-1751731.jpeg?auto=compress&cs=tinysrgb&w=120',
  'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=120',
];

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
      <div className="lp-shot-glow" aria-hidden />

      <div className="lp-shot-float lp-shot-float--top">
        <Zap size={14} />
        <span>Instant Lightning payout</span>
      </div>

      <div className="lp-shot-float lp-shot-float--side">
        <span className="lp-shot-float-value">0%</span>
        <span className="lp-shot-float-label">Platform fees</span>
      </div>

      <div className="lp-shot-device">
        <div className="lp-shot-chrome">
          <span className="lp-shot-dot lp-shot-dot--rose" />
          <span className="lp-shot-dot lp-shot-dot--amber" />
          <span className="lp-shot-dot lp-shot-dot--mint" />
          <span className="lp-shot-url">katoa.org/wishlist/medellin-skate-park</span>
        </div>

        <div className="lp-shot-screen">
          <div className="lp-shot-cover">
            <img src={FEATURED.cover} alt="" loading="eager" />
            <div className="lp-shot-cover-overlay" />
            <div className="lp-shot-cover-copy">
              <div className="lp-shot-title-row">
                <h3>{FEATURED.title}</h3>
                <span aria-hidden>{FEATURED.flag}</span>
              </div>
              <p>{FEATURED.description}</p>
              <div className="lp-shot-location">
                <MapPin size={12} />
                <span>{FEATURED.city}, {FEATURED.country}</span>
              </div>
            </div>
            <span className="lp-shot-live">Live</span>
          </div>

          <div className="lp-shot-body">
            <div className="lp-shot-creator">
              <div className="lp-shot-avatar">{FEATURED.creator[0].toUpperCase()}</div>
              <div>
                <p className="lp-shot-creator-name">@{FEATURED.creator}</p>
                <p className="lp-shot-creator-meta">carlos@getalby.com</p>
              </div>
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

            <button type="button" className="lp-shot-cta" tabIndex={-1}>
              <Gift size={16} />
              Send a gift
            </button>

            <div className="lp-shot-items">
              {items.map((item) => (
                <div key={item.id} className="lp-shot-item">
                  <img src={item.image_url} alt="" />
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
  return (
    <section className="lp-hero">
      <div className="lp-hero-bg" aria-hidden>
        <div className="lp-hero-gradient" />
        <div className="lp-hero-blob lp-hero-blob--1" />
        <div className="lp-hero-blob lp-hero-blob--2" />
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
                <ArrowRight size={18} strokeWidth={2} />
              </Link>
              <Link href="/comparison" className="lp-btn-secondary">
                {ctaCompare}
              </Link>
            </div>

            <div className="lp-hero-social">
              <div className="lp-hero-avatars" aria-hidden>
                {CREATOR_STACK.map((src) => (
                  <img key={src} src={src} alt="" />
                ))}
              </div>
              <p>
                <strong>{stats.creators ?? '2.5K+'}</strong> creators earning on their terms
              </p>
            </div>
          </div>

          <div className="lp-hero-visual">
            <ProductScreenshot />
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