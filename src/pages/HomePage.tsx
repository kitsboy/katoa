import { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Link } from '../components/Link';
import { Tooltip } from '../components/Tooltip';
import { FeeComparison } from '../components/FeeComparison';
import { supabase } from '../lib/supabase';
import { ArrowRight, Zap, Shield, Globe, CheckCircle2, TrendingUp } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-b from-nightmoon-800 via-nightmoon-700 to-nightmoon-900 text-white">

      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden px-6">
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-mandarin-400/40 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-mandarin-500/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">

          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-nightmoon-600/50 border border-mandarin-400/50 rounded-full mb-8 animate-fade-in shadow-sm backdrop-blur-sm">
            <div className="w-2 h-2 bg-mandarin-400 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-mandarin-300">
              Trusted by creators worldwide
            </span>
          </div>

          <h1 className="text-5xl md:text-[4rem] lg:text-[4.75rem] font-black mb-6 leading-[1.1] tracking-tight">
            Keep <span className="bg-gradient-to-r from-mandarin-400 to-mandarin-500 bg-clip-text text-transparent">100%</span> of
            <br />
            Your Earnings
          </h1>

          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-10 font-medium leading-relaxed">
            Zero fees. Instant Bitcoin payments. Global reach.
            <br />
            <span className="text-slate-400">While competitors take 10-20%, we take nothing.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="min-w-[240px] h-14 text-lg font-bold group"
              >
                Start Earning 100%
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Button>
            </Link>
            <Link href="/compare">
              <Button
                size="lg"
                variant="outline"
                className="min-w-[240px] h-14 text-lg font-bold border-mandarin-400 text-mandarin-400 hover:bg-mandarin-400/10"
              >
                See How We Compare
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-slate-300 text-sm font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-mandarin-400" />
              <span>{stats.volume} sats processed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-mandarin-400" />
              <span>{stats.countries} countries served</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-mandarin-400" />
              <span>0% fees forever</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">

            <Card className="group p-8 bg-nightmoon-700/50 border-mandarin-600/40 hover:border-mandarin-400 hover:shadow-xl hover:shadow-mandarin-500/30 transition-all duration-300 backdrop-blur-sm">
              <Tooltip content="Bitcoin Lightning Network enables instant settlements with sub-cent fees, making micro-transactions economically viable for the first time.">
                <div className="w-16 h-16 bg-gradient-to-br from-mandarin-400 to-mandarin-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-mandarin-500/50 group-hover:scale-110 transition-transform duration-300">
                  <Zap size={32} className="text-white" strokeWidth={2.5} />
                </div>
              </Tooltip>

              <h3 className="text-2xl font-bold text-white mb-3">
                Lightning Fast
                <Tooltip content="Transactions settle in under 1 second, compared to 7+ days on traditional platforms." icon />
              </h3>

              <p className="text-slate-300 leading-relaxed text-lg mb-4">
                Instant Bitcoin payments via Lightning Network. Funds arrive in seconds, not days.
              </p>

              <div className="pt-4 border-t border-mandarin-700/30">
                <div className="text-mandarin-300 font-semibold">vs. 7-day payouts elsewhere</div>
              </div>
            </Card>

            <Card className="group p-8 bg-nightmoon-700/50 border-mandarin-600/40 hover:border-mandarin-400 hover:shadow-xl hover:shadow-mandarin-500/30 transition-all duration-300 backdrop-blur-sm">
              <Tooltip content="Bitcoin has no borders. No banks needed. Works everywhere from Argentina to Zimbabwe.">
                <div className="w-16 h-16 bg-gradient-to-br from-mandarin-500 to-mandarin-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-mandarin-500/50 group-hover:scale-110 transition-transform duration-300">
                  <Globe size={32} className="text-white" strokeWidth={2.5} />
                </div>
              </Tooltip>

              <h3 className="text-2xl font-bold text-white mb-3">
                Truly Global
                <Tooltip content="Unlike Stripe/PayPal that block 50+ countries, Bitcoin works everywhere." icon />
              </h3>

              <p className="text-slate-300 leading-relaxed text-lg mb-4">
                No banks required. Works in 195+ countries. Support anyone, anywhere.
              </p>

              <div className="pt-4 border-t border-mandarin-700/30">
                <div className="text-mandarin-300 font-semibold">vs. ~10 countries with 10% fees</div>
              </div>
            </Card>

            <Card className="group p-8 bg-nightmoon-700/50 border-mandarin-600/40 hover:border-mandarin-400 hover:shadow-xl hover:shadow-mandarin-500/30 transition-all duration-300 backdrop-blur-sm">
              <Tooltip content="Zero-knowledge proofs mean we can verify payments without seeing your data. True privacy by design.">
                <div className="w-16 h-16 bg-gradient-to-br from-mandarin-400 to-mandarin-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-mandarin-500/50 group-hover:scale-110 transition-transform duration-300">
                  <Shield size={32} className="text-white" strokeWidth={2.5} />
                </div>
              </Tooltip>

              <h3 className="text-2xl font-bold text-white mb-3">
                Actually Private
                <Tooltip content="Decentralized means no company owns your data. Encrypted via Nostr protocol." icon />
              </h3>

              <p className="text-slate-300 leading-relaxed text-lg mb-4">
                Zero-knowledge proofs. Encrypted messaging. Your data stays yours.
              </p>

              <div className="pt-4 border-t border-mandarin-700/30">
                <div className="text-mandarin-300 font-semibold">vs. server-based data mining</div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-br from-nightmoon-800 to-nightmoon-700">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-white mb-4">
              Stop Losing <span className="bg-gradient-to-r from-mandarin-400 to-mandarin-500 bg-clip-text text-transparent">Thousands</span> to Fees
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Traditional platforms take 10-20% of everything you earn. We take nothing.
            </p>
          </div>
          <FeeComparison />
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="p-12 bg-gradient-to-br from-mandarin-600 to-mandarin-700 border-mandarin-500/50 shadow-2xl shadow-mandarin-900/50">
            <h2 className="text-4xl font-black text-white mb-4">
              Ready to Keep 100% of Your Earnings?
            </h2>
            <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
              Join thousands of creators who've stopped paying platform fees forever.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="min-w-[200px] shadow-xl"
                >
                  Get Started Free
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
              <Link href="/explore">
                <Button
                  size="lg"
                  variant="outline"
                  className="min-w-[200px] border-2 border-white text-white hover:bg-white/10"
                >
                  Browse Campaigns
                  <TrendingUp className="ml-2" size={20} />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
