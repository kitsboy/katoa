import { useState } from 'react';
import { DollarSign, TrendingDown, AlertCircle } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';

export function FeeComparison() {
  const [monthlyEarnings, setMonthlyEarnings] = useState(10000);

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

  const results = calculateFees(monthlyEarnings);
  const savings = {
    vsThrone: results.throne.fees,
    vsLinktree: results.linktree.fees,
    vsOnlyFans: results.onlyfans.fees,
  };

  const maxSavings = Math.max(savings.vsThrone, savings.vsLinktree, savings.vsOnlyFans);

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          The True Cost of Platform Fees
        </h2>
        <p className="text-xl text-slate-400 max-w-3xl mx-auto">
          See how much you're losing to competitors' fees. KATOA keeps it simple: 0% forever.
        </p>
      </div>

      <Card className="p-8 bg-gradient-to-br from-slate-800 to-slate-700 border-slate-700">
        <div className="mb-8">
          <label className="block text-lg font-semibold text-white mb-4">
            What's your monthly earnings goal?
          </label>
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={24} />
            <input
              type="number"
              value={monthlyEarnings}
              onChange={(e) => setMonthlyEarnings(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full pl-14 pr-4 py-4 bg-slate-900 border-2 border-slate-700 rounded-xl text-white text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="10000"
            />
          </div>
          <p className="text-sm text-slate-500 mt-2">Enter your target monthly earnings in USD</p>
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
                  <span className="px-4 py-1 bg-yellow-400 text-slate-900 text-xs font-bold rounded-full shadow-lg">
                    BEST VALUE
                  </span>
                </div>
              )}

              <h3 className="text-white font-bold text-xl mb-4">{platform.platform}</h3>

              <div className="space-y-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-white/70 text-sm">Monthly Fees</p>
                  <p className={`text-2xl font-black ${platform.fees === 0 ? 'text-white' : 'text-red-300'}`}>
                    ${platform.fees.toLocaleString()}
                  </p>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-white/70 text-sm">You Keep</p>
                  <p className="text-2xl font-black text-white">
                    ${platform.net.toLocaleString()}
                  </p>
                </div>

                {platform.platform !== 'KATOA' && (
                  <div className="pt-3 border-t border-white/20">
                    <div className="flex items-center gap-2 text-red-300 text-sm font-semibold">
                      <TrendingDown size={16} />
                      <span>-{((platform.fees / monthlyEarnings) * 100).toFixed(1)}% lost</span>
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
                Save ${maxSavings.toLocaleString()} per month
              </h4>
              <p className="text-emerald-300 text-lg">
                That's ${(maxSavings * 12).toLocaleString()} per year back in your pocket with KATOA.
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <div className="text-4xl mb-3">🌍</div>
          <h3 className="text-xl font-bold text-white mb-2">195+ Countries</h3>
          <p className="text-slate-400">
            Throne: ~10 countries with 0% fees
            <br />
            <span className="text-emerald-400 font-semibold">KATOA: All countries, always 0%</span>
          </p>
        </Card>

        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <div className="text-4xl mb-3">⚡</div>
          <h3 className="text-xl font-bold text-white mb-2">Instant Settlement</h3>
          <p className="text-slate-400">
            OnlyFans: 7-day rolling payout
            <br />
            <span className="text-emerald-400 font-semibold">KATOA: Instant Lightning Network</span>
          </p>
        </Card>

        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <div className="text-4xl mb-3">🔐</div>
          <h3 className="text-xl font-bold text-white mb-2">True Privacy</h3>
          <p className="text-slate-400">
            Competitors: Server-based data collection
            <br />
            <span className="text-emerald-400 font-semibold">KATOA: Zero-knowledge proofs</span>
          </p>
        </Card>
      </div>
    </div>
  );
}
