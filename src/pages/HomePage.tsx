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
    <div className="min-h-screen bg-gradient-to-b from-cloud-400 via-cloud-500 to-lavender-50">

      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden px-6">
        <div className="absolute inset-0 overflow-hidden opacity-40">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lavender-400/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-mint-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">

          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-mint-600 rounded-full mb-8 animate-fade-in shadow-md backdrop-blur-sm">
            <div className="w-2 h-2 bg-mint-600 rounded-full animate-pulse" />
            <span className="text-sm font-bold text-slate-800 tracking-wide">
              Trusted by creators worldwide
            </span>
          </div>

          <h1 className="text-5xl md:text-[4rem] lg:text-[4.75rem] font-bold mb-6 leading-[1.1] tracking-tight text-slate-900">
            Keep <span className="bg-gradient-to-r from-lavender-600 to-mint-600 bg-clip-text text-transparent">100%</span> of
            <br />
            Your Earnings
          </h1>

          <p className="text-xl md:text-2xl text-slate-800 max-w-3xl mx-auto mb-10 font-medium leading-relaxed">
            Zero fees. Instant Bitcoin payments. Global reach.
            <br />
            <span className="text-slate-900 font-semibold">While competitors take 10-20%, we take nothing.</span>
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
                className="min-w-[240px] h-14 text-lg font-bold"
              >
                See How We Compare
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-slate-800 text-sm font-bold">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-mint-600" />
              <span>{stats.volume} sats processed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-mint-600" />
              <span>{stats.countries} countries served</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-mint-600" />
              <span>0% fees forever</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">

            <Card className="group p-8 bg-lavender-50 border-lavender-300 hover:border-lavender-400 hover:shadow-xl hover:shadow-lavender-300/30 transition-all duration-300">
              <Tooltip content="Bitcoin Lightning Network enables instant settlements with sub-cent fees, making micro-transactions economically viable for the first time.">
                <div className="w-16 h-16 bg-gradient-to-br from-lavender-400 to-lavender-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-lavender-400/30 group-hover:scale-110 transition-transform duration-300">
                  <Zap size={32} className="text-white" strokeWidth={2.5} />
                </div>
              </Tooltip>

              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                Lightning Fast
                <Tooltip content="Transactions settle in under 1 second, compared to 7+ days on traditional platforms." icon />
              </h3>

              <p className="text-slate-800 leading-relaxed text-lg mb-4">
                Instant Bitcoin payments via Lightning Network. Funds arrive in seconds, not days.
              </p>

              <div className="pt-4 border-t border-lavender-200">
                <div className="text-lavender-700 font-bold">vs. 7-day payouts elsewhere</div>
              </div>
            </Card>

            <Card className="group p-8 bg-mint-50 border-mint-300 hover:border-mint-400 hover:shadow-xl hover:shadow-mint-300/30 transition-all duration-300">
              <Tooltip content="Bitcoin has no borders. No banks needed. Works everywhere from Argentina to Zimbabwe.">
                <div className="w-16 h-16 bg-gradient-to-br from-mint-400 to-mint-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-mint-400/30 group-hover:scale-110 transition-transform duration-300">
                  <Globe size={32} className="text-white" strokeWidth={2.5} />
                </div>
              </Tooltip>

              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                Truly Global
                <Tooltip content="Unlike Stripe/PayPal that block 50+ countries, Bitcoin works everywhere." icon />
              </h3>

              <p className="text-slate-800 leading-relaxed text-lg mb-4">
                No banks required. Works in 195+ countries. Support anyone, anywhere.
              </p>

              <div className="pt-4 border-t border-mint-200">
                <div className="text-mint-700 font-bold">vs. ~10 countries with 10% fees</div>
              </div>
            </Card>

            <Card className="group p-8 bg-mocha-50 border-mocha-300 hover:border-mocha-400 hover:shadow-xl hover:shadow-mocha-300/30 transition-all duration-300">
              <Tooltip content="Zero-knowledge proofs mean we can verify payments without seeing your data. True privacy by design.">
                <div className="w-16 h-16 bg-gradient-to-br from-mocha-400 to-mocha-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-mocha-400/30 group-hover:scale-110 transition-transform duration-300">
                  <Shield size={32} className="text-white" strokeWidth={2.5} />
                </div>
              </Tooltip>

              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                Actually Private
                <Tooltip content="Decentralized means no company owns your data. Encrypted via Nostr protocol." icon />
              </h3>

              <p className="text-slate-800 leading-relaxed text-lg mb-4">
                Zero-knowledge proofs. Encrypted messaging. Your data stays yours.
              </p>

              <div className="pt-4 border-t border-mocha-200">
                <div className="text-mocha-700 font-bold">vs. server-based data mining</div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-br from-lavender-100 to-lavender-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Stop Losing <span className="bg-gradient-to-r from-lavender-600 to-mint-600 bg-clip-text text-transparent">Thousands</span> to Fees
            </h2>
            <p className="text-xl text-slate-800 font-semibold max-w-2xl mx-auto">
              Traditional platforms take 10-20% of everything you earn. We take nothing.
            </p>
          </div>
          <FeeComparison />
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="p-12 bg-gradient-to-br from-lavender-600 to-mint-600 border-lavender-500 shadow-2xl shadow-lavender-600/40">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Keep 100% of Your Earnings?
            </h2>
            <p className="text-xl text-white mb-8 max-w-2xl mx-auto font-semibold">
              Join thousands of creators who've stopped paying platform fees forever.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  variant="secondary"
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
                  className="min-w-[200px] shadow-xl bg-white"
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
