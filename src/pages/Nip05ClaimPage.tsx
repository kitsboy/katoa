import { useState } from 'react';
import { PageMeta } from '../components/PageMeta';
import { PageHero } from '../components/PageHero';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Link } from '../components/Link';
import { copyToClipboard } from '../lib/clipboard';
import { useToast } from '../components/Toast';
import { hasNip07, nostrService } from '../lib/nostr';

/**
 * Scaffold for creator@katoa.org claims.
 * Stores a local request + copyable JSON snippet for ops until automation exists.
 */
export function Nip05ClaimPage() {
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [npub, setNpub] = useState('');

  async function fillFromExtension() {
    if (!hasNip07()) {
      toast('Install Alby or nos2x first', 'error');
      return;
    }
    try {
      const pk = await window.nostr!.getPublicKey();
      setNpub(nostrService.encodeNpub(pk));
    } catch {
      toast('Could not read extension key', 'error');
    }
  }

  async function saveRequest() {
    const u = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!u || u.length < 2) {
      toast('Choose a simple username (letters/numbers)', 'error');
      return;
    }
    let hex: string;
    try {
      hex = nostrService.normalizePubkey(npub.trim());
    } catch {
      toast('Invalid npub or hex pubkey', 'error');
      return;
    }
    const request = {
      username: u,
      handle: `${u}@katoa.org`,
      pubkey_hex: hex,
      npub: nostrService.encodeNpub(hex),
      requested_at: new Date().toISOString(),
      status: 'pending_ops',
    };
    try {
      const prev = JSON.parse(localStorage.getItem('katoa_nip05_claims') || '[]') as unknown[];
      prev.push(request);
      localStorage.setItem('katoa_nip05_claims', JSON.stringify(prev));
    } catch {
      /* ignore */
    }
    const snippet = JSON.stringify({ [u]: hex }, null, 2);
    await copyToClipboard(
      `NIP-05 claim for ops:\n${JSON.stringify(request, null, 2)}\n\nAdd to names in nostr.json:\n${snippet}`
    );
    toast('Claim saved locally and copied for ops / GitHub issue', 'success');
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-charcoal-950 pt-16 pb-24">
      <PageMeta
        title="Claim name@katoa.org"
        description="Request a KATOA NIP-05 handle for your Nostr pubkey."
        path="/nip05"
      />
      <main className="max-w-lg mx-auto px-4 sm:px-6 py-8 pt-24">
        <PageHero
          title="Claim name@katoa.org"
          subtitle="Link your Nostr identity to a KATOA handle. Platform key is katoa@katoa.org; creators request personal handles here."
        />
        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="yourname"
            className="min-h-[48px]"
          />
          <p className="text-xs text-gray-500 -mt-2">
            Will be <span className="text-gray-300">{username || 'yourname'}@katoa.org</span>
          </p>
          <Input
            label="Nostr public key"
            value={npub}
            onChange={(e) => setNpub(e.target.value)}
            placeholder="npub1…"
            className="font-mono text-xs min-h-[48px]"
          />
          <Button type="button" variant="outline" className="w-full min-h-[44px]" onClick={() => void fillFromExtension()}>
            Fill from NIP-07 extension
          </Button>
          <Button type="button" className="w-full min-h-[48px]" onClick={() => void saveRequest()}>
            Submit claim request
          </Button>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Automation is not live yet — this copies a request for ops. See{' '}
            <Link href="/security" className="text-neon-cyan-400 hover:underline">
              security
            </Link>{' '}
            and docs/NOSTR-NIP05.md.
          </p>
        </div>
      </main>
    </div>
  );
}
