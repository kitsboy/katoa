import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from './Button';
import { getStorage, setStorage } from '../lib/storage';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'katoa_pwa_install_dismissed';

export function PwaInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getStorage(DISMISS_KEY, false)) return;

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
    setStorage(DISMISS_KEY, true);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    dismiss();
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 inset-x-4 md:inset-x-auto md:right-6 md:max-w-sm z-[60] animate-slide-up">
      <div className="bg-charcoal-900 border border-neon-cyan-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="font-semibold text-white text-sm">Add KATOA to Home Screen</p>
            <p className="text-xs text-gray-400 mt-1">Quick access, app-like experience.</p>
          </div>
          <button type="button" onClick={dismiss} className="p-1 text-gray-500 hover:text-white touch-manipulation" aria-label="Dismiss">
            <X size={18} />
          </button>
        </div>
        <Button variant="primary" size="sm" className="w-full" onClick={install}>
          <Download size={16} className="mr-2" /> Install
        </Button>
      </div>
    </div>
  );
}