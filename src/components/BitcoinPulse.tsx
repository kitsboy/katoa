import { useEffect, useState } from 'react';
import { TrendingUp, Activity, BarChart2 } from 'lucide-react';
import { GlassSection } from './GlassSection';

interface BitcoinPulseData {
    timestamp: string;
    btc_price: number;
    fear_greed: number;
    sentiment: string;
    trend_24h: string;
    source: string;
}

export function BitcoinPulse() {
    const [data, setData] = useState<BitcoinPulseData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const timestamp = new Date().getTime(); // Prevent browser caching
                const response = await fetch(`/live-data/bitcoin-pulse.json?t=${timestamp}`);
                if (!response.ok) throw new Error('Failed to fetch pulse data');
                const json = await response.json();
                setData(json);
                setError(null);
            } catch (err) {
                console.error('Error fetching Bitcoin pulse:', err);
                setError('Waiting for live data feed...');
            }
        };

        fetchData(); // Initial fetch
        const interval = setInterval(fetchData, 5 * 60 * 1000); // Poll every 5 minutes

        return () => clearInterval(interval);
    }, []);

    if (error || !data) {
        return (
            <GlassSection className="max-w-md w-full mx-auto relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/5 to-transparent shadow-[inset_0_0_20px_rgba(20,230,255,0.05)]"></div>
                <div className="relative p-6 flex flex-col items-center justify-center text-center opacity-70">
                    <Activity className="text-neon-cyan mb-2 animate-pulse" size={32} />
                    <p className="text-sm font-mono text-neon-cyan">{error || 'Initializing Feed...'}</p>
                </div>
            </GlassSection>
        );
    }

    return (
        <GlassSection className="max-w-3xl w-full mx-auto relative overflow-hidden group" glow="cyan">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-neon-cyan to-bitcoin-orange rounded-l-2xl"></div>

            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Activity className="text-neon-cyan animate-pulse" size={20} />
                    <h3 className="font-display font-bold text-white tracking-wider text-sm uppercase">Bitcoin Pulse</h3>
                </div>
                <div className="text-[10px] font-mono whitespace-nowrap px-2 py-1 rounded bg-black/40 text-gray-400 border border-white/10">
                    Last Updated: {new Date(data.timestamp).toLocaleTimeString()}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Price */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col items-center justify-center">
                    <span className="text-xs text-gray-400 mb-2 uppercase tracking-wider font-semibold">Live Price</span>
                    <span className="text-2xl font-bold font-mono text-bitcoin-orange glow-orange">
                        ${data.btc_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </div>

                {/* Fear & Greed */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col items-center justify-center">
                    <span className="text-xs text-gray-400 mb-2 uppercase tracking-wider font-semibold flex items-center gap-1">
                        <BarChart2 size={12} /> Fear & Greed
                    </span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold font-mono text-white">{data.fear_greed}</span>
                        <span className="text-xs font-semibold text-red-400 uppercase">({data.sentiment})</span>
                    </div>
                </div>

                {/* Trend */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col items-center justify-center">
                    <span className="text-xs text-gray-400 mb-2 uppercase tracking-wider font-semibold">24hr Trend</span>
                    <span className="text-2xl font-bold font-mono text-neon-cyan glow-cyan flex items-center gap-1">
                        <TrendingUp size={20} /> {data.trend_24h}
                    </span>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-[10px] text-gray-500 font-mono">
                <span>Source: {data.source}</span>
                <span className="flex items-center gap-1 text-neon-cyan/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-ping"></div> Live Sync Active
                </span>
            </div>
        </GlassSection>
    );
}
