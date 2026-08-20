import { useState } from 'react';
import { Check, Zap, Crown, Rocket, Star, type LucideIcon } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';

interface Tier {
  id: string;
  name: string;
  price_sats: number;
  price_usd: number;
  description: string;
  features: string[];
  icon: LucideIcon;
  iconWrap: string;
  iconColor: string;
  popular?: boolean;
}

interface SubscriptionTiersProps {
  tiers?: Tier[];
  onSubscribe?: (tierId: string) => void;
  creatorName?: string;
}

export function SubscriptionTiers({
  tiers: customTiers,
  onSubscribe,
  creatorName = 'Creator',
}: SubscriptionTiersProps) {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [showBolt12, setShowBolt12] = useState(false);

  const defaultTiers: Tier[] = [
    {
      id: 'supporter',
      name: 'Supporter',
      price_sats: 21000,
      price_usd: 5,
      description: 'Support the journey',
      features: [
        'Access to exclusive updates',
        'Supporter badge',
        'Early content access',
        'Community chat access',
      ],
      icon: Zap,
      iconWrap: 'from-neon-cyan-500/20 to-sky-600/10',
      iconColor: 'text-neon-cyan-400',
    },
    {
      id: 'patron',
      name: 'Patron',
      price_sats: 42000,
      price_usd: 10,
      description: 'Be a true patron',
      features: [
        'Everything in Supporter',
        'Patron badge',
        'Monthly Q&A access',
        'Behind-the-scenes content',
        'Vote on future content',
      ],
      icon: Crown,
      iconWrap: 'from-bitcoin-orange-500/25 to-amber-600/10',
      iconColor: 'text-bitcoin-orange-400',
      popular: true,
    },
    {
      id: 'champion',
      name: 'Champion',
      price_sats: 105000,
      price_usd: 25,
      description: 'Champion level support',
      features: [
        'Everything in Patron',
        'Champion badge',
        '1-on-1 monthly chat',
        'Priority support',
        'Custom content requests',
        'Name in credits',
      ],
      icon: Rocket,
      iconWrap: 'from-emerald-500/20 to-teal-600/10',
      iconColor: 'text-emerald-400',
    },
  ];

  const tiers = customTiers || defaultTiers;

  const handleSubscribe = (tierId: string) => {
    setSelectedTier(tierId);
    setShowBolt12(true);
    onSubscribe?.(tierId);
  };

  return (
    <section className="space-y-8" aria-labelledby="subscribe-heading">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-[10px] uppercase tracking-[0.2em] text-bitcoin-orange-400 font-semibold mb-3">
          Recurring support
        </p>
        <h2 id="subscribe-heading" className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
          Support {creatorName}
        </h2>
        <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-4">
          Choose a Lightning tier. Instant, private, and 0% platform fees — 100% goes to the creator.
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/25 rounded-full">
          <Zap size={14} className="text-emerald-400" aria-hidden />
          <span className="text-emerald-300 font-semibold text-xs">
            BOLT 12 · 100% to creator
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 items-stretch">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          return (
            <div key={tier.id} className={`relative h-full ${tier.popular ? 'pt-4 lg:pt-0' : ''}`}>
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <div className="px-3 py-1 bg-gradient-to-r from-bitcoin-orange-500 to-amber-600 rounded-full flex items-center gap-1.5 shadow-[0_4px_16px_rgba(247,147,26,0.35)]">
                    <Star size={12} className="text-white fill-white" aria-hidden />
                    <span className="text-white font-bold text-[10px] uppercase tracking-wide whitespace-nowrap">
                      Most popular
                    </span>
                  </div>
                </div>
              )}

              <Card
                variant="glass"
                className={`flex flex-col h-full p-5 sm:p-6 ${
                  tier.popular
                    ? 'border-bitcoin-orange-500/50 shadow-[0_0_40px_rgba(247,147,26,0.12)]'
                    : ''
                }`}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tier.iconWrap} border border-white/10 flex items-center justify-center shrink-0`}
                  >
                    <Icon size={22} className={tier.iconColor} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-white leading-tight">{tier.name}</h3>
                    <p className="text-xs text-gray-500">{tier.description}</p>
                  </div>
                </div>

                <div className="mb-5 pb-5 border-b border-white/10">
                  <div className="text-3xl font-black text-white tabular-nums leading-none">
                    {tier.price_sats.toLocaleString()}
                  </div>
                  <p className="text-gray-400 text-sm mt-1.5">
                    sats/month <span className="text-gray-600">(~${tier.price_usd})</span>
                  </p>
                  <p className="text-xs text-emerald-400 font-semibold mt-2">0% fees · 100% to creator</p>
                </div>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check size={16} className="text-emerald-400 shrink-0 mt-0.5" aria-hidden />
                      <span className="text-gray-300 text-sm leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={tier.popular ? 'bitcoin' : 'outline'}
                  className="w-full"
                  onClick={() => handleSubscribe(tier.id)}
                >
                  Subscribe with Lightning
                </Button>
                <p className="mt-3 text-center text-[11px] text-gray-500">
                  Cancel anytime · Instant activation
                </p>
              </Card>
            </div>
          );
        })}
      </div>

      {showBolt12 && selectedTier && (
        <Card className="max-w-xl mx-auto p-6 sm:p-8" variant="glass">
          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-bitcoin-orange-500/25 to-amber-600/10 border border-bitcoin-orange-500/30 flex items-center justify-center">
              <Zap size={28} className="text-bitcoin-orange-400" />
            </div>

            <h3 className="text-xl font-bold text-white mb-1">BOLT 12 subscription</h3>
            <p className="text-gray-400 text-sm mb-6">
              Scan with your Lightning wallet to set up recurring payments
            </p>

            <div className="bg-white rounded-2xl p-6 mb-5 inline-block">
              <div className="w-48 h-48 mx-auto bg-gray-100 rounded-xl flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Zap size={36} className="mx-auto mb-2 text-bitcoin-orange-500" />
                  <p className="text-sm font-semibold">BOLT 12 Offer QR</p>
                  <p className="text-xs">(Integration pending)</p>
                </div>
              </div>
            </div>

            <div className="bg-charcoal-900 rounded-xl p-3 mb-5 text-left">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">BOLT 12 offer</p>
              <code className="text-emerald-400 text-xs break-all font-mono">
                lno1pg257enxv4ezqcneype82um50ynhxgrwdajx293pqe7y75t...
              </code>
            </div>

            <ul className="space-y-2 text-sm text-gray-400 text-left mb-5">
              {[
                'Recurring monthly payment automatically',
                'Cancel anytime from your wallet',
                '100% private — no personal info required',
                '0% platform fees — all funds go to creator',
              ].map((line) => (
                <li key={line} className="flex items-center gap-2">
                  <Check size={16} className="text-emerald-400 shrink-0" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            <Button
              variant="outline"
              onClick={() => {
                setShowBolt12(false);
                setSelectedTier(null);
              }}
            >
              Close
            </Button>
          </div>
        </Card>
      )}

      <p className="text-center text-gray-500 text-xs">
        Powered by Bitcoin Lightning · BOLT 12 native · Zero-knowledge privacy
      </p>
    </section>
  );
}
