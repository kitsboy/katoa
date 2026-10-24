import { useCurrency, CURRENCY_OPTIONS } from '../contexts/CurrencyContext';
import { languageNames, useLanguage, type Language } from '../contexts/LanguageContext';
import { PageMeta } from '../components/PageMeta';
import { Card } from '../components/Card';
import { Link } from '../components/Link';
import { TipMenu } from '../components/TipMenu';
import { DemoPreviewBadge } from '../components/DemoPreviewBadge';
import { MediaCard } from '../components/MediaCard';
import { useAuth } from '../contexts/AuthContext';

export function DemoPage() {
  const { setLanguage } = useLanguage();
  const { displayCurrency, setDisplayCurrency, satsToDisplay, formatPerUnitBitcoinPrice } = useCurrency();
  const { isDemoUser } = useAuth();

  return (
    <article className="lp-page" data-theme="dark" aria-labelledby="demo-hero-title">
      <PageMeta
        title="Demo — KATOA"
        description="Meet Luna, KATOA’s sample video creator. This is the honest demo hub: open her profile and wishlist, switch currency and language, and try tip presets. No live settlement."
        path="/demo"
        ogTitle="Meet Luna — KATOA Demo"
        ogDescription="Luna is KATOA’s sample video creator. Open her profile and wishlist, switch currency and language, and try tip presets. This is an honest sample demo, not a live payment."
      />
      <span id="demo-hero-title" className="sr-only">Meet Luna — KATOA Demo</span>
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Card className="p-8">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <DemoPreviewBadge />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neon-cyan-300">Demo hub · sample protagonist</span>
          </div>

          <h1 className="text-3xl font-black text-white mb-2">Meet Luna</h1>
          <p className="text-gray-300 mb-2 leading-relaxed">
            Luna is KATOA’s sample video creator — the protagonist of this demo.
          </p>
          <p className="text-gray-400 mb-6 leading-relaxed">
            She makes exclusive video drops and funds them directly from viewers with Bitcoin Lightning.
            You can open her profile, open her wishlist, switch the display currency,            switch the UI language,
            and try tip presets — all on this page, all locally, all visibly sample-only.
          </p>

          <div className="rounded-xl border border-bitcoin-orange-500/30 bg-bitcoin-orange-500/5 p-4 flex items-center justify-between">
            <p className="text-sm text-gray-300">
              This is the public demo entry point for KATOA. It shows one sample creator and sample flows — not live payments.
            </p>
            <Link to="/explore" className="text-bitcoin-orange-300 text-sm font-semibold hover:text-bitcoin-orange-200">
              Browse all demo creators
            </Link>
          </div>

          <MediaCard
            media={{
              imageUrl: '/images/mock/pexels-7867fa1faf.jpeg',
              videoUrl: 'https://videos.pexels.com/video-files/4058851/4058851-hd_720_1280_25fps.mp4',
              alt: 'Luna — sample video creator',
            }}
            aspect="wide"
            className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden"
            variant="creator"
            alwaysPlay
            priority
          />

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-5">
            <div>
              <p className="text-sm font-bold text-white mb-2">The protagonist</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                Luna — independent video creator based in Los Angeles. Her demo wishlist is{' '}
                <Link to="/wishlist/luna-exclusive-videos" className="text-bitcoin-orange-400 underline decoration-bitcoin-orange-500/40 hover:decoration-bitcoin-orange-300">
                  Luna — Exclusive Video Collection
                </Link>.
              </p>
              <div className="mt-3 flex gap-2 flex-wrap">
                <Link to="/u/luna_vip" className="inline-flex min-h-[44px] px-4 rounded-xl border border-white/10 text-white hover:bg-white/5">
                  Open profile
                </Link>
                <Link to="/wishlist/luna-exclusive-videos" className="inline-flex min-h-[44px] px-4 rounded-xl border border-white/10 text-white hover:bg-white/5">
                  Open wishlist
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5">
              <div>
                <p className="text-sm font-bold text-white mb-2">Display currency</p>
                <p className="text-xs text-gray-400 mb-2">
                  All amounts are stored in sats. Fiat values are display-only — nothing is settled in fiat.
                </p>
                <div className="inline-flex rounded-xl border border-white/10 bg-black/40 p-1" role="group" aria-label="Display currency">
                  {CURRENCY_OPTIONS.map(({ code }) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setDisplayCurrency(code)}
                      className={`min-h-[44px] px-4 rounded-lg text-sm font-semibold transition-colors ${
                        displayCurrency === code
                          ? 'bg-bitcoin-orange-500/20 text-bitcoin-orange-200'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {code}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  Sample: {satsToDisplay(72500)}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Per-unit Bitcoin price: {formatPerUnitBitcoinPrice(displayCurrency)}
                </p>
              </div>

              <div>
                <p className="text-sm font-bold text-white mb-2">Language</p>
                <p className="text-xs text-gray-400 mb-2">Changes the demo UI copy. No account, no server call.</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(languageNames).map(([code, label]) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setLanguage(code as Language)}
                      className={`min-h-[44px] px-4 rounded-xl border text-sm font-semibold transition-colors ${
                        'en' === code
                          ? 'border-bitcoin-orange-500/50 bg-bitcoin-orange-500/20 text-bitcoin-orange-200'
                          : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-white mb-2">Tip presets</p>
              <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                Sample tip amounts only. This is a demo of the tip UI, not a live Lightning payment.
              </p>
              <TipMenu
                onSelect={(sats) => {
                  if (isDemoUser) {
                    toast(`Demo tip preset selected: ${satsToDisplay(sats)}`);
                  } else {
                    toast(`Tip preset selected: ${satsToDisplay(sats)}`);
                  }
                }}
                presets={[21000, 50000, 100000]}
              />
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-gray-300 space-y-2">
              <p><span className="font-semibold text-white">Non-custodial demo.</span> Katoa does not hold your sats. This page exercises the UI only.</p>
              <p>Add a real Lightning address or Nostr key in Settings to move from sample demo to real receive flow.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/settings" className="flex-1 inline-flex min-h-[44px] px-4 rounded-xl border border-white/10 text-white hover:bg-white/5">
                Open Settings
              </Link>
              <Link to="/explore" className="flex-1 inline-flex min-h-[44px] px-4 rounded-xl border border-white/10 text-white hover:bg-white/5">
                Browse demo creators
              </Link>
            </div>
          </div>

          <p className="mt-4 text-[11px] text-gray-500">
            Public sample demo. Luna’s profile, wishlists, and flows are demonstrably sample content. Real Lightning, real Nostr, and live creator accounts come later.
          </p>
        </Card>
      </div>
    </article>
  );
}

function toast(message: string) {
  // eslint-disable-next-line no-console
  console.log(`[demo] ${message}`);
}
