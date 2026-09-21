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
  const userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|iPod/i.test(userAgent);
  const primaryWallet = defaultHref
    ? { href: defaultHref, label: isMobile ? 'Open wallet on this device' : 'Open default wallet', kind: 'uri' as const }
    : wallets[0]
      ? { ...wallets[0], label: wallets[0].name }
      : null;
  const secondaryWallets = primaryWallet && primaryWallet.href === defaultHref ? wallets : wallets.slice(1);

  return (
    <div className={className} data-wallet-detection={isMobile ? 'mobile' : 'desktop'}>
      <div className="flex items-center justify-between gap-3 mb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {t('donate.openInWallet')}
        </p>
        <span className="text-[10px] text-gray-600">{isMobile ? 'Best on this device' : 'Scan QR if no wallet opens'}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {primaryWallet && (
          <a
            href={primaryWallet.href}
            target={primaryWallet.kind === 'web' ? '_blank' : undefined}
            rel={primaryWallet.kind === 'web' ? 'noopener noreferrer' : undefined}
            className="inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-lg bg-bitcoin-orange-500/15 border border-bitcoin-orange-500/30 text-xs font-semibold text-bitcoin-orange-300 hover:bg-bitcoin-orange-500/25 transition-colors touch-manipulation"
          >
            {primaryWallet.label}
            {primaryWallet.kind === 'web' && <ExternalLink size={12} className="opacity-50" aria-hidden />}
          </a>
        )}
        {secondaryWallets.map((w) => (
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
      </div>
    </div>
  );
}
