import { ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface WalletDeepLinksProps {
  /** bolt11 invoice, LNURL, or bitcoin: URI */
  paymentUri: string;
  className?: string;
}

function buildWalletUrls(paymentUri: string) {
  const enc = encodeURIComponent(paymentUri);
  return [
    { name: 'Phoenix', href: `https://phoenix.acinq.co/invoice?data=${enc}` },
    { name: 'Wallet of Satoshi', href: `https://www.walletofsatoshi.com/` },
    { name: 'Zeus', href: `zeusln://send?invoice=${enc}` },
    { name: 'Muun', href: `muun://` },
  ];
}

/** Mobile-friendly “open in wallet” shortcuts for Lightning / Bitcoin URIs. */
export function WalletDeepLinks({ paymentUri, className = '' }: WalletDeepLinksProps) {
  const { t } = useLanguage();
  if (!paymentUri) return null;
  const wallets = buildWalletUrls(paymentUri);

  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
        {t('donate.openInWallet')}
      </p>
      <div className="flex flex-wrap gap-2">
        {wallets.map((w) => (
          <a
            key={w.name}
            href={w.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-gray-200 hover:border-neon-cyan-500/40 hover:text-white transition-colors touch-manipulation"
          >
            {w.name}
            <ExternalLink size={12} className="opacity-50" aria-hidden />
          </a>
        ))}
        <a
          href={paymentUri.startsWith('lightning:') || paymentUri.startsWith('bitcoin:') ? paymentUri : `lightning:${paymentUri}`}
          className="inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded-lg bg-bitcoin-orange-500/15 border border-bitcoin-orange-500/30 text-xs font-semibold text-bitcoin-orange-300 hover:bg-bitcoin-orange-500/25 transition-colors touch-manipulation"
        >
          {t('donate.openDefaultWallet')}
        </a>
      </div>
    </div>
  );
}
