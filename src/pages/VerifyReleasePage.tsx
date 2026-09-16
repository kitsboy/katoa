import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Bitcoin, FileSearch } from 'lucide-react';
import { PageMeta } from '../components/PageMeta';
import { PageHero } from '../components/PageHero';
import { TrustProofStrip } from '../components/TrustProofStrip';
import { ReleaseAttestationsPanel } from '../components/trust/ReleaseAttestationsPanel';
import { ReleaseAttestation } from '../components/trust/ReleaseAttestation';
import type { ReleaseAttestation as ReleaseRecord } from '../lib/releaseAttestations';
import { useLanguage } from '../contexts/LanguageContext';

const HEX64 = /^[a-f0-9]{64}$/i;

/**
 * /verify — "Check a release": paste any SHA-256 and re-resolve it against an
 * actual Bitcoin block. No account, no KYC, no Katoa needing to be trusted.
 *
 * Deep link /verify/<64-hex> runs the check on load, so a creator can share a
 * release attestation with "tap to verify" as a one-click promise.
 */
export function VerifyReleasePage() {
  const { t } = useLanguage();
  const { hash: hashParam } = useParams<{ hash?: string }>();

  const initialHash = useMemo(() => {
    const raw = (hashParam ?? '').trim().toLowerCase();
    return HEX64.test(raw) ? raw : '';
  }, [hashParam]);

  const [draft, setDraft] = useState(initialHash);
  const [active, setActive] = useState(initialHash);
  const [invalidTouched, setInvalidTouched] = useState(false);

  useEffect(() => {
    if (initialHash) {
      setDraft(initialHash);
      setActive(initialHash);
    }
  }, [initialHash]);

  const manualRelease: ReleaseRecord | null = active
    ? {
        id: `manual-${active.slice(0, 12)}`,
        creator: 'you',
        title: 'Pasted hash',
        kind: 'manual-check',
        hash: active,
      }
    : null;

  const onCheck = () => {
    const raw = draft.trim().toLowerCase();
    if (!HEX64.test(raw)) {
      setInvalidTouched(true);
      setActive('');
      return;
    }
    setInvalidTouched(false);
    setActive(raw);
  };

  return (
    <>
      <PageMeta
        title={t('verify.page.title')}
        description={t('verify.page.lead')}
        path="/verify"
      />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <PageHero title={t('verify.page.title')} subtitle={t('verify.page.lead')} />
        <TrustProofStrip className="mb-8" />

        <div
          className="rounded-2xl border border-white/15 bg-white/[0.04] p-4 sm:p-5"
          data-testid="verify-form"
        >
          <label htmlFor="release-hash-input" className="text-xs font-bold uppercase tracking-widest text-gray-300">
            SHA-256
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              id="release-hash-input"
              type="text"
              inputMode="text"
              autoComplete="off"
              spellCheck={false}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onCheck();
              }}
              placeholder="64 hex characters (the fingerprint of the released file)"
              data-testid="release-hash-input"
              className="min-h-[46px] flex-1 rounded-xl border border-white/15 bg-charcoal-900 px-4 font-mono text-sm text-white placeholder:text-gray-500 focus:border-bitcoin-orange-500/60 focus:outline-none"
            />
            <button
              type="button"
              onClick={onCheck}
              data-testid="release-hash-submit"
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-bitcoin-orange-500 px-5 text-sm font-bold text-charcoal-950 shadow-[0_0_24px_rgba(247,147,26,0.35)] transition-colors hover:bg-bitcoin-orange-400"
            >
              <FileSearch size={16} aria-hidden />
              {t('verify.page.button')}
            </button>
          </div>
          {invalidTouched && !HEX64.test(draft.trim().toLowerCase()) ? (
            <p role="alert" data-testid="verify-hash-invalid" className="mt-2 text-xs text-rose-300">
              {t('verify.page.invalid')}
            </p>
          ) : null}
        </div>

        {manualRelease ? (
          <div className="mt-6">
            <ReleaseAttestation release={manualRelease} autoVerify />
          </div>
        ) : null}

        <div className="mt-10">
          <ReleaseAttestationsPanel />
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-gray-300">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-bitcoin-orange-400">
            <Bitcoin size={14} aria-hidden />
            Why this is enough
          </p>
          <p className="mt-2">
            A SHA-256 hash is a fingerprint: it is the same for the same file,
            everywhere, forever. When that fingerprint is anchored into a Bitcoin
            block, the anchor proves <em>this exact file existed at or before
            that block</em> — nothing more. No platform, no account, no company
            has to vouch for it. You can redo the whole check yourself with any
            OpenTimestamps tool and the .ots proof file.
          </p>
          <p className="mt-2">
            Anchoring costs effectively nothing (that is how Katoa stays 0%).
            Verifying costs nothing. Being asked to trust is optional.
          </p>
        </div>
      </div>
    </>
  );
}

export default VerifyReleasePage;
