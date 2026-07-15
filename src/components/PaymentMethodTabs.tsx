import { Zap, Bitcoin, Radio } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export type PaymentTab = 'lightning' | 'onchain' | 'nostr';

interface PaymentMethodTabsProps {
  value: PaymentTab;
  onChange: (tab: PaymentTab) => void;
}

export function PaymentMethodTabs({ value, onChange }: PaymentMethodTabsProps) {
  const { t } = useLanguage();

  const tabs: { id: PaymentTab; labelKey: string; icon: typeof Zap }[] = [
    { id: 'lightning', labelKey: 'payment.tab.lightning', icon: Zap },
    { id: 'onchain', labelKey: 'payment.tab.onchain', icon: Bitcoin },
    { id: 'nostr', labelKey: 'payment.tab.nostr', icon: Radio },
  ];

  return (
    <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/10" role="tablist" aria-label={t('payment.tabList')}>
      {tabs.map(({ id, labelKey, icon: Icon }) => {
        const tabId = `payment-tab-${id}`;
        return (
          <button
            key={id}
            id={tabId}
            type="button"
            role="tab"
            aria-selected={value === id}
            aria-controls="payment-method-panel"
            tabIndex={value === id ? 0 : -1}
            onClick={() => onChange(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 min-h-[44px] rounded-lg text-xs sm:text-sm font-semibold transition-colors touch-manipulation ${
              value === id
                ? 'bg-bitcoin-orange-500/20 text-bitcoin-orange-300 border border-bitcoin-orange-500/40'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Icon size={14} aria-hidden />
            {t(labelKey)}
          </button>
        );
      })}
    </div>
  );
}