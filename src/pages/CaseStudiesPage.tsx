import { Link } from '../components/Link';
import { PageMeta } from '../components/PageMeta';
import { PageHero } from '../components/PageHero';
import { Button } from '../components/Button';
import { useLanguage } from '../contexts/LanguageContext';

const STORIES = [
  { id: '1', href: '/wishlist/medellin-skate-park' },
  { id: '2', href: '/creators' },
  { id: '3', href: '/templates?vertical=meals' },
] as const;

export function CaseStudiesPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-charcoal-950 pb-24">
      <PageMeta
        title={t('cases.metaTitle')}
        description={t('cases.metaDesc')}
        path="/case-studies"
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <PageHero
          title={t('cases.title')}
          subtitle={t('cases.subtitle')}
        />
        <div className="space-y-4">
          {STORIES.map((s) => (
            <article key={s.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
              <p className="text-[10px] font-bold uppercase tracking-wider text-bitcoin-orange-400 mb-1">
                {t(`cases.${s.id}.vertical`)}
              </p>
              <h2 className="text-xl font-display font-bold text-white mb-2">{t(`cases.${s.id}.title`)}</h2>
              <p className="text-sm text-emerald-400/90 font-semibold mb-2">{t(`cases.${s.id}.result`)}</p>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">{t(`cases.${s.id}.body`)}</p>
              <Link href={s.href}>
                <Button variant="outline" className="min-h-[44px]">
                  {t('cases.viewExample')}
                </Button>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
