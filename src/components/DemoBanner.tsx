import { Link } from './Link';
import { Sparkles } from 'lucide-react';

interface DemoBannerProps {
  message?: string;
}

export function DemoBanner({
  message = 'Demo mode — explore with sample data. No account required.',
}: DemoBannerProps) {
  return (
    <div className="bg-bitcoin-orange-500/10 border-b border-bitcoin-orange-500/30 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-2 text-center text-sm">
        <Sparkles size={16} className="text-bitcoin-orange-400 shrink-0" />
        <span className="text-bitcoin-orange-200">{message}</span>
        <Link href="/wishlist/medellin-skate-park" className="text-neon-cyan-400 font-semibold hover:underline touch-manipulation">
          Try demo wishlist →
        </Link>
      </div>
    </div>
  );
}