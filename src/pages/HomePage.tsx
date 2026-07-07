import { useEffect, useState, lazy, Suspense } from 'react';
import { Link } from '../components/Link';
import { GlassSection } from '../components/GlassSection';
import { GlassCallout } from '../components/GlassCallout';
import { HeroMotionBackground } from '../components/HeroMotionBackground';
import { HeroOverlayCard } from '../components/HeroOverlayCard';
import { PageMeta } from '../components/PageMeta';
import { SectionHeader } from '../components/SectionHeader';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { ArrowRight, Zap, Shield, Globe, ChevronDown } from 'lucide-react';

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

      {/* Hero */}
      <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden px-3 sm:px-6 pt-28 sm:pt-32 pb-16">
        <HeroMotionBackground />
        <div className="relative z-10 max-w-5xl mx-auto text-center w-full">
          <HeroOverlayCard>
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] mb-6 sm:mb-8">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-neon-cyan-400 opacity-60 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-cyan-500" />
              </span>
              <span className="text-[11px] sm:text-xs font-medium tracking-wide text-gray-300 uppercase">
                {t('home.badge')}
              </span>
            </div>

            <h1 className="font-display font-bold tracking-tight mb-5 sm:mb-6">
              <span className="block text-3xl sm:text-4xl md:text-5xl text-white/90 mb-2 sm:mb-3">
                {t('home.keep')}
              </span>
              <span className="block text-6xl sm:text-7xl md:text-8xl lg:text-[7.5rem] font-black leading-[0.9] hero-headline-accent">
                {t('home.percent')}
              </span>
              <span className="block mt-3 sm:mt-4 text-xl sm:text-2xl md:text-3xl text-gray-400 font-medium">
                {t('home.earnings')}
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-gray-400 max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed">
              {t('home.subtitle')}
              <span className="hidden sm:inline"> · </span>
              <span className="block sm:inline mt-1 sm:mt-0 text-gray-500">{t('home.subtitle2')}</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8 sm:mb-10 max-w-md sm:max-w-none mx-auto">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center min-h-[48px] sm:min-h-[52px] px-8 text-sm sm:text-base font-semibold bg-white text-charcoal-950 hover:bg-gray-100 rounded-full transition-all duration-200 touch-manipulation active:scale-[0.98] shadow-[0_0_32px_rgba(255,255,255,0.15)]"
              >
                {t('home.cta.start')}
                <ArrowRight className="ml-2" size={18} strokeWidth={2.5} />
              </Link>
              <Link
                href="/comparison"
                className="inline-flex items-center justify-center min-h-[48px] sm:min-h-[52px] px-8 text-sm sm:text-base font-semibold text-white/90 border border-white/15 hover:border-white/30 hover:bg-white/[0.06] rounded-full transition-all duration-200 touch-manipulation active:scale-[0.98]"
              >
                {t('home.cta.compare')}
              </Link>
            </div>

            <div className="inline-flex flex-wrap items-center justify-center gap-px p-1 rounded-2xl border border-white/[0.08] bg-black/20">
              {[
                { value: stats.volume, label: t('home.stats.processed'), accent: 'text-bitcoin-orange-400' },
                { value: stats.countries, label: t('home.stats.countries'), accent: 'text-neon-cyan-400' },
                { value: '0%', label: t('home.stats.fees'), accent: 'text-emerald-400' },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className={`hero-stat-pill flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-left sm:text-center ${
                    i > 0 ? 'border-l border-white/[0.06] sm:border-l-0' : ''
                  }`}
                >
                  <span className={`text-sm sm:text-base font-bold font-mono tabular-nums ${stat.accent}`}>
                    {stat.value}
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">{stat.label}</span>
                </div>
              ))}
            </div>
          </HeroOverlayCard>
        </div>

        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 motion-safe:animate-bounce" aria-hidden="true">
          <span className="text-[10px] uppercase tracking-widest text-gray-600">Scroll</span>
          <ChevronDown size={20} className="text-gray-500" strokeWidth={1.5} />
        </div>
      </section>

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