import { Heart, Clock } from 'lucide-react';

interface ContributionCardProps {
  contributorName: string;
  amountSats: number;
  message?: string;
  timestamp: string;
  isAnonymous?: boolean;
  rank?: number;
}

export function ContributionCard({
  contributorName,
  amountSats,
  message,
  timestamp,
  isAnonymous = false,
  rank,
}: ContributionCardProps) {
  const formatSats = (sats: number): string => {
    return new Intl.NumberFormat().format(sats);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getRankBadge = (rankNum: number) => {
    const badges = {
      1: { emoji: '🥇', color: 'from-yellow-400 to-orange-500', label: 'Top Supporter' },
      2: { emoji: '🥈', color: 'from-slate-300 to-slate-400', label: '2nd Place' },
      3: { emoji: '🥉', color: 'from-amber-600 to-amber-700', label: '3rd Place' },
    };
    return badges[rankNum as keyof typeof badges];
  };

  const rankBadge = rank && rank <= 3 ? getRankBadge(rank) : null;

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-700 rounded-xl p-5 hover-lift animate-scale-in">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {isAnonymous ? '?' : contributorName[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-white font-semibold">
                {isAnonymous ? 'Anonymous' : contributorName}
              </h4>
              {rankBadge && (
                <div
                  className={`px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${rankBadge.color} text-white flex items-center gap-1`}
                  title={rankBadge.label}
                >
                  {rankBadge.emoji}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <Clock size={12} />
              <span>{formatDate(timestamp)}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-emerald-400 font-bold text-lg">
            {formatSats(amountSats)}
          </div>
          <div className="text-slate-500 text-xs">sats</div>
        </div>
      </div>
      {message && (
        <div className="mt-3 pt-3 border-t border-slate-700">
          <p className="text-slate-300 text-sm italic flex items-start gap-2">
            <Heart size={14} className="text-pink-500 flex-shrink-0 mt-0.5" />
            <span>"{message}"</span>
          </p>
        </div>
      )}
    </div>
  );
}
