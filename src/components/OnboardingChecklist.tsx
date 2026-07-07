import { useEffect, useState } from 'react';
import { Check, Circle, Clock } from 'lucide-react';
import { Link } from './Link';
import { useLanguage } from '../contexts/LanguageContext';
import { GlassSection } from './GlassSection';

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
    <GlassSection glow="cyan" className="max-w-3xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-xs font-medium text-neon-cyan mb-3">
            <Clock size={14} />
            {t('onboarding.badge')}
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-1">{t('onboarding.title')}</h3>
          <p className="text-sm text-gray-400">{t('onboarding.subtitle')}</p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-2xl font-black text-neon-cyan">{completedCount}</span>
          <span className="text-gray-500 text-sm">/{items.length}</span>
        </div>
      </div>

      <ul className="space-y-3">
        {items.map((item) => {
          const isChecked = !!checked[item.id];
          return (
            <li key={item.id}>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-neon-cyan/30 transition-colors">
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  className={`shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all touch-manipulation ${
                    isChecked
                      ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan'
                      : 'border-white/20 text-gray-500 hover:border-neon-cyan/50'
                  }`}
                  aria-label={isChecked ? 'Mark incomplete' : 'Mark complete'}
                >
                  {isChecked ? <Check size={16} /> : <Circle size={16} />}
                </button>
                <span className={`flex-1 text-sm sm:text-base ${isChecked ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                  {t(item.labelKey)}
                </span>
                {!isChecked && (
                  <Link
                    href={item.href}
                    className="text-xs font-semibold text-neon-cyan hover:text-neon-cyan-300 shrink-0"
                  >
                    {t('common.go')} →
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </GlassSection>
  );
}