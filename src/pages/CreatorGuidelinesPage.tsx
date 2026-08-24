import { Link } from '../components/Link';
import { PageMeta } from '../components/PageMeta';
import { PageHero } from '../components/PageHero';
import { useLanguage } from '../contexts/LanguageContext';

const RULES = [
  {
    title: 'You own the relationship',
    body: 'Fans pay you — Lightning address, zaps, or product purchases. KATOA never holds funds or takes a cut.',
  },
  {
    title: 'You set the content boundaries',
    body: 'SFW or adult-oriented — be clear in your bio. Follow the law where you and your audience live. No CSAM, no non-consensual imagery, no scams.',
  },
  {
    title: 'Wishlists are promises you keep',
    body: 'If fans buy products or fund goals, communicate. Update progress. Mark items funded when appropriate.',
  },
  {
    title: 'Private messages are opt-in',
    body: 'Enable Messages only if you want DMs. You can turn them off anytime. Never ask fans for seed phrases or remote wallet access.',
  },
  {
    title: 'No impersonation',
    body: 'Use your identity. Linking Nostr (NIP-07) strengthens trust. Do not impersonate brands or other people.',
  },
];

export function CreatorGuidelinesPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-charcoal-950 pb-24">
      <PageMeta
        title={t('creators.guidelinesTitle')}
        description="How to use KATOA as a creator — tips, wishlists, DMs, and safety."
        path="/creators/guidelines"
      />
      <div
        className="max-w-2xl mx-auto px-4 sm:px-6 py-8"
        aria-label={t('creators.guidelinesTitle')}
      >
        <PageHero
          title={t('creators.guidelinesTitle')}
          subtitle="Keep 100% of earnings. Stay sovereign. Stay human."
        />
        <div className="space-y-3" role="list">
          {RULES.map((r) => (
            <article
              key={r.title}
              role="listitem"
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <h2 className="font-bold text-white mb-1.5">{r.title}</h2>
              <p className="text-sm text-gray-400 leading-relaxed">{r.body}</p>
            </article>
          ))}
        </div>
        <nav className="mt-8 text-center text-sm text-gray-500" aria-label="Related links">
          <Link href="/creators" className="text-neon-cyan-400 hover:underline">
            {t('creators.pageTitle')}
          </Link>
          {' · '}
          <Link href="/messages" className="text-neon-cyan-400 hover:underline">
            {t('messages.pageTitle')}
          </Link>
          {' · '}
          <Link href="/security" className="text-neon-cyan-400 hover:underline">
            {t('nav.security')}
          </Link>
        </nav>
      </div>
    </div>
  );
}
