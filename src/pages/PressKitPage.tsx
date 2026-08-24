import { Link } from '../components/Link';
import { PageMeta } from '../components/PageMeta';
import { PageHero } from '../components/PageHero';
import { Button } from '../components/Button';
import { copyToClipboard } from '../lib/clipboard';
import { useToast } from '../components/Toast';
import { Download, Copy } from 'lucide-react';

const ONELINER =
  'KATOA is a zero-fee, non-custodial Bitcoin creator platform — wishlists and Lightning gifts so creators keep 100%.';

const BOILERPLATE = `KATOA (Keep All That's Owed Always) is an open-source, zero-fee creator platform built on Bitcoin Lightning and Nostr. Creators publish wishlists and receive support directly to wallets they control. KATOA never takes a platform cut and never holds user funds. Part of the Give A Bit family.`;

export function PressKitPage() {
  const { toast } = useToast();

  async function copy(text: string, label: string) {
    const r = await copyToClipboard(text);
    toast(r === 'success' ? `${label} copied` : 'Copy failed', r === 'success' ? 'success' : 'error');
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-charcoal-950 pb-24">
      <PageMeta
        title="Press kit"
        description="KATOA press kit — one-liner, boilerplate, logos, and links for journalists and partners."
        path="/press"
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <PageHero title="Press kit" subtitle="Assets and copy for media, partners, and meetup hosts." />

        <div className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">One-liner</h2>
            <p className="text-white leading-relaxed mb-3">{ONELINER}</p>
            <Button variant="outline" className="min-h-[44px]" onClick={() => copy(ONELINER, 'One-liner')}>
              <Copy size={16} className="mr-2" /> Copy
            </Button>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">Boilerplate</h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-3 whitespace-pre-line">{BOILERPLATE}</p>
            <Button variant="outline" className="min-h-[44px]" onClick={() => copy(BOILERPLATE, 'Boilerplate')}>
              <Copy size={16} className="mr-2" /> Copy
            </Button>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Logos</h2>
            <div className="flex flex-wrap gap-4 items-center mb-4">
              <img src="/logo2.png" alt="KATOA logo" width={64} height={64} className="rounded-xl bg-charcoal-950 p-1" />
              <img src="/logo2-192.png" alt="KATOA 192" width={48} height={48} className="rounded-xl" />
              <img src="/logo2-512.png" alt="KATOA 512" width={64} height={64} className="rounded-xl" />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <a href="/logo2-512.png" download className="inline-flex">
                <Button variant="secondary" className="min-h-[44px] w-full sm:w-auto">
                  <Download size={16} className="mr-2" /> logo2-512.png
                </Button>
              </a>
              <a href="/logo2.png" download className="inline-flex">
                <Button variant="outline" className="min-h-[44px] w-full sm:w-auto">
                  <Download size={16} className="mr-2" /> logo2.png
                </Button>
              </a>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">Links</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <a className="text-neon-cyan-400 hover:underline" href="https://katoa.org">
                  https://katoa.org
                </a>
              </li>
              <li>
                <a className="text-neon-cyan-400 hover:underline" href="https://github.com/kitsboy/katoa">
                  GitHub
                </a>
              </li>
              <li>
                <Link href="/pitch" className="text-neon-cyan-400 hover:underline">
                  Pitch page
                </Link>
              </li>
              <li>
                <Link href="/security" className="text-neon-cyan-400 hover:underline">
                  Security & custody
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
