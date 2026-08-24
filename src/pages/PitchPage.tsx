import { useState, useRef, useEffect, TouchEvent } from 'react';
import { Link } from '../components/Link';
import { PageMeta } from '../components/PageMeta';
import { Button } from '../components/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';

const slides = [
  {
    eyebrowKey: 'pitch.slide0.eyebrow',
    titleKey: 'pitch.slide0.title',
    subtitleKey: 'pitch.slide0.subtitle',
    body: 'Zero-fee creator support on Bitcoin Lightning. Borderless. Private. Open source. You keep 100%.',
    stats: [
      { labelKey: 'pitch.slide0.statFee', value: '0%', color: 'text-bitcoin-orange-400' },
      { labelKey: 'pitch.slide0.statCost', value: '$0', color: 'text-neon-cyan-400' },
      { labelKey: 'pitch.slide0.statKeep', value: '100%', color: 'text-emerald-400' },
    ],
  },
  {
    eyebrowKey: 'pitch.slide1.eyebrow',
    titleKey: 'pitch.slide1.title',
    body: 'Creators do the work. Gatekeepers own the relationship, delay payouts, and skim forever.',
    cards: [
      { big: '20%', title: 'Large subscription apps', desc: '~$24k/year lost on $10k/mo. Bank + KYC required.' },
      { big: '10%', title: 'Wishlist / gifting apps', desc: 'Limited countries for low fees. Currency conversion adds up.' },
      { big: '9–10%', title: 'Link-in-bio', desc: 'Or pay $480/year for 0% fees. Either way — rent.' },
    ],
    quote: '"How much of your support actually reached them?"',
  },
  {
    eyebrowKey: 'pitch.slide2.eyebrow',
    titleKey: 'pitch.slide2.title',
    bullets: [
      '0% platform fees — forever. Architectural invariant.',
      'Lightning to wallets you control. Katoa never holds funds.',
      '195+ countries. No bank account. No KYC to start.',
      'Nostr optional. Email + Google work today.',
      'MIT open source. Auditable. Forkable. FOSS forever.',
    ],
  },
  {
    eyebrowKey: 'pitch.slide3.eyebrow',
    titleKey: 'pitch.slide3.title',
    body: 'Live fee calculator on katoa.org — supporters see exactly where sats go.',
    table: [
      { platform: 'Large subscription apps', fees: '~20%', countries: 'Limited', payout: 'Days' },
      { platform: 'Wishlist / gifting apps', fees: '~10%', countries: '~10', payout: 'Slow' },
      { platform: 'Link-in-bio', fees: '9–10%', countries: '~50', payout: 'Varies' },
      { platform: 'KATOA', fees: '0%', countries: '195+', payout: 'Lightning', highlight: true },
    ],
  },
  {
    eyebrowKey: 'pitch.slide4.eyebrow',
    titleKey: 'pitch.slide4.title',
    features: [
      '0% Platform Fees', 'Bitcoin Lightning', 'Global by Default', 'No Banking Required', 'On-Chain & Lightning',
      'Unlimited Wishlists', 'Shareable Pages', 'Privacy First', 'Open Source (MIT)', 'BOLT 12 path',
    ],
  },
  {
    eyebrowKey: 'pitch.slide5.eyebrow',
    titleKey: 'pitch.slide5.title',
    columns: [
      { title: 'Primary', items: ['Independent creators', 'Mutual aid projects', 'Unbanked builders', 'Bitcoin & Nostr natives'] },
      { title: 'Supporters', items: ['Private, low-fee giving', 'QR + share links', 'Sats reach the cause', 'Future: Nostr campaigns'] },
    ],
  },
  {
    eyebrowKey: 'pitch.slide6.eyebrow',
    titleKey: 'pitch.slide6.title',
    tech: [
      { title: 'Frontend', desc: 'React 18 · TypeScript · Vite · Tailwind · night-jewel glass UI' },
      { title: 'Backend', desc: 'Supabase Postgres · Auth · Storage · Row Level Security' },
      { title: 'Bitcoin', desc: 'Lightning addresses · Nostr check · QR · MapLibre · BTCPay webhook code · BOLT12 path' },
    ],
  },
  {
    eyebrowKey: 'pitch.slide7.eyebrow',
    titleKey: 'pitch.slide7.title',
    body: 'KATOA is the wishlist arm of Give A Bit — Bitcoin education, services, and hope for normal people.',
    quote: 'We will never charge platform fees. Creators keep what they\'re owed — always.',
  },
  {
    eyebrowKey: 'pitch.slide8.eyebrow',
    titleKey: 'pitch.slide8.title',
    body: 'Keep 100% of what supporters send (0% platform fee). Build on Bitcoin Lightning — early.',
    cta: true,
  },
];

