import { Link } from '../components/Link';
import { Button } from '../components/Button';
import { PageMeta } from '../components/PageMeta';
import { useLanguage } from '../contexts/LanguageContext';
import { Home, Compass } from 'lucide-react';

export function NotFoundPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-charcoal-950 flex items-center justify-center px-4 pt-24 pb-20">
      <PageMeta title={t('notfound.metaTitle')} description={t('notfound.metaDesc')} path="/404" noindex />
      <div className="text-center max-w-md animate-slide-up">
        <p className="text-8xl font-display font-black text-neon-cyan-500/30 mb-4">404</p>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-3">{t('notfound.title')}</h1>
        <p className="text-gray-400 mb-8">{t('notfound.subtitle')}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="primary" size="lg" className="w-full sm:w-auto min-w-[180px]">
              <Home size={18} className="mr-2" /> {t('notfound.backHome')}
            </Button>
          </Link>
          <Link href="/explore">
            <Button variant="outline" size="lg" className="w-full sm:w-auto min-w-[180px]">
              <Compass size={18} className="mr-2" /> {t('nav.explore')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}