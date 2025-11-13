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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-black text-white">

      {/* Hero Section - Concise & Powerful */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden px-6">
        {/* Subtle animated background */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">

          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8 animate-fade-in">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-emerald-300">
              Trusted by {stats.creators}+ creators worldwide
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-[1.1] tracking-tight">
            Keep <span className="text-gradient-emerald">100%</span> of
            <br />
            Your Earnings
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-10 font-medium leading-relaxed">
            Zero fees. Instant Bitcoin payments. Global reach.
            <br />
            <span className="text-slate-400">While competitors take 10-20%, we take nothing.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="min-w-[240px] h-14 text-lg font-bold bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.4)] group"
              >
                Start Earning 100%
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Button>
            </Link>
            <Link href="/compare">
              <Button
                size="lg"
                variant="outline"
                className="min-w-[240px] h-14 text-lg font-bold border-2 border-slate-600 hover:border-emerald-500 hover:bg-emerald-500/5"
              >
                See How We Compare
              </Button>
            </Link>
          </div>

          {/* Social Proof Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-slate-400 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>{stats.volume} sats processed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>{stats.countries} countries served</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>0% fees forever</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Value Props - 3 Cards */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">

            {/* Card 1: Lightning Fast */}
            <Card className="group p-8 bg-gradient-to-br from-slate-800/80 to-slate-700/80 border-slate-700 hover:border-emerald-500/50 transition-all duration-300 hover-lift">
              <Tooltip content="Bitcoin Lightning Network enables instant settlements with sub-cent fees, making micro-transactions economically viable for the first time.">
                <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-glow">
                  <Zap size={28} className="text-white" />
                </div>
              </Tooltip>

              <h3 className="text-2xl font-bold text-white mb-3">
                Lightning Fast
                <Tooltip content="Transactions settle in under 1 second, compared to 7+ days on traditional platforms." icon />
              </h3>

              <p className="text-slate-400 leading-relaxed text-lg mb-4">
                Instant Bitcoin payments via Lightning Network. Funds arrive in seconds, not days.
              </p>

              <div className="pt-4 border-t border-slate-700">
                <div className="text-emerald-400 font-semibold">vs. 7-day payouts elsewhere</div>
              </div>
            </Card>

            {/* Card 2: Truly Global */}
            <Card className="group p-8 bg-gradient-to-br from-slate-800/80 to-slate-700/80 border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover-lift">
              <Tooltip content="Bitcoin has no borders. No banks needed. Works everywhere from Argentina to Zimbabwe.">
                <div className="w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-glow">
                  <Globe size={28} className="text-white" />
                </div>
              </Tooltip>

              <h3 className="text-2xl font-bold text-white mb-3">
                Truly Global
                <Tooltip content="Unlike Stripe/PayPal that block 50+ countries, Bitcoin works everywhere." icon />
              </h3>

              <p className="text-slate-400 leading-relaxed text-lg mb-4">
                No banks required. Works in 195+ countries. Support anyone, anywhere.
              </p>

              <div className="pt-4 border-t border-slate-700">
                <div className="text-cyan-400 font-semibold">vs. ~10 countries with 10% fees</div>
              </div>
            </Card>

            {/* Card 3: Actually Private */}
            <Card className="group p-8 bg-gradient-to-br from-slate-800/80 to-slate-700/80 border-slate-700 hover:border-purple-500/50 transition-all duration-300 hover-lift">
              <Tooltip content="Zero-knowledge proofs mean we can verify payments without seeing your data. True privacy by design.">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-glow">
                  <Shield size={28} className="text-white" />
                </div>
              </Tooltip>

              <h3 className="text-2xl font-bold text-white mb-3">
                Actually Private
                <Tooltip content="Decentralized means no company owns your data. Encrypted via Nostr protocol." icon />
              </h3>

              <p className="text-slate-400 leading-relaxed text-lg mb-4">
                Zero-knowledge proofs. Encrypted messaging. Your data stays yours.
              </p>

              <div className="pt-4 border-t border-slate-700">
                <div className="text-purple-400 font-semibold">vs. server-based data mining</div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Fee Comparison - The Killer Feature */}
      <section className="py-20 px-6 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto">
          <FeeComparison />
        </div>
      </section>

      {/* Use Cases - Quick Overview */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Built for Creators Who Keep 100%
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Everything Throne, Linktree, and OnlyFans offer. Without the fees.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🎁', title: 'Wishlists', desc: 'Like Throne, but 0% fees', tooltip: 'Create wishlists for gifts, crowdfund items, instant delivery' },
              { icon: '⚡', title: 'Subscriptions', desc: 'Unlike OnlyFans, you keep 100%', tooltip: 'BOLT 12 recurring payments on-chain, no intermediary' },
              { icon: '🔗', title: 'Link-in-Bio', desc: 'Like Linktree, but free', tooltip: 'Unlimited links, full customization, zero monthly fees' },
              { icon: '💬', title: 'Private DMs', desc: 'Encrypted via Nostr', tooltip: 'End-to-end encrypted messaging, no server surveillance' },
            ].map((item, idx) => (
              <Tooltip key={idx} content={item.tooltip} position="bottom">
                <Card className="p-8 text-center bg-slate-800/50 border-slate-700 hover:border-emerald-500/50 transition-all hover-lift cursor-help flex flex-col items-center justify-start h-full">
                  <div className="text-5xl mb-6">{item.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3 min-h-[2rem] flex items-center">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </Card>
              </Tooltip>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Clear & Compelling */}
      <section className="py-32 px-6 bg-gradient-to-b from-slate-900 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-2xl mb-8 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.5)] animate-float">
            <TrendingUp size={40} className="text-white" />
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Stop Losing Money to Platform Fees
          </h2>

          <p className="text-xl md:text-2xl text-slate-300 mb-10 leading-relaxed">
            A creator earning $10k/month loses <span className="text-red-400 font-bold">$12,000-$24,000 per year</span> to fees.
            <br />
            <span className="text-emerald-400 font-bold">With KATOA? $0.</span>
          </p>

          <Link href="/dashboard">
            <Button
              size="lg"
              className="h-16 px-12 text-xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.5)]"
            >
              Create Your Free Account
              <ArrowRight className="ml-3" size={24} />
            </Button>
          </Link>

          <p className="text-slate-500 text-sm mt-6">
            No credit card. No KYC. No fees. Ever.
          </p>
        </div>
      </section>
    </div>
  );
}
