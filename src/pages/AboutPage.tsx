import { Shield, Zap, Globe, Users, Heart, TrendingUp, Lock, DollarSign } from 'lucide-react';
import { Card } from '../components/Card';
import { Link } from '../components/Link';
import { Button } from '../components/Button';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-black text-white">

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
            The Platform That
            <br />
            <span className="text-gradient-emerald">Actually Serves Creators</span>
          </h1>

          <p className="text-2xl text-slate-300 mb-8 leading-relaxed">
            We're not just another platform. We're a movement.
          </p>

          <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-emerald-300 font-semibold">Built by creators, for creators</span>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 px-6 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              The Creator Economy is Broken
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Traditional platforms extract too much. Here's how much creators lose:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 bg-red-900/20 border-red-500/30">
              <div className="text-6xl font-black text-red-400 mb-4">20%</div>
              <h3 className="text-2xl font-bold text-white mb-3">OnlyFans</h3>
              <p className="text-slate-300 leading-relaxed">
                A $10k/month creator loses <span className="text-red-400 font-bold">$24,000 per year</span> to fees.
              </p>
            </Card>

            <Card className="p-8 bg-orange-900/20 border-orange-500/30">
              <div className="text-6xl font-black text-orange-400 mb-4">10%</div>
              <h3 className="text-2xl font-bold text-white mb-3">Throne</h3>
              <p className="text-slate-300 leading-relaxed">
                Plus currency conversion fees. Plus withdrawal delays. Plus limited to 10 countries.
              </p>
            </Card>

            <Card className="p-8 bg-yellow-900/20 border-yellow-500/30">
              <div className="text-6xl font-black text-yellow-400 mb-4">9%</div>
              <h3 className="text-2xl font-bold text-white mb-3">Linktree</h3>
              <p className="text-slate-300 leading-relaxed">
                Or pay $40/month for 0% fees. Either way, they're taking your money.
              </p>
            </Card>
          </div>

          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 border-2 border-red-500/30 rounded-2xl">
              <TrendingUp size={32} className="text-red-400" />
              <div className="text-left">
                <div className="text-slate-400 text-sm">Average creator loses</div>
                <div className="text-3xl font-black text-red-400">$12,000-$24,000/year</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Our Solution: Bitcoin + Decentralization
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              We built KATOA on technology that makes platform fees impossible.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 animate-glow">
                <Zap size={32} className="text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Lightning Network</h3>
              <p className="text-slate-300 text-lg leading-relaxed mb-4">
                Bitcoin's Lightning Network enables instant, near-free transactions globally. No payment processor
                taking a cut. No 7-day delays. No geographic restrictions.
              </p>
              <ul className="space-y-3">
                {[
                  'Settlements in under 1 second',
                  'Works in 195+ countries',
                  'Micropayments down to satoshis',
                  'No bank account required',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-400">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 animate-glow">
                <Shield size={32} className="text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Nostr Protocol</h3>
              <p className="text-slate-300 text-lg leading-relaxed mb-4">
                A decentralized social protocol that makes censorship impossible. Your account, your data,
                your rules. No company can ban you or harvest your information.
              </p>
              <ul className="space-y-3">
                {[
                  'No account suspensions (you own your keys)',
                  'End-to-end encrypted messaging',
                  'Zero-knowledge payment proofs',
                  'Distributed across relays worldwide',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-400">
                    <div className="w-2 h-2 bg-purple-400 rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Card className="p-12 bg-gradient-to-br from-emerald-900/20 to-cyan-900/20 border-emerald-500/30 text-center">
            <DollarSign size={64} className="text-emerald-400 mx-auto mb-6" />
            <h3 className="text-4xl font-bold text-white mb-4">The Result: 0% Fees Forever</h3>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              When payments flow peer-to-peer on Bitcoin, there's no intermediary to extract fees.
              This isn't a promotional rate. It's how the technology works.
            </p>
          </Card>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 px-6 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              What We Stand For
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Heart,
                title: 'Creators First',
                desc: 'Every decision we make prioritizes creator earnings and freedom.',
                color: 'from-pink-500 to-rose-600',
              },
              {
                icon: Shield,
                title: 'Privacy Always',
                desc: 'Zero-knowledge proofs. No data harvesting. Your data stays yours.',
                color: 'from-purple-500 to-indigo-600',
              },
              {
                icon: Globe,
                title: 'Truly Global',
                desc: 'No geographic discrimination. Bitcoin works everywhere, for everyone.',
                color: 'from-cyan-500 to-blue-600',
              },
              {
                icon: Lock,
                title: 'Censorship Proof',
                desc: 'Decentralized by design. No company can ban you or control your content.',
                color: 'from-emerald-500 to-green-600',
              },
            ].map((value, idx) => (
              <Card key={idx} className="p-8 bg-slate-800/50 border-slate-700 hover:border-emerald-500/50 transition-all hover-lift text-center">
                <div className={`w-16 h-16 mx-auto bg-gradient-to-r ${value.color} rounded-2xl flex items-center justify-center mb-6 animate-glow`}>
                  <value.icon size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-slate-400 leading-relaxed">{value.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Who We Serve
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              KATOA was built for creators the traditional platforms ignore.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 bg-gradient-to-br from-slate-800 to-slate-700 border-slate-700">
              <div className="text-5xl mb-6">🌍</div>
              <h3 className="text-2xl font-bold text-white mb-4">The Unbanked</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Creators in Argentina, Nigeria, Venezuela, Vietnam. Countries where Stripe and PayPal don't work.
              </p>
              <div className="text-emerald-400 font-semibold">195+ countries supported</div>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-slate-800 to-slate-700 border-slate-700">
              <div className="text-5xl mb-6">🔒</div>
              <h3 className="text-2xl font-bold text-white mb-4">The Privacy-Conscious</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Creators who refuse to be surveilled. Who want end-to-end encryption. Who demand data sovereignty.
              </p>
              <div className="text-purple-400 font-semibold">Military-grade privacy</div>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-slate-800 to-slate-700 border-slate-700">
              <div className="text-5xl mb-6">💰</div>
              <h3 className="text-2xl font-bold text-white mb-4">The Ambitious</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Creators earning $10k-$100k+ per month who are sick of losing 10-20% to platform fees.
              </p>
              <div className="text-orange-400 font-semibold">Save $12k-$240k annually</div>
            </Card>
          </div>
        </div>
      </section>

      {/* The Team */}
      <section className="py-20 px-6 bg-gradient-to-b from-slate-900 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Built by Creators, For Creators
          </h2>

          <Card className="p-12 bg-slate-800/50 border-slate-700 mb-12">
            <Users size={64} className="text-emerald-400 mx-auto mb-6" />
            <p className="text-xl text-slate-300 leading-relaxed mb-6">
              We're a team of creators who got fed up with losing 10-20% of our earnings to platforms.
              So we built something better.
            </p>
            <p className="text-lg text-slate-400 leading-relaxed">
              We're not venture-backed. We don't answer to investors demanding user growth at all costs.
              We answer to creators. That's why we'll <span className="text-emerald-400 font-bold">never charge fees</span>.
            </p>
          </Card>

          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white">Our Promise</h3>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              {[
                'We will never charge platform fees',
                'We will never harvest your data',
                'We will never ban creators for lawful content',
                'We will always prioritize your earnings over ours',
              ].map((promise, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-slate-900 rounded-lg border border-slate-700">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Shield size={14} className="text-white" />
                  </div>
                  <span className="text-slate-300 text-lg">{promise}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Join the Movement
          </h2>

          <p className="text-2xl text-slate-300 mb-12 leading-relaxed">
            Thousands of creators have already stopped paying platform fees.
            <br />
            <span className="text-emerald-400 font-bold">Be next.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="min-w-[240px] h-16 text-xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700"
              >
                Start Earning 100%
              </Button>
            </Link>
            <Link href="/compare">
              <Button
                size="lg"
                variant="outline"
                className="min-w-[240px] h-16 text-xl font-bold border-2 border-slate-600 hover:border-emerald-500"
              >
                See the Numbers
              </Button>
            </Link>
          </div>

          <p className="text-slate-500 text-sm mt-8">
            No fees. No KYC. No catches. Just you keeping 100%.
          </p>
        </div>
      </section>
    </div>
  );
}
