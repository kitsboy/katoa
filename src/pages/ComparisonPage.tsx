import { useState, useEffect, useMemo } from 'react';
import { Check, X, Shield, Globe, Zap, Lock, DollarSign, Users, ChevronRight } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Link } from '../components/Link';
import { FeeComparison } from '../components/FeeComparison';
import { PageMeta } from '../components/PageMeta';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { useLanguage } from '../contexts/LanguageContext';
import { formatNumber } from '../lib/i18nFormat';
import { TrustProofStrip } from '../components/TrustProofStrip';

function calculateSavings(amount: number) {
  const onlyfans = amount * 0.20;
  const throne = amount * 0.10;
  const linktree = amount * 0.09 + 40;
  return {
    vsOnlyFans: onlyfans,
    vsThrone: throne,
    vsLinktree: linktree,
    max: Math.max(onlyfans, throne, linktree),
    yearly: Math.max(onlyfans, throne, linktree) * 12,
  };
}

const FEATURE_SECTIONS = [
  {
    categoryKey: 'comparison.cat.fees',
    icon: 'dollar' as const,
    items: [
      { featureKey: 'comparison.feat.platformFees', katoa: '0%', throne: '2.9% + 0-7%', linktree: '9-10%', onlyfans: '20%', kickstarter: '5%', indiegogo: '5%' },
      { featureKey: 'comparison.feat.paymentProcessing', katoa: '0%', throne: '2.9% + $0.30', linktree: 'Included', onlyfans: 'Included', kickstarter: '3-5%', indiegogo: '2.9% + $0.30' },
      { featureKey: 'comparison.feat.totalFee10k', katoa: '$0', throne: '~$1,000', linktree: '$900-1,000', onlyfans: '$2,000', kickstarter: '$800-1,000', indiegogo: '$1,000-1,500' },
      { featureKey: 'comparison.feat.monthlySub', katoa: '$0', throne: '$0', linktree: '$8-$40', onlyfans: '$0', kickstarter: '$0', indiegogo: '$0' },
      { featureKey: 'comparison.feat.withdrawalFees', katoa: '0%', throne: '2.9% + $0.30', linktree: 'Varies', onlyfans: 'Included', kickstarter: 'Varies', indiegogo: 'Varies' },
      { featureKey: 'comparison.feat.hiddenCosts', katoa: 'None', throne: 'Currency conversion', linktree: 'Payment fees', onlyfans: 'None', kickstarter: 'Fulfillment $5K-25K+', indiegogo: '5% holdback on flexible' },
    ],
  },
  {
    categoryKey: 'comparison.cat.banking',
    icon: null,
    items: [
      { featureKey: 'comparison.feat.bankRequired', katoa: false, throne: true, linktree: true, onlyfans: true, kickstarter: true, indiegogo: true },
      { featureKey: 'comparison.feat.kyc', katoa: false, throne: true, linktree: true, onlyfans: true, kickstarter: true, indiegogo: true },
      { featureKey: 'comparison.feat.noBanking', katoa: true, throne: false, linktree: false, onlyfans: false, kickstarter: false, indiegogo: false },
      { featureKey: 'comparison.feat.processorDep', katoa: false, throne: true, linktree: true, onlyfans: true, kickstarter: true, indiegogo: true },
    ],
  },
  {
    categoryKey: 'comparison.cat.global',
    icon: 'globe' as const,
    items: [
      { featureKey: 'comparison.feat.countries', katoa: '195+', throne: '~10 (for 0% fees)', linktree: '~50', onlyfans: 'Limited', kickstarter: '~50', indiegogo: '~50' },
      { featureKey: 'comparison.feat.sanctioned', katoa: true, throne: false, linktree: false, onlyfans: false, kickstarter: false, indiegogo: false },
      { featureKey: 'comparison.feat.instantIntl', katoa: true, throne: false, linktree: false, onlyfans: false, kickstarter: false, indiegogo: false },
      { featureKey: 'comparison.feat.conversion', katoa: '0%', throne: '3-5%', linktree: '3-5%', onlyfans: '3-5%', kickstarter: '3-5%', indiegogo: '3-5%' },
    ],
  },
  {
    categoryKey: 'comparison.cat.payout',
    icon: null,
    items: [
      { featureKey: 'comparison.feat.payoutTime', katoa: 'Instant', throne: '7 days', linktree: 'Varies', onlyfans: '7 days rolling', kickstarter: '14+ days', indiegogo: '14 days' },
      { featureKey: 'comparison.feat.instantSettlement', katoa: true, throne: false, linktree: false, onlyfans: false, kickstarter: false, indiegogo: false },
      { featureKey: 'comparison.feat.holdback', katoa: false, throne: false, linktree: false, onlyfans: false, kickstarter: false, indiegogo: '5% until delivery' },
    ],
  },
  {
    categoryKey: 'comparison.cat.revenue',
    icon: null,
    items: [
      { featureKey: 'comparison.feat.crowdfunding', katoa: true, throne: true, linktree: false, onlyfans: false, kickstarter: true, indiegogo: true },
      { featureKey: 'comparison.feat.subscriptions', katoa: true, throne: false, linktree: true, onlyfans: true, kickstarter: false, indiegogo: false },
      { featureKey: 'comparison.feat.tips', katoa: true, throne: true, linktree: true, onlyfans: true, kickstarter: false, indiegogo: false },
      { featureKey: 'comparison.feat.digital', katoa: true, throne: false, linktree: true, onlyfans: true, kickstarter: false, indiegogo: false },
      { featureKey: 'comparison.feat.fulfillment', katoa: false, throne: false, linktree: false, onlyfans: false, kickstarter: true, indiegogo: true },
    ],
  },
  {
    categoryKey: 'comparison.cat.privacy',
    icon: 'lock' as const,
    items: [
      { featureKey: 'comparison.feat.zk', katoa: true, throne: false, linktree: false, onlyfans: false, kickstarter: false, indiegogo: false },
      { featureKey: 'comparison.feat.encrypted', katoa: true, throne: false, linktree: false, onlyfans: false, kickstarter: false, indiegogo: false },
      { featureKey: 'comparison.feat.decentralized', katoa: true, throne: false, linktree: false, onlyfans: false, kickstarter: false, indiegogo: false },
      { featureKey: 'comparison.feat.censorship', katoa: true, throne: false, linktree: false, onlyfans: false, kickstarter: false, indiegogo: false },
    ],
  },
  {
    categoryKey: 'comparison.cat.payment',
    icon: 'zap' as const,
    items: [
      { featureKey: 'comparison.feat.micro', katoa: true, throne: false, linktree: false, onlyfans: false, kickstarter: false, indiegogo: false },
      { featureKey: 'comparison.feat.bolt12', katoa: true, throne: false, linktree: false, onlyfans: false, kickstarter: false, indiegogo: false },
      { featureKey: 'comparison.feat.lightning', katoa: true, throne: false, linktree: false, onlyfans: false, kickstarter: false, indiegogo: false },
      { featureKey: 'comparison.feat.multiRevenue', katoa: true, throne: true, linktree: true, onlyfans: true, kickstarter: false, indiegogo: false },
    ],
  },
  {
    categoryKey: 'comparison.cat.control',
    icon: 'users' as const,
    items: [
      { featureKey: 'comparison.feat.suspension', katoa: false, throne: true, linktree: true, onlyfans: true, kickstarter: true, indiegogo: true },
      { featureKey: 'comparison.feat.contentCensor', katoa: false, throne: true, linktree: true, onlyfans: true, kickstarter: true, indiegogo: true },
      { featureKey: 'comparison.feat.ownData', katoa: true, throne: false, linktree: false, onlyfans: false, kickstarter: false, indiegogo: false },
      { featureKey: 'comparison.feat.ownKeys', katoa: true, throne: false, linktree: false, onlyfans: false, kickstarter: false, indiegogo: false },
    ],
  },
];

