import { Link } from '../components/Link';
import { PageMeta } from '../components/PageMeta';
import { PageHero } from '../components/PageHero';
import { Button } from '../components/Button';
import { CreatorVerticalsGrid } from '../components/CreatorVerticalsGrid';
import { TrustProofStrip } from '../components/TrustProofStrip';
import { useLanguage } from '../contexts/LanguageContext';
import { Zap, ShoppingBag, Video, Crown } from 'lucide-react';

const STEPS = [
  {
    icon: Video,
    title: 'Show up as you',
    body: 'Profile, cover video, story. SFW or spicy — you set the boundaries. Fans follow your link.',
  },
  {
    icon: ShoppingBag,
    title: 'Wishlist anything',
    body: 'Paste Amazon, fashion, gear, or travel links. Fans fund in sats or buy the product for you.',
  },
  {
    icon: Crown,
    title: 'Optional support tiers',
    body: 'Supporter / Patron / Champion style goals — Lightning when you are ready. Zero platform cut.',
  },
  {
    icon: Zap,
    title: 'Get paid directly',
    body: 'Sats to your Lightning address. No 20% platform tax. No bank required to start.',
  },
];

/** Positioning page: OF-style creator economy without the fee cut or KYC theater. */
export function CreatorsPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-charcoal-950 pt-16 pb-24">
      <PageMeta
        title={t('creators.pageTitle')}
        description={t('creators.pageSubtitle')}
        path="/creators"
      />
      <main
        className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pt-24"
        aria-label={t('a11y.creatorsMain')}
      >
        <PageHero title={t('creators.pageTitle')} subtitle={t('creators.pageSubtitle')} />
        <TrustProofStrip className="mb-10" />

        <div className="grid sm:grid-cols-2 gap-3 mb-12" role="list">
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <article
                key={s.title}
                role="listitem"
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex gap-3"
              >
                <div
                  className="w-11 h-11 rounded-xl bg-bitcoin-orange-500/15 border border-bitcoin-orange-500/25 flex items-center justify-center shrink-0"
                  aria-hidden
                >
                  <Icon size={20} className="text-bitcoin-orange-400" />
                </div>
                <div>
                  <h2 className="font-bold text-white mb-1">{s.title}</h2>
                  <p className="text-sm text-gray-400 leading-relaxed">{s.body}</p>
                </div>
              </article>
            );
          })}
        </div>

        <CreatorVerticalsGrid className="mb-12" />

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/auth">
            <Button className="min-h-[52px] w-full sm:w-auto px-8 bg-gradient-to-r from-bitcoin-orange-500 to-amber-500 font-bold text-charcoal-950">
              Start free — keep 100%
            </Button>
          </Link>
          <Link href="/explore">
            <Button variant="outline" className="min-h-[52px] w-full sm:w-auto px-8">
              See creators
            </Button>
          </Link>
          <Link href="/creators/guidelines">
            <Button variant="ghost" className="min-h-[52px] w-full sm:w-auto px-8 text-gray-300">
              {t('creators.guidelinesTitle')}
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
