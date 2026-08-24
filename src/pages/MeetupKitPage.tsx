import { PageMeta } from '../components/PageMeta';
import { PageHero } from '../components/PageHero';
import { Link } from '../components/Link';
import { Button } from '../components/Button';
import { copyToClipboard } from '../lib/clipboard';
import { useToast } from '../components/Toast';
import { Copy, QrCode } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function MeetupKitPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const script = t('meetup.script');

  async function copy(text: string) {
    const r = await copyToClipboard(text);
    toast(r === 'success' ? t('meetup.copied') : t('meetup.copyFailed'), r === 'success' ? 'success' : 'error');
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-charcoal-950 pb-24">
      <PageMeta
        title={t('meetup.metaTitle')}
        description={t('meetup.metaDesc')}
        path="/meetup"
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <PageHero title={t('meetup.title')} subtitle={t('meetup.subtitle')} />

        <div className="space-y-4">
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">{t('meetup.scriptHeading')}</h2>
            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed mb-3">{script}</pre>
            <Button variant="outline" className="min-h-[44px]" onClick={() => copy(script)}>
              <Copy size={16} className="mr-2" /> {t('meetup.copyScript')}
            </Button>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
            <QrCode size={28} className="mx-auto text-bitcoin-orange-400 mb-3" />
            <p className="text-sm text-gray-400 mb-3">{t('meetup.pointPhones')}</p>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://katoa.org')}`}
              alt={t('meetup.qrAlt')}
              width={200}
              height={200}
              className="mx-auto rounded-xl bg-white p-2"
            />
            <p className="mt-3 font-mono text-xs text-gray-500">https://katoa.org</p>
          </section>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/press" className="flex-1">
              <Button variant="secondary" className="w-full min-h-[48px]">
                {t('meetup.pressKit')}
              </Button>
            </Link>
            <Link href="/pitch" className="flex-1">
              <Button variant="primary" className="w-full min-h-[48px]">
                {t('meetup.pitchPage')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
