import { Check, Crown } from 'lucide-react';
import { Button } from './Button';
import { DemoBadge } from './DemoBadge';
import type { SubscriptionState } from '../lib/subscriptions';
import { formatRelativeTime } from '../lib/i18nFormat';

interface ManageSubscriptionPanelProps {
  creatorSlug: string;
  /** The active subscription as the gate resolved it (DB row, or the demo seam). */
  state: SubscriptionState | null;
  onUnsubscribe: () => void;
  t: (key: string) => string;
}

/**
 * "You're subscribed" manage panel.
 *
 * The state comes from the caller's subscription gate, so a DB-confirmed row and
 * the labelled demo seam are not confused: only `source === 'invoice'` says a
 * Lightning payment settled.
 */
export function ManageSubscriptionPanel({
  creatorSlug,
  state,
  onUnsubscribe,
  t,
}: ManageSubscriptionPanelProps) {
  if (!state || state.creatorSlug !== creatorSlug) return null;

  const since =
    state.subscribedAt > 0 ? formatRelativeTime(new Date(state.subscribedAt)) : '—';
  const isLocal = state.source !== 'invoice';
  const expires =
    state.activeUntil && state.activeUntil > 0
      ? new Date(state.activeUntil).toLocaleDateString()
      : null;

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
              {isLocal && (
                <DemoBadge
                  label="Local"
                  title="Unlocked on this device. Not a Lightning settlement."
                  className="ml-1"
                />
              )}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {t('creator.tier')}: <span className="text-emerald-300 font-semibold capitalize">{state.tierId}</span>
              {' · '}
              {t('creator.since')} {since}
              {' · '}
              {isLocal ? 'source local (demo seam)' : 'source invoice (webhook confirmed)'}
            </p>
            {expires && (
              <p className="text-[11px] text-gray-400 mt-1">Renews or re-locks after {expires}</p>
            )}
            {isLocal && (
              <p className="text-[11px] text-gray-500 mt-1">
                Unlocks on this device until Lightning webhooks exist.
              </p>
            )}
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={onUnsubscribe} className="min-h-[44px]">
          {t('creator.unsubscribe')}
        </Button>
      </div>
    </div>
  );
}
