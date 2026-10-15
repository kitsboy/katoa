import { useState } from 'react';
import { Copy, Check, ExternalLink, ShieldAlert, Wallet } from 'lucide-react';
import { Button } from './Button';
import { useToast } from './Toast';
import { copyToClipboard } from '../lib/clipboard';
import { getQrImageUrl, silentPaymentQrData } from '../lib/qr';
import {
  SILENT_PAYMENT_SUPPORT_LIST_URL,
  silentPaymentWalletSentence,
} from '../lib/silentPayments';

/**
 * "How to pay this" handoff for a creator who accepts silent payments.
 *
 * Katoa cannot build an invoice on this rail, so this panel does not pretend to:
 * it hands over the address, the QR, the wallet requirement, and the exact
 * reason no confirmation will ever appear on this page.
 */
export function SilentPaymentHandoff({
  address,
  creatorUsername,
  amountSats = null,
  className = '',
}: {
  /** Bare BIP352 address (`sp1…`), or the stored `silent:`/`sp:` descriptor. */
  address: string;
  creatorUsername: string;
  /** An amount the supporter picked, shown only as guidance for their wallet. */
  amountSats?: number | null;
  className?: string;
}) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const qrUri = silentPaymentQrData(address);
  const qrUrl = qrUri ? getQrImageUrl(qrUri, 220) : '';

  const steps = [
    {
      title: 'Send from a BIP352-capable wallet',
      body: silentPaymentWalletSentence(),
    },
    {
      title: 'Scan the QR or copy the sp1 address',
      body: 'The address is reusable — that is the point of BIP352. Every payment made to it still lands on a different on-chain address.',
    },
    {
      title: 'Choose the amount in your wallet',
      body: amountSats && amountSats > 0
        ? `${amountSats.toLocaleString()} sats is what this wishlist page would have asked for, but no amount can be encoded here — set it in your wallet before sending.`
        : 'A silent payment carries no invoice, so Katoa cannot request an amount. Set it in your wallet before sending.',
    },
    {
      title: 'Keep your own receipt',
      body: `No invoice, payment hash, zap receipt or webhook exists on this rail, so nothing tells @${creatorUsername} or Katoa that you paid. This page will not move the total.`,
    },
  ];

  const handleCopy = async () => {
    const result = await copyToClipboard(address);
    if (result === 'success') {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
      toast('Silent payment address copied', 'success');
    } else {
      toast('Could not copy the address', 'error');
    }
  };

  return (
    <section
      data-testid="silent-payment-handoff"
      className={`rounded-2xl border border-white/15 bg-white/[0.03] p-4 sm:p-5 ${className}`}
      aria-label={`How to pay @${creatorUsername} with silent payments`}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-xl border border-white/15 bg-white/5 p-2">
          <Wallet size={18} className="text-gray-200" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
            Silent payments · BIP352
          </p>
          <h3 className="mt-1 text-sm font-black text-white">
            Pay @{creatorUsername} from your own wallet
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-gray-400">
            This creator accepts silent payments. Katoa cannot create an invoice for this rail, so nothing
            here is pre-filled or confirmed on their behalf.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        {qrUrl ? (
          <div className="bg-white p-2.5 rounded-xl shrink-0">
            <img
              src={qrUrl}
              alt={`Silent payment address QR for @${creatorUsername}`}
              className="w-[160px] h-[160px]"
              loading="lazy"
            />
          </div>
        ) : null}
        <div className="min-w-0 w-full">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
            Silent payment address
          </label>
          <p className="font-mono text-[11px] leading-relaxed text-gray-200 break-all rounded-xl border border-white/10 bg-black/30 p-2.5">
            {address}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="min-h-[44px]" onClick={() => void handleCopy()}>
              {copied ? <Check size={16} className="mr-2 text-emerald-400" /> : <Copy size={16} className="mr-2" />}
              {copied ? 'Copied' : 'Copy address'}
            </Button>
            <a
              href={SILENT_PAYMENT_SUPPORT_LIST_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-1.5 px-3 rounded-full border border-white/15 bg-white/5 text-xs font-semibold text-gray-200 hover:bg-white/10"
            >
              Wallet support list
              <ExternalLink size={13} aria-hidden />
            </a>
          </div>
        </div>
      </div>

      <ol className="mt-5 space-y-3">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-black text-gray-200">
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-100">{step.title}</p>
              <p className="text-[11px] leading-relaxed text-gray-400">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-4 flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-[11px] leading-relaxed text-amber-100/90">
        <ShieldAlert size={14} className="mt-0.5 shrink-0" aria-hidden />
        <span>
          Katoa never marks this rail as paid. A silent payment is final once broadcast, so send a small test
          amount first if you have not paid this address before.
        </span>
      </p>
    </section>
  );
}
