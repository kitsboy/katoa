import { useEffect, useState } from 'react';
import { Check, Circle } from 'lucide-react';
import { Link } from './Link';
import { useLanguage } from '../contexts/LanguageContext';
import { STORAGE_KEYS } from '../lib/storage';

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

export function OnboardingChecklist() {
  const { t } = useLanguage();
  const [checked, setChecked] = useState<Record<string, boolean>>(loadProgress);

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
    <div className="lp-onboarding">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="lp-eyebrow mb-2">{t('onboarding.badge')}</p>
          <h2 className="lp-onboarding-title">
            {t('onboarding.title')}
          </h2>
          <p className="lp-onboarding-subtitle">{t('onboarding.subtitle')}</p>
        </div>
        <div className="text-right shrink-0 tabular-nums">
          <span className="lp-onboarding-count">{completedCount}</span>
          <span className="lp-onboarding-count-total">/{items.length}</span>
        </div>
      </div>

      <ul className="space-y-2">
        {items.map((item) => {
          const isChecked = !!checked[item.id];
          return (
            <li key={item.id}>
              <div className="lp-onboarding-item">
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  className={`lp-onboarding-check ${isChecked ? 'lp-onboarding-check-done' : ''}`}
                  aria-label={isChecked ? 'Mark incomplete' : 'Mark complete'}
                >
                  {isChecked ? <Check size={14} /> : <Circle size={14} />}
                </button>
                <span className={`lp-onboarding-label ${isChecked ? 'lp-onboarding-label--done' : ''}`}>
                  {t(item.labelKey)}
                </span>
                {!isChecked && (
                  <Link href={item.href} className="lp-onboarding-link shrink-0">
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