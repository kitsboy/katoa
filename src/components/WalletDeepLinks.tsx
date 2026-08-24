import { ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { buildWalletDeepLinks, defaultWalletHref } from '../lib/qr';

interface WalletDeepLinksProps {
  /** bolt11 invoice, LNURL, or bitcoin: URI */
  paymentUri: string;
  className?: string;
}

/** Mobile-friendly “open in wallet” shortcuts for Lightning / Bitcoin URIs. */
export function WalletDeepLinks({ paymentUri, className = '' }: WalletDeepLinksProps) {
  const { t } = useLanguage();
  if (!paymentUri) return null;
  const wallets = buildWalletDeepLinks(paymentUri);
  const defaultHref = defaultWalletHref(paymentUri);
  if (!defaultHref && wallets.length === 0) return null;

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
            target={w.kind === 'web' ? '_blank' : undefined}
            rel={w.kind === 'web' ? 'noopener noreferrer' : undefined}
            className="inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-gray-200 hover:border-neon-cyan-500/40 hover:text-white transition-colors touch-manipulation"
          >
            {w.name}
            {w.kind === 'web' && <ExternalLink size={12} className="opacity-50" aria-hidden />}
          </a>
        ))}
        {defaultHref && (
          <a
            href={defaultHref}
            className="inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-lg bg-bitcoin-orange-500/15 border border-bitcoin-orange-500/30 text-xs font-semibold text-bitcoin-orange-300 hover:bg-bitcoin-orange-500/25 transition-colors touch-manipulation"
          >
            {t('donate.openDefaultWallet')}
          </a>
        )}
      </div>
    </div>
  );
}
