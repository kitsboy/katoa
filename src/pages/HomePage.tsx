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
    <div className="min-h-screen bg-gradient-to-b from-sand-tan-50 via-white to-sand-tan-100">

      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden px-4 sm:px-6">
        <div className="absolute inset-0 overflow-hidden opacity-40">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-sand-tan-400/30 to-orange-500/30 rounded-full blur-3xl animate-subtle-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-night-blue-400/30 to-cyan-500/30 rounded-full blur-3xl animate-subtle-pulse" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl animate-subtle-pulse" style={{ animationDelay: '3s' }} />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(225,179,130,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-30"></div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">

          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 border-2 border-emerald-500 rounded-full mb-8 animate-fade-in shadow-lg backdrop-blur-md hover:scale-105 transition-transform duration-300 cursor-default">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-bold text-emerald-900 tracking-wide">
              Trusted by creators worldwide
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-[4rem] lg:text-[4.75rem] font-bold mb-6 leading-[1.1] tracking-tight text-night-blue-shadow px-2">
            Keep <span className="bg-gradient-to-r from-sand-tan-600 via-orange-500 to-night-blue-600 bg-clip-text text-transparent animate-gradient">100%</span> of
            <br />
            Your Earnings
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-night-blue-500 max-w-3xl mx-auto mb-10 font-medium leading-relaxed px-2">
            Own Every Satoshi. Participate Everywhere. Build Anything.
            <br />
            <span className="text-night-blue-shadow font-semibold">Restricted to no one. First time ever.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 px-4">
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

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-night-blue-500 text-xs sm:text-sm font-bold px-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-sand-tan-200 hover:border-sand-tan-400 hover:bg-white/80 transition-all duration-300 hover:scale-105">
              <CheckCircle2 size={18} className="text-sand-tan-600" />
              <span>{stats.volume} sats processed</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-sand-tan-200 hover:border-sand-tan-400 hover:bg-white/80 transition-all duration-300 hover:scale-105">
              <CheckCircle2 size={18} className="text-sand-tan-600" />
              <span>{stats.countries} countries served</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-sand-tan-200 hover:border-sand-tan-400 hover:bg-white/80 transition-all duration-300 hover:scale-105">
              <CheckCircle2 size={18} className="text-sand-tan-600" />
              <span>0% fees forever</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">

            <Card className="group p-6 sm:p-8 bg-white border-sand-tan-300 hover:border-orange-400 hover:shadow-xl hover:shadow-orange-300/30 transition-all duration-500">
              <Tooltip content="Lightning Network settles Bitcoin payments in milliseconds with near-zero fees. This revolutionary technology makes micropayments economically viable, enabling new business models impossible with traditional finance. Your money moves at the speed of the internet." position="bottom">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-orange-500/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <Zap size={44} className="text-white" strokeWidth={3} />
                </div>
              </Tooltip>

              <h3 className="text-2xl font-bold text-night-blue-shadow mb-3">
                Lightning Fast
                <Tooltip content="Settlement in seconds, not weeks. While traditional platforms hold your money for 7-14 days, Lightning Network delivers instant access to your earnings. Build your financial freedom without waiting." icon position="bottom" />
              </h3>

              <p className="text-night-blue-800 leading-relaxed text-lg mb-4 font-semibold">
                Instant Bitcoin payments via Lightning Network. Funds arrive in seconds, not days.
              </p>

              <div className="pt-4 border-t border-orange-200">
                <div className="text-white font-bold text-base bg-orange-500 py-2 px-4 rounded-lg inline-block">vs. 7-day payouts elsewhere</div>
              </div>
            </Card>

            <Card className="group p-6 sm:p-8 bg-white border-sand-tan-300 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-300/30 transition-all duration-300">
              <Tooltip content="Bitcoin transcends borders and banking systems. Whether you're in New York or Nigeria, Tokyo or Tanzania, your supporters can fund your dreams. No government can shut you down. No bank can deny you service. True financial inclusion for all humanity." position="bottom">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <Globe size={44} className="text-white" strokeWidth={3} />
                </div>
              </Tooltip>

              <h3 className="text-2xl font-bold text-night-blue-shadow-700 mb-3">
                Truly Global
                <Tooltip content="195+ countries. Zero discrimination. While competitors cherry-pick wealthy nations and charge 10-20% fees, Bitcoin serves everyone equally. The unbanked are no longer excluded. This is financial democracy." icon position="bottom" />
              </h3>

              <p className="text-night-blue-800 leading-relaxed text-lg mb-4 font-semibold">
                No banks required. Works in 195+ countries. Support anyone, anywhere.
              </p>

              <div className="pt-4 border-t border-blue-200">
                <div className="text-white font-bold text-base bg-blue-500 py-2 px-4 rounded-lg inline-block">vs. ~10 countries with 10% fees</div>
              </div>
            </Card>

            <Card className="group p-6 sm:p-8 bg-white border-sand-tan-300 hover:border-green-400 hover:shadow-xl hover:shadow-green-300/30 transition-all duration-300">
              <Tooltip content="Zero-knowledge cryptography proves transactions without revealing your identity. Nostr protocol encrypts your messages end-to-end. Your data lives on your device, not our servers. We can't sell what we don't have. Privacy is your birthright." position="bottom">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-green-500/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <Shield size={44} className="text-white" strokeWidth={3} />
                </div>
              </Tooltip>

              <h3 className="text-2xl font-bold text-night-blue-shadow mb-3">
                Actually Private
                <Tooltip content="Decentralized architecture means no central authority controls your account. No CEO can delete you. No government can freeze you. Your identity, your data, your rules. This is sovereignty in the digital age." icon position="bottom" />
              </h3>

              <p className="text-night-blue-800 leading-relaxed text-lg mb-4 font-semibold">
                Zero-knowledge proofs. Encrypted messaging. Your data stays yours.
              </p>

              <div className="pt-4 border-t border-green-200">
                <div className="text-white font-bold text-base bg-green-500 py-2 px-4 rounded-lg inline-block">vs. server-based data mining</div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gradient-to-br from-lavender-100 to-lavender-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-night-blue-shadow mb-4 px-2">
              Stop Losing <span className="bg-gradient-to-r from-sand-tan-600 to-night-blue-600 bg-clip-text text-transparent">Thousands</span> to Fees
            </h2>
            <p className="text-lg sm:text-xl text-night-blue-500 font-semibold max-w-2xl mx-auto px-2">
              Traditional platforms take 10-20% of everything you earn. We take nothing.
            </p>
          </div>
          <FeeComparison />
        </div>
      </section>

      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="p-6 sm:p-12 bg-gradient-to-br from-sand-tan-500 to-night-blue-500 border-sand-tan-400 shadow-2xl shadow-sand-tan-600/40">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Keep 100% of Your Earnings?
            </h2>
            <p className="text-lg sm:text-xl text-white mb-8 max-w-2xl mx-auto font-semibold">
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
