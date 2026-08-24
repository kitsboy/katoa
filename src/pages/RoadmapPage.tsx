import { Link } from '../components/Link';
import { PageMeta } from '../components/PageMeta';
import { PageHero } from '../components/PageHero';
import { useLanguage } from '../contexts/LanguageContext';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

type Status = 'done' | 'now' | 'next';

const ITEMS: Array<{ status: Status; title: string; detail: string }> = [
  {
    status: 'done',
    title: 'Glass product UI + multi-language',
    detail: 'Landing, explore, wishlists, settings, 7 languages, mobile nav.',
  },
  {
    status: 'done',
    title: 'Lighthouse & PWA hardening',
    detail: 'CLS fixes, self-hosted images, CSP, service worker cache guards.',
  },
  {
    status: 'done',
    title: 'Honest stats + trust surfaces',
    detail: 'metrics.json labeled sample data, security page, proof strip, demo badges.',
  },
  {
    status: 'now',
    title: 'Lightning receive truth',
    detail: 'BTCPay / LNURL invoices end-to-end with webhook-confirmed funding totals.',
  },
  {
    status: 'now',
    title: 'Creator first-gift path',
    detail: 'Sign up → wallet → wishlist → share → first sat in under 10 minutes.',
  },
  {
    status: 'next',
    title: 'Nostr-first identity',
    detail: 'NIP-07 login, signed profiles, zap-aligned storytelling.',
  },
  {
    status: 'next',
    title: 'Dynamic OG share cards',
    detail: 'Per-wishlist images with progress and sats for social previews.',
  },
  {
    status: 'next',
    title: 'BOLT12 / recurring support',
    detail: 'Reusable offers and monthly support without custody.',
  },
];

const icon = {
  done: CheckCircle2,
  now: Clock,
  next: Circle,
} as const;

const style = {
  done: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  now: 'text-bitcoin-orange-400 border-bitcoin-orange-500/30 bg-bitcoin-orange-500/10',
  next: 'text-gray-400 border-white/10 bg-white/[0.03]',
} as const;

export function RoadmapPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-charcoal-950 pb-24">
      <PageMeta
        title={t('roadmap.inApp.title')}
        description={t('roadmap.inApp.meta')}
        path="/roadmap"
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <PageHero title={t('roadmap.inApp.title')} subtitle={t('roadmap.inApp.meta')} />

        <ol className="space-y-3">
          {ITEMS.map((item) => {
            const Icon = icon[item.status];
            return (
              <li
                key={item.title}
                className={`rounded-2xl border p-4 sm:p-5 flex gap-3 ${style[item.status]}`}
              >
                <Icon size={22} className="shrink-0 mt-0.5" aria-hidden />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1">
                    {item.status === 'done' ? 'Shipped' : item.status === 'now' ? 'In progress' : 'Next'}
                  </p>
                  <h2 className="text-base sm:text-lg font-display font-bold text-white mb-1">{item.title}</h2>
                  <p className="text-sm text-gray-300/90 leading-relaxed">{item.detail}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <p className="mt-8 text-sm text-gray-500 text-center">
          Full technical plan lives in{' '}
          <a
            href="https://github.com/kitsboy/katoa/blob/main/docs/ROADMAP.md"
            className="text-neon-cyan-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            docs/ROADMAP.md
          </a>
          . Want to help?{' '}
          <Link href="/contact" className="text-neon-cyan-400 hover:underline">
            Contact
          </Link>{' '}
          or open a PR.
        </p>
      </div>
    </div>
  );
}
