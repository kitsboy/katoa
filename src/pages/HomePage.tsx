import { useEffect, useState } from 'react';
import { Link } from '../components/Link';
import { GlassSection } from '../components/GlassSection';
import { LightningField } from '../components/LightningField';
import { FeeComparison } from '../components/FeeComparison';
import { supabase } from '../lib/supabase';
import { ArrowRight, Zap, Shield, Globe, ChevronDown } from 'lucide-react';
import { BitcoinPulse } from '../components/BitcoinPulse';
import { ProtocolUpdates } from '../components/ProtocolUpdates';

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
        setStats(prev => ({ ...prev, creators: `${(count / 1000).toFixed(1)}K` }));
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  return (
    <div className="min-h-screen relative">
      <LightningField />

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6 pt-24">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/katoa-hero-bg.jpg"
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'blur(0.5px)', opacity: 0.5 }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal-950/40 via-charcoal-950/60 to-charcoal-950/90"></div>
        </div>
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <GlassSection className="max-w-4xl mx-auto" glow="cyan">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-neon-cyan/10 border border-neon-cyan/30 rounded-full mb-8 backdrop-blur-sm">
              <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse" />
              <span className="text-sm font-medium text-neon-cyan">
                Bitcoin-native • Non-custodial • Open Source
              </span>
            </div>

            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl font-black mb-6 leading-tight tracking-tighter">
              <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 mb-2">Keep</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan-400 via-blue-400 to-neon-cyan-500 glow-cyan text-7xl sm:text-8xl md:text-9xl py-2 drop-shadow-[0_0_30px_rgba(20,230,255,0.4)]">100%</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-b from-gray-100 to-gray-500 mt-2">of Your Earnings</span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
              <span className="text-white font-semibold">Zero-fee, privacy-first Bitcoin commerce.</span>
              <br />
              Protocol-level upgrade to creator monetization.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 relative z-20">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center min-w-[260px] h-14 text-lg font-bold bg-neon-cyan-500 text-charcoal-950 hover:bg-neon-cyan-400 shadow-[0_0_40px_rgba(20,230,255,0.3)] hover:shadow-[0_0_60px_rgba(20,230,255,0.5)] transition-all duration-200 rounded-lg cursor-pointer"
              >
                Start Earning 100%
                <ArrowRight className="ml-2" size={20} />
              </Link>
              <Link
                href="/compare"
                className="inline-flex items-center justify-center min-w-[260px] h-14 text-lg font-bold border-2 border-neon-cyan-500 text-neon-cyan-500 hover:bg-neon-cyan-500/10 transition-all duration-200 backdrop-blur-sm rounded-lg cursor-pointer"
              >
                See How We Compare
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-mono">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
                <span className="text-bitcoin-orange font-bold">{stats.volume}</span>
                <span className="text-gray-400">sats processed</span>
              </div>
              <div className="w-1 h-1 bg-gray-600 rounded-full animate-pulse" />
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
                <span className="text-bitcoin-orange font-bold">{stats.countries}</span>
                <span className="text-gray-400">countries</span>
              </div>
              <div className="w-1 h-1 bg-gray-600 rounded-full animate-pulse" />
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
                <span className="text-neon-cyan font-bold">0%</span>
                <span className="text-gray-400">fees forever</span>
              </div>
            </div>
          </GlassSection>

          <div className="mt-8">
            <BitcoinPulse />
          </div>

          <div className="mt-8">
            <ProtocolUpdates />
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown size={32} className="text-gray-500" />
        </div>
      </section>

      <section className="relative py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-neon-cyan/10 border border-neon-cyan/30 rounded-full mb-6">
              <Zap size={18} className="text-neon-cyan" />
              <span className="text-sm font-medium text-neon-cyan">
                Protocol Specifications
              </span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              Built Different
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <GlassSection className="group hover:-translate-y-2 transition-all duration-200">
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-neon-cyan/20 to-neon-cyan/5 rounded-xl flex items-center justify-center border border-neon-cyan/30">
                  <Zap size={32} className="text-neon-cyan" strokeWidth={2} />
                </div>
                <div className="text-xs font-mono text-gray-500 bg-white/5 px-3 py-1 rounded-full">
                  L2 • Lightning
                </div>
              </div>

              <h3 className="text-2xl font-display font-bold text-white mb-3">
                Instant Settlement
              </h3>

              <p className="text-gray-400 leading-relaxed mb-6">
                Funds settle over Bitcoin's Lightning Network in seconds. No bank intermediaries. No waiting periods.
              </p>

              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Traditional platforms:</span>
                  <span className="text-gray-400 font-mono">7-14 days</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-neon-cyan font-semibold">KATOA:</span>
                  <span className="text-neon-cyan font-mono font-bold glow-cyan">Instant</span>
                </div>
              </div>
            </GlassSection>

            <GlassSection className="group hover:-translate-y-2 transition-all duration-200">
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-neon-cyan/20 to-neon-cyan/5 rounded-xl flex items-center justify-center border border-neon-cyan/30">
                  <Globe size={32} className="text-neon-cyan" strokeWidth={2} />
                </div>
                <div className="text-xs font-mono text-gray-500 bg-white/5 px-3 py-1 rounded-full">
                  Global • 195+
                </div>
              </div>

              <h3 className="text-2xl font-display font-bold text-white mb-3">
                Universal Access
              </h3>

              <p className="text-gray-400 leading-relaxed mb-6">
                Bitcoin transcends borders and banking systems. No KYC. No discrimination. True financial inclusion.
              </p>

              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Traditional platforms:</span>
                  <span className="text-gray-400 font-mono">~10 countries</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-neon-cyan font-semibold">KATOA:</span>
                  <span className="text-neon-cyan font-mono font-bold glow-cyan">195+ countries</span>
                </div>
              </div>
            </GlassSection>

            <GlassSection className="group hover:-translate-y-2 transition-all duration-200">
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-neon-cyan/20 to-neon-cyan/5 rounded-xl flex items-center justify-center border border-neon-cyan/30">
                  <Shield size={32} className="text-neon-cyan" strokeWidth={2} />
                </div>
                <div className="text-xs font-mono text-gray-500 bg-white/5 px-3 py-1 rounded-full">
                  Privacy • ZK
                </div>
              </div>

              <h3 className="text-2xl font-display font-bold text-white mb-3">
                True Privacy
              </h3>

              <p className="text-gray-400 leading-relaxed mb-6">
                Zero-knowledge cryptography. Encrypted messaging. Your data lives on your device, not our servers.
              </p>

              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Traditional platforms:</span>
                  <span className="text-gray-400 font-mono">Server-based</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-neon-cyan font-semibold">KATOA:</span>
                  <span className="text-neon-cyan font-mono font-bold glow-cyan">Zero-knowledge</span>
                </div>
              </div>
            </GlassSection>
          </div>
        </div>
      </section>

      <section className="relative py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              Stop Losing <span className="text-gradient-bitcoin glow-orange">Thousands</span> to Fees
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              See exactly how much money you're leaving on the table with traditional platforms.
            </p>
          </div>
          <FeeComparison />
        </div>
      </section>

      <section className="relative py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <GlassSection glow="cyan" className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-bitcoin-orange/10 border border-bitcoin-orange/30 rounded-full mb-6">
              <Zap size={18} className="text-bitcoin-orange" />
              <span className="text-sm font-medium text-bitcoin-orange">
                A Movement to Democratize Giving
              </span>
            </div>

            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-6">
              Join the Bitcoin Creator Economy
            </h2>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
              Thousands of creators!!! worldwide have stopped paying platform fees and started building true financial freedom.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 relative z-20">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center min-w-[240px] h-14 text-lg font-bold bg-neon-cyan-500 text-charcoal-950 hover:bg-neon-cyan-400 shadow-[0_0_40px_rgba(20,230,255,0.3)] transition-all duration-200 rounded-lg cursor-pointer"
              >
                Get Started Free
                <ArrowRight className="ml-2" size={20} />
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center justify-center min-w-[240px] h-14 text-lg font-bold border-2 border-white/20 text-white hover:bg-white/10 transition-all duration-200 backdrop-blur-sm rounded-lg cursor-pointer"
              >
                Browse Campaigns
              </Link>
            </div>

            <div className="flex items-center justify-center gap-8 pt-8 border-t border-white/10">
              <div className="text-center">
                <div className="text-3xl font-display font-bold text-neon-cyan glow-cyan mb-1">2024</div>
                <div className="text-sm text-gray-500">Launch</div>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="text-center">
                <div className="text-3xl font-display font-bold text-bitcoin-orange glow-orange mb-1">{stats.volume}</div>
                <div className="text-sm text-gray-500">Processed</div>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="text-center">
                <div className="text-3xl font-display font-bold text-neon-cyan glow-cyan mb-1">Next</div>
                <div className="text-sm text-gray-500">Global Scale</div>
              </div>
            </div>
          </GlassSection>
        </div>
      </section>
    </div>
  );
}
