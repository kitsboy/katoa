import { Check, Share2 } from 'lucide-react';
import { Button } from './Button';
import { DemoBadge } from './DemoBadge';

/** Lightweight success state after a gift intent (non-custodial — not a payment confirmation). */
export function GiftSuccess({
  onClose,
  onShare,
  buyUrl,
  buyLabel = 'Buy the product',
  message = 'Intent recorded. Complete the payment in your wallet — funding updates after confirmation.',
  amountSats,
  method,
  status = 'pending',
}: {
  onClose: () => void;
  onShare?: () => void;
  buyUrl?: string | null;
  buyLabel?: string;
  message?: string;
  amountSats?: number;
  method?: 'lightning' | 'onchain' | 'nostr';
  status?: 'pending' | 'demo';
}) {
  const methodLabel =
    method === 'onchain' ? 'On-chain' : method === 'nostr' ? 'Nostr zap' : method === 'lightning' ? 'Lightning' : null;
  const amountLabel =
    typeof amountSats === 'number' && Number.isFinite(amountSats) && amountSats > 0
      ? `${amountSats.toLocaleString()} sats`
      : null;
  const isDemo = status === 'demo';

  return (
    <div className="text-center py-6 px-2" role="status">
      <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center mb-4 animate-scale-in">
        <Check size={32} className="text-emerald-400" />
      </div>
      <div className="flex items-center justify-center gap-2 mb-2">
        <h3 className="text-xl font-display font-bold text-white">Thank you</h3>
        <DemoBadge
          label={isDemo ? 'Demo' : 'Pending'}
          title={
            isDemo
              ? 'Sample gift — not a live settlement'
              : 'Waiting for wallet + server confirmation. Totals do not update in the browser.'
          }
        />
      </div>
      {(amountLabel || methodLabel) && (
        <p className="text-sm text-gray-300 font-semibold mb-2 tabular-nums">
          {[amountLabel, methodLabel].filter(Boolean).join(' · ')}
        </p>
      )}
      <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-sm mx-auto">{message}</p>
      <div className="flex flex-col gap-2 justify-center">
        {buyUrl && (
          <a
            href={buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center min-h-[48px] rounded-xl border border-neon-cyan-500/35 bg-neon-cyan-500/10 text-neon-cyan-300 font-bold text-sm"
          >
            {buyLabel}
          </a>
        )}
        {onShare ? (
          <Button type="button" variant="secondary" onClick={onShare} className="min-h-[48px]">
            <Share2 size={16} className="mr-2" />
            Share this wishlist
          </Button>
        ) : null}
        <Button type="button" variant="primary" onClick={onClose} className="min-h-[48px]">
          Done
        </Button>
      </div>
    </div>
  );
}
