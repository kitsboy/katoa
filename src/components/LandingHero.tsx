import { Link } from './Link';
import { ArrowRight, Gift, MapPin, Zap } from 'lucide-react';
import { mockWishlistItems } from '../data/mockWishlists';
import { useLanguage } from '../contexts/LanguageContext';

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
  const { t } = useLanguage();
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
            <img src={FEATURED.cover} alt={t('home.shot.coverAlt').replace('${title}', t('home.shot.title'))} width={1260} height={750} loading="eager" fetchPriority="high" />
            <div className="lp-shot-cover-overlay" />
            <div className="lp-shot-cover-copy">
              <div className="lp-shot-title-row">
                <p className="lp-shot-title">{t('home.shot.title')}</p>
                <span aria-hidden>{FEATURED.flag}</span>
              </div>
              <p>{t('home.shot.description')}</p>
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
              <span className="lp-shot-live" title={t('home.shot.demoTitle')}>{t('demo.badge')}</span>
            </div>

            <div className="lp-shot-progress" data-tip={t('home.shot.progressTip')}>
              <div className="lp-shot-progress-head">
                <span>{t('home.shot.satsRaised').replace('${n}', formatSats(FEATURED.raised))}</span>
                <strong>{progress}%</strong>
              </div>
              <div className="lp-shot-progress-bar" role="img" aria-label={t('home.shot.fundedPct').replace('${pct}', String(progress))}>
                <div style={{ width: `${progress}%` }} />
              </div>
              <span className="lp-shot-progress-goal">{t('home.shot.ofGoal').replace('${n}', formatSats(FEATURED.goal))}</span>
            </div>

            <button type="button" className="lp-shot-cta" tabIndex={-1} aria-hidden="true">
              <Gift size={15} />
              {t('home.shot.sendGift')}
            </button>

            <div className="lp-shot-items">
              {items.map((item) => (
                <div key={item.id} className="lp-shot-item">
                  <img src={item.image_url} alt={item.title} width={36} height={36} />
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
  const { t } = useLanguage();
  const metricItems = [
    { value: stats.volume, label: stats.processedLabel, accent: 'orange' as const, tip: t('home.tip.volume') },
    { value: stats.countries, label: stats.countriesLabel, accent: 'cyan' as const, tip: t('home.tip.countries') },
    { value: '0%', label: stats.feesLabel, accent: 'emerald' as const, tip: t('home.tip.fees') },
  ];

  return (
    <section className="lp-hero">
      <div className="lp-hero-bg" aria-hidden>
        <div className="lp-hero-gradient" />
      </div>

      <div className="lp-hero-inner">
        <div className="lp-hero-grid">
          <div className="lp-hero-copy">
            <p className="lp-eyebrow" data-tip={t('home.tip.eyebrow')}>{badge}</p>

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
                <strong>{stats.creators ?? '—'}</strong> {t('home.chip.creators')}
              </span>
              <span className="lp-proof-chip lp-proof-chip--orange">{t('home.chip.zeroFees')}</span>
              <span className="lp-proof-chip lp-proof-chip--cyan">
                <Zap size={12} />
                {t('home.chip.lightning')}
              </span>
            </div>
          </div>

          <div className="lp-hero-visual">
            <ProductScreenshot />
          </div>
        </div>

        <div className="lp-metrics">
          {metricItems.map((item) => (
            <div key={item.label} className={`lp-metric lp-metric--${item.accent}`} data-tip={item.tip}>
              <span className="lp-metric-value">{item.value}</span>
              <span className="lp-metric-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}