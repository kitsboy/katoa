import { useEffect, useState } from 'react';
import { Link } from '../components/Link';
import { LandingHero } from '../components/LandingHero';
import { TrustProofStrip } from '../components/TrustProofStrip';
import { PageMeta } from '../components/PageMeta';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { fetchProductMetrics, homeStatsFromMetrics, type HomeStats } from '../lib/productMetrics';
import { ArrowRight } from 'lucide-react';
import { CreatorDiscoveryGrid } from '../components/CreatorDiscoveryGrid';
import { mockWishlists } from '../data/mockWishlists';
import type { CreatorVideoWishlist } from '../components/CreatorVideoCard';

const discoveryCreators: CreatorVideoWishlist[] = [
  mockWishlists.find((w) => w.slug === 'luna-exclusive-videos'),
  mockWishlists.find((w) => w.slug === 'sasha-vip-content'),
  mockWishlists.find((w) => w.slug === 'medellin-skate-park'),
  mockWishlists.find((w) => w.slug === 'paul-artist-guitar'),
].filter(Boolean) as CreatorVideoWishlist[];

export function HomePage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<HomeStats>({
    creators: '—',
    volume: '—',
    countries: '195+',
    source: 'unavailable',
    isDemoSample: false,
  });

  useEffect(() => {
    void loadStats();
  }, []);

  async function loadStats() {
    const metrics = await fetchProductMetrics();
    if (metrics) setStats(homeStatsFromMetrics(metrics));

    if (!isSupabaseConfigured()) return;

    try {
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      if (typeof count === 'number' && count > 0) {
        setStats((prev) => ({
          ...prev,
          creators: count >= 1000 ? `${(count / 1000).toFixed(1)}K` : String(count),
          source: 'supabase',
          isDemoSample: false,
        }));
      }
    } catch {
      // Keep the honest sample or unavailable state.
    }
  }

  return (
    <div className="lp-page" data-theme="dark">
      <PageMeta title={t('home.metaTitle')} description={t('home.metaDesc')} path="/" />

      {stats.source === 'unavailable' && (
        <p className="text-center text-sm text-gray-200 py-2 px-4" role="status">
          {t('home.statsUnavailable')}
        </p>
      )}
      {stats.isDemoSample && stats.source === 'metrics' && (
        <p className="text-center text-sm text-bitcoin-orange-300 py-2 px-4" role="status">
          {t('home.statsSample')}
        </p>
      )}

      <LandingHero
        badge={t('home.badge')}
        keepLabel={t('home.keep')}
        percentLabel={t('home.percent')}
        earningsLabel={t('home.earnings')}
        subtitle={t('home.subtitle')}
        subtitle2={t('home.subtitle2')}
        ctaStart={t('home.cta.start')}
        ctaCompare={t('home.cta.compare')}
        stats={{
          volume: stats.volume,
          countries: stats.countries,
          creators: stats.creators,
          feesLabel: t('home.stats.fees'),
          processedLabel: stats.isDemoSample ? t('home.stats.sampleRaised') : t('home.stats.processed'),
          countriesLabel: t('home.stats.countries'),
        }}
      />

      <section className="lp-section lp-section-muted py-12 sm:py-16" aria-labelledby="home-discovery-heading">
        <div className="lp-container">
          <CreatorDiscoveryGrid creators={discoveryCreators} t={t} />
        </div>
      </section>

      <section className="lp-section py-12 sm:py-16" aria-labelledby="home-how-heading">
        <div className="lp-container max-w-5xl">
          <div className="max-w-2xl mb-8">
            <p className="lp-section-eyebrow">{t('home.howItWorks.eyebrow')}</p>
            <h2 id="home-how-heading" className="lp-section-title">{t('home.howItWorks.title')}</h2>
            <p className="lp-section-subtitle">{t('home.howItWorks.subtitle')}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              ['01', t('home.step1.title'), t('home.step1.desc')],
              ['02', t('home.step2.title'), t('home.step2.desc')],
              ['03', t('home.step3.title'), t('home.step3.desc')],
              ['04', t('home.step4.title'), t('home.step4.desc')],
            ].map(([step, title, description]) => (
              <article key={step} className="lp-bento-card !p-5">
                <span className="text-xs font-bold tracking-widest text-bitcoin-orange-300">{step}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-section lp-section-cta py-12 sm:py-16">
        <div className="lp-container">
          <div className="lp-cta-panel">
            <TrustProofStrip compact className="mb-6" />
            <h2>{t('home.join.title')}</h2>
            <p>{t('home.join.subtitle')}</p>
            <div className="lp-cta-row lp-cta-row-center">
              <Link href="/dashboard" className="lp-btn-primary">
                {t('home.join.cta')}
                <ArrowRight size={18} strokeWidth={2} />
              </Link>
              <Link href="/explore" className="lp-btn-secondary">
                {t('home.join.browse')}
              </Link>
            </div>
            <p className="lp-cta-note">{t('home.cta.note')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
