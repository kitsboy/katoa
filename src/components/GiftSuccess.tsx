import { Check, Share2 } from 'lucide-react';
import { Button } from './Button';

/** Lightweight success state after a gift intent (non-custodial — not a payment confirmation). */
export function GiftSuccess({
  onClose,
  onShare,
  message = 'Intent recorded. Complete the payment in your wallet — funding updates after confirmation.',
}: {
  onClose: () => void;
  onShare?: () => void;
  message?: string;
}) {
  return (
    <div className="text-center py-6 px-2" role="status">
      <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center mb-4 animate-scale-in">
        <Check size={32} className="text-emerald-400" />
      </div>
      <h3 className="text-xl font-display font-bold text-white mb-2">Thank you</h3>
      <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-sm mx-auto">{message}</p>
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        {onShare && (
          <Button variant="secondary" onClick={onShare} className="min-h-[48px]">
            <Share2 size={16} className="mr-2" />
            Share this wishlist
          </Button>
        )}
        <Button variant="primary" onClick={onClose} className="min-h-[48px]">
          Done
        </Button>
      </div>
    </div>
  );
}
