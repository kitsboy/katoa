import { Link } from '../components/Link';
import { PageMeta } from '../components/PageMeta';
import { PageHero } from '../components/PageHero';
import { Button } from '../components/Button';

const STORIES = [
  {
    title: 'Community skate park (demo)',
    vertical: 'Sports / youth',
    result: 'Wishlist + Lightning gifts · 0% platform fee',
    body: 'A public demo wishlist shows how fans fund gear and construction items — or buy products via Amazon links — without a 10–20% cut.',
    href: '/wishlist/medellin-skate-park',
  },
  {
    title: 'Independent creator tip jar',
    vertical: 'Model / lifestyle',
    result: 'Direct sats · wishlist outfits & gear',
    body: 'Creators list product links and goals. Supporters fund in Bitcoin or purchase items. No bank middleman required to start.',
    href: '/creators',
  },
  {
    title: 'Coach / meal planner launch',
    vertical: 'Education & food',
    body: 'Templates seed camera gear, print runs, and program launches. Fans underwrite the work; creator keeps every sat.',
    result: 'Template-driven wishlist',
    href: '/templates?vertical=meals',
  },
];

export function CaseStudiesPage() {
  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-charcoal-950 pt-16 pb-24">
      <PageMeta
        title="Case studies"
        description="How creators use KATOA — zero-fee wishlists and Lightning support."
        path="/case-studies"
      />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pt-24">
        <PageHero
          title="Case studies"
          subtitle="Patterns that work. Some stories use demo catalogs until live pilots publish."
        />
        <div className="space-y-4">
          {STORIES.map((s) => (
            <article key={s.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
              <p className="text-[10px] font-bold uppercase tracking-wider text-bitcoin-orange-400 mb-1">
                {s.vertical}
              </p>
              <h2 className="text-xl font-display font-bold text-white mb-2">{s.title}</h2>
              <p className="text-sm text-emerald-400/90 font-semibold mb-2">{s.result}</p>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">{s.body}</p>
              <Link href={s.href}>
                <Button variant="outline" className="min-h-[44px]">
                  View example
                </Button>
              </Link>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
