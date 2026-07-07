import { Shield, Zap, Globe, Users, Heart, TrendingUp, Lock, DollarSign, X } from 'lucide-react';
import { Card } from '../components/Card';
import { Link } from '../components/Link';
import { Button } from '../components/Button';
import { PageMeta } from '../components/PageMeta';
import { useLanguage } from '../contexts/LanguageContext';

export function AboutPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-charcoal-950 text-white pt-16">
      <PageMeta
        title={t('about.title')}
        description="Learn about KATOA's mission — zero-fee, privacy-first Bitcoin commerce built by creators for creators."
        path="/about"
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
            {t('about.hero.line1')}
            <br />
            <span className="text-gradient-emerald">{t('about.hero.highlight')}</span>
          </h1>

          <p className="text-2xl text-gray-300 mb-8 leading-relaxed">
            {t('about.hero.subtitle')}
          </p>

          <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-emerald-300 font-semibold">{t('about.hero.badge')}</span>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 px-6 bg-charcoal-900/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t('about.problem.title')}
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              {t('about.problem.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-8 bg-red-900/20 border-red-500/30">
              <div className="text-6xl font-black text-red-400 mb-4">20%</div>
              <h3 className="text-2xl font-bold text-white mb-3">OnlyFans</h3>
              <p className="text-gray-300 leading-relaxed mb-3">
                A $10k/month creator loses <span className="text-red-400 font-bold">$24,000 per year</span> to fees.
              </p>
              <div className="text-sm text-gray-400 border-t border-red-500/20 pt-3 mt-3">
                <span className="text-red-300 font-semibold">Requires:</span> Bank account + KYC
              </div>
            </Card>

            <Card className="p-8 bg-orange-900/20 border-orange-500/30">
              <div className="text-6xl font-black text-orange-400 mb-4">10%</div>
              <h3 className="text-2xl font-bold text-white mb-3">Throne</h3>
              <p className="text-gray-300 leading-relaxed mb-3">
                Plus currency conversion. Plus withdrawal delays. Limited to 10 countries.
              </p>
              <div className="text-sm text-gray-400 border-t border-orange-500/20 pt-3 mt-3">
                <span className="text-orange-300 font-semibold">Requires:</span> Bank account + KYC
              </div>
            </Card>

            <Card className="p-8 bg-yellow-900/20 border-yellow-500/30">
              <div className="text-6xl font-black text-yellow-400 mb-4">9%</div>
              <h3 className="text-2xl font-bold text-white mb-3">Linktree</h3>
              <p className="text-gray-300 leading-relaxed mb-3">
                Or pay $40/month for 0% fees. Either way, they're taking your money.
              </p>
              <div className="text-sm text-gray-400 border-t border-yellow-500/20 pt-3 mt-3">
                <span className="text-yellow-300 font-semibold">Requires:</span> Bank account + payment processor
              </div>
            </Card>

            <Card className="p-8 bg-blue-900/20 border-blue-500/30">
              <div className="text-6xl font-black text-blue-400 mb-4">8-10%</div>
              <h3 className="text-2xl font-bold text-white mb-3">Kickstarter</h3>
              <p className="text-gray-300 leading-relaxed mb-3">
                Plus <span className="text-blue-400 font-bold">$5K-25K fulfillment costs</span>. All-or-nothing funding.
              </p>
              <div className="text-sm text-gray-400 border-t border-blue-500/20 pt-3 mt-3">
                <span className="text-blue-300 font-semibold">Requires:</span> Bank account + KYC + fulfillment
              </div>
            </Card>

            <Card className="p-8 bg-cyan-900/20 border-cyan-500/30">
              <div className="text-6xl font-black text-cyan-400 mb-4">8-15%</div>
              <h3 className="text-2xl font-bold text-white mb-3">Indiegogo</h3>
              <p className="text-gray-300 leading-relaxed mb-3">
                5% holdback until delivery. 14-day payout delays. Flexible but costly.
              </p>
              <div className="text-sm text-gray-400 border-t border-cyan-500/20 pt-3 mt-3">
                <span className="text-cyan-300 font-semibold">Requires:</span> Bank account + KYC + fulfillment
              </div>
            </Card>

            <Card className="p-8 bg-emerald-900/30 border-emerald-500/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-bl-lg">
                YOU
              </div>
              <div className="text-6xl font-black text-emerald-400 mb-4">0%</div>
              <h3 className="text-2xl font-bold text-white mb-3">KATOA</h3>
              <p className="text-gray-300 leading-relaxed mb-3">
                No fees. No delays. <span className="text-emerald-400 font-bold">Keep 100%</span> forever.
              </p>
              <div className="text-sm text-emerald-300 border-t border-emerald-500/20 pt-3 mt-3 font-semibold">
                No bank account needed. No KYC.
              </div>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Card className="inline-block p-8 bg-charcoal-900 border-2 border-red-500/30">
              <div className="flex items-center gap-4 mb-6">
                <TrendingUp size={40} className="text-red-400" />
                <div className="text-left">
                  <div className="text-gray-400 text-sm">Average creator loses</div>
                  <div className="text-4xl font-black text-red-400">$12,000-$24,000/year</div>
                </div>
              </div>
              <div className="text-gray-300 text-lg mb-4">
                <span className="text-white font-bold">ALL 5 platforms require:</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="flex items-center gap-2 text-gray-400">
                  <X size={20} className="text-red-400" />
                  Bank account
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <X size={20} className="text-red-400" />
                  KYC verification
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <X size={20} className="text-red-400" />
                  Payment processors
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <X size={20} className="text-red-400" />
                  Geographic limits
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="text-emerald-400 font-bold text-xl mb-2">KATOA requires: NOTHING</div>
                <div className="text-gray-400">Just a Bitcoin Lightning wallet. That's it.</div>
              </div>
            </Card>
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
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              We built KATOA on technology that makes platform fees impossible.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 animate-glow">
                <Zap size={32} className="text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Lightning Network</h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-4">
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
                  <li key={idx} className="flex items-center gap-3 text-gray-400">
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
              <p className="text-gray-300 text-lg leading-relaxed mb-4">
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
                  <li key={idx} className="flex items-center gap-3 text-gray-400">
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
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              When payments flow peer-to-peer on Bitcoin, there's no intermediary to extract fees.
              This isn't a promotional rate. It's how the technology works.
            </p>
          </Card>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 px-6 bg-charcoal-900/30">
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
              <Card key={idx} className="p-8 bg-white/[0.03] backdrop-blur-md border-white/10 hover:border-emerald-500/50 transition-all hover-lift text-center">
                <div className={`w-16 h-16 mx-auto bg-gradient-to-r ${value.color} rounded-2xl flex items-center justify-center mb-6 animate-glow`}>
                  <value.icon size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-gray-400 leading-relaxed">{value.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Competitive Breakdown */}
      <section className="py-20 px-6 bg-gradient-to-b from-charcoal-900/50 to-charcoal-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Every Competitor Falls Short
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              They all have the same fundamental flaw: dependence on traditional banking systems.
            </p>
          </div>

          <div className="space-y-8">
            <Card className="p-8 bg-gradient-to-r from-red-900/20 to-charcoal-950/60 border-red-500/30">
              <div className="flex items-start gap-6">
                <div className="text-5xl">💰</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-3">OnlyFans: 20% Platform Tax</h3>
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    A creator making $10K/month loses <span className="text-red-400 font-bold">$2,000 per month</span> ($24K/year).
                    Plus censorship risk from Mastercard/Visa. Plus account suspension without appeal.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <X size={16} className="text-red-400" />
                      Requires bank account + KYC
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <X size={16} className="text-red-400" />
                      7-day payout delays
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <X size={16} className="text-red-400" />
                      Payment processor censorship
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <X size={16} className="text-red-400" />
                      Limited to supported countries
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-gradient-to-r from-blue-900/20 to-charcoal-950/60 border-blue-500/30">
              <div className="flex items-start gap-6">
                <div className="text-5xl">🚀</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-3">Kickstarter: Fulfillment Nightmare</h3>
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    8-10% platform fees, plus <span className="text-blue-400 font-bold">$5K-25K+ fulfillment costs</span>.
                    All-or-nothing funding means if you don't hit your goal, you get $0.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <X size={16} className="text-blue-400" />
                      Requires bank account + KYC
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <X size={16} className="text-blue-400" />
                      14+ day payout delays
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <X size={16} className="text-blue-400" />
                      Shipping/fulfillment stress
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <X size={16} className="text-blue-400" />
                      One-time funding only
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-gradient-to-r from-cyan-900/20 to-charcoal-950/60 border-cyan-500/30">
              <div className="flex items-start gap-6">
                <div className="text-5xl">🎯</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-3">Indiegogo: Hidden Holdbacks</h3>
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    8-15% total fees including <span className="text-cyan-400 font-bold">5% holdback until delivery</span>.
                    Flexible funding sounds good until you realize they're holding your money hostage.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <X size={16} className="text-cyan-400" />
                      Requires bank account + KYC
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <X size={16} className="text-cyan-400" />
                      14-day payout delays
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <X size={16} className="text-cyan-400" />
                      5% held until product delivery
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <X size={16} className="text-cyan-400" />
                      Fulfillment required
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-gradient-to-r from-yellow-900/20 to-charcoal-950/60 border-yellow-500/30">
              <div className="flex items-start gap-6">
                <div className="text-5xl">🔗</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-3">Linktree: Pay-to-Win Monetization</h3>
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    Free tier: 10% fees. Or pay <span className="text-yellow-400 font-bold">$40/month</span> ($480/year) for 0% fees.
                    Either way, you lose money just to have a landing page.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <X size={16} className="text-yellow-400" />
                      Requires payment processor
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <X size={16} className="text-yellow-400" />
                      Geographic restrictions
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <X size={16} className="text-yellow-400" />
                      9-10% fees or $480/year
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <X size={16} className="text-yellow-400" />
                      Limited to 50 countries
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-gradient-to-r from-orange-900/20 to-charcoal-950/60 border-orange-500/30">
              <div className="flex items-start gap-6">
                <div className="text-5xl">🎁</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-3">Throne: False Advertising</h3>
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    Advertises "0% fees" but actually charges <span className="text-orange-400 font-bold">~10% total</span>.
                    True 0% only works in ~10 countries. Rest pay full freight.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <X size={16} className="text-orange-400" />
                      Requires bank account + KYC
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <X size={16} className="text-orange-400" />
                      7-day withdrawal delays
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <X size={16} className="text-orange-400" />
                      Limited to 10 countries for 0%
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <X size={16} className="text-orange-400" />
                      Hidden currency conversion fees
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Card className="mt-12 p-12 bg-gradient-to-br from-emerald-900/30 to-cyan-900/30 border-emerald-500/50 text-center">
            <Shield size={64} className="text-emerald-400 mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-white mb-4">KATOA: The Only Real Alternative</h3>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              We don't charge fees because we <span className="text-emerald-400 font-bold">can't</span>.
              Bitcoin Lightning payments go directly to you. No intermediary. No bank. No KYC. No geography limits.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              <div className="p-4 bg-white/[0.03] backdrop-blur-md rounded-lg border border-emerald-500/30">
                <div className="text-emerald-400 font-bold mb-2">✓ 0% Fees Forever</div>
                <div className="text-sm text-gray-400">Not promotional. How it works.</div>
              </div>
              <div className="p-4 bg-white/[0.03] backdrop-blur-md rounded-lg border border-emerald-500/30">
                <div className="text-emerald-400 font-bold mb-2">✓ Instant Payouts</div>
                <div className="text-sm text-gray-400">Lightning settles in seconds.</div>
              </div>
              <div className="p-4 bg-white/[0.03] backdrop-blur-md rounded-lg border border-emerald-500/30">
                <div className="text-emerald-400 font-bold mb-2">✓ No Bank Needed</div>
                <div className="text-sm text-gray-400">Just a Lightning wallet.</div>
              </div>
              <div className="p-4 bg-white/[0.03] backdrop-blur-md rounded-lg border border-emerald-500/30">
                <div className="text-emerald-400 font-bold mb-2">✓ 195+ Countries</div>
                <div className="text-sm text-gray-400">Works everywhere equally.</div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Who We Serve
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              KATOA was built for creators the traditional platforms ignore.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 bg-white/[0.03] backdrop-blur-md border-white/10">
              <div className="text-5xl mb-6">🌍</div>
              <h3 className="text-2xl font-bold text-white mb-4">The Unbanked</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Creators in Argentina, Nigeria, Venezuela, Vietnam. Countries where Stripe and PayPal don't work.
              </p>
              <div className="text-emerald-400 font-semibold">195+ countries supported</div>
            </Card>

            <Card className="p-8 bg-white/[0.03] backdrop-blur-md border-white/10">
              <div className="text-5xl mb-6">🔒</div>
              <h3 className="text-2xl font-bold text-white mb-4">The Privacy-Conscious</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Creators who refuse to be surveilled. Who want end-to-end encryption. Who demand data sovereignty.
              </p>
              <div className="text-purple-400 font-semibold">Military-grade privacy</div>
            </Card>

            <Card className="p-8 bg-white/[0.03] backdrop-blur-md border-white/10">
              <div className="text-5xl mb-6">💰</div>
              <h3 className="text-2xl font-bold text-white mb-4">The Ambitious</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Creators earning $10k-$100k+ per month who are sick of losing 10-20% to platform fees.
              </p>
              <div className="text-orange-400 font-semibold">Save $12k-$240k annually</div>
            </Card>
          </div>
        </div>
      </section>

      {/* The Team */}
      <section className="py-20 px-6 bg-gradient-to-b from-charcoal-900/50 to-charcoal-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Built by Creators, For Creators
          </h2>

          <Card className="p-12 bg-white/[0.03] backdrop-blur-md border-white/10 mb-12">
            <Users size={64} className="text-emerald-400 mx-auto mb-6" />
            <p className="text-xl text-gray-300 leading-relaxed mb-6">
              We're a team of creators who got fed up with losing 10-20% of our earnings to platforms.
              So we built something better.
            </p>
            <p className="text-lg text-gray-400 leading-relaxed">
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
                <div key={idx} className="flex items-start gap-3 p-4 bg-charcoal-900 rounded-lg border border-white/10">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Shield size={14} className="text-white" />
                  </div>
                  <span className="text-gray-300 text-lg">{promise}</span>
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

          <p className="text-2xl text-gray-300 mb-12 leading-relaxed">
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
            <Link href="/comparison">
              <Button
                size="lg"
                variant="outline"
                className="min-w-[240px] h-16 text-xl font-bold border-2 border-white/20 hover:border-neon-cyan-500/50 hover:border-emerald-500"
              >
                See the Numbers
              </Button>
            </Link>
          </div>

          <p className="text-gray-500 text-sm mt-8">
            No fees. No KYC. No catches. Just you keeping 100%.
          </p>
        </div>
      </section>
    </div>
  );
}
