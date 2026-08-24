import { useState } from 'react';
import { Check, Zap, Crown, Rocket, Star, type LucideIcon } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { DemoBadge } from './DemoBadge';

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
  const unlocked = selectedTier ? tiers.find((t) => t.id === selectedTier) : null;

  const handleSubscribe = (tierId: string) => {
    setSelectedTier(tierId);
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
          Choose a Lightning tier. 0% platform fees — when invoices settle, 100% goes to the creator.
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-bitcoin-orange-500/10 border border-bitcoin-orange-500/25 rounded-full">
          <DemoBadge
            label="Demo"
            title="Local unlock on this device until Lightning webhooks exist"
          />
          <span className="text-bitcoin-orange-200 font-semibold text-xs">
            Local seam · not a live invoice
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
                  className="w-full min-h-[44px]"
                  onClick={() => handleSubscribe(tier.id)}
                >
                  Subscribe with Lightning
                </Button>
                <p className="mt-3 text-center text-[11px] text-gray-500">
                  DEMO · Unlocks on this device until Lightning webhooks exist
                </p>
              </Card>
            </div>
          );
        })}
      </div>

      {unlocked && (
        <Card className="max-w-xl mx-auto p-6 sm:p-8" variant="glass">
          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-bitcoin-orange-500/25 to-amber-600/10 border border-bitcoin-orange-500/30 flex items-center justify-center">
              <Check size={28} className="text-emerald-400" />
            </div>

            <div className="flex items-center justify-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-white">{unlocked.name} unlocked on this device</h3>
              <DemoBadge label="Demo" title="Local seam — not a Lightning payment" />
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Unlocks on this device until Lightning webhooks exist. This is not a live invoice or BOLT 12 offer.
            </p>

            <ul className="space-y-2 text-sm text-gray-400 text-left mb-5">
              {[
                'Content unlock is stored in this browser only',
                'No Lightning payment was sent',
                'When webhooks ship, the same button will request a real invoice',
                '0% platform fees — all settled funds go to the creator',
              ].map((line) => (
                <li key={line} className="flex items-center gap-2">
                  <Check size={16} className="text-emerald-400 shrink-0" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            <Button
              variant="outline"
              className="min-h-[44px]"
              onClick={() => setSelectedTier(null)}
            >
              Close
            </Button>
          </div>
        </Card>
      )}

      <p className="text-center text-gray-500 text-xs">
        Local demo seam · Lightning subscribe requires invoice → webhook → subscriptions row
      </p>
    </section>
  );
}
