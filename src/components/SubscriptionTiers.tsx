import { useState } from 'react';
import { Check, Zap, Crown, Rocket, Star } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';

interface Tier {
  id: string;
  name: string;
  price_sats: number;
  price_usd: number;
  description: string;
  features: string[];
  icon: any;
  color: string;
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
  creatorName = 'Creator'
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
      color: 'from-blue-500 to-indigo-600',
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
      color: 'from-purple-500 to-pink-600',
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
      color: 'from-orange-500 to-red-600',
    },
  ];

  const tiers = customTiers || defaultTiers;

  const handleSubscribe = (tierId: string) => {
    setSelectedTier(tierId);
    setShowBolt12(true);
    if (onSubscribe) {
      onSubscribe(tierId);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Support {creatorName}
        </h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-6">
          Choose your tier and support with Bitcoin Lightning. Instant, private, and 0% fees.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
          <Zap size={16} className="text-emerald-400" />
          <span className="text-emerald-400 font-semibold text-sm">
            BOLT 12 Recurring Subscriptions • 100% Goes to Creator
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
        {tiers.map((tier, index) => {
          const Icon = tier.icon;
          return (
            <Card
              key={tier.id}
              className={`relative p-8 hover-lift transition-all duration-300 ${
                tier.popular
                  ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500 md:scale-105'
                  : 'bg-gradient-to-br bg-white/[0.03] backdrop-blur-md border-white/10'
              } animate-slide-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center gap-1.5 shadow-lg">
                    <Star size={14} className="text-white fill-white" />
                    <span className="text-white font-bold text-xs">MOST POPULAR</span>
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <div
                  className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${tier.color} rounded-2xl flex items-center justify-center animate-glow`}
                >
                  <Icon size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{tier.description}</p>

                <div className="mb-4">
                  <div className="text-4xl font-black text-white mb-1">
                    {tier.price_sats.toLocaleString()}
                  </div>
                  <div className="text-gray-400 text-sm">
                    sats/month (~${tier.price_usd})
                  </div>
                </div>

                <div className="text-xs text-emerald-400 font-semibold">
                  0% fees • 100% to creator
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={14} className="text-emerald-400" />
                    </div>
                    <span className="text-gray-300 text-sm leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  tier.popular
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700'
                    : 'bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700'
                }`}
                onClick={() => handleSubscribe(tier.id)}
              >
                Subscribe with Lightning
              </Button>

              <div className="mt-4 text-center text-xs text-gray-500">
                Cancel anytime • Instant activation
              </div>
            </Card>
          );
        })}
      </div>

      {showBolt12 && selectedTier && (
        <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-br bg-white/[0.03] backdrop-blur-md border-white/10 animate-scale-in">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-2xl flex items-center justify-center animate-glow">
              <Zap size={40} className="text-white" />
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">
              BOLT 12 Subscription Setup
            </h3>
            <p className="text-gray-400 mb-6">
              Scan this QR code with your Lightning wallet to set up recurring payments
            </p>

            <div className="bg-white rounded-2xl p-8 mb-6">
              <div className="w-64 h-64 mx-auto bg-gray-100 rounded-xl flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Zap size={48} className="mx-auto mb-2 text-emerald-500" />
                  <p className="text-sm font-semibold">BOLT 12 Offer QR</p>
                  <p className="text-xs">(Integration pending)</p>
                </div>
              </div>
            </div>

            <div className="bg-charcoal-900 rounded-xl p-4 mb-6">
              <p className="text-xs text-gray-500 mb-2">BOLT 12 Offer String</p>
              <code className="text-emerald-400 text-sm break-all font-mono">
                lno1pg257enxv4ezqcneype82um50ynhxgrwdajx293pqe7y75t...
              </code>
            </div>

            <div className="space-y-2 text-sm text-gray-400 text-left">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-400" />
                <span>Recurring monthly payment automatically</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-400" />
                <span>Cancel anytime from your wallet</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-400" />
                <span>100% private - no personal info required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-400" />
                <span>0% platform fees - all funds go to creator</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="mt-6"
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

      <div className="text-center">
        <p className="text-gray-500 text-sm">
          Powered by Bitcoin Lightning Network • BOLT 12 Native • Zero-Knowledge Privacy
        </p>
      </div>
    </div>
  );
}
