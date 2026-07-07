import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from './Button';
import { useLanguage } from '../contexts/LanguageContext';
import { getStorage, setStorage, STORAGE_KEYS } from '../lib/storage';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaInstallPrompt() {
  const { t } = useLanguage();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getStorage(STORAGE_KEYS.pwaInstallDismissed, false)) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = () => {
    setVisible(false);
    setStorage(STORAGE_KEYS.pwaInstallDismissed, true);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    dismiss();
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-desc"
      className="fixed bottom-20 md:bottom-6 inset-x-4 md:inset-x-auto md:right-6 md:max-w-sm z-[60] motion-safe:animate-slide-up"
    >
      <div className="bg-charcoal-900 border border-neon-cyan-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p id="pwa-install-title" className="font-semibold text-white text-sm">{t('pwa.installTitle')}</p>
            <p id="pwa-install-desc" className="text-xs text-gray-400 mt-1">{t('pwa.installSubtitle')}</p>
          </div>
          <button type="button" onClick={dismiss} className="p-1 text-gray-500 hover:text-white touch-manipulation" aria-label={t('pwa.dismiss')}>
            <X size={18} />
          </button>
        </div>
        <Button variant="primary" size="sm" className="w-full" onClick={install}>
          <Download size={16} className="mr-2" /> {t('pwa.install')}
        </Button>
      </div>
    </div>
  );
}