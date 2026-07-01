import { useEffect, useState, type ReactNode } from 'react';
import { Activity, Blocks, Quote, TrendingUp, Zap } from 'lucide-react';
import { getBitcoinPrice, formatUsd } from '../lib/bitcoinPrice';
import { bitcoinQuotes } from '../data/footerJobs';

interface PulseSnippet {
  btc_price?: number;
  fear_greed?: number;
  trend_24h?: string;
}

export function FooterBitcoinStrip() {
  const [price, setPrice] = useState<number | null>(null);
  const [pulse, setPulse] = useState<PulseSnippet | null>(null);
  const [blockHeight, setBlockHeight] = useState<number | null>(null);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    getBitcoinPrice().then(setPrice).catch(() => setPrice(null));

    fetch('/live-data/bitcoin-pulse.json')
      .then((r) => r.json())
      .then(setPulse)
      .catch(() => null);

    fetch('https://mempool.space/api/blocks/tip/height')
      .then((r) => r.json())
      .then((h) => setBlockHeight(typeof h === 'number' ? h : null))
      .catch(() => null);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % bitcoinQuotes.length);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  const quote = bitcoinQuotes[quoteIndex];
  const satsPerDollar = price ? Math.round(100_000_000 / price) : null;

  return (
    <div className="border-b border-white/10 bg-gradient-to-r from-charcoal-950 via-charcoal-900 to-charcoal-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-5 flex flex-wrap gap-2 sm:gap-3">
            <StatPill icon={<Zap size={14} className="text-bitcoin-orange-500" />} label="BTC/USD">
              {price ? formatUsd(price) : '—'}
            </StatPill>
            <StatPill icon={<TrendingUp size={14} className="text-neon-cyan-500" />} label="24h">
              {pulse?.trend_24h ?? '—'}
            </StatPill>
            <StatPill icon={<Activity size={14} className="text-emerald-400" />} label="Fear & Greed">
              {pulse?.fear_greed ?? '—'}
            </StatPill>
            <StatPill icon={<Blocks size={14} className="text-purple-400" />} label="Block">
              {blockHeight ? `#${blockHeight.toLocaleString()}` : '—'}
            </StatPill>
            {satsPerDollar && (
              <StatPill icon={<span className="text-[10px] font-bold text-bitcoin-orange-500">₿</span>} label="$1 ≈">
                {satsPerDollar.toLocaleString()} sats
              </StatPill>
            )}
          </div>

          <div className="lg:col-span-7 flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
            <Quote size={18} className="text-neon-cyan-500 shrink-0 mt-0.5 opacity-80" />
            <div className="min-w-0">
              <p className="text-sm text-gray-300 italic leading-relaxed transition-opacity duration-500">
                "{quote.text}"
              </p>
              <p className="text-xs text-gray-500 mt-1 font-mono">— {quote.author}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatPill({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs">
      {icon}
      <span className="text-gray-500 uppercase tracking-wider font-semibold">{label}</span>
      <span className="text-white font-mono font-bold">{children}</span>
    </div>
  );
}