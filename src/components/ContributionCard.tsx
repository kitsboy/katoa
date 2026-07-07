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
  const formatSats = (sats: number): string => new Intl.NumberFormat().format(sats);

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
      2: { emoji: '🥈', color: 'from-gray-300 to-gray-400', label: '2nd Place' },
      3: { emoji: '🥉', color: 'from-amber-600 to-amber-700', label: '3rd Place' },
    };
    return badges[rankNum as keyof typeof badges];
  };

  const rankBadge = rank && rank <= 3 ? getRankBadge(rank) : null;

  return (
    <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl p-4 sm:p-5 hover:border-neon-cyan-500/30 transition-all animate-scale-in">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg">
            {isAnonymous ? '?' : contributorName[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-white font-semibold text-sm sm:text-base truncate">
                {isAnonymous ? 'Anonymous' : contributorName}
              </h4>
              {rankBadge && (
                <div
                  className={`px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${rankBadge.color} text-white flex items-center gap-1 shrink-0`}
                  title={rankBadge.label}
                >
                  {rankBadge.emoji}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
              <Clock size={12} />
              <span>{formatDate(timestamp)}</span>
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-emerald-400 font-bold text-base sm:text-lg">{formatSats(amountSats)}</div>
          <div className="text-gray-500 text-xs">sats</div>
        </div>
      </div>
      {message && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-gray-300 text-sm italic flex items-start gap-2">
            <Heart size={14} className="text-pink-500 shrink-0 mt-0.5" />
            <span>&ldquo;{message}&rdquo;</span>
          </p>
        </div>
      )}
    </div>
  );
}