import { useEffect, useState } from 'react';
import { X, Smartphone } from 'lucide-react';
import { Button } from './Button';
import { useLanguage } from '../contexts/LanguageContext';
import { getStorage, setStorage, STORAGE_KEYS } from '../lib/storage';
import { copyToClipboard } from '../lib/clipboard';
import { useToast } from './Toast';
import { Link } from './Link';

/** Soft prompt: save KATOA / your creator page to home screen. */
export function PwaCreatorPrompt() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (getStorage(STORAGE_KEYS.pwaCreatorPromptDismissed, false)) return;
    if (getStorage(STORAGE_KEYS.pwaInstallDismissed, false)) return;
    // Only show after a short delay on creator-ish routes
    const path = window.location.pathname;
    if (!path.startsWith('/creators') && !path.startsWith('/dashboard') && path !== '/') return;
    const tmr = window.setTimeout(() => setOpen(true), 4000);
    return () => window.clearTimeout(tmr);
  }, []);

  if (!open) return null;

  const dismiss = () => {
    setOpen(false);
    setStorage(STORAGE_KEYS.pwaCreatorPromptDismissed, true);
  };

  const copyLink = async () => {
    const url = `${window.location.origin}/creators`;
    const r = await copyToClipboard(url);
    toast(r === 'success' ? t('pwa.creatorCopied') : t('favorites.copyFailed'), r === 'success' ? 'success' : 'error');
  };

  return (
    <div
      role="dialog"
      aria-labelledby="pwa-creator-title"
      aria-describedby="pwa-creator-desc"
      className="fixed bottom-20 md:bottom-6 inset-x-4 md:inset-x-auto md:left-6 md:max-w-sm z-[55]"
    >
      <div className="rounded-2xl border border-neon-cyan-500/30 bg-charcoal-900/95 backdrop-blur-xl p-4 shadow-2xl">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-xl bg-neon-cyan-500/15 flex items-center justify-center shrink-0">
            <Smartphone size={20} className="text-neon-cyan-400" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p id="pwa-creator-title" className="text-sm font-bold text-white">
              {t('pwa.creatorTitle')}
            </p>
            <p id="pwa-creator-desc" className="text-xs text-gray-400 mt-1 leading-relaxed">
              {t('pwa.creatorBody')}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button type="button" size="sm" className="min-h-[40px]" onClick={() => void copyLink()}>
                {t('pwa.creatorCopy')}
              </Button>
              <Link href="/creators" onClick={dismiss}>
                <Button type="button" size="sm" variant="outline" className="min-h-[40px]">
                  {t('pwa.creatorOpen')}
                </Button>
              </Link>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="p-2 min-h-[44px] min-w-[44px] text-gray-500 hover:text-white"
            aria-label={t('pwa.dismiss')}
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
