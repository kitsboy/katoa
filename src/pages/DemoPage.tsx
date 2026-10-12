import { useCurrency } from '../contexts/CurrencyContext';
import { useLanguage } from '../contexts/LanguageContext';
import { PageMeta } from '../components/PageMeta';
import { Card } from '../components/Card';
import { Link } from '../components/Link';
import { TipMenu } from '../components/TipMenu';
import { DemoPreviewBadge } from '../components/DemoPreviewBadge';
import { useAuth } from '../contexts/AuthContext';

export function DemoPage() {
  const { setLanguage } = useLanguage();
  const { setDisplayCurrency, satsToDisplay } = useCurrency();
  const { isDemoUser } = useAuth();

  return (
    <div className="min-h-screen bg-charcoal-950">
      <PageMeta
        title="Demo — KATOA"
        description="Honest Katoa demo: sample creator, currency, language, and tip presets. No live settlement."
        path="/demo"
        noindex
      />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Card className="p-8">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <DemoPreviewBadge />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neon-cyan-300">Local demo hub</span>
          </div>

          <h1 className="text-3xl font-black text-white mb-2">Demo Katoa</h1>
          <p className="text-gray-300 mb-6 leading-relaxed">
            This is an honest sample demo. It shows a sample creator, display currency, language, and tip presets — without pretending any of it is a live payment.
          </p>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-5">
            <div>
              <p className="text-sm font-bold text-white mb-2">Sample creator</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                Luna — a demo video creator with a small wishlist, sample posts, and a visible support goal.
              </p>
              <div className="mt-3 flex gap-2 flex-wrap">
                <Link href="/u/luna_vip" className="inline-flex min-h-[44px] px-4 rounded-xl border border-white/10 text-white hover:bg-white/5">
                  Open profile
                </Link>
                <Link href="/wishlist/luna-exclusive-videos" className="inline-flex min-h-[44px] px-4 rounded-xl border border-white/10 text-white hover:bg-white/5">
                  Open wishlist
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5">
              <div>
                <p className="text-sm font-bold text-white mb-2">Display currency</p>
                <p className="text-xs text-gray-400 mb-2">All amounts are stored in sats. This is only how they are shown.</p>
                <div className="inline-flex rounded-xl border border-white/10 bg-black/40 p-1" role="group" aria-label="Display currency">
                  {['SATS','BTC','USD','EUR','GBP','JPY','BRL'].map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setDisplayCurrency(code as 'SATS'|'BTC'|'USD'|'EUR'|'GBP'|'JPY'|'BRL')}
                      className={`min-h-[44px] px-4 rounded-lg text-sm font-semibold transition-colors %{
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
              </div>

              <div>
                <p className="text-sm font-bold text-white mb-2">Language</p>
                <p className="text-xs text-gray-400 mb-2">Changes the demo UI copy. No account, no server call.</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries({
                    en: 'English',
                    es: 'Español',
                    pt: 'Português',
                    fr: 'Français',
                    de: 'Deutsch',
                    ja: '日本語',
                    zh: '中文',
                  }).map(([code, label]) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setLanguage(code as 'en'|'es'|'pt'|'fr'|'de'|'ja'|'zh')}
                      className={`min-h-[44px] px-4 rounded-xl border text-sm font-semibold transition-colors %{
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
            Demo mode is local and sample-only. Real Lightning, real Nostr, and live creator accounts come later.
          </p>
        </Card>
      </div>
    </div>
  );
}

function toast(message: string) {
  // eslint-disable-next-line no-console
  console.log(`[demo] ${message}`);
}
