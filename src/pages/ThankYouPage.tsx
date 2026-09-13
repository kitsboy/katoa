import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Link } from '../components/Link';
import { PageMeta } from '../components/PageMeta';
import { useLanguage } from '../contexts/LanguageContext';
import { CheckCircle2, Mail, Wallet, Compass, LifeBuoy, ArrowRight } from 'lucide-react';

type ThankYouSource = 'signup' | 'contact' | 'support' | 'gift' | 'default';

function normaliseSource(raw: string | null): ThankYouSource {
  switch (raw) {
    case 'signup':
    case 'contact':
    case 'support':
    case 'gift':
      return raw;
    default:
      return 'default';
  }
}

/**
 * The real end of a conversion flow. Every entry point that used to stop at a
 * toast or an inline card lands here: account sign-up, the contact form, and
 * the support/gift drawer. Each variant says plainly what just happened and
 * what the visitor should do next — no dead end, no silent lie.
 */
export function ThankYouPage() {
  const { t } = useLanguage();
  const [params] = useSearchParams();
  const [source, setSource] = useState<ThankYouSource>(() => normaliseSource(params.get('from')));

  useEffect(() => {
    setSource(normaliseSource(params.get('from')));
  }, [params]);

  const headline = t(`thankyou.${source}.title`);
  const lead = t(`thankyou.${source}.lead`);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-charcoal-950 pb-20 md:pb-16">
      <PageMeta
        title={t('thankyou.metaTitle')}
        description={t('thankyou.metaDesc')}
        path="/thank-you"
        noindex
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Card variant="glass" className="p-6 sm:p-10">
          <div className="text-center">
            <div className="inline-flex w-16 h-16 bg-emerald-500/20 rounded-full items-center justify-center mb-6">
              <CheckCircle2 className="text-emerald-400" size={32} aria-hidden="true" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4">{headline}</h1>
            <p className="text-gray-300 max-w-xl mx-auto mb-8">{lead}</p>
          </div>

          <div className="border-t border-white/10 pt-8">
            <h2 className="text-lg font-display font-bold text-white mb-5 text-center">
              {t('thankyou.nextTitle')}
            </h2>
            <ol className="space-y-4">
              <li className="flex gap-4">
                <span className="shrink-0 inline-flex w-9 h-9 items-center justify-center rounded-full bg-neon-cyan-500/20 text-neon-cyan-300 font-bold">1</span>
                <div>
                  <p className="text-white font-medium flex items-center gap-2">
                    <Mail size={16} className="text-neon-cyan-400" aria-hidden="true" />
                    {t('thankyou.step1.title')}
                  </p>
                  <p className="text-gray-400 text-sm">{t('thankyou.step1.body')}</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="shrink-0 inline-flex w-9 h-9 items-center justify-center rounded-full bg-neon-cyan-500/20 text-neon-cyan-300 font-bold">2</span>
                <div>
                  <p className="text-white font-medium flex items-center gap-2">
                    <Wallet size={16} className="text-bitcoin-orange-400" aria-hidden="true" />
                    {t('thankyou.step2.title')}
                  </p>
                  <p className="text-gray-400 text-sm">{t('thankyou.step2.body')}</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="shrink-0 inline-flex w-9 h-9 items-center justify-center rounded-full bg-neon-cyan-500/20 text-neon-cyan-300 font-bold">3</span>
                <div>
                  <p className="text-white font-medium flex items-center gap-2">
                    <Compass size={16} className="text-emerald-400" aria-hidden="true" />
                    {t('thankyou.step3.title')}
                  </p>
                  <p className="text-gray-400 text-sm">{t('thankyou.step3.body')}</p>
                </div>
              </li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-9">
            <Link to="/explore" className="flex-1">
              <Button variant="bitcoin" className="w-full min-h-[48px] touch-manipulation">
                {t('thankyou.cta.explore')} <ArrowRight size={18} className="ml-2" aria-hidden="true" />
              </Button>
            </Link>
            <Link to="/dashboard" className="flex-1">
              <Button variant="ghost" className="w-full min-h-[48px] touch-manipulation">
                {t('thankyou.cta.dashboard')}
              </Button>
            </Link>
          </div>

          <p className="text-gray-400 text-sm text-center mt-8 flex items-center justify-center gap-2">
            <LifeBuoy size={16} aria-hidden="true" />
            {t('thankyou.helpPrefix')}{' '}
            <a className="text-neon-cyan-400 underline" href="mailto:hello@giveabit.io">hello@giveabit.io</a>
          </p>
        </Card>
      </div>
    </div>
  );
}
