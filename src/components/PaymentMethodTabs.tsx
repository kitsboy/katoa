import { Zap, Bitcoin, Radio } from 'lucide-react';

export type PaymentTab = 'lightning' | 'onchain' | 'nostr';

interface PaymentMethodTabsProps {
  value: PaymentTab;
  onChange: (tab: PaymentTab) => void;
}

const tabs: { id: PaymentTab; label: string; icon: typeof Zap }[] = [
  { id: 'lightning', label: 'Lightning', icon: Zap },
  { id: 'onchain', label: 'On-chain', icon: Bitcoin },
  { id: 'nostr', label: 'Nostr Zap', icon: Radio },
];

export function PaymentMethodTabs({ value, onChange }: PaymentMethodTabsProps) {
  return (
    <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/10" role="tablist" aria-label="Payment method">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={value === id}
          onClick={() => onChange(id)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 min-h-[44px] rounded-lg text-xs sm:text-sm font-semibold transition-colors touch-manipulation ${
            value === id
              ? 'bg-bitcoin-orange-500/20 text-bitcoin-orange-300 border border-bitcoin-orange-500/40'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </div>
  );
}