import { useEffect } from 'react';
import changelog from '../data/changelog.json';
import { getStorage, setStorage, STORAGE_KEYS } from '../lib/storage';

/** Marks the latest notes as seen. Does not auto-open a modal (steals first taps). */
export function ChangelogModal() {
  useEffect(() => {
    const latest = changelog.versions[0];
    const seen = getStorage<string>(STORAGE_KEYS.changelogSeen, '');
    if (seen !== latest.version) {
      setStorage(STORAGE_KEYS.changelogSeen, latest.version);
    }
  }, []);
  return null;
}
