import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface BitcoinData {
  price: number;
  priceChange: number;
  hashrate: string;
}

export function BitcoinStats() {
  const [data, setData] = useState<BitcoinData>({
    price: 0,
    priceChange: 0,
    hashrate: '...',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBitcoinData();

    // Update price every 10 seconds
    const priceInterval = setInterval(fetchBitcoinPrice, 10000);

    // Update hashrate every hour
    const hashrateInterval = setInterval(fetchHashrate, 3600000);

    return () => {
      clearInterval(priceInterval);
      clearInterval(hashrateInterval);
    };
  }, []);

  async function fetchBitcoinPrice() {
    try {
      const response = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=BTC');
      const result = await response.json();
      const price = parseFloat(result.data.rates.USD);

      setData(prev => {
        const priceChange = prev.price ? ((price - prev.price) / prev.price) * 100 : 0;
        return { ...prev, price, priceChange };
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching Bitcoin price:', error);
    }
  }

  async function fetchHashrate() {
    try {
      const response = await fetch('https://blockchain.info/q/hashrate');
      const hashrateValue = await response.text();
      const hashrateNumber = parseFloat(hashrateValue);

      // Convert to EH/s (Exahash per second)
      const hashrateEH = (hashrateNumber / 1000000).toFixed(2);
      setData(prev => ({ ...prev, hashrate: `${hashrateEH} EH/s` }));
    } catch (error) {
      console.error('Error fetching hashrate:', error);
      setData(prev => ({ ...prev, hashrate: 'N/A' }));
    }
  }

  async function fetchBitcoinData() {
    await Promise.all([fetchBitcoinPrice(), fetchHashrate()]);
  }

  const isPositive = data.priceChange >= 0;

  return (
    <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
      {/* Bitcoin Price */}
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 border border-gray-800 rounded-lg backdrop-blur-sm">
        <span className="text-gray-500 font-medium">BTC</span>
        {loading ? (
          <span className="text-gray-400">Loading...</span>
        ) : (
          <>
            <span className="text-white font-bold">
              ${data.price.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
            <div className={`flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span className="text-xs font-semibold">
                {isPositive ? '+' : ''}{data.priceChange.toFixed(2)}%
              </span>
            </div>
          </>
        )}
      </div>

      {/* Hash Rate */}
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 border border-gray-800 rounded-lg backdrop-blur-sm">
        <Activity size={16} className="text-orange-500" />
        <span className="text-gray-500 font-medium">Hash Rate</span>
        <span className="text-white font-bold">{data.hashrate}</span>
      </div>
    </div>
  );
}