function CategoryIcon({ icon }: { icon: 'dollar' | 'globe' | 'lock' | 'zap' | 'users' | null }) {
  if (!icon) return null;
  const props = { size: 20, className: 'text-white' };
  switch (icon) {
    case 'dollar': return <DollarSign {...props} />;
    case 'globe': return <Globe {...props} />;
    case 'lock': return <Lock {...props} />;
    case 'zap': return <Zap {...props} />;
    case 'users': return <Users {...props} />;
    default: return null;
  }
}

export function ComparisonPage() {
  const { t } = useLanguage();
  const [tableScrolled, setTableScrolled] = useState(false);
  const [monthlyEarnings, setMonthlyEarnings] = useState(10000);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const earnings = params.get('earnings');
    if (earnings) {
      const num = parseInt(earnings.replace(/[^0-9]/g, ''), 10);
      if (num > 0) setMonthlyEarnings(num);
    }
  }, []);

  useEffect(() => {
    if (monthlyEarnings <= 0) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get('earnings') === String(monthlyEarnings)) return;
    url.searchParams.set('earnings', String(monthlyEarnings));
    window.history.replaceState({}, '', `${url.pathname}${url.search}`);
  }, [monthlyEarnings]);

  const savings = useMemo(() => calculateSavings(monthlyEarnings), [monthlyEarnings]);

  const renderValue = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check size={24} className="text-emerald-400 mx-auto" />
      ) : (
        <X size={24} className="text-red-400 mx-auto" />
      );
    }
    return <span className="text-white font-medium">{value}</span>;
  };

  const yearlyText = t('comparison.savingsYearly')
    .replace('${amount}', monthlyEarnings.toLocaleString())
    .replace('${yearly}', savings.yearly.toLocaleString());

  const vsText = t('comparison.savingsVs')
    .replace('${onlyfans}', savings.vsOnlyFans.toLocaleString())
    .replace('${throne}', savings.vsThrone.toLocaleString())
    .replace('${linktree}', savings.vsLinktree.toLocaleString());

  return (
    <div className="min-h-screen bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-charcoal-950 pt-16">
      <PageMeta
        title="Platform Comparison"
        description="Compare KATOA vs OnlyFans, Patreon, Kickstarter, and more. 0% fees, instant Lightning, no KYC."
        path="/comparison"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <Breadcrumbs
          items={[
            { label: t('footer.pricing'), href: '/pricing' },
            { label: t('comparison.hero.highlight').replace('?', '') },
          ]}
          className="mb-6"
        />
        <div className="text-center mb-16 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-full mb-6">
            <Shield className="text-emerald-400" size={18} />
            <span className="text-sm font-medium text-emerald-300">{t('comparison.badge')}</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="block text-white mb-2">{t('comparison.hero.line1')}</span>
            <span className="block bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              {t('comparison.hero.highlight')}
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 max-w-4xl mx-auto mb-6 leading-relaxed">
            {t('comparison.hero.subtitle')}
          </p>
          <TrustProofStrip className="mb-8" />
        </div>

        <Card className="mb-8 p-6 sm:p-8 bg-white/[0.03] border border-white/10">
          <label htmlFor="comparison-earnings" className="block text-sm font-medium text-gray-300 mb-3">
            {t('comparison.earningsLabel')}
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <input
              id="comparison-earnings"
              type="range"
              min={1000}
              max={100000}
              step={1000}
              value={monthlyEarnings}
              onChange={(e) => setMonthlyEarnings(Number(e.target.value))}
              className="flex-1 accent-emerald-500 min-h-[44px]"
            />
            <span className="text-2xl font-black text-white tabular-nums shrink-0">
              ${formatNumber(monthlyEarnings)}
            </span>
          </div>
        </Card>

        {monthlyEarnings > 0 && (
          <Card className="mb-12 p-6 sm:p-8 bg-emerald-500/10 border-2 border-emerald-500/30 animate-slide-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  {t('comparison.saveMonthly').replace('${amount}', formatNumber(savings.max))}
                </h2>
                <p className="text-emerald-300 text-sm sm:text-base">{yearlyText}</p>
                <p className="text-gray-400 text-xs mt-2">{vsText}</p>
              </div>
              <Link href={`/comparison?earnings=${monthlyEarnings}`} className="shrink-0">
                <Button variant="bitcoin" className="w-full sm:w-auto">
                  {t('comparison.adjustCalc')}
                </Button>
              </Link>
            </div>
          </Card>
        )}

        <FeeComparison syncUrl />

        <div className="mt-20 space-y-12">
          <h2 className="text-4xl font-bold text-center text-white mb-12">{t('comparison.breakdown.title')}</h2>

          {FEATURE_SECTIONS.map((category, idx) => (
            <Card
              key={category.categoryKey}
              className="p-8 bg-white/[0.03] backdrop-blur-md border-white/10 animate-slide-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <CategoryIcon icon={category.icon} />
                </div>
                {t(category.categoryKey)}
              </h3>

              <div
                className="comparison-table-scroll overflow-x-auto scrollbar-hide -mx-2 px-2 sm:mx-0 sm:px-0"
                aria-label={t('comparison.breakdown.title')}
                onScroll={(e) => setTableScrolled(e.currentTarget.scrollLeft > 8)}
              >
                {!tableScrolled && (
                  <div className="comparison-scroll-hint sm:hidden flex items-center justify-end gap-1 text-xs text-gray-500 mb-2 pr-1">
                    <span>{t('comparison.table.swipe')}</span>
                    <ChevronRight size={14} className="text-neon-cyan-400 animate-pulse" />
                  </div>
                )}
                <table className="w-full min-w-[640px]">
                  <thead className="comparison-table-sticky-header">
                    <tr className="border-b border-white/10">
                      <th scope="col" className="text-left text-white font-semibold pb-4 pr-4 min-w-[140px]">{t('comparison.table.feature')}</th>
                      <th scope="col" className="text-center text-emerald-600 font-bold pb-4 px-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-600/20 rounded-lg">KATOA</div>
                      </th>
                      <th scope="col" className="text-center text-white font-semibold pb-4 px-2 text-sm">Throne</th>
                      <th scope="col" className="text-center text-white font-semibold pb-4 px-2 text-sm">Linktree</th>
                      <th scope="col" className="text-center text-white font-semibold pb-4 px-2 text-sm">OnlyFans</th>
                      <th scope="col" className="text-center text-white font-semibold pb-4 px-2 text-sm">Kickstarter</th>
                      <th scope="col" className="text-center text-white font-semibold pb-4 px-2 text-sm">Indiegogo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.items.map((item) => (
                      <tr key={item.featureKey} className="border-b border-white/10 hover:bg-white/[0.05] transition-colors">
                        <th scope="row" className="text-white py-4 pr-4 font-medium text-left">{t(item.featureKey)}</th>
                        <td className="text-center py-4 px-2">
                          <div className="font-bold">{renderValue(item.katoa)}</div>
                        </td>
                        <td className="text-center py-4 px-2 text-white text-sm">{renderValue(item.throne)}</td>
                        <td className="text-center py-4 px-2 text-white text-sm">{renderValue(item.linktree)}</td>
                        <td className="text-center py-4 px-2 text-white text-sm">{renderValue(item.onlyfans)}</td>
                        <td className="text-center py-4 px-2 text-white text-sm">{renderValue(item.kickstarter)}</td>
                        <td className="text-center py-4 px-2 text-white text-sm">{renderValue(item.indiegogo)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card hover padding="lg" className="text-center">
            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/60 transform hover:scale-110 hover:rotate-12 transition-all duration-300">
              <Globe size={56} className="text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-3xl font-black text-white mb-6 tracking-tight">{t('comparison.card.countries.title')}</h3>
            <p className="text-gray-300 text-base leading-relaxed mb-5">{t('comparison.card.countries.body')}</p>
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="text-gray-400 font-semibold text-base">{t('comparison.card.countries.throne')}</div>
              <div className="text-emerald-400 font-bold text-lg bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 py-3 px-5 rounded-xl border border-emerald-500/30">{t('comparison.card.countries.katoa')}</div>
            </div>
          </Card>

          <Card hover padding="lg" className="text-center">
            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/60 transform hover:scale-110 hover:rotate-12 transition-all duration-300">
              <Shield size={56} className="text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-3xl font-black text-white mb-6 tracking-tight">{t('comparison.card.privacy.title')}</h3>
            <p className="text-gray-300 text-base leading-relaxed mb-5">{t('comparison.card.privacy.body')}</p>
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="text-gray-400 font-semibold text-base">{t('comparison.card.privacy.others')}</div>
              <div className="text-emerald-400 font-bold text-lg bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 py-3 px-5 rounded-xl border border-emerald-500/30">{t('comparison.card.privacy.katoa')}</div>
            </div>
          </Card>

          <Card hover padding="lg" className="text-center">
            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/60 transform hover:scale-110 hover:rotate-12 transition-all duration-300">
              <Zap size={56} className="text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-3xl font-black text-white mb-6 tracking-tight">{t('comparison.card.instant.title')}</h3>
            <p className="text-gray-300 text-base leading-relaxed mb-5">{t('comparison.card.instant.body')}</p>
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="text-gray-400 font-semibold text-base">{t('comparison.card.instant.others')}</div>
              <div className="text-emerald-400 font-bold text-lg bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 py-3 px-5 rounded-xl border border-emerald-500/30">{t('comparison.card.instant.katoa')}</div>
            </div>
          </Card>
        </div>

        <div className="mt-20 text-center">
          <Card className="p-12 bg-gradient-to-br from-emerald-900/20 to-cyan-900/20 border-emerald-500/30">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">{t('comparison.cta.title')}</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">{t('comparison.cta.subtitle')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-lg font-bold px-12">
                  {t('comparison.cta.start')}
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="border-2 border-white/20 hover:border-neon-cyan-500/50 text-lg font-bold px-12">
                  {t('comparison.cta.pricing')}
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}