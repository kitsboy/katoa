import { useEffect, useState, lazy, Suspense } from 'react';
import { Link } from '../components/Link';
import { LandingHero } from '../components/LandingHero';
import { LandingTrustBar } from '../components/LandingTrustBar';
import { PageMeta } from '../components/PageMeta';
import { SectionHeader } from '../components/SectionHeader';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ArrowRight, Zap, Shield, Globe } from 'lucide-react';

const FeeComparison = lazy(() => import('../components/FeeComparison').then((m) => ({ default: m.FeeComparison })));
const OnboardingChecklist = lazy(() => import('../components/OnboardingChecklist').then((m) => ({ default: m.OnboardingChecklist })));

const howItWorksSteps = [
  { titleKey: 'home.step1.title', descKey: 'home.step1.desc', step: '01' },
  { titleKey: 'home.step2.title', descKey: 'home.step2.desc', step: '02' },
  { titleKey: 'home.step3.title', descKey: 'home.step3.desc', step: '03' },
  { titleKey: 'home.step4.title', descKey: 'home.step4.desc', step: '04' },
];

const pillars = [
  { icon: Zap, titleKey: 'home.pillar1.title', descKey: 'home.pillar1.desc', oldKey: 'home.pillar1.old', nextKey: 'home.pillar1.next' },
  { icon: Globe, titleKey: 'home.pillar2.title', descKey: 'home.pillar2.desc', oldKey: 'home.pillar2.old', nextKey: 'home.pillar2.next' },
  { icon: Shield, titleKey: 'home.pillar3.title', descKey: 'home.pillar3.desc', oldKey: 'home.pillar3.old', nextKey: 'home.pillar3.next' },
];

export function HomePage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({ creators: '2.5K', volume: '₿1.2M', countries: '195+' });
  const [statsUnavailable, setStatsUnavailable] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    if (!isSupabaseConfigured()) {
      setStatsUnavailable(true);
      return;
    }
    try {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (count) {
        setStats((prev) => ({ ...prev, creators: `${(count / 1000).toFixed(1)}K` }));
        setStatsUnavailable(false);
      }
    } catch {
      setStatsUnavailable(true);
    }
  }

  return (
    <div className="lp-page">
      <PageMeta
        title="KATOA — Zero-Fee Bitcoin Creator Platform"
        description="Keep 100% of your earnings. Privacy-first wishlists and donations on Bitcoin Lightning. 0% fees forever."
        path="/"
      />

      {statsUnavailable && (
        <p className="text-center text-xs text-gray-500 py-2" role="status">
          {t('home.statsUnavailable')}
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
          processedLabel: t('home.stats.processed'),
          countriesLabel: t('home.stats.countries'),
        }}
      />

      <LandingTrustBar />

      <section className="lp-section">
        <div className="lp-container">
          <Suspense fallback={<div className="h-32 lp-skeleton rounded-2xl" />}>
            <OnboardingChecklist />
          </Suspense>
        </div>
      </section>

      <section className="lp-section lp-section-muted">
        <div className="lp-container">
          <SectionHeader
            variant="landing"
            eyebrow={t('home.howItWorks.eyebrow')}
            title={t('home.howItWorks.title')}
            subtitle={t('home.howItWorks.subtitle')}
            align="left"
          />

          <div className="lp-steps">
            {howItWorksSteps.map((item, index) => (
              <article key={item.step} className="lp-step">
                <div className="lp-step-index">
                  <span>{item.step}</span>
                  {index < howItWorksSteps.length - 1 && <div className="lp-step-line" aria-hidden />}
                </div>
                <div className="lp-step-content">
                  <h3>{t(item.titleKey)}</h3>
                  <p>{t(item.descKey)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-section">
        <div className="lp-container">
          <SectionHeader
            variant="landing"
            eyebrow={t('home.protocol')}
            title={t('home.builtDifferent')}
            align="left"
          />

          <div className="lp-bento">
            {pillars.map(({ icon: Icon, titleKey, descKey, oldKey, nextKey }) => (
              <article key={titleKey} className="lp-bento-card">
                <div className="lp-bento-icon">
                  <Icon size={22} strokeWidth={1.75} />
                </div>
                <h3>{t(titleKey)}</h3>
                <p>{t(descKey)}</p>
                <div className="lp-bento-compare">
                  <div>
                    <span>{t('home.bento.traditional')}</span>
                    <strong>{t(oldKey)}</strong>
                  </div>
                  <div>
                    <span>{t('home.bento.katoa')}</span>
                    <strong>{t(nextKey)}</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-section lp-section-muted">
        <div className="lp-container">
          <SectionHeader
            variant="landing"
            title={t('home.fees.title')}
            subtitle={t('home.fees.subtitle')}
            align="left"
          />
          <Suspense fallback={<div className="h-64 lp-skeleton rounded-2xl" />}>
            <FeeComparison variant="landing" />
          </Suspense>
        </div>
      </section>

      <section className="lp-section lp-section-cta">
        <div className="lp-container">
          <div className="lp-cta-panel">
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
              <Link href="/explore?videos=1" className="lp-btn-secondary">
                {t('explore.videoCreators')}
              </Link>
            </div>
            <p className="lp-cta-note">{t('home.cta.note')}</p>
            <div className="lp-cta-stats">
              <div><strong>2024</strong><span>{t('home.cta.launch')}</span></div>
              <div><strong>{stats.volume}</strong><span>{t('home.cta.processed')}</span></div>
              <div><strong>0%</strong><span>{t('home.cta.fees')}</span></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}