import { Link } from '../components/Link';
import { PageMeta } from '../components/PageMeta';
import { PageHero } from '../components/PageHero';
import { useLanguage } from '../contexts/LanguageContext';

const RULE_IDS = ['1', '2', '3', '4', '5'] as const;

export function CreatorGuidelinesPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-charcoal-950 pb-24">
      <PageMeta
        title={t('creators.guidelinesTitle')}
        description={t('creators.guidelinesMetaDesc')}
        path="/creators/guidelines"
      />
      <div
        className="max-w-2xl mx-auto px-4 sm:px-6 py-8"
        aria-label={t('creators.guidelinesTitle')}
      >
        <PageHero
          title={t('creators.guidelinesTitle')}
          subtitle={t('creators.guidelinesSubtitle')}
        />
        <div className="space-y-3" role="list">
          {RULE_IDS.map((id) => (
            <article
              key={id}
              role="listitem"
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <h2 className="font-bold text-white mb-1.5">{t(`guidelines.${id}.title`)}</h2>
              <p className="text-sm text-gray-400 leading-relaxed">{t(`guidelines.${id}.body`)}</p>
            </article>
          ))}
        </div>
        <nav className="mt-8 text-center text-sm text-gray-500" aria-label={t('creators.guidelinesRelated')}>
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
