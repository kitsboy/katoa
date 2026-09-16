/**
 * Type surface for the shared family component `HowProofWorks.jsx`, ported
 * byte-for-byte from kitsboy/satohash (src/components/trust/HowProofWorks.jsx).
 *
 * The implementation stays JavaScript on purpose: it is a plain, dependency-free
 * explainer every offering imports as-is. This declaration is the only local
 * addition, so Katoa's strict TypeScript build can consume it.
 */
import type { ReactElement } from 'react';

export type ProofState = 'pending' | 'confirmed' | 'not-proven';

/** Any `/api/verify` response. Rendered as-is; never upgraded. */
export interface ProofVerdictLike {
  verified?: boolean;
  verified_method?: string | null;
  bitcoin_block_height?: number | string | null;
  block_time?: number | string | null;
  ots_download_url?: string | null;
  explainer?: string | null;
  reason?: string | null;
  status?: string | null;
  [key: string]: unknown;
}

export interface HowProofWorksProps {
  verdict?: ProofVerdictLike | null;
  state?: ProofState | null;
  hash?: string | null;
  otsUrl?: string | null;
  variant?: 'full' | 'compact';
  labels?: Record<string, string>;
  className?: string;
}

export declare function stateFromVerdict(verdict?: ProofVerdictLike | null): ProofState;

export default function HowProofWorks(props: HowProofWorksProps): ReactElement;
