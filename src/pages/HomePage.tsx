import { useEffect, useState, lazy, Suspense } from 'react';
import { Link } from '../components/Link';
import { GlassSection } from '../components/GlassSection';
import { HeroMotionBackground } from '../components/HeroMotionBackground';
import { PageMeta } from '../components/PageMeta';
import { supabase } from '../lib/supabase';
import { ArrowRight, Zap, Shield, Globe, ChevronDown } from 'lucide-react';

const FeeComparison = lazy(() => import('../components/FeeComparison').then((m) => ({ default: m.FeeComparison })));

export function HomePage() {
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

      {/* Hero — motion background header only */}
      <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden px-4 sm:px-6 pt-24">
        <HeroMotionBackground />
        <div className="relative z-10 max-w-6xl mx-auto text-center w-full">
          <GlassSection className="max-w-4xl mx-auto" glow="cyan">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-neon-cyan/10 border border-neon-cyan/30 rounded-full mb-6 sm:mb-8 backdrop-blur-sm">
              <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse" />
              <span className="text-xs sm:text-sm font-medium text-neon-cyan">
                Bitcoin-native • Non-custodial • Open Source
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-4 sm:mb-6 leading-tight tracking-tighter">
              <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 mb-1">Keep</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan-400 via-blue-400 to-neon-cyan-500 text-5xl sm:text-7xl md:text-8xl lg:text-9xl py-1 sm:py-2 drop-shadow-[0_0_30px_rgba(20,230,255,0.4)]">
                100%
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-b from-gray-100 to-gray-500 mt-1 text-3xl sm:text-5xl md:text-6xl">
                of Your Earnings
              </span>
            </h1>

            <p className="text-base sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
              <span className="text-white font-semibold">Zero-fee, privacy-first Bitcoin commerce.</span>
              <br className="hidden sm:block" />
              <span className="sm:ml-0"> Protocol-level upgrade to creator monetization.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center w-full sm:min-w-[260px] min-h-[52px] text-base sm:text-lg font-bold bg-neon-cyan-500 text-charcoal-950 hover:bg-neon-cyan-400 shadow-[0_0_40px_rgba(20,230,255,0.3)] transition-all duration-200 rounded-xl touch-manipulation active:scale-[0.98]"
              >
                Start Earning 100%
                <ArrowRight className="ml-2" size={20} />
              </Link>
              <Link
                href="/comparison"
                className="inline-flex items-center justify-center w-full sm:min-w-[260px] min-h-[52px] text-base sm:text-lg font-bold border-2 border-neon-cyan-500 text-neon-cyan-500 hover:bg-neon-cyan-500/10 transition-all duration-200 backdrop-blur-sm rounded-xl touch-manipulation active:scale-[0.98]"
              >
                See How We Compare
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-mono">
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
                <span className="text-bitcoin-orange font-bold">{stats.volume}</span>
                <span className="text-gray-400">processed</span>
              </div>
              <div className="hidden sm:block w-1 h-1 bg-gray-600 rounded-full" />
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
                <span className="text-neon-cyan font-bold">{stats.countries}</span>
                <span className="text-gray-400">countries</span>
              </div>
              <div className="hidden sm:block w-1 h-1 bg-gray-600 rounded-full" />
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
                <span className="text-neon-cyan font-bold">0%</span>
                <span className="text-gray-400">fees forever</span>
              </div>
            </div>
          </GlassSection>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 motion-safe:animate-bounce" aria-hidden="true">
          <ChevronDown size={28} className="text-gray-500" />
        </div>
      </section>

      <section className="relative py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-[10px] uppercase tracking-[0.2em] text-neon-cyan-500 font-semibold mb-3">Protocol</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">Built Different</h2>
          </div>

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
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
              Stop Losing <span className="text-gradient-bitcoin glow-orange">Thousands</span> to Fees
            </h2>
            <p className="text-base sm:text-xl text-gray-400 max-w-2xl mx-auto">See how much you keep with KATOA vs traditional platforms.</p>
          </div>
          <Suspense fallback={<div className="h-64 animate-shimmer bg-white/5 rounded-2xl" />}>
            <FeeComparison />
          </Suspense>
        </div>
      </section>

      <section className="relative py-16 sm:py-20 px-4 sm:px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <GlassSection glow="orange" className="text-center">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">Join the Bitcoin Creator Economy</h2>
            <p className="text-base sm:text-xl text-gray-300 max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed">
              Creators worldwide are stopping platform fees and building true financial freedom.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12">
              <Link href="/dashboard" className="inline-flex items-center justify-center min-h-[52px] min-w-[240px] text-lg font-bold bg-neon-cyan-500 text-charcoal-950 hover:bg-neon-cyan-400 rounded-xl touch-manipulation active:scale-[0.98]">
                Get Started Free <ArrowRight className="ml-2" size={20} />
              </Link>
              <Link href="/explore" className="inline-flex items-center justify-center min-h-[52px] min-w-[240px] text-lg font-bold border-2 border-white/20 text-white hover:bg-white/10 rounded-xl touch-manipulation">
                Browse Campaigns
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-6 sm:pt-8 border-t border-white/10">
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