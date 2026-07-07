import { useEffect, useState, lazy, Suspense } from 'react';
import { Link } from '../components/Link';
import { GlassSection } from '../components/GlassSection';
import { GlassCallout } from '../components/GlassCallout';
import { LandingHero } from '../components/LandingHero';
import { PageMeta } from '../components/PageMeta';
import { SectionHeader } from '../components/SectionHeader';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { ArrowRight, Zap, Shield, Globe } from 'lucide-react';

const FeeComparison = lazy(() => import('../components/FeeComparison').then((m) => ({ default: m.FeeComparison })));
const SocialProofTicker = lazy(() => import('../components/SocialProofTicker').then((m) => ({ default: m.SocialProofTicker })));
const OnboardingChecklist = lazy(() => import('../components/OnboardingChecklist').then((m) => ({ default: m.OnboardingChecklist })));

const howItWorksSteps = [
  { titleKey: 'home.step1.title', descKey: 'home.step1.desc', step: '01' },
  { titleKey: 'home.step2.title', descKey: 'home.step2.desc', step: '02' },
  { titleKey: 'home.step3.title', descKey: 'home.step3.desc', step: '03' },
  { titleKey: 'home.step4.title', descKey: 'home.step4.desc', step: '04' },
];

export function HomePage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({ creators: '2.5K', volume: '₿1.2M', countries: '195+' });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (count) {
        setStats((prev) => ({ ...prev, creators: `${(count / 1000).toFixed(1)}K` }));
      }
    } catch {
      /* use defaults */
    }
  }

  return (
    <div className="min-h-[100dvh] relative bg-charcoal-950">
      <PageMeta
        title="KATOA — Zero-Fee Bitcoin Creator Platform"
        description="Keep 100% of your earnings. Privacy-first wishlists and donations on Bitcoin Lightning. 0% fees forever."
        path="/"
      />

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
          feesLabel: t('home.stats.fees'),
          processedLabel: t('home.stats.processed'),
          countriesLabel: t('home.stats.countries'),
        }}
      />

      <Suspense fallback={null}>
        <SocialProofTicker />
      </Suspense>

      {/* Onboarding checklist */}
      <section className="relative py-12 sm:py-16 px-4 sm:px-6">
        <Suspense fallback={<div className="h-32 animate-shimmer bg-white/5 rounded-2xl" />}>
          <OnboardingChecklist />
        </Suspense>
      </section>

      {/* How it works — horizontal scroll */}
      <section className="relative py-16 sm:py-20 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            eyebrow={t('home.howItWorks.title')}
            title={t('home.howItWorks.title')}
            subtitle={t('home.howItWorks.subtitle')}
          />

          <p className="text-xs text-gray-500 mb-3 sm:hidden flex items-center gap-1">
            <span>Swipe to see all steps</span>
            <span className="text-neon-cyan-400">→</span>
          </p>
          <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {howItWorksSteps.map((item) => (
              <GlassSection
                key={item.step}
                className="min-w-[260px] sm:min-w-[280px] max-w-[300px] shrink-0 snap-start"
              >
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-bitcoin-orange-500 to-amber-600 text-white font-black text-sm shadow-[0_0_24px_rgba(247,147,26,0.25)] mb-4">
                  {item.step}
                </span>
                <h3 className="text-lg font-bold text-white mb-2">{t(item.titleKey)}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{t(item.descKey)}</p>
              </GlassSection>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeader eyebrow={t('home.protocol')} title={t('home.builtDifferent')} />

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { icon: Zap, tag: 'L2 • Lightning', title: 'Instant Settlement', desc: 'Funds settle over Bitcoin Lightning in seconds. No bank intermediaries.', old: '7-14 days', katoa: 'Instant' },
              { icon: Globe, tag: 'Global • 195+', title: 'Universal Access', desc: 'Bitcoin transcends borders. No KYC. True financial inclusion.', old: '~10 countries', katoa: '195+ countries' },
              { icon: Shield, tag: 'Privacy • ZK', title: 'True Privacy', desc: 'Zero-knowledge cryptography. Your data lives on your device.', old: 'Server-based', katoa: 'Zero-knowledge' },
            ].map(({ icon: Icon, tag, title, desc, old, katoa }) => (
              <GlassSection key={title} className="group hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-start justify-between mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-neon-cyan/20 to-neon-cyan/5 rounded-xl flex items-center justify-center border border-neon-cyan/30">
                    <Icon size={28} className="text-neon-cyan" strokeWidth={2} />
                  </div>
                  <div className="text-xs font-mono text-gray-500 bg-white/5 px-2 sm:px-3 py-1 rounded-full">{tag}</div>
                </div>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-white mb-2 sm:mb-3">{title}</h3>
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-4 sm:mb-6">{desc}</p>
                <div className="pt-4 border-t border-white/10 text-sm space-y-2">
                  <div className="flex justify-between"><span className="text-gray-500">Traditional:</span><span className="text-gray-400 font-mono">{old}</span></div>
                  <div className="flex justify-between"><span className="text-neon-cyan font-semibold">KATOA:</span><span className="text-neon-cyan font-mono font-bold">{katoa}</span></div>
                </div>
              </GlassSection>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeader title={t('home.fees.title')} subtitle={t('home.fees.subtitle')} />
          <Suspense fallback={<div className="h-64 animate-shimmer bg-white/5 rounded-2xl" />}>
            <FeeComparison />
          </Suspense>
        </div>
      </section>

      <section className="relative py-16 sm:py-20 px-4 sm:px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <GlassSection glow="orange" className="text-center">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">{t('home.join.title')}</h2>
            <p className="text-base sm:text-xl text-gray-300 max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed">
              {t('home.join.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12">
              <Link href="/dashboard" className="inline-flex items-center justify-center min-h-[52px] min-w-[240px] text-lg font-bold bg-neon-cyan-500 text-charcoal-950 hover:bg-neon-cyan-400 rounded-xl touch-manipulation active:scale-[0.98]">
                {t('home.join.cta')} <ArrowRight className="ml-2" size={20} />
              </Link>
              <Link href="/explore" className="inline-flex items-center justify-center min-h-[52px] min-w-[240px] text-lg font-bold border-2 border-white/20 text-white hover:bg-white/10 rounded-xl touch-manipulation">
                {t('home.join.browse')}
              </Link>
            </div>
            <GlassCallout variant="bitcoin" className="text-left sm:text-center">
              <span className="font-semibold text-white">0% platform fees.</span> Lightning network costs are tiny and typically paid by supporters. KATOA never touches your balance.
            </GlassCallout>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-6 sm:pt-8 mt-8 border-t border-white/10">
              <div className="text-center"><div className="text-2xl sm:text-3xl font-display font-bold text-neon-cyan mb-1">2024</div><div className="text-sm text-gray-500">Launch</div></div>
              <div className="hidden sm:block w-px h-12 bg-white/10" />
              <div className="text-center"><div className="text-2xl sm:text-3xl font-display font-bold text-bitcoin-orange mb-1">{stats.volume}</div><div className="text-sm text-gray-500">Processed</div></div>
              <div className="hidden sm:block w-px h-12 bg-white/10" />
              <div className="text-center"><div className="text-2xl sm:text-3xl font-display font-bold text-neon-cyan mb-1">0%</div><div className="text-sm text-gray-500">Fees</div></div>
            </div>
          </GlassSection>
        </div>
      </section>
    </div>
  );
}