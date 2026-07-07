import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import changelog from '../data/changelog.json';
import { getStorage, setStorage } from '../lib/storage';

const SEEN_KEY = 'katoa_changelog_seen';

export function ChangelogModal() {
  const [open, setOpen] = useState(false);
  const latest = changelog.versions[0];

  useEffect(() => {
    const seen = getStorage<string>(SEEN_KEY, '');
    if (seen !== latest.version) {
      const t = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(t);
    }
  }, [latest.version]);

  const dismiss = () => {
    setStorage(SEEN_KEY, latest.version);
    setOpen(false);
  };

  return (
    <Modal isOpen={open} onClose={dismiss} title={`What's new in ${latest.version}`} size="md">
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
      <Button variant="primary" className="w-full" onClick={dismiss}>Got it</Button>
    </Modal>
  );
}