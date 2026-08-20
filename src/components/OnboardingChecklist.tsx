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

const items: ChecklistItem[] = [
  { id: 'account', labelKey: 'onboarding.item.account', href: '/auth' },
  { id: 'wallet', labelKey: 'onboarding.item.wallet', href: '/settings' },
  { id: 'wishlist', labelKey: 'onboarding.item.wishlist', href: '/dashboard' },
  { id: 'share', labelKey: 'onboarding.item.share', href: '/explore' },
  { id: 'firstsat', labelKey: 'onboarding.item.firstsat', href: '/explore' },
];

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

export function OnboardingChecklist({ variant = 'landing' }: { variant?: 'landing' | 'dark' }) {
  const { t } = useLanguage();
  const { user, profile, isDemoUser } = useAuth();
  const [checked, setChecked] = useState<Record<string, boolean>>(loadProgress);
  const dark = variant === 'dark';

  useEffect(() => {
    setChecked((prev) => {
      const next = { ...prev };
      if (user) next.account = true;
      if (profile?.lightning_address) next.wallet = true;
      if (isDemoUser && demoWishlistsExist()) next.wishlist = true;
      return next;
    });

    if (!user || isDemoUser || !isSupabaseConfigured()) return;

    let cancelled = false;
    const userId = user.id;
    void (async () => {
      try {
        const { count } = await supabase
          .from('wishlists')
          .select('id', { count: 'exact', head: true })
          .eq('creator_id', userId);
        if (!cancelled && (count ?? 0) > 0) {
          setChecked((prev) => (prev.wishlist ? prev : { ...prev, wishlist: true }));
        }
      } catch {
        /* live wishlist count is optional */
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

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  if (allDone) return null;

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
        </div>
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
                  {t(item.labelKey)}
                </span>
                {!isChecked && (
                  <Link
                    href={item.href}
                    className={dark ? 'text-xs font-semibold text-neon-cyan-400 shrink-0' : 'lp-onboarding-link shrink-0'}
                  >
                    {t('common.go')} →
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}