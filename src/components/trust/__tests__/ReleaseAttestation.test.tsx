import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReleaseAttestation } from '../ReleaseAttestation';
import { LanguageProvider } from '../../../contexts/LanguageContext';

const CONFIRMED = {
  verified: true,
  verified_method: 'bitcoind',
  bitcoin_block_height: 967273,
  ots_download_url: 'https://api.satohash.io/api/stamps/real-proof?download=true',
  explainer: 'Verified against a Bitcoin node.',
};

const NOT_FOUND = {
  verified: false,
  error: 'Hash not found in registry.',
};

const release = {
  id: 'katoa-trust-ui-v1',
  creator: 'katoa',
  title: 'Released & Bitcoin-anchored trust UI (v1)',
  kind: 'platform-release',
  released_at: '2026-09-16',
  artifact_url: '/attestations/katoa-trust-ui-v1.txt',
  hash: '7960c231da6cd9f810140c24920a5563606ba71aadd2f8a4db80876b279ed668',
  ots_url: 'https://api.satohash.io/api/stamps/claimed-copy?download=true',
  demo: false,
};

function renderAttestation(props: Partial<Parameters<typeof ReleaseAttestation>[0]> = {}) {
  return render(
    <LanguageProvider>
      <ReleaseAttestation release={release} {...props} />
    </LanguageProvider>
  );
}

describe('ReleaseAttestation — "Released & Bitcoin-anchored"', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('shows the release claim and the verify action before any check', () => {
    renderAttestation();
    // Eyebrow + release title both carry the phrase; either one proves the surface is live.
    expect(screen.getAllByText(/Released & Bitcoin-anchored/i).length).toBeGreaterThan(0);
    expect(screen.getByTestId('release-hash')).toHaveTextContent(release.hash);
    expect(screen.getByTestId('verify-release-button')).toBeInTheDocument();
  });

  it('one-click verify: renders a confirmed verdict with method + block, and the .ots download', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => CONFIRMED })
    );

    renderAttestation();
    fireEvent.click(screen.getByTestId('verify-release-button'));

    await waitFor(() => {
      expect(screen.getByTestId('proof-state-badge')).toHaveTextContent(/anchored to bitcoin/i);
    });
    expect(screen.getByTestId('verify-method')).toHaveAttribute('data-method', 'bitcoind');
    expect(screen.getByTestId('verify-method')).toHaveTextContent(/bitcoind/);
    expect(screen.getByText(/967,273/)).toBeInTheDocument();
    expect(screen.getByTestId('release-ots-download')).toHaveAttribute(
      'href',
      CONFIRMED.ots_download_url
    );
  });

  it('names the public explorer when that is how the check was done', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ...CONFIRMED, verified_method: 'esplora' }),
      })
    );
    renderAttestation();
    fireEvent.click(screen.getByTestId('verify-release-button'));
    await waitFor(() => {
      expect(screen.getByTestId('verify-method')).toHaveAttribute('data-method', 'esplora');
    });
    expect(screen.getByTestId('verify-method')).toHaveTextContent(/explorer/i);
  });

  it('renders a forged / unresolved proof as "Not proven" — never softened', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => NOT_FOUND })
    );
    renderAttestation();
    fireEvent.click(screen.getByTestId('verify-release-button'));
    await waitFor(() => {
      expect(screen.getByTestId('proof-state-badge')).toHaveTextContent(/not proven/i);
    });
    expect(screen.getByTestId('how-proof-works')).toHaveAttribute('data-proof-state', 'not-proven');
  });

  it('offers the .ots download before any verdict too (claim copy), then prefers the live URL', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => CONFIRMED })
    );
    renderAttestation();
    expect(screen.getByTestId('release-ots-download')).toHaveAttribute(
      'href',
      release.ots_url
    );
    fireEvent.click(screen.getByTestId('verify-release-button'));
    await waitFor(() => {
      expect(screen.getByTestId('release-ots-download')).toHaveAttribute(
        'href',
        CONFIRMED.ots_download_url
      );
    });
  });

  it('says nothing was verified when the checker itself fails — no fake verdict', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    renderAttestation();
    fireEvent.click(screen.getByTestId('verify-release-button'));
    await waitFor(() => {
      expect(screen.getByTestId('verify-error')).toBeInTheDocument();
    });
    expect(screen.getByTestId('verify-error')).toHaveTextContent(/nothing was verified/i);
  });
});
