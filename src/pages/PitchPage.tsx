import { useState, useRef, useEffect, TouchEvent } from 'react';
import { Link } from '../components/Link';
import { PageMeta } from '../components/PageMeta';
import { Button } from '../components/Button';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';

const slides = [
  {
    eyebrow: 'Give A Bit · Bitcoin Sovereignty · FOSS',
    title: 'KATOA',
    subtitle: 'Keep All That\'s Owed Always',
    body: 'Zero-fee creator support on Bitcoin Lightning. Instant. Borderless. Private. Open source.',
    stats: [
      { label: 'Platform fee', value: '0%', color: 'text-bitcoin-orange-400' },
      { label: 'Monthly cost', value: '$0', color: 'text-neon-cyan-400' },
      { label: 'You keep', value: '100%', color: 'text-emerald-400' },
    ],
  },
  {
    eyebrow: 'The broken creator economy',
    title: 'Platforms take 5–20% — and your freedom',
    body: 'Creators do the work. Gatekeepers own the relationship, delay payouts, and skim forever.',
    cards: [
      { big: '20%', title: 'OnlyFans', desc: '~$24k/year lost on $10k/mo. Bank + KYC required.' },
      { big: '10%', title: 'Throne', desc: 'Limited countries for low fees. Currency conversion adds up.' },
      { big: '9–10%', title: 'Linktree', desc: 'Or pay $480/year for 0% fees. Either way — rent.' },
    ],
    quote: '"How much of your support actually reached them?"',
  },
  {
    eyebrow: 'The KATOA answer',
    title: 'Infrastructure, not rent extraction',
    bullets: [
      '0% platform fees — forever. Architectural invariant.',
      'Instant Lightning settlement. Seconds, not 7–30 day cycles.',
      '195+ countries. No bank account. No KYC to start.',
      'Nostr-native identity. Your keys. Your audience.',
      'MIT open source. Auditable. Forkable. FOSS forever.',
    ],
  },
  {
    eyebrow: 'Radical transparency',
    title: 'Let the math close the deal',
    body: 'Live fee calculator on katoa.org — supporters see exactly where sats go.',
    table: [
      { platform: 'OnlyFans', fees: '~20%', countries: 'Limited', payout: '7 days' },
      { platform: 'Throne', fees: '~10%', countries: '~10', payout: 'Slow' },
      { platform: 'Linktree', fees: '9–10%', countries: '~50', payout: 'Varies' },
      { platform: 'KATOA', fees: '0%', countries: '195+', payout: 'Seconds', highlight: true },
    ],
  },
  {
    eyebrow: 'Everything included',
    title: 'Ten features. Zero extra cost.',
    features: [
      '0% Platform Fees', 'Instant Lightning', 'Global by Default', 'No Banking Required', 'On-Chain & Lightning',
      'Unlimited Wishlists', 'Live Analytics', 'Shareable Pages', 'Privacy First', 'BOLT 12 Recurring',
    ],
  },
  {
    eyebrow: 'Audience',
    title: 'Built for creators who refuse to pay rent',
    columns: [
      { title: 'Primary', items: ['Independent creators', 'Mutual aid projects', 'Unbanked builders', 'Bitcoin & Nostr natives'] },
      { title: 'Supporters', items: ['Private, low-fee giving', 'QR + share links', 'Sats reach the cause', 'Future: Nostr campaigns'] },
    ],
  },
  {
    eyebrow: 'Under the hood',
    title: 'Real product. Real stack.',
    tech: [
      { title: 'Frontend', desc: 'React 18 · TypeScript · Vite · Tailwind · Mobile-first glass UI' },
      { title: 'Backend', desc: 'Supabase Postgres · Auth · Storage · Row Level Security' },
      { title: 'Bitcoin', desc: 'Lightning · Nostr · QR · BTC Map · BTCPay · BOLT12 path' },
    ],
  },
  {
    eyebrow: 'Give A Bit ecosystem',
    title: 'Private money. Feel-good giving.',
    body: 'KATOA is the wishlist arm of Give A Bit — Bitcoin education, services, and hope for normal people.',
    quote: 'We will never charge platform fees. Creators keep what they\'re owed — always.',
  },
  {
    eyebrow: 'Next step',
    title: 'Ready to keep 100%?',
    body: 'Join creators who stopped paying platform taxes and started building on Bitcoin.',
    cta: true,
  },
];

export function PitchPage() {
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

  return (
    <div className="min-h-[100dvh] bg-charcoal-950 text-white overflow-hidden">
      <PageMeta
        title="Pitch Deck"
        description="KATOA marketing presentation — zero-fee Bitcoin creator platform."
        path="/pitch"
        noindex
      />

      <div
        className="min-h-[100dvh] flex flex-col pt-16 pb-safe"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role="region"
        aria-roledescription="carousel"
        aria-label="KATOA pitch deck"
      >
        <p className="sr-only" aria-live="polite">
          Slide {current + 1} of {slides.length}: {slide.title}
        </p>
        <p className="hidden sm:block text-center text-xs text-gray-500 px-4 pt-2">
          Use arrow keys or swipe to navigate
        </p>
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 py-8 max-w-2xl mx-auto w-full">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neon-cyan-400 font-semibold mb-3">
            {slide.eyebrow}
          </p>

          {current === 0 ? (
            <>
              <h1 className="font-display text-5xl sm:text-6xl font-black bg-gradient-to-r from-bitcoin-orange-400 via-amber-300 to-neon-cyan-400 bg-clip-text text-transparent mb-2">
                {slide.title}
              </h1>
              <p className="font-mono text-sm text-neon-cyan-400 mb-4">{slide.subtitle}</p>
              <p className="text-gray-300 text-lg mb-8">{slide.body}</p>
              <div className="grid grid-cols-3 gap-4">
                {slide.stats?.map((s) => (
                  <div key={s.label} className="text-center p-3 rounded-xl bg-white/[0.04] border border-white/10">
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">{s.label}</p>
                    <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4 leading-tight">{slide.title}</h2>
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
                        <th className="text-left py-2">Platform</th>
                        <th className="text-left py-2">Fees</th>
                        <th className="text-left py-2">Payout</th>
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
                      Start Earning 100%
                    </Button>
                  </Link>
                  <Link href="/comparison?earnings=10000">
                    <Button variant="outline" size="lg" className="w-full">
                      Compare Platforms
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
            aria-label="Previous slide"
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
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => go(1)}
            disabled={current === slides.length - 1}
            className="p-3 rounded-xl bg-white/5 border border-white/10 disabled:opacity-30 touch-manipulation"
            aria-label="Next slide"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}