import { useState, useEffect, useRef } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Link } from '../components/Link';
import { FeeComparison } from '../components/FeeComparison';
import { PageMeta } from '../components/PageMeta';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SectionHeader } from '../components/SectionHeader';
import { GlassCallout } from '../components/GlassCallout';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Check,
  Zap,
  Globe,
  Lock,
  Bitcoin,
  Users,
  BarChart3,
  Share2,
  Shield,
  RefreshCw,
  Sparkles,
  Heart,
  Building2,
  ArrowRight,
  Infinity,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const features = [
  {
    icon: Infinity,
    title: '0% Platform Fees',
    description: 'Keep every sat you earn. No tiers, no upsells, no surprises—ever.',
    accent: 'text-bitcoin-orange-400',
    glow: 'from-bitcoin-orange-500/20',
  },
  {
    icon: Zap,
    title: 'Instant Lightning',
    description: 'Donations settle in seconds over Bitcoin Lightning. No 7-day holds.',
    accent: 'text-neon-cyan-400',
    glow: 'from-neon-cyan-500/20',
  },
  {
    icon: Globe,
    title: 'Global by Default',
    description: 'Accept support from 195+ countries without currency conversion fees.',
    accent: 'text-emerald-400',
    glow: 'from-emerald-500/20',
  },
  {
    icon: Lock,
    title: 'No Banking Required',
    description: 'Start without a bank account, KYC, or payment processor approval.',
    accent: 'text-violet-400',
    glow: 'from-violet-500/20',
  },
  {
    icon: Bitcoin,
    title: 'On-Chain & Lightning',
    description: 'Supporters pay however their wallet works—main chain or L2.',
    accent: 'text-amber-400',
    glow: 'from-amber-500/20',
  },
  {
    icon: Users,
    title: 'Unlimited Wishlists',
    description: 'Create as many wishlists and projects as you need, all included.',
    accent: 'text-sky-400',
    glow: 'from-sky-500/20',
  },
  {
    icon: BarChart3,
    title: 'Live Analytics',
    description: 'Track contributions, followers, and goals in real time on your dashboard.',
    accent: 'text-pink-400',
    glow: 'from-pink-500/20',
  },
  {
    icon: Share2,
    title: 'Shareable Pages',
    description: 'Beautiful public wishlist pages with QR codes and social-ready links.',
    accent: 'text-teal-400',
    glow: 'from-teal-500/20',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Decentralized infrastructure. You own your keys, data, and audience.',
    accent: 'text-emerald-400',
    glow: 'from-emerald-500/20',
  },
  {
    icon: RefreshCw,
    title: 'BOLT 12 Recurring',
    description: 'Offer subscription tiers with reusable Lightning invoices for supporters.',
    accent: 'text-orange-400',
    glow: 'from-orange-500/20',
  },
];

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    audience: 'Individuals & fans',
    icon: Heart,
    iconBg: 'from-sky-500/20 to-blue-600/20',
    iconColor: 'text-sky-400',
    highlights: [
      'Create unlimited wishlists',
      'Receive Bitcoin donations',
      'Share on social media',
      'Basic analytics',
    ],
    cta: 'Get Started Free',
    href: '/auth',
    variant: 'outline' as const,
    popular: false,
  },
  {
    id: 'creator',
    name: 'Creator',
    audience: 'Serious creators',
    icon: Sparkles,
    iconBg: 'from-bitcoin-orange-500/25 to-amber-600/25',
    iconColor: 'text-bitcoin-orange-400',
    highlights: [
      'Everything in Starter',
      'Custom wishlist themes',
      'Advanced analytics',
      'Supporter update emails',
      'Priority support',
    ],
    cta: 'Start Creating',
    href: '/auth',
    variant: 'bitcoin' as const,
    popular: true,
  },
  {
    id: 'organization',
    name: 'Organization',
    audience: 'Nonprofits & teams',
    icon: Building2,
    iconBg: 'from-emerald-500/20 to-teal-600/20',
    iconColor: 'text-emerald-400',
    highlights: [
      'Everything in Creator',
      'Team collaboration',
      'Verified org badge',
      'Donor receipt tools',
      'Dedicated onboarding',
    ],
    cta: 'Contact Us',
    href: '/contact',
    variant: 'outline' as const,
    popular: false,
  },
];

const steps = [
  {
    step: '01',
    title: 'Create Your Profile',
    description: 'Sign up in minutes—no bank link, no ID upload. Connect a Lightning wallet when you are ready.',
  },
  {
    step: '02',
    title: 'Build Your Wishlist',
    description: 'Add goals, media, and your story. Organize campaigns under projects if you run multiple causes.',
  },
  {
    step: '03',
    title: 'Share Your Link',
    description: 'Post your page anywhere. QR codes and embeddable links make it easy for supporters to find you.',
  },
  {
    step: '04',
    title: 'Receive Bitcoin',
    description: 'Donations land instantly in your wallet. Zero platform cut. Minimal Lightning network fees only.',
  },
];

