import { useState } from 'react';
import { DollarSign, TrendingDown, AlertCircle } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';

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

export function FeeComparison() {
  const [monthlyEarnings, setMonthlyEarnings] = useState(10000);
  const [currency, setCurrency] = useState(currencies[0]);
  const [displayValue, setDisplayValue] = useState('10,000');

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
      color: 'from-emerald-500 to-cyan-600',
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
      <div className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          The True Cost of Platform Fees
        </h2>
        <p className="text-xl text-night-blue-300 max-w-3xl mx-auto">
          See how much you're losing to competitors' fees. KATOA keeps it simple: 0% forever.
        </p>
      </div>

      <Card className="p-8 bg-gradient-to-br from-night-blue-500 to-night-blue-500 border-night-blue-500">
        <div className="mb-8">
          <label className="block text-lg font-semibold text-white mb-4">
            What's your monthly earnings goal?
          </label>

          <div className="relative max-w-2xl mx-auto">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-xl opacity-75 blur-sm animate-pulse"></div>
            <div className="relative bg-night-blue-shadow-700 rounded-xl overflow-hidden border-2 border-orange-500/30 shadow-lg shadow-orange-500/20">
              <div className="flex items-stretch divide-x divide-night-blue-500">
                <div className="flex-shrink-0 bg-night-blue-500/50">
                  <select
                    value={currency.code}
                    onChange={(e) => setCurrency(currencies.find(c => c.code === e.target.value) || currencies[0])}
                    className="h-full px-4 py-3 bg-transparent text-white text-sm font-semibold focus:outline-none cursor-pointer appearance-none hover:bg-night-blue-500/80 transition-colors"
                    style={{ minWidth: '140px' }}
                  >
                    {currencies.map((curr) => (
                      <option key={curr.code} value={curr.code} className="bg-night-blue-shadow-700">
                        {curr.symbol} {curr.code}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 flex items-center px-4">
                  <span className="text-night-blue-300 text-xl font-bold mr-2">
                    {currency.symbol}
                  </span>
                  <input
                    type="text"
                    value={displayValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="flex-1 bg-transparent text-white text-2xl font-bold focus:outline-none placeholder-night-blue-400"
                    placeholder="10,000"
                  />
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-night-blue-400 text-center mt-3">Amounts converted to USD for comparison</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[results.onlyfans, results.throne, results.linktree, results.katoa].map((platform) => (
            <div
              key={platform.platform}
              className={`relative p-6 rounded-xl bg-gradient-to-br ${platform.color} ${
                platform.platform === 'KATOA' ? 'ring-4 ring-emerald-400 scale-105' : ''
              } transition-transform hover:scale-105`}
            >
              {platform.platform === 'KATOA' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="px-4 py-1 bg-yellow-400 text-night-blue-shadow-700 text-xs font-bold rounded-full shadow-lg">
                    BEST VALUE
                  </span>
                </div>
              )}

              <h3 className="text-white font-bold text-xl mb-4">{platform.platform}</h3>

              <div className="space-y-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-white/70 text-sm">Monthly Fees</p>
                  <p className={`text-2xl font-black ${platform.fees === 0 ? 'text-white' : 'text-red-100'}`}>
                    {formatCurrency(platform.fees)}
                  </p>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-white/70 text-sm">You Keep</p>
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
          ))}
        </div>

        <div className="mt-8 p-6 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
              <DollarSign size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-white mb-2">
                Save {formatCurrency(maxSavings)} per month
              </h4>
              <p className="text-emerald-300 text-lg">
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
            className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-lg font-bold px-12"
          >
            Start Keeping 100% Today
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="p-10 bg-gradient-to-br from-gray-900 via-gray-800 to-black border-2 border-gray-700 hover:border-blue-500/50 text-center hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-2">
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/60 transform hover:scale-110 hover:rotate-12 transition-all duration-300">
            <DollarSign size={56} className="text-white" strokeWidth={2.5} />
          </div>
          <h3 className="text-3xl font-black text-white mb-6 tracking-tight">195+ Countries</h3>
          <div className="space-y-3">
            <p className="text-gray-300 text-base font-semibold">
              Throne: ~10 countries with 0% fees
            </p>
            <div className="text-emerald-400 font-bold text-lg bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 py-3 px-5 rounded-xl border border-emerald-500/30">
              KATOA: All countries, always 0%
            </div>
          </div>
        </Card>

        <Card className="p-10 bg-gradient-to-br from-gray-900 via-gray-800 to-black border-2 border-gray-700 hover:border-orange-500/50 text-center hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 transform hover:-translate-y-2">
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/60 transform hover:scale-110 hover:rotate-12 transition-all duration-300">
            <TrendingDown size={56} className="text-white" strokeWidth={2.5} />
          </div>
          <h3 className="text-3xl font-black text-white mb-6 tracking-tight">Instant Settlement</h3>
          <div className="space-y-3">
            <p className="text-gray-300 text-base font-semibold">
              OnlyFans: 7-day rolling payout
            </p>
            <div className="text-emerald-400 font-bold text-lg bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 py-3 px-5 rounded-xl border border-emerald-500/30">
              KATOA: Instant Lightning Network
            </div>
          </div>
        </Card>

        <Card className="p-10 bg-gradient-to-br from-gray-900 via-gray-800 to-black border-2 border-gray-700 hover:border-purple-500/50 text-center hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 transform hover:-translate-y-2">
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/60 transform hover:scale-110 hover:rotate-12 transition-all duration-300">
            <AlertCircle size={56} className="text-white" strokeWidth={2.5} />
          </div>
          <h3 className="text-3xl font-black text-white mb-6 tracking-tight">True Privacy</h3>
          <div className="space-y-3">
            <p className="text-gray-300 text-base font-semibold">
              Competitors: Server-based data collection
            </p>
            <div className="text-emerald-400 font-bold text-lg bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 py-3 px-5 rounded-xl border border-emerald-500/30">
              KATOA: Zero-knowledge proofs
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
