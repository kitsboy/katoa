/**
 * Katoa release attestations — the data behind "Released & Bitcoin-anchored".
 *
 * A release attestation is a creator's public claim that *this exact file*
 * existed at or before a Bitcoin block: sha256 → OpenTimestamps calendars →
 * Bitcoin block anchor. Anyone can re-verify it with the `.ots` file and a
 * public Bitcoin chain, no account and no Katoa involved.
 *
 * HONESTY CONTRACT (why this file is deliberately dumb):
 * - The registry JSON is a list of CLAIMS. Nothing here is a verdict.
 * - This module never returns a `verified` flag and never invents a block.
 *   The only thing allowed to produce a verdict is `verifyProof()` (the live
 *   chain check) — that is where the UI gets its method + height.
 * - Malformed entries are dropped rather than rendered as broken proof UI.
 */

import { getSatohashUrl } from './satohash';

const HEX64 = /^[a-f0-9]{64}$/i;
const REGISTRY_PATH = '/attestations/releases.json';

export type ReleaseKind = 'platform-release' | 'creator-release' | 'edition' | string;

/** A public, auditable release claim. Stored fields are claims, not proof. */
export interface ReleaseAttestation {
  id: string;
  /** Katoa username the release belongs to ("katoa" for platform releases). */
  creator: string;
  title: string;
  kind?: ReleaseKind;
  released_at?: string | null;
  /** Where the anchored file itself can be downloaded (byte-exact). */
  artifact_url?: string | null;
  /** SHA-256 of the artifact. This is what gets verified against Bitcoin. */
  hash: string;
  /** Stored `.ots` link — a convenience copy, never treated as a verdict. */
  ots_url?: string | null;
  verify_url?: string | null;
  /** Marked demo entries get a visible Demo badge. */
  demo?: boolean;
}

type RegistryShape = {
  schema?: string;
  releases?: unknown[];
};

function isHex64(value: unknown): value is string {
  return typeof value === 'string' && HEX64.test(value.trim());
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function parseEntry(raw: unknown): ReleaseAttestation | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;

  // A release without a hash cannot be verified, and an unverifiable release
  // has no business on a proof surface.
  if (!isHex64(row.hash)) return null;

  const id = asString(row.id);
  const creator = asString(row.creator);
  const title = asString(row.title);
  if (!id || !creator || !title) return null;

  return {
    id,
    creator,
    title,
    kind: asString(row.kind) || 'creator-release',
    released_at: asString(row.released_at),
    artifact_url: asString(row.artifact_url),
    hash: String(row.hash).trim().toLowerCase(),
    ots_url: asString(row.ots_url),
    verify_url: asString(row.verify_url),
    demo: row.demo === true,
  };
}

/** Load the public release registry. Never throws; returns [] when unavailable. */
export async function loadReleaseAttestations(
  options: { signal?: AbortSignal } = {}
): Promise<ReleaseAttestation[]> {
  try {
    const res = await fetch(REGISTRY_PATH, {
      headers: { Accept: 'application/json' },
      signal: options.signal,
    });
    if (!res.ok) return [];
    const body = (await res.json()) as RegistryShape;
    if (!Array.isArray(body?.releases)) return [];
    return body.releases
      .map(parseEntry)
      .filter((entry): entry is ReleaseAttestation => entry !== null);
  } catch {
    return [];
  }
}

/** Releases belonging to one creator, in registry order. */
export function attestationsForCreator(
  list: ReleaseAttestation[],
  username: string
): ReleaseAttestation[] {
  const needle = username.trim().toLowerCase().replace(/^@/, '');
  if (!needle) return [];
  return list.filter((entry) => entry.creator.trim().toLowerCase() === needle);
}

/** Absolute URL for a registry artifact path (`/attestations/x.txt`). */
export function artifactUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const base = (import.meta.env.VITE_SITE_URL ?? 'https://katoa.org').replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Public Satohash verify page for this release, when the registry has one. */
export function satohashVerifyUrl(release: ReleaseAttestation): string | null {
  return release.verify_url || `${getSatohashUrl()}/verify/${release.hash}`;
}
