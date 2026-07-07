import { useState, memo, useEffect } from 'react';
import { DollarSign, TrendingDown, AlertCircle } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { Tooltip } from './Tooltip';

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 149.50 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 1.36 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.53 },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', rate: 0.88 },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rate: 7.24 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83.37 },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', rate: 4.98 },
];

const PlatformCard = memo(function PlatformCard({
  platform,
  amountInUSD,
  formatCurrency,
}: {
  platform: { fees: number; net: number; platform: string; color: string };
  amountInUSD: number;
  formatCurrency: (amount: number) => string;
}) {
  return (
    <div
      className={`relative p-6 rounded-xl bg-gradient-to-br ${platform.color} ${
        platform.platform === 'KATOA' ? 'ring-4 ring-orange-500 shadow-[0_0_30px_rgba(255,135,0,0.5)] md:scale-105' : ''
      } transition-transform hover:scale-105`}
    >
      {platform.platform === 'KATOA' && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="px-4 py-1 bg-yellow-400 text-charcoal-950 text-xs font-bold rounded-full shadow-lg">
            BEST VALUE
          </span>
        </div>
      )}

      <h3 className="text-white font-bold text-xl mb-4 flex items-center justify-between">
        <span className="flex items-center gap-2">
          {platform.platform === 'KATOA' && (
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1 shadow-md">
              <img src="/sats.svg" alt="KATOA" className="w-full h-full" />
            </div>
          )}
          {platform.platform === 'OnlyFans' && (
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1 shadow-md">
              <img src="/pngwing.com.png" alt="OnlyFans" className="w-full h-full object-contain" />
            </div>
          )}
          {platform.platform === 'Throne' && (
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1 shadow-md">
              <img src="/Throne_Icon_-_Single_(Gradient).png" alt="Throne" className="w-full h-full object-contain" />
            </div>
          )}
          {platform.platform === 'Linktree' && (
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1 shadow-md">
              <img src="/linktree-logo-in-transparent-background-free-png.webp" alt="Linktree" className="w-full h-full object-contain" />
            </div>
          )}
          {platform.platform}
        </span>
        <Tooltip
          content={
            platform.platform === 'KATOA'
              ? '0% fees forever. Built on Bitcoin Lightning Network. Every dollar you earn is yours to keep. No hidden costs, no platform taxes, no surprise charges.'
              : platform.platform === 'OnlyFans'
              ? 'OnlyFans charges 20% platform fee on all earnings. If you earn $10,000, they take $2,000. Plus payment processing fees and currency conversion costs.'
              : platform.platform === 'Throne'
              ? 'Throne charges 10% platform fee plus 2.9% + $0.30 payment processing. Only available in ~10 countries with 0% promotional rate. Requires bank account and KYC verification.'
              : 'Linktree charges 9-10% in fees plus $40/month subscription for Commerce features. Payment processing fees vary by region. Requires bank account.'
          }
          icon
        />
      </h3>

      <div className="space-y-3">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
          <p className="text-white/70 text-sm flex items-center justify-between">
            <span>Monthly Fees</span>
            <Tooltip
              content={
                platform.platform === 'KATOA'
                  ? 'Zero fees forever. KATOA never takes a cut of your earnings. No monthly subscriptions. No transaction fees. No payment processing fees. What you earn is what you keep.'
                  : platform.platform === 'OnlyFans'
                  ? `OnlyFans takes 20% of everything you earn. From ${formatCurrency(amountInUSD)}, they extract ${formatCurrency(platform.fees)}. This applies to subscriptions, tips, PPV, and all other revenue.`
                  : platform.platform === 'Throne'
                  ? `Throne charges 10% platform fee on all transactions. From ${formatCurrency(amountInUSD)}, they take ${formatCurrency(platform.fees)}. Additional payment processing fees apply.`
                  : `Linktree charges approximately 9% in fees plus $40/month subscription. From ${formatCurrency(amountInUSD)}, total cost is ${formatCurrency(platform.fees)}. Payment processor fees vary by location.`
              }
              icon
            />
          </p>
          <p className={`text-2xl font-black ${platform.fees === 0 ? 'text-white' : 'text-red-100'}`}>
            {formatCurrency(platform.fees)}
          </p>
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
          <p className="text-white/70 text-sm flex items-center justify-between">
            <span>You Keep</span>
            <Tooltip
              content={
                platform.platform === 'KATOA'
                  ? `Your actual take-home: ${formatCurrency(platform.net)} from ${formatCurrency(amountInUSD)} earned. That's 100% of your earnings. Instant settlement via Bitcoin Lightning Network.`
                  : `Your actual take-home after ${platform.platform} takes their cut: ${formatCurrency(platform.net)} from ${formatCurrency(amountInUSD)} earned. You lose ${formatCurrency(platform.fees)} to platform fees. Payouts take 7-14 days.`
              }
              icon
            />
          </p>
          <p className="text-2xl font-black text-white">
            {formatCurrency(platform.net)}
          </p>
        </div>

        {platform.platform !== 'KATOA' && (
          <div className="pt-3 border-t border-white/20">
            <div className="flex items-center gap-2 text-orange-200 text-sm font-bold">
              <TrendingDown size={16} />
              <span>-{((platform.fees / amountInUSD) * 100).toFixed(1)}% lost</span>
            </div>
          </div>
        )}

        {platform.platform === 'KATOA' && (
          <div className="pt-3 border-t border-white/20">
            <div className="flex items-center gap-2 text-white text-sm font-semibold">
              <AlertCircle size={16} />
              <span>100% yours</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export function FeeComparison() {
  const [monthlyEarnings, setMonthlyEarnings] = useState(10000);
  const [currency, setCurrency] = useState(currencies[0]);
  const [displayValue, setDisplayValue] = useState('10,000');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const earnings = params.get('earnings');
    if (earnings) {
      const num = parseInt(earnings.replace(/[^0-9]/g, ''), 10);
      if (num > 0) {
        setMonthlyEarnings(num);
        setDisplayValue(num.toLocaleString());
      }
    }
  }, []);

  const formatNumber = (value: string): string => {
    const numbers = value.replace(/[^0-9]/g, '');
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleInputChange = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, '');
    const numValue = parseInt(numbers) || 0;
    setMonthlyEarnings(numValue);
    setDisplayValue(formatNumber(numbers));
  };

  const calculateFees = (amount: number) => {
    const throne = {
      fees: amount * 0.10,
      net: amount * 0.90,
      platform: 'Throne',
      color: 'from-purple-500 to-pink-500',
    };

    const linktree = {
      fees: amount * 0.09 + 40,
      net: amount * 0.91 - 40,
      platform: 'Linktree',
      color: 'from-green-500 to-teal-500',
    };

    const onlyfans = {
      fees: amount * 0.20,
      net: amount * 0.80,
      platform: 'OnlyFans',
      color: 'from-blue-500 to-cyan-500',
    };

    const katoa = {
      fees: 0,
      net: amount,
      platform: 'KATOA',
      color: 'from-orange-500 to-amber-600',
    };

    return { throne, linktree, onlyfans, katoa };
  };

  const amountInUSD = monthlyEarnings / currency.rate;
  const results = calculateFees(amountInUSD);
  const savings = {
    vsThrone: results.throne.fees,
    vsLinktree: results.linktree.fees,
    vsOnlyFans: results.onlyfans.fees,
  };

  const maxSavings = Math.max(savings.vsThrone, savings.vsLinktree, savings.vsOnlyFans);

  const formatCurrency = (amount: number) => {
    const convertedAmount = amount * currency.rate;
    return `${currency.symbol}${convertedAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8 bg-white/[0.03] border border-white/10 py-8 px-4 rounded-2xl backdrop-blur-md">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
          The True Cost of Platform Fees
        </h2>
        <p className="text-lg sm:text-xl md:text-2xl text-gray-300 font-medium max-w-3xl mx-auto">
          See how much you're losing to competitors' fees. KATOA keeps it simple: 0% forever.
        </p>
      </div>

      <Card variant="glass" padding="lg">
        <div className="mb-8">
          <label className="block text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 text-center">
            What's your monthly project goal?
          </label>

          <div className="relative max-w-2xl mx-auto">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-bitcoin-orange-500 via-amber-500 to-bitcoin-orange-600 rounded-xl opacity-75 blur-sm animate-pulse" aria-hidden />
            <div className="relative bg-charcoal-900 rounded-xl overflow-hidden border-2 border-bitcoin-orange-500/30 shadow-lg shadow-bitcoin-orange-500/20">
              {/* Mobile: vertical stack */}
              <div className="flex flex-col sm:flex-row sm:items-stretch sm:divide-x divide-white/10">
                <div className="flex-shrink-0 border-b sm:border-b-0 border-white/10 bg-white/[0.03]">
                  <label htmlFor="fee-currency" className="sr-only">Currency</label>
                  <select
                    id="fee-currency"
                    value={currency.code}
                    onChange={(e) => setCurrency(currencies.find(c => c.code === e.target.value) || currencies[0])}
                    className="w-full sm:w-auto h-full px-4 py-3.5 bg-transparent text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-neon-cyan-500/50 cursor-pointer appearance-none hover:bg-white/5 transition-colors"
                    style={{ minWidth: '140px' }}
                  >
                    {currencies.map((curr) => (
                      <option key={curr.code} value={curr.code} className="bg-charcoal-900">
                        {curr.symbol} {curr.code}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 flex items-center px-4 py-3">
                  <span className="text-gray-400 text-xl font-bold mr-2" aria-hidden>
                    {currency.symbol}
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={displayValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="flex-1 bg-transparent text-white text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-neon-cyan-500/50 rounded-lg placeholder-gray-500 min-h-[44px]"
                    placeholder="10,000"
                    aria-label="Monthly earnings amount"
                  />
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center mt-3">Amounts converted to USD for comparison</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[results.onlyfans, results.throne, results.linktree, results.katoa].map((platform) => (
            <PlatformCard
              key={platform.platform}
              platform={platform}
              amountInUSD={amountInUSD}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>

        <div className="mt-8 p-6 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
              <DollarSign size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Save {formatCurrency(maxSavings)} per month
              </h4>
              <p className="text-emerald-300 text-base sm:text-lg">
                That's {formatCurrency(maxSavings * 12)} per year back in your pocket with KATOA.
                <br />
                <span className="font-semibold">What would you do with that money?</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Button
            size="lg"
            className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-lg font-bold px-8 sm:px-12 w-full sm:w-auto"
          >
            Start Keeping 100% Today
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card hover padding="lg" className="text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/40">
            <DollarSign size={48} className="text-white" strokeWidth={2.5} />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white mb-4 tracking-tight">195+ Countries</h3>
          <div className="space-y-3">
            <p className="text-gray-300 text-base font-semibold">
              Throne: ~10 countries with 0% fees
            </p>
            <div className="text-emerald-400 font-bold text-lg bg-emerald-500/10 py-3 px-5 rounded-xl border border-emerald-500/30">
              KATOA: All countries, always 0%
            </div>
          </div>
        </Card>

        <Card hover padding="lg" className="text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/40">
            <TrendingDown size={48} className="text-white" strokeWidth={2.5} />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white mb-4 tracking-tight">Instant Settlement</h3>
          <div className="space-y-3">
            <p className="text-gray-300 text-base font-semibold">
              OnlyFans: 7-day rolling payout
            </p>
            <div className="text-emerald-400 font-bold text-lg bg-emerald-500/10 py-3 px-5 rounded-xl border border-emerald-500/30">
              KATOA: Instant Lightning Network
            </div>
          </div>
        </Card>

        <Card hover padding="lg" className="text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/40">
            <AlertCircle size={48} className="text-white" strokeWidth={2.5} />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white mb-4 tracking-tight">True Privacy</h3>
          <div className="space-y-3">
            <p className="text-gray-300 text-base font-semibold">
              Competitors: Server-based data collection
            </p>
            <div className="text-emerald-400 font-bold text-lg bg-emerald-500/10 py-3 px-5 rounded-xl border border-emerald-500/30">
              KATOA: Zero-knowledge proofs
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}