import { Link } from '../components/Link';
import { PageMeta } from '../components/PageMeta';
import { PageHero } from '../components/PageHero';

const SCOPE = [
  { severity: 'Critical', example: 'Auth bypass, fund redirection, XSS with account takeover', reward: 'Sats TBD' },
  { severity: 'High', example: 'IDOR on wishlists, injection, serious CSP bypass', reward: 'Sats TBD' },
  { severity: 'Medium', example: 'Info leaks, open redirects, logic bugs without fund risk', reward: 'Hall of fame' },
  { severity: 'Low', example: 'UI spoofing, missing headers (non-exploitable)', reward: 'Thanks + credit' },
];

export function BugBountyPage() {
  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-charcoal-950 pb-24">
      <PageMeta
        title="Bug bounty (lite)"
        description="Report security issues on KATOA. Responsible disclosure. Sats rewards when funded."
        path="/security/bounty"
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <PageHero
          title="Bug bounty lite"
          subtitle="Help harden a zero-fee, non-custodial creator stack. No testing on mainnet funds that are not yours."
        />

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 mb-6 text-sm text-gray-300 leading-relaxed space-y-2">
          <p>
            <strong className="text-white">In scope:</strong> katoa.org SPA, public APIs we operate, auth flows,
            client-side payment UI (not third-party wallets).
          </p>
          <p>
            <strong className="text-white">Out of scope:</strong> social engineering, DoS, spam, issues needing physical
            access, third-party services (Supabase/Cloudflare/wallet vendors) unless we misconfigured them.
          </p>
          <p>
            <strong className="text-white">Report:</strong>{' '}
            <a className="text-neon-cyan-400 hover:underline" href="https://github.com/kitsboy/katoa/issues">
              GitHub issues
            </a>{' '}
            (security label) or contact via{' '}
            <Link href="/contact" className="text-neon-cyan-400 hover:underline">
              /contact
            </Link>
            . Prefer private disclosure for criticals.
          </p>
        </div>

        <div className="space-y-2">
          {SCOPE.map((row) => (
            <div
              key={row.severity}
              className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-bitcoin-orange-400 sm:w-24 shrink-0">
                {row.severity}
              </span>
              <span className="text-sm text-gray-300 flex-1">{row.example}</span>
              <span className="text-xs font-mono text-gray-500">{row.reward}</span>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-gray-600">
          Related: <Link href="/security" className="text-neon-cyan-400 hover:underline">Security & custody</Link>
        </p>
      </div>
    </div>
  );
}
