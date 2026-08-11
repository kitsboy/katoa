import { useState } from 'react';
import { Radio, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { hasNip07, nip07UserMessage, nostrService } from '../lib/nostr';
import { useToast } from './Toast';

type Item = { title: string; price_sats: number; description: string };

/** Publish wishlist snapshot to Nostr (NIP-78 kind 30078) via NIP-07. */
export function NostrPublishWishlist({
  title,
  description,
  slug,
  items,
  className = '',
}: {
  title: string;
  description: string;
  slug: string;
  items: Item[];
  className?: string;
}) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [lastId, setLastId] = useState<string | null>(null);

  async function publish() {
    setBusy(true);
    try {
      if (!hasNip07()) {
        toast(nip07UserMessage(new Error('Nostr extension not found')), 'error');
        return;
      }
      const id = await nostrService.publishWishlist({
        title,
        description,
        slug,
        items: items.map((i) => ({
          title: i.title,
          price_sats: i.price_sats,
          description: i.description || '',
        })),
      });
      if (!id) {
        toast('Publish failed — approve signing and check relays', 'error');
        return;
      }
      setLastId(id);
      toast('Wishlist published to Nostr relays', 'success');
    } catch (e) {
      toast(nip07UserMessage(e), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`rounded-xl border border-purple-500/25 bg-purple-500/5 p-3 sm:p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
          <Radio size={18} className="text-purple-300" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white">Publish to Nostr</p>
          <p className="text-[11px] text-gray-400 leading-relaxed mb-2">
            Signs a NIP-78 event with your extension. Fans can discover your wishlist outside KATOA. We never
            hold keys.
          </p>
          <Button
            type="button"
            variant="outline"
            className="min-h-[44px] w-full sm:w-auto border-purple-500/40 text-purple-200"
            disabled={busy}
            onClick={() => void publish()}
          >
            {busy ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" /> Publishing…
              </>
            ) : (
              'Publish wishlist to relays'
            )}
          </Button>
          {lastId && (
            <p className="mt-2 text-[10px] font-mono text-gray-500 break-all">Event: {lastId.slice(0, 16)}…</p>
          )}
        </div>
      </div>
    </div>
  );
}
