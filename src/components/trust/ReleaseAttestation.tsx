import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bitcoin, Download, ExternalLink, RefreshCw } from 'lucide-react';
import HowProofWorks, { type ProofVerdictLike } from './HowProofWorks';
import { DemoBadge } from '../DemoBadge';
import { verifyProof } from '../../lib/satohash';
import {
  artifactUrl,
  satohashVerifyUrl,
  type ReleaseAttestation as ReleaseRecord,
} from '../../lib/releaseAttestations';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * "Released & Bitcoin-anchored" — a creator release attestation, made checkable.
 *
 * Doctrine (why it is built this way):
 * - The verdict ALWAYS comes from a live chain check (`POST /api/verify`) that
 *   the viewer triggers. Stored registry values are shown as claims only.
 * - The surface names HOW the check was done: our own node (bitcoind) or a
 *   public explorer (esplora). No silent third party.
 * - A rejected or unknown hash renders "Not proven" and is never softened.
 * - The `.ots` proof download sits next to the verdict, every time. Assurance
 *   without the means to audit is not assurance.
 */
export interface ReleaseAttestationProps {
  release: ReleaseRecord;
  variant?: 'full' | 'compact';
  className?: string;
  /** Run the chain check on mount (deep links: /verify/<hash>). */
  autoVerify?: boolean;
}

type Phase = 'idle' | 'checking' | 'done' | 'error';

export function ReleaseAttestation({
  release,
  variant = 'full',
  className = '',
  autoVerify = false,
}: ReleaseAttestationProps) {
  const { t } = useLanguage();
  const [verdict, setVerdict] = useState<ProofVerdictLike | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const run = useCallback(async () => {
    setPhase('checking');
    setError(null);
    setVerdict(null);
    try {
      const result = await verifyProof(release.hash);
      if (!mounted.current) return;
      setVerdict(result as ProofVerdictLike);
      setPhase('done');
    } catch (err) {
      if (!mounted.current) return;
      setError(err instanceof Error ? err.message : 'unknown error');
      setPhase('error');
    }
  }, [release.hash]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (autoVerify) void run();
  }, [autoVerify, run]);

  // The component's own strings, in the visitor's language.
  const labels = useMemo(
    () => ({
      statePendingTitle: t('trust.proof.statePendingTitle'),
      stateConfirmedTitle: t('trust.proof.stateConfirmedTitle'),
      stateNotProvenTitle: t('trust.proof.stateNotProvenTitle'),
      blockLabel: t('trust.proof.blockLabel'),
      showSteps: t('trust.proof.showSteps'),
      hideSteps: t('trust.proof.hideSteps'),
    }),
    [t]
  );

  const method = typeof verdict?.verified_method === 'string' ? verdict.verified_method : null;
  const verified = verdict?.verified === true;
  const methodLabel =
    method === 'bitcoind'
      ? t('trust.release.methodNode')
      : method === 'esplora'
        ? t('trust.release.methodExplorer')
        : method;

  // Live proof file first; the registry copy is only a fallback for pre-check view.
  const otsHref = (verdict?.ots_download_url as string | undefined) ?? release.ots_url ?? null;
  const fileHref = artifactUrl(release.artifact_url);
  const satohashHref = satohashVerifyUrl(release);

  return (
    <section
      data-testid="release-attestation"
      data-release-id={release.id}
      data-verify-phase={phase}
      data-verified={verified ? 'true' : 'false'}
      className={`family-trust rounded-2xl border border-white/15 bg-white/[0.04] p-4 sm:p-5 ${className}`}
    >
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-bitcoin-orange-400">
            {t('trust.release.eyebrow')}
          </p>
          <h3 className="mt-1 text-base font-bold text-white">{release.title}</h3>
          <p className="mt-0.5 text-xs text-gray-400">
            @{release.creator}
            {release.released_at ? ` · ${release.released_at}` : ''}
            {release.kind ? ` · ${release.kind}` : ''}
          </p>
        </div>
        {release.demo ? (
          <DemoBadge title="Sample release for preview — the anchor is real, the creator attribution is demo data" />
        ) : null}
      </header>

      <p className="mt-3 break-all font-mono text-[10px] text-gray-400" data-testid="release-hash">
        {release.hash}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void run()}
          disabled={phase === 'checking'}
          data-testid="verify-release-button"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-bitcoin-orange-500/40 bg-bitcoin-orange-500/10 px-4 text-sm font-bold text-bitcoin-orange-300 transition-colors hover:bg-bitcoin-orange-500/20 disabled:opacity-60"
        >
          {phase === 'checking' ? (
            <>
              <RefreshCw size={14} className="animate-spin" aria-hidden />
              {t('trust.release.verifying')}
            </>
          ) : (
            <>
              <Bitcoin size={14} aria-hidden />
              {phase === 'done' || phase === 'error'
                ? t('trust.release.retry')
                : t('trust.release.verify')}
            </>
          )}
        </button>

        {verified && method ? (
          <p className="text-xs text-gray-300" data-testid="verify-method" data-method={method}>
            <span className="text-gray-400">{t('trust.release.method')}: </span>
            {methodLabel}
          </p>
        ) : null}
      </div>

      {phase === 'error' ? (
        <p role="alert" data-testid="verify-error" className="mt-3 text-xs leading-relaxed text-rose-300">
          {t('trust.release.error')}
          {error ? <span className="block text-gray-500">{error}</span> : null}
        </p>
      ) : null}

      <HowProofWorks
        verdict={verdict}
        hash={release.hash}
        otsUrl={otsHref}
        variant={variant}
        labels={labels}
        className="mt-4"
      />

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        {otsHref ? (
          <a
            href={otsHref}
            data-testid="release-ots-download"
            className="inline-flex items-center gap-1 font-bold text-bitcoin-orange-300 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Download size={12} aria-hidden />
            {t('trust.release.downloadOts')}
          </a>
        ) : null}

        {fileHref ? (
          <a
            href={fileHref}
            data-testid="release-artifact"
            className="inline-flex items-center gap-1 text-gray-300 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Download size={12} aria-hidden />
            {t('trust.release.downloadArtifact')}
          </a>
        ) : null}

        {satohashHref ? (
          <a
            href={satohashHref}
            className="inline-flex items-center gap-1 text-gray-400 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={12} aria-hidden />
            Satohash
          </a>
        ) : null}
      </div>
    </section>
  );
}

export default ReleaseAttestation;
