import { useEffect, useState } from 'react';
import { FileCheck } from 'lucide-react';
import { ReleaseAttestation } from './ReleaseAttestation';
import {
  attestationsForCreator,
  loadReleaseAttestations,
  type ReleaseAttestation as ReleaseRecord,
} from '../../lib/releaseAttestations';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * The list of anchored releases for a creator page (or for /verify).
 *
 * Renders nothing at all when there is nothing anchored — an empty proof panel
 * would be noise, and a fake one would be a lie. Every entry carries its own
 * one-click chain check and its own `.ots` proof link.
 */
export function ReleaseAttestationsPanel({
  creator,
  limit,
  className = '',
}: {
  /** Filter to one Katoa username; omit to show every anchored release. */
  creator?: string;
  limit?: number;
  className?: string;
}) {
  const { t } = useLanguage();
  const [releases, setReleases] = useState<ReleaseRecord[] | null>(null);

  useEffect(() => {
    const signal = { cancelled: false };
    void loadReleaseAttestations().then((list) => {
      if (signal.cancelled) return;
      const scoped = creator ? attestationsForCreator(list, creator) : list;
      setReleases(typeof limit === 'number' ? scoped.slice(0, limit) : scoped);
    });
    return () => {
      signal.cancelled = true;
    };
  }, [creator, limit]);

  if (!releases || releases.length === 0) return null;

  return (
    <section data-testid="release-attestations-panel" className={className}>
      <header className="flex items-center gap-2">
        <FileCheck size={18} className="text-bitcoin-orange-400" aria-hidden />
        <h2 className="text-lg font-bold text-white">{t('trust.release.sectionTitle')}</h2>
      </header>
      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-300">
        {t('trust.release.sectionLead')}
      </p>
      <div className="mt-4 grid gap-4">
        {releases.map((release) => (
          <ReleaseAttestation key={release.id} release={release} />
        ))}
      </div>
    </section>
  );
}

export default ReleaseAttestationsPanel;
