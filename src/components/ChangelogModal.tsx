import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { useLanguage } from '../contexts/LanguageContext';
import changelog from '../data/changelog.json';
import { getStorage, setStorage, STORAGE_KEYS } from '../lib/storage';

export function ChangelogModal() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const latest = changelog.versions[0];

  useEffect(() => {
    const seen = getStorage<string>(STORAGE_KEYS.changelogSeen, '');
    if (seen !== latest.version) {
      const timer = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [latest.version]);

  const dismiss = () => {
    setStorage(STORAGE_KEYS.changelogSeen, latest.version);
    setOpen(false);
  };

  return (
    <Modal isOpen={open} onClose={dismiss} title={`${t('changelog.whatsNew')} ${latest.version}`} size="md">
      <div className="flex items-center gap-2 text-neon-cyan-400 text-sm mb-4">
        <Sparkles size={16} />
        <span>{latest.date}</span>
      </div>
      <ul className="space-y-2 mb-6">
        {latest.changes.map((c) => (
          <li key={c} className="text-gray-300 text-sm flex gap-2">
            <span className="text-bitcoin-orange-400">•</span>
            {c}
          </li>
        ))}
      </ul>
      <Button variant="primary" className="w-full" onClick={dismiss}>{t('changelog.gotIt')}</Button>
    </Modal>
  );
}