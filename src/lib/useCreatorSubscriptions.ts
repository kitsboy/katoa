import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchDbSubscriptions,
  getSubscriptions,
  subscriptionGateMode,
  type SubscriptionGateMode,
  type SubscriptionState,
} from './subscriptions';

/**
 * Every creator slug this fan currently subscribes to, from the active gate.
 * Used where the keys are not known up front (nav badges).
 */
export function useSubscribedCreatorSlugs(): string[] {
  const { user, loading } = useAuth();
  const mode = useMemo(() => subscriptionGateMode(), []);
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    if (mode === 'demo') {
      setSlugs(Object.keys(getSubscriptions()).sort());
      return;
    }
    if (loading) return;
    if (!user) {
      setSlugs([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      const subs = await fetchDbSubscriptions();
      if (!cancelled) setSlugs(Object.keys(subs).sort());
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, loading, user]);

  return slugs;
}

export interface CreatorSubscriptionGate {
  /** True only when an active subscription is known for one of `keys`. */
  subscribed: boolean;
  /** How the unlock was established: a settled invoice, or the labelled demo seam. */
  source: 'invoice' | 'local' | 'none';
  mode: SubscriptionGateMode;
  /** The key that is subscribed / unlocked (drives "manage subscription"). */
  activeKey: string | null;
  /** All keys the active gate unlocks (for nav badges and feed gates). */
  unlockedKeys: string[];
  state: SubscriptionState | null;
  /** Re-read after a subscribe or cancel action. */
  refresh: () => void;
}

/**
 * Single source of truth for subscriber-only content.
 *
 * With Supabase configured (`mode: 'db'`) the only unlock is a `subscriptions`
 * row an active session can read — the local seam is not consulted at all, so a
 * browser-writable value cannot unlock locked posts. Without a backend
 * (`mode: 'demo'`) the labelled device seam is used, as the preview has no
 * authoritative source.
 */
export function useCreatorSubscriptions(keys: string[], refreshToken = 0): CreatorSubscriptionGate {
  const { user, loading } = useAuth();
  const mode = useMemo(() => subscriptionGateMode(), []);
  const [state, setState] = useState<SubscriptionState | null>(null);
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((v) => v + 1), []);
  // Keys are rewritten on every render by callers; key the effect by content.
  const keySignature = keys.join('|');

  useEffect(() => {
    let cancelled = false;
    const wanted = keySignature ? keySignature.split('|') : [];

    if (mode === 'demo') {
      const subs = getSubscriptions();
      const hit = wanted.find((key) => subs[key]);
      setState(hit ? subs[hit] : null);
      return;
    }

    // DB gate: wait for auth to settle, then read the fan's own rows.
    if (loading) return;
    if (!user) {
      setState(null);
      return;
    }

    void (async () => {
      const subs = await fetchDbSubscriptions();
      if (cancelled) return;
      const hit = wanted.find((key) => subs[key]);
      setState(hit ? subs[hit] : null);
    })();

    return () => {
      cancelled = true;
    };
  }, [mode, loading, user, keySignature, version, refreshToken]);

  const unlockedKeys = useMemo(() => {
    if (!state) return [];
    const wanted = keySignature ? keySignature.split('|') : [];
    return wanted.filter((key) => key === state.creatorSlug);
  }, [state, keySignature]);

  return {
    subscribed: Boolean(state),
    source: state ? state.source : 'none',
    mode,
    activeKey: state?.creatorSlug ?? null,
    unlockedKeys,
    state,
    refresh,
  };
}
