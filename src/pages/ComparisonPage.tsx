import { Check, X, Shield, Globe, Zap, Lock, DollarSign, Users } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Link } from '../components/Link';
import { FeeComparison } from '../components/FeeComparison';

export function ComparisonPage() {
  const features = [
    {
      category: 'Fees & Costs',
      items: [
        { feature: 'Platform Fees', katoa: '0%', throne: '2.9% + 0-7%', linktree: '9-10%', onlyfans: '20%', kickstarter: '5%', indiegogo: '5%' },
        { feature: 'Payment Processing', katoa: '0%', throne: '2.9% + $0.30', linktree: 'Included', onlyfans: 'Included', kickstarter: '3-5%', indiegogo: '2.9% + $0.30' },
        { feature: 'Total Fee on $10K', katoa: '$0', throne: '~$1,000', linktree: '$900-1,000', onlyfans: '$2,000', kickstarter: '$800-1,000', indiegogo: '$1,000-1,500' },
        { feature: 'Monthly Subscription', katoa: '$0', throne: '$0', linktree: '$8-$40', onlyfans: '$0', kickstarter: '$0', indiegogo: '$0' },
        { feature: 'Withdrawal Fees', katoa: '0%', throne: '2.9% + $0.30', linktree: 'Varies', onlyfans: 'Included', kickstarter: 'Varies', indiegogo: 'Varies' },
        { feature: 'Hidden Costs', katoa: 'None', throne: 'Currency conversion', linktree: 'Payment fees', onlyfans: 'None', kickstarter: 'Fulfillment $5K-25K+', indiegogo: '5% holdback on flexible' },
      ],
    },
    {
      category: 'Banking Requirements',
      items: [
        { feature: 'Bank Account Required', katoa: false, throne: true, linktree: true, onlyfans: true, kickstarter: true, indiegogo: true },
        { feature: 'KYC/Identity Verification', katoa: false, throne: true, linktree: true, onlyfans: true, kickstarter: true, indiegogo: true },
        { feature: 'Works Without Banking', katoa: true, throne: false, linktree: false, onlyfans: false, kickstarter: false, indiegogo: false },
        { feature: 'Payment Processor Dependent', katoa: false, throne: true, linktree: true, onlyfans: true, kickstarter: true, indiegogo: true },
      ],
    },
    {
      category: 'Global Reach',
      items: [
        { feature: 'Countries Supported', katoa: '195+', throne: '~10 (for 0% fees)', linktree: '~50', onlyfans: 'Limited', kickstarter: '~50', indiegogo: '~50' },
        { feature: 'Works in Sanctioned Countries', katoa: true, throne: false, linktree: false, onlyfans: false, kickstarter: false, indiegogo: false },
        { feature: 'Instant International Transfers', katoa: true, throne: false, linktree: false, onlyfans: false, kickstarter: false, indiegogo: false },
        { feature: 'Currency Conversion Fees', katoa: '0%', throne: '3-5%', linktree: '3-5%', onlyfans: '3-5%', kickstarter: '3-5%', indiegogo: '3-5%' },
      ],
    },
    {
      category: 'Payout Speed',
      items: [
        { feature: 'Payout Time', katoa: 'Instant', throne: '7 days', linktree: 'Varies', onlyfans: '7 days rolling', kickstarter: '14+ days', indiegogo: '14 days' },
        { feature: 'Instant Settlement', katoa: true, throne: false, linktree: false, onlyfans: false, kickstarter: false, indiegogo: false },
        { feature: 'Fund Holdback', katoa: false, throne: false, linktree: false, onlyfans: false, kickstarter: false, indiegogo: '5% until delivery' },
      ],
    },
    {
      category: 'Revenue Models',
      items: [
        { feature: 'Crowdfunding/Projects', katoa: true, throne: true, linktree: false, onlyfans: false, kickstarter: true, indiegogo: true },
        { feature: 'Subscriptions', katoa: true, throne: false, linktree: true, onlyfans: true, kickstarter: false, indiegogo: false },
        { feature: 'Tips/Donations', katoa: true, throne: true, linktree: true, onlyfans: true, kickstarter: false, indiegogo: false },
        { feature: 'Digital Products', katoa: true, throne: false, linktree: true, onlyfans: true, kickstarter: false, indiegogo: false },
        { feature: 'Fulfillment Required', katoa: false, throne: false, linktree: false, onlyfans: false, kickstarter: true, indiegogo: true },
      ],
    },
    {
      category: 'Privacy & Security',
      items: [
        { feature: 'Zero-Knowledge Proofs', katoa: true, throne: false, linktree: false, onlyfans: false, kickstarter: false, indiegogo: false },
        { feature: 'Encrypted Messaging', katoa: true, throne: false, linktree: false, onlyfans: false, kickstarter: false, indiegogo: false },
        { feature: 'Decentralized Infrastructure', katoa: true, throne: false, linktree: false, onlyfans: false, kickstarter: false, indiegogo: false },
        { feature: 'Censorship Resistant', katoa: true, throne: false, linktree: false, onlyfans: false, kickstarter: false, indiegogo: false },
      ],
    },
    {
      category: 'Payment Features',
      items: [
        { feature: 'Micropayments Support', katoa: true, throne: false, linktree: false, onlyfans: false, kickstarter: false, indiegogo: false },
        { feature: 'BOLT 12 Recurring', katoa: true, throne: false, linktree: false, onlyfans: false, kickstarter: false, indiegogo: false },
        { feature: 'Lightning Network', katoa: true, throne: false, linktree: false, onlyfans: false, kickstarter: false, indiegogo: false },
        { feature: 'Multiple Revenue Streams', katoa: true, throne: true, linktree: true, onlyfans: true, kickstarter: false, indiegogo: false },
      ],
    },
    {
      category: 'Platform Control',
      items: [
        { feature: 'Account Suspension Risk', katoa: false, throne: true, linktree: true, onlyfans: true, kickstarter: true, indiegogo: true },
        { feature: 'Content Censorship', katoa: false, throne: true, linktree: true, onlyfans: true, kickstarter: true, indiegogo: true },
        { feature: 'Own Your Data', katoa: true, throne: false, linktree: false, onlyfans: false, kickstarter: false, indiegogo: false },
        { feature: 'Own Your Keys', katoa: true, throne: false, linktree: false, onlyfans: false, kickstarter: false, indiegogo: false },
      ],
    },
  ];

  const renderValue = (value: any) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check size={24} className="text-emerald-400 mx-auto" />
      ) : (
        <X size={24} className="text-red-400 mx-auto" />
      );
    }
    return <span className="text-white font-medium">{value}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-night-blue-500 via-night-blue-500 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="text-center mb-16 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-full mb-6">
            <Shield className="text-emerald-400" size={18} />
            <span className="text-sm font-medium text-emerald-300">
              Honest Comparison • No Marketing Spin
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="block text-white mb-2">Why Choose</span>
            <span className="block bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              KATOA?
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-night-blue-200 max-w-4xl mx-auto mb-8 leading-relaxed">
            We're not just another creator platform. We're built on Bitcoin Lightning, designed for global creators,
            and committed to 0% fees forever. Here's how we stack up.
          </p>
        </div>

        <FeeComparison />

        <div className="mt-20 space-y-12">
          <h2 className="text-4xl font-bold text-center text-white mb-12">
            Feature-by-Feature Breakdown
          </h2>

          {features.map((category, idx) => (
            <Card
              key={category.category}
              className="p-8 bg-gradient-to-br from-night-blue-500 to-night-blue-500 border-night-blue-500 animate-slide-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  {category.category === 'Fees & Costs' && <DollarSign size={20} className="text-white" />}
                  {category.category === 'Global Reach' && <Globe size={20} className="text-white" />}
                  {category.category === 'Privacy & Security' && <Lock size={20} className="text-white" />}
                  {category.category === 'Payment Features' && <Zap size={20} className="text-white" />}
                  {category.category === 'Platform Control' && <Users size={20} className="text-white" />}
                </div>
                {category.category}
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-night-blue-500">
                      <th className="text-left text-night-blue-300 font-semibold pb-4 pr-4">Feature</th>
                      <th className="text-center text-emerald-400 font-bold pb-4 px-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 rounded-lg">
                          KATOA
                        </div>
                      </th>
                      <th className="text-center text-night-blue-300 font-semibold pb-4 px-2 text-sm">Throne</th>
                      <th className="text-center text-night-blue-300 font-semibold pb-4 px-2 text-sm">Linktree</th>
                      <th className="text-center text-night-blue-300 font-semibold pb-4 px-2 text-sm">OnlyFans</th>
                      <th className="text-center text-night-blue-300 font-semibold pb-4 px-2 text-sm">Kickstarter</th>
                      <th className="text-center text-night-blue-300 font-semibold pb-4 px-2 text-sm">Indiegogo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.items.map((item, itemIdx) => (
                      <tr
                        key={itemIdx}
                        className="border-b border-night-blue-500 hover:bg-night-blue-500/50 transition-colors"
                      >
                        <td className="text-night-blue-200 py-4 pr-4">{item.feature}</td>
                        <td className="text-center py-4 px-2">
                          <div className="font-bold">{renderValue(item.katoa)}</div>
                        </td>
                        <td className="text-center py-4 px-2 text-night-blue-300 text-sm">{renderValue(item.throne)}</td>
                        <td className="text-center py-4 px-2 text-night-blue-300 text-sm">{renderValue(item.linktree)}</td>
                        <td className="text-center py-4 px-2 text-night-blue-300 text-sm">{renderValue(item.onlyfans)}</td>
                        <td className="text-center py-4 px-2 text-night-blue-300 text-sm">{renderValue(item.kickstarter)}</td>
                        <td className="text-center py-4 px-2 text-night-blue-300 text-sm">{renderValue(item.indiegogo)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-8 bg-gradient-to-br from-emerald-900/30 to-cyan-900/30 border-emerald-500/30 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-2xl flex items-center justify-center animate-glow">
              <Shield size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">For the Unbanked</h3>
            <p className="text-night-blue-200 leading-relaxed mb-6">
              No bank account? No problem. Bitcoin works everywhere, for everyone. No discrimination.
            </p>
            <div className="text-emerald-400 font-bold text-sm">195+ Countries Supported</div>
          </Card>

          <Card className="p-8 bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center animate-glow">
              <Lock size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">For the Private</h3>
            <p className="text-night-blue-200 leading-relaxed mb-6">
              Zero-knowledge proofs. Encrypted messaging. Decentralized storage. Your data stays yours.
            </p>
            <div className="text-purple-400 font-bold text-sm">Military-Grade Privacy</div>
          </Card>

          <Card className="p-8 bg-gradient-to-br from-orange-900/30 to-red-900/30 border-orange-500/30 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center animate-glow">
              <Zap size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">For the Ambitious</h3>
            <p className="text-night-blue-200 leading-relaxed mb-6">
              Keep 100% of your earnings. Scale globally. Build your empire without platform taxes.
            </p>
            <div className="text-orange-400 font-bold text-sm">0% Fees Forever</div>
          </Card>
        </div>

        <div className="mt-20 text-center">
          <Card className="p-12 bg-gradient-to-br from-emerald-900/20 to-cyan-900/20 border-emerald-500/30">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Keep 100%?
            </h2>
            <p className="text-xl text-night-blue-200 max-w-2xl mx-auto mb-8">
              Join thousands of creators who've stopped paying platform fees and started earning what they deserve.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-lg font-bold px-12"
                >
                  Start Earning 100%
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-night-blue-400 hover:border-emerald-500 text-lg font-bold px-12"
                >
                  See Pricing (Spoiler: $0)
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
