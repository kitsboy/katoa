import { Button } from './Button';
import { useLanguage } from '../contexts/LanguageContext';

export function ErrorFallback({ onRetry, errorId }: { onRetry: () => void; errorId: string | null }) {
  const { t } = useLanguage();
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4 py-12" role="alert">
      <div className="text-center max-w-md w-full">
        <h2 className="text-xl font-bold text-white mb-2">{t('errorBoundary.title')}</h2>
        <p className="text-gray-200 mb-4 leading-relaxed">{t('errorBoundary.message')}</p>
        {errorId && (
          <p className="text-[11px] font-mono text-gray-300 mb-6">Ref: {errorId}</p>
        )}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3">
          <Button variant="secondary" onClick={onRetry} className="min-h-[48px] w-full sm:w-auto">
            {t('errorBoundary.tryAgain')}
          </Button>
          <Button variant="primary" onClick={() => window.location.assign('/')} className="min-h-[48px] w-full sm:w-auto">
            {t('errorBoundary.goHome')}
          </Button>
          <Button variant="outline" onClick={() => window.location.assign('/faq')} className="min-h-[48px] w-full sm:w-auto">
            FAQ
          </Button>
        </div>
      </div>
    </div>
  );
}
