import { useState, useEffect, useCallback } from 'react';
import { Bitcoin, Copy, Check, Share2, X } from 'lucide-react';
import { Button } from './Button';
import { bitcoinQrData, getQrImageUrl } from '../lib/qr';
import { copyToClipboard } from '../lib/clipboard';

interface DonateQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
}

export function DonateQRModal({ isOpen, onClose, address }: DonateQRModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [qrFailed, setQrFailed] = useState(false);
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  useEffect(() => {
    if (!isOpen || !address) return;

    const qrData = bitcoinQrData(address);
    setQrCodeUrl(getQrImageUrl(qrData, 400));
    setQrFailed(false);
    setCopied(false);
  }, [isOpen, address]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  const copyAddress = useCallback(async () => {
    const ok = await copyToClipboard(address);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [address]);

  const shareAddress = useCallback(async () => {
    if (!canShare) return;
    try {
      await navigator.share({
        title: 'Donate to KATOA',
        text: address,
      });
    } catch {
      /* user cancelled or share failed */
    }
  }, [address, canShare]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="donate-qr-title">
      <button
        type="button"
        aria-label="Close donation QR"
        className="absolute inset-0 bg-black/75 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      <div className="relative z-[90] w-full sm:max-w-md max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto overscroll-contain animate-sheet-up sm:animate-scale-in">
        <div className="relative bg-gradient-to-b from-charcoal-900 via-charcoal-950 to-charcoal-950 border border-white/10 sm:rounded-2xl rounded-t-[1.75rem] shadow-[0_-8px_60px_rgba(247,147,26,0.2)] sm:shadow-[0_20px_80px_rgba(0,0,0,0.5)] pb-safe">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-bitcoin-orange-500/60 to-transparent" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-bitcoin-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="sm:hidden flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-white/20" aria-hidden />
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-all touch-manipulation"
          >
            <X size={20} />
          </button>

          <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-6">
            <div className="text-center mb-6 pr-10 sm:pr-0">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-bitcoin-orange-500 to-amber-600 shadow-[0_0_32px_rgba(247,147,26,0.35)] mb-4">
                <Bitcoin size={28} className="text-white" />
              </div>
              <h3 id="donate-qr-title" className="text-xl sm:text-2xl font-display font-bold text-white mb-1.5">
                Scan to Donate
              </h3>
              <p className="text-gray-400 text-sm">Any Bitcoin wallet · main chain</p>
            </div>

            <div className="relative mx-auto w-full max-w-[min(100%,280px)] sm:max-w-[300px] mb-6">
              <div className="absolute -inset-1 rounded-[1.35rem] bg-gradient-to-br from-bitcoin-orange-500/40 via-amber-500/20 to-neon-cyan-500/30 blur-sm" aria-hidden />
              <div className="relative bg-white p-3 sm:p-4 rounded-2xl shadow-xl ring-1 ring-black/5">
                {qrCodeUrl && !qrFailed ? (
                  <img
                    src={qrCodeUrl}
                    alt="Bitcoin donation QR code"
                    className="w-full aspect-square object-contain"
                    style={{ imageRendering: 'crisp-edges' }}
                    onError={() => setQrFailed(true)}
                  />
                ) : (
                  <img
                    src="/donations-qr.png"
                    alt="Bitcoin donation QR code"
                    className="w-full aspect-square object-contain"
                    style={{ imageRendering: 'crisp-edges' }}
                  />
                )}
              </div>
            </div>

            <div className="mb-5">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-2 text-center sm:text-left">
                Bitcoin address
              </p>
              <button
                type="button"
                onClick={copyAddress}
                className="w-full text-left p-3.5 rounded-xl bg-black/40 border border-white/10 hover:border-bitcoin-orange-500/40 transition-colors touch-manipulation group"
              >
                <code className="text-[11px] sm:text-xs text-gray-300 break-all font-mono leading-relaxed block group-active:text-white">
                  {address}
                </code>
                <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-bitcoin-orange-400 font-medium">
                  {copied ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      Copied to clipboard
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Tap to copy address
                    </>
                  )}
                </span>
              </button>
            </div>

            <div className={`grid gap-3 ${canShare ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <Button variant="bitcoin" size="lg" onClick={copyAddress} className="w-full gap-2">
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Copied' : 'Copy address'}
              </Button>
              {canShare && (
                <Button variant="secondary" size="lg" onClick={shareAddress} className="w-full gap-2">
                  <Share2 size={18} />
                  Share
                </Button>
              )}
            </div>

            <p className="mt-4 text-center text-[11px] text-gray-500 leading-relaxed">
              Your sats keep KATOA free and open-source. Thank you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}