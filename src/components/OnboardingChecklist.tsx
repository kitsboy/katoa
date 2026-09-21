import { useEffect, useState } from 'react';
import { Check, Circle } from 'lucide-react';
import { Link } from './Link';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getStorage, STORAGE_KEYS } from '../lib/storage';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface ChecklistItem {
  id: string;
  labelKey: string;
  href: string;
}

function loadProgress(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.onboardingChecklist);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function demoWishlistsExist(): boolean {
  const stored = getStorage<Array<{ wishlist_count?: number }>>(STORAGE_KEYS.demoDashboardProjects, []);
  if (stored.some((p) => (p.wishlist_count ?? 0) > 0)) return true;
  const wl = getStorage<Record<string, unknown[]>>(STORAGE_KEYS.demoProjectWishlists, {});
  return Object.values(wl).some((arr) => Array.isArray(arr) && arr.length > 0);
}

function demoProfileIsPublished(): boolean {
  const projects = getStorage<Array<{ visibility?: string }>>(STORAGE_KEYS.demoDashboardProjects, []);
  return projects.some((project) => project.visibility === 'public');
}

export function OnboardingChecklist({ variant = 'landing' }: { variant?: 'landing' | 'dark' }) {
  const { t } = useLanguage();
  const { user, profile, isDemoUser } = useAuth();
  const [checked, setChecked] = useState<Record<string, boolean>>(loadProgress);
  const dark = variant === 'dark';
  const publicHref = profile?.username ? `/u/${profile.username}` : '/dashboard';

  const items: ChecklistItem[] = [
    { id: 'wallet', labelKey: 'onboarding.item.wallet', href: '/settings' },
    { id: 'wishlist', labelKey: 'onboarding.item.wishlist', href: '/project' },
    { id: 'publish', labelKey: 'onboarding.item.publish', href: '/dashboard' },
    { id: 'share', labelKey: 'onboarding.item.share', href: publicHref },
  ];

  useEffect(() => {
    setChecked((prev) => {
      const next = { ...prev };
      if (profile?.lightning_address) next.wallet = true;
      if (isDemoUser && demoWishlistsExist()) next.wishlist = true;
      if (isDemoUser && demoProfileIsPublished()) next.publish = true;
      return next;
    });

    if (!user || isDemoUser || !isSupabaseConfigured()) return;

    let cancelled = false;
    const userId = user.id;
    const hasLightning = Boolean(profile?.lightning_address);
    void (async () => {
      try {
        const [wishlistRes, walletRes, publishedProjectRes, publishedWishlistRes] = await Promise.all([
          supabase.from('wishlists').select('id', { count: 'exact', head: true }).eq('creator_id', userId),
          hasLightning
            ? Promise.resolve({ count: 1 })
            : supabase.from('wallet_addresses').select('id', { count: 'exact', head: true }).eq('user_id', userId),
          supabase.from('projects').select('id', { count: 'exact', head: true }).eq('creator_id', userId).eq('visibility', 'public'),
          supabase.from('wishlists').select('id', { count: 'exact', head: true }).eq('creator_id', userId).eq('visibility', 'public'),
        ]);
        if (cancelled) return;
        setChecked((prev) => {
          const next = { ...prev };
          if ((wishlistRes.count ?? 0) > 0) next.wishlist = true;
          if ((walletRes.count ?? 0) > 0) next.wallet = true;
          if ((publishedProjectRes.count ?? 0) > 0 || (publishedWishlistRes.count ?? 0) > 0) next.publish = true;
          return next;
        });
      } catch {
        /* live wallet/wishlist counts are optional */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, profile?.lightning_address, isDemoUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.onboardingChecklist, JSON.stringify(checked));
  }, [checked]);

  const completedCount = items.filter((item) => checked[item.id]).length;
  const allDone = completedCount === items.length;
  const progressPercent = Math.round((completedCount / items.length) * 100);

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function handleShare() {
    const url = `${window.location.origin}${publicHref}`;
    const title = profile?.username ? `@${profile.username} on KATOA` : 'KATOA';
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, url });
        setChecked((prev) => ({ ...prev, share: true }));
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setChecked((prev) => ({ ...prev, share: true }));
      }
      return;
    }
    setChecked((prev) => ({ ...prev, share: true }));
  }

  if (allDone) {
    return (
      <div
        data-testid="creator-launch-ready"
        className={dark ? 'rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5' : 'lp-onboarding'}
      >
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-emerald-500/15 p-2 text-emerald-300" aria-hidden>
            <Check size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">100% ready</p>
            <h2 className="mt-1 text-lg font-bold text-white">You’re ready to share</h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-300">Wallet, wishlist, public profile, and share link are all set.</p>
            <Link href={publicHref} className="mt-3 inline-flex min-h-[40px] items-center rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 text-sm font-bold text-emerald-200">View public profile →</Link>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Creator launch progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={100}>
          <div className="h-full w-full rounded-full bg-gradient-to-r from-emerald-400 to-neon-cyan-400" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        dark
          ? 'rounded-2xl border border-white/10 bg-white/[0.03] p-5'
          : 'lp-onboarding'
      }
    >
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className={dark ? 'text-[10px] uppercase tracking-[0.18em] text-bitcoin-orange-400 font-semibold mb-2' : 'lp-eyebrow mb-2'}>
            {t('onboarding.badge')}
          </p>
          <h2 className={dark ? 'text-lg font-bold text-white mb-1' : 'lp-onboarding-title'}>
            {t('onboarding.title')}
          </h2>
          <p className={dark ? 'text-sm text-gray-400' : 'lp-onboarding-subtitle'}>{t('onboarding.subtitle')}</p>
        </div>
        <div className="text-right shrink-0 tabular-nums">
          <span className={dark ? 'text-xl font-bold text-bitcoin-orange-400' : 'lp-onboarding-count'}>{completedCount}</span>
          <span className={dark ? 'text-sm text-gray-500' : 'lp-onboarding-count-total'}>/{items.length}</span>
          <span className="block text-[10px] font-bold text-gray-500">{progressPercent}%</span>
        </div>
      </div>
      <div className="mb-5 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Creator launch progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercent}>
        <div className="h-full rounded-full bg-gradient-to-r from-bitcoin-orange-500 to-neon-cyan-400 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
      </div>

      <ul className="space-y-2">
        {items.map((item) => {
          const isChecked = !!checked[item.id];
          return (
            <li key={item.id}>
              <div
                className={
                  dark
                    ? 'flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/10 bg-black/20'
                    : 'lp-onboarding-item'
                }
              >
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  className={
                    dark
                      ? `w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${
                          isChecked
                            ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400'
                            : 'border-white/15 text-gray-500'
                        }`
                      : `lp-onboarding-check ${isChecked ? 'lp-onboarding-check-done' : ''}`
                  }
                  aria-label={isChecked ? 'Mark incomplete' : 'Mark complete'}
                >
                  {isChecked ? <Check size={14} /> : <Circle size={14} />}
                </button>
                <span
                  className={
                    dark
                      ? `flex-1 text-sm ${isChecked ? 'text-gray-500 line-through' : 'text-gray-200'}`
                      : `lp-onboarding-label ${isChecked ? 'lp-onboarding-label--done' : ''}`
                  }
                >
                  {item.id === 'publish' ? 'Publish your profile' : t(item.labelKey)}
                </span>
                {!isChecked && item.id === 'share' ? (
                  <button
                    type="button"
                    onClick={() => void handleShare()}
                    className={dark ? 'text-sm font-semibold text-neon-cyan-400 shrink-0 min-h-[36px]' : 'lp-onboarding-link shrink-0'}
                  >
                    {t('share.button')} →
                  </button>
                ) : !isChecked ? (
                  <Link
                    href={item.href}
                    className={dark ? 'text-sm font-semibold text-neon-cyan-400 shrink-0 min-h-[36px] inline-flex items-center' : 'lp-onboarding-link shrink-0'}
                  >
                    {t('common.go')} →
                  </Link>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