export function PitchPage() {
  const { t } = useLanguage();
  const [current, setCurrent] = useState(0);
  const touchStart = useRef(0);

  const go = (dir: -1 | 1) => {
    setCurrent((c) => Math.max(0, Math.min(slides.length - 1, c + dir)));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onTouchStart = (e: TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) go(diff > 0 ? 1 : -1);
  };

  const slide = slides[current];
  const slideTitle = t(slide.titleKey);

  return (
    <div className="min-h-[100dvh] bg-[#0e0a18] text-white overflow-hidden">
      <PageMeta
        title={t('pitch.metaTitle')}
        description={t('pitch.metaDesc')}
        path="/pitch"
        noindex
      />

      <div
        className="min-h-[100dvh] flex flex-col pt-6 pb-safe"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role="region"
        aria-roledescription="carousel"
        aria-label={t('pitch.aria')}
      >
        <p className="sr-only" aria-live="polite">
          {t('pitch.slideAnnouncement')
            .replace('${current}', String(current + 1))
            .replace('${total}', String(slides.length))
            .replace('${title}', slideTitle)}
        </p>
        <p className="hidden sm:block text-center text-xs text-gray-500 px-4 pt-2">
          {t('pitch.navHint')}
        </p>
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 py-8 max-w-2xl mx-auto w-full">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neon-cyan-400 font-semibold mb-3">
            {t(slide.eyebrowKey)}
          </p>

          {current === 0 ? (
            <>
              <h1 className="font-display text-5xl sm:text-6xl font-black bg-gradient-to-r from-bitcoin-orange-400 via-amber-300 to-neon-cyan-400 bg-clip-text text-transparent mb-2">
                {slideTitle}
              </h1>
              <p className="font-mono text-sm text-neon-cyan-400 mb-4">{slide.subtitleKey ? t(slide.subtitleKey) : ''}</p>
              <p className="text-gray-300 text-lg mb-8">{slide.body}</p>
              <div className="grid grid-cols-3 gap-4">
                {slide.stats?.map((s) => (
                  <div key={s.labelKey} className="text-center p-3 rounded-xl bg-white/[0.04] border border-white/10">
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">{t(s.labelKey)}</p>
                    <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4 leading-tight">{slideTitle}</h2>
              {slide.body && <p className="text-gray-300 mb-6 leading-relaxed">{slide.body}</p>}

              {slide.cards && (
                <div className="space-y-3 mb-6">
                  {slide.cards.map((c) => (
                    <div key={c.title} className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                      <span className="text-2xl font-black text-red-400">{c.big}</span>
                      <h3 className="font-bold text-white mt-1">{c.title}</h3>
                      <p className="text-sm text-gray-400">{c.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {slide.bullets && (
                <ul className="space-y-3 mb-6">
                  {slide.bullets.map((b) => (
                    <li key={b} className="flex gap-2 text-gray-300 text-sm">
                      <span className="text-emerald-400 font-bold">✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
              )}

              {slide.table && (
                <div className="overflow-x-auto -mx-4 px-4 mb-6">
                  <table className="w-full text-sm min-w-[320px]">
                    <thead>
                      <tr className="text-gray-500 text-xs uppercase">
                        <th className="text-left py-2">{t('pitch.slide3.platform')}</th>
                        <th className="text-left py-2">{t('pitch.slide3.fees')}</th>
                        <th className="text-left py-2">{t('pitch.slide3.payout')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slide.table.map((row) => (
                        <tr key={row.platform} className={row.highlight ? 'bg-bitcoin-orange-500/15 text-white font-semibold' : 'text-gray-300 border-t border-white/10'}>
                          <td className="py-2">{row.platform}</td>
                          <td className="py-2">{row.fees}</td>
                          <td className="py-2">{row.payout}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {slide.features && (
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {slide.features.map((f, i) => (
                    <div key={f} className="p-2.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs font-semibold">
                      <span className="text-neon-cyan-400 text-[10px]">{String(i + 1).padStart(2, '0')}</span>
                      <p className="text-white mt-0.5">{f}</p>
                    </div>
                  ))}
                </div>
              )}

              {slide.columns && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {slide.columns.map((col) => (
                    <div key={col.title}>
                      <h3 className="text-sm font-bold text-neon-cyan-400 mb-2">{col.title}</h3>
                      <ul className="space-y-2">
                        {col.items.map((item) => (
                          <li key={item} className="text-sm text-gray-300 flex gap-2">
                            <span className="text-emerald-400">✓</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {slide.tech && (
                <div className="space-y-3 mb-6">
                  {slide.tech.map((t) => (
                    <div key={t.title} className="p-4 rounded-xl bg-white/[0.04] border border-white/10">
                      <h3 className="font-bold text-white mb-1">{t.title}</h3>
                      <p className="text-xs text-gray-400">{t.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {slide.quote && (
                <blockquote className="border-l-4 border-bitcoin-orange-500 pl-4 italic text-gray-300 mb-6">
                  {slide.quote}
                </blockquote>
              )}

              {slide.cta && (
                <div className="flex flex-col gap-3">
                  <Link href="/auth">
                    <Button variant="bitcoin" size="lg" className="w-full gap-2">
                      <Zap size={18} />
                      {t('pitch.startEarning')}
                    </Button>
                  </Link>
                  <Link href="/comparison?earnings=10000">
                    <Button variant="outline" size="lg" className="w-full">
                      {t('pitch.comparePlatforms')}
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-4 pb-6 flex items-center justify-between gap-4 max-w-2xl mx-auto w-full">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={current === 0}
            className="p-3 rounded-xl bg-white/5 border border-white/10 disabled:opacity-30 touch-manipulation"
            aria-label={t('pitch.prevSlide')}
          >
            <ChevronLeft size={22} />
          </button>

          <div className="flex gap-1.5 flex-1 justify-center">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all touch-manipulation ${
                  i === current ? 'w-6 bg-neon-cyan-400' : 'w-1.5 bg-white/20'
                }`}
                aria-label={t('pitch.goToSlide').replace('${n}', String(i + 1))}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => go(1)}
            disabled={current === slides.length - 1}
            className="p-3 rounded-xl bg-white/5 border border-white/10 disabled:opacity-30 touch-manipulation"
            aria-label={t('pitch.nextSlide')}
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}