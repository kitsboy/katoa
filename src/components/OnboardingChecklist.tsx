import { useEffect, useState } from 'react';
import { Check, Circle } from 'lucide-react';
import { Link } from './Link';
import { useLanguage } from '../contexts/LanguageContext';

const STORAGE_KEY = 'katoa-onboarding-checklist';

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
];

function loadProgress(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function OnboardingChecklist() {
  const { t } = useLanguage();
  const [checked, setChecked] = useState<Record<string, boolean>>(loadProgress);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
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
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight mb-1">
            {t('onboarding.title')}
          </h3>
          <p className="text-sm text-gray-500">{t('onboarding.subtitle')}</p>
        </div>
        <div className="text-right shrink-0 tabular-nums">
          <span className="text-2xl font-semibold text-gray-900">{completedCount}</span>
          <span className="text-gray-500 text-sm">/{items.length}</span>
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
                <span className={`flex-1 text-sm ${isChecked ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                  {t(item.labelKey)}
                </span>
                {!isChecked && (
                  <Link href={item.href} className="text-xs font-medium text-white hover:text-gray-300 shrink-0">
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