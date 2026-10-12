import { PageMeta } from '../components/PageMeta';
import { Card } from '../components/Card';
import { Link } from '../components/Link';
import { useLanguage } from '../contexts/LanguageContext';

export function DemoPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-charcoal-950">
      <PageMeta
        title="Demo"
        description="Katoa demo page."
        path="/demo"
        noindex
      />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Card className="p-8">
          <h1 className="text-3xl font-black text-white mb-4">Demo</h1>
          <p className="text-gray-300">{t('common.loading')}</p>
          <div className="mt-6 flex gap-3">
            <Link href="/settings" className="inline-flex min-h-[44px] px-4 rounded-xl border border-white/10 text-white hover:bg-white/5">
              Settings
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
