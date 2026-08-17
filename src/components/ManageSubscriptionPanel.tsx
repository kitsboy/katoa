import { Check, Crown } from 'lucide-react';
import { Button } from './Button';
import { getSubscription } from '../lib/subscriptions';
import { formatRelativeTime } from '../lib/i18nFormat';

interface ManageSubscriptionPanelProps {
  creatorSlug: string;
  onUnsubscribe: () => void;
  t: (key: string) => string;
}

/**
 * \"You're subscribed\" manage panel — shows the active tier, how long the
 * subscription has been active, and an unsubscribe action. Client-side demo
 * (local seam) until the Lightning backend ships.
 */
export function ManageSubscriptionPanel({
  creatorSlug,
  onUnsubscribe,
  t,
}: ManageSubscriptionPanelProps) {
  const sub = getSubscription(creatorSlug);
  if (!sub) return null;

  const since =
    sub.subscribedAt > 0
      ? formatRelativeTime(new Date(sub.subscribedAt))
      : '—';

  return (
    <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20">
            <Crown size={20} className="text-emerald-400" />
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-white font-bold">
              <Check size={16} className="text-emerald-400" />
              {t('creator.youreSubscribed')}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {t('creator.tier')}: <span className="text-emerald-300 font-semibold capitalize">{sub.tierId}</span>
              {' · '}
              {t('creator.since')} {since}
            </p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={onUnsubscribe}>
          {t('creator.unsubscribe')}
        </Button>
      </div>
    </div>
  );
}