const pricingFaqs = [
  {
    question: 'Are there really zero platform fees?',
    answer: 'Yes — forever. KATOA charges 0% on every donation. You only pay tiny Lightning network fees, typically fractions of a cent.',
  },
  {
    question: 'Do I need a bank account or KYC?',
    answer: 'No. Sign up with email, Google, or Nostr. Connect a Lightning wallet when you are ready to receive — no identity verification required.',
  },
  {
    question: 'How fast do I receive donations?',
    answer: 'Instantly. Lightning settlements arrive in seconds, directly to your wallet. No 7-day holds or payout minimums.',
  },
];

export function PricingPage() {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyCta(!entry.isIntersecting),
      { threshold: 0, rootMargin: '0px' }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-charcoal-950 text-white">
      <PageMeta
        title="Pricing"
        description="KATOA pricing: $0/month, 0% platform fees forever. Keep 100% of your Bitcoin earnings on Lightning."
        path="/pricing"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-20">
        <Breadcrumbs items={[{ label: t('pricing.title') }]} />
      </div>
      {/* Hero */}
      <section ref={heroRef} className="relative pt-8 sm:pt-12 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-bitcoin-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute top-32 right-1/4 w-96 h-96 bg-neon-cyan-500/8 rounded-full blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bitcoin-orange-500/10 border border-bitcoin-orange-500/30 mb-6">
            <Bitcoin size={16} className="text-bitcoin-orange-400" />
            <span className="text-sm font-medium text-bitcoin-orange-300">0% fees · Forever · For everyone</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-black mb-4 leading-tight">
            <span className="text-white">{t('pricing.title')}</span>
            <span className="block mt-1 bg-gradient-to-r from-bitcoin-orange-400 via-amber-300 to-neon-cyan-400 bg-clip-text text-transparent">
              {t('pricing.subtitle')}
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            One price for every creator, nonprofit, and cause on KATOA:{' '}
            <span className="text-white font-semibold">nothing.</span> No monthly bills. No percentage skim. Just Bitcoin,
            direct to you.
          </p>

          <div className="mt-8 inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-6 px-6 py-4 rounded-2xl bg-white/[0.04] border border-white/10">
            <div className="text-center sm:text-left">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-1">Platform fee</p>
              <p className="text-4xl sm:text-5xl font-black text-bitcoin-orange-400 leading-none">
                0<span className="text-2xl">%</span>
              </p>
            </div>
            <div className="hidden sm:block w-px h-12 bg-white/10" />
            <div className="text-center sm:text-left">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-1">Monthly cost</p>
              <p className="text-4xl sm:text-5xl font-black text-neon-cyan-400 leading-none">
                $0
              </p>
            </div>
            <div className="hidden sm:block w-px h-12 bg-white/10" />
            <div className="text-center sm:text-left">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-1">You keep</p>
              <p className="text-4xl sm:text-5xl font-black text-emerald-400 leading-none">
                100<span className="text-2xl">%</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">Built for how you give</h2>
            <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
              Same zero-fee promise on every plan—pick the workflow that fits your mission.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch pt-2">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <div key={plan.id} className={`relative h-full ${plan.popular ? 'pt-5' : ''}`}>
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full bg-gradient-to-r from-bitcoin-orange-500 to-amber-600 text-white text-xs font-bold uppercase tracking-wide whitespace-nowrap shadow-[0_4px_16px_rgba(247,147,26,0.35)]">
                      Most popular
                    </div>
                  )}

                  <Card
                    variant="glass"
                    hover
                    className={`flex flex-col p-6 sm:p-8 h-full ${
                      plan.popular
                        ? 'border-bitcoin-orange-500/50 shadow-[0_0_40px_rgba(247,147,26,0.12)] lg:scale-[1.02]'
                        : ''
                    }`}
                  >
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${plan.iconBg} border border-white/10 flex items-center justify-center`}
                    >
                      <Icon size={22} className={plan.iconColor} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                      <p className="text-xs text-gray-500">{plan.audience}</p>
                    </div>
                  </div>

                  <div className="mb-6 pb-6 border-b border-white/10">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white">$0</span>
                      <span className="text-gray-500 text-sm">/month</span>
                    </div>
                    <p className="mt-1 text-sm text-bitcoin-orange-400 font-semibold">0% platform fee</p>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.highlights.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-gray-300">
                        <Check size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href={plan.href} className="block mt-auto">
                    <Button variant={plan.variant} className="w-full gap-2">
                      {plan.popular && <Zap size={18} />}
                      {plan.cta}
                    </Button>
                  </Link>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10 Features */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] uppercase tracking-[0.2em] text-neon-cyan-500 font-semibold mb-3">Everything included</p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-3">10 features. Zero extra cost.</h2>
            <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
              The full KATOA toolkit ships on day one—no paywalls, no &ldquo;pro&rdquo; upsells, no fine print.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  variant="glass"
                  hover
                  className="p-5 sm:p-6 group"
                >
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.glow} to-transparent border border-white/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}
                  >
                    <Icon size={20} className={feature.accent} />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2 leading-snug">{feature.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Savings calculator */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">See what you save</h2>
            <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
              Drag the slider—other platforms take thousands. KATOA takes nothing.
            </p>
          </div>
          <FeeComparison />
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto">
          <Card variant="glass" className="p-6 sm:p-10 lg:p-12 overflow-visible">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">How it works</h2>
              <p className="text-gray-400 text-sm sm:text-base">From sign-up to your first sat in four steps</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {steps.map((item, index) => (
                <div key={item.step} className="relative text-center sm:text-left">
                  {index < steps.length - 1 && (
                    <div
                      className="hidden lg:block absolute top-6 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px bg-gradient-to-r from-bitcoin-orange-500/40 to-transparent"
                      aria-hidden
                    />
                  )}
                  <div className="inline-flex sm:flex items-center justify-center sm:justify-start gap-3 mb-4">
                    <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-bitcoin-orange-500 to-amber-600 text-white font-black text-sm shadow-[0_0_24px_rgba(247,147,26,0.25)]">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>

            <GlassCallout variant="bitcoin" className="mt-10 text-center">
              <span className="font-semibold text-white">No hidden fees.</span> Lightning network costs are tiny and
              typically paid by supporters. KATOA never touches your balance.
            </GlassCallout>
          </Card>

          {/* Mini FAQ */}
          <div className="mt-12 sm:mt-16">
            <SectionHeader
              eyebrow="FAQ"
              title="Quick answers"
              subtitle="Three things creators ask most about zero-fee pricing"
            />
            <div className="space-y-3 max-w-3xl mx-auto">
              {pricingFaqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={faq.question} className="bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full px-4 sm:px-6 py-4 flex items-center justify-between text-left hover:bg-white/[0.04] transition-colors min-h-[56px] touch-manipulation"
                      aria-expanded={isOpen}
                    >
                      <h3 className="text-base sm:text-lg font-semibold text-white pr-4">{faq.question}</h3>
                      {isOpen ? <ChevronUp className="text-gray-400 shrink-0" size={20} /> : <ChevronDown className="text-gray-400 shrink-0" size={20} />}
                    </button>
                    {isOpen && (
                      <div className="px-4 sm:px-6 py-4 border-t border-white/10 bg-charcoal-900/50">
                        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-center mt-6">
              <Link href="/faq" className="text-sm text-neon-cyan-400 hover:underline">
                View full FAQ →
              </Link>
            </p>
          </div>

          {/* CTA */}
          <div className="mt-10 sm:mt-12 text-center">
            <h3 className="text-xl sm:text-2xl font-display font-bold text-white mb-3">Ready to keep 100%?</h3>
            <p className="text-gray-400 text-sm sm:text-base mb-6 max-w-md mx-auto">
              Join creators who stopped paying platform taxes and started building on Bitcoin.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/auth">
                <Button variant="bitcoin" size="lg" className="w-full sm:w-auto gap-2 min-w-[200px]">
                  <Zap size={18} />
                  Start Free
                </Button>
              </Link>
              <Link href="/comparison">
                <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 min-w-[200px]">
                  Compare Platforms
                  <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {showStickyCta && (
        <div className="md:hidden fixed bottom-[calc(56px+env(safe-area-inset-bottom))] inset-x-0 z-40 px-4 pb-2 animate-slide-up">
          <div className="max-w-lg mx-auto p-3 rounded-2xl bg-charcoal-950/95 backdrop-blur-xl border border-bitcoin-orange-500/30 shadow-[0_-8px_32px_rgba(0,0,0,0.5)] flex gap-2">
            <Link href="/auth" className="flex-1">
              <Button variant="bitcoin" className="w-full font-bold min-h-[48px]">
                <Zap size={18} className="mr-2" />
                Start Free
              </Button>
            </Link>
            <Link href="/comparison" className="shrink-0">
              <Button variant="outline" className="min-h-[48px] px-4 border-white/15">
                Compare
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}