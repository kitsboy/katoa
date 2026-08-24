import { Link } from '../components/Link';
import { PageMeta } from '../components/PageMeta';
import { PageHero } from '../components/PageHero';
import { TrustProofStrip } from '../components/TrustProofStrip';
import { useLanguage } from '../contexts/LanguageContext';
import { Shield, KeyRound, Wallet, EyeOff, Server, FileCheck } from 'lucide-react';

const SECTIONS = [
  {
    icon: Wallet,
    title: 'Non-custodial by design',
    body: 'KATOA never holds your Bitcoin. Supporters send sats to addresses and Lightning destinations you control. If our servers go offline, your money is still in your wallet.',
  },
  {
    icon: KeyRound,
    title: 'Keys stay with you',
    body: 'Account login uses email/OAuth (or demo mode). Optional Nostr keys stay in your browser extension or device. We do not store seed phrases or private keys.',
  },
  {
    icon: EyeOff,
    title: 'Minimal data',
    body: 'We store what is needed to run wishlists and auth. See Privacy for details. Prefer Lightning addresses and public npubs over personal identifiers when you can.',
  },
  {
    icon: Server,
    title: 'What we host',
    body: 'The web app (Cloudflare Pages), optional Supabase for profiles/wishlists, and analytics that do not require bank-grade surveillance. Payment settlement happens on Bitcoin / Lightning.',
  },
  {
    icon: FileCheck,
    title: 'Open source & proof',
    body: 'Frontend is MIT-licensed on GitHub. Architecture and fee claims are public. Report security issues via GitHub; critical findings may earn sats when a bounty is funded.',
  },
  {
    icon: Shield,
    title: 'Safe harbour',
    body: 'KATOA is educational software. Nothing here is legal, tax, or investment advice. You are responsible for compliance in your jurisdiction.',
  },
] as const;

export function SecurityPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-charcoal-950 pb-24">
      <PageMeta
        title={t('security.title')}
        description={t('security.metaDesc')}
        path="/security"
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <PageHero title={t('security.title')} subtitle={t('security.metaDesc')} />
        <TrustProofStrip className="mb-10" />

        <div className="space-y-4">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <article
                key={s.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="shrink-0 w-11 h-11 rounded-xl bg-neon-cyan-500/10 border border-neon-cyan-500/20 flex items-center justify-center">
                    <Icon size={20} className="text-neon-cyan-400" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-display font-bold text-white mb-1.5">{s.title}</h2>
                    <p className="text-sm sm:text-base text-gray-400 leading-relaxed">{s.body}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <Link
            href="/privacy"
            className="flex-1 text-center min-h-[48px] inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white font-semibold hover:border-neon-cyan-500/40 transition-colors"
          >
            Privacy policy
          </Link>
          <a
            href="https://github.com/kitsboy/katoa"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center min-h-[48px] inline-flex items-center justify-center rounded-xl bg-neon-cyan-500 text-charcoal-950 font-bold hover:bg-neon-cyan-400 transition-colors"
          >
            View source on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
