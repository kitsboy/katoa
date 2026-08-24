import { useMemo } from 'react';
import { Link } from '../components/Link';
import { PageMeta } from '../components/PageMeta';
import { PageHero } from '../components/PageHero';
import { Button } from '../components/Button';
import { Heart, Music, Stethoscope, Code2, GraduationCap, Users, Sparkles, Dumbbell, Utensils, Flag } from 'lucide-react';
import { CREATOR_VERTICALS, verticalById } from '../data/creatorVerticals';

const TEMPLATES = [
  {
    id: 'mutual-aid',
    icon: Heart,
    title: 'Mutual aid',
    blurb: 'Community fund for food, rent, or emergency support. Clear goal, transparent updates.',
    items: ['Emergency fund', 'Food packages', 'Transport'],
    vertical: 'lifestyle',
  },
  {
    id: 'model-drop',
    icon: Sparkles,
    title: 'Creator drop / tips',
    blurb: 'Fan funding for shoots, outfits, travel — keep 100% of tips and wishlist gifts.',
    items: ['Studio day', 'Outfit', 'Lighting', 'Travel'],
    vertical: 'model',
  },
  {
    id: 'fitness',
    icon: Dumbbell,
    title: 'Fitness program',
    blurb: 'Launch a challenge, fund gear, or underwrite a competition season.',
    items: ['Gym gear', 'Entry fees', 'Content day', 'Recovery'],
    vertical: 'fitness',
  },
  {
    id: 'meals',
    icon: Utensils,
    title: 'Meal plan / cookbook',
    blurb: 'Recipe video days, print runs, kitchen tools. Fans back the kitchen.',
    items: ['Camera', 'Print run', 'Props', 'Kitchen upgrade'],
    vertical: 'meals',
  },
  {
    id: 'golf',
    icon: Flag,
    title: 'Golf / tournament',
    blurb: 'Entry fees, clubs, travel. Your gallery funds the bag — not a 20% platform.',
    items: ['Tournament entry', 'Clubs', 'Travel', 'Lessons'],
    vertical: 'golf',
  },
  {
    id: 'album',
    icon: Music,
    title: 'Album / release',
    blurb: 'Fund studio time, mastering, or vinyl. Reward tiers as wishlist items.',
    items: ['Studio days', 'Mastering', 'Artwork'],
    vertical: 'music',
  },
  {
    id: 'clinic',
    icon: Stethoscope,
    title: 'Clinic / health',
    blurb: 'Medical equipment or community health drives with item-level funding.',
    items: ['Supplies', 'Equipment', 'Outreach'],
    vertical: 'creator',
  },
  {
    id: 'oss',
    icon: Code2,
    title: 'Open-source sprint',
    blurb: 'Ship a library or protocol upgrade. Sponsors fund milestones in sats.',
    items: ['Dev sprint', 'Docs', 'Security review'],
    vertical: 'education',
  },
  {
    id: 'education',
    icon: GraduationCap,
    title: 'Coach / educator',
    blurb: 'Courses, workshops, classroom supplies. Teach freely, earn fully.',
    items: ['Curriculum', 'Devices', 'Scholarships'],
    vertical: 'education',
  },
  {
    id: 'collective',
    icon: Users,
    title: 'Collective project',
    blurb: 'Multi-creator pot with a shared story and co-admins (roadmap).',
    items: ['Shared goal', 'Roles', 'Public ledger'],
    vertical: 'collective',
  },
] as const;

export function TemplatesPage() {
  const verticalParam =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('vertical') || ''
      : '';
  const focus = verticalById(verticalParam);

  const list = useMemo(() => {
    if (!focus) return TEMPLATES;
    const match = TEMPLATES.filter((t) => t.vertical === focus.id);
    return match.length ? match : TEMPLATES;
  }, [focus]);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-charcoal-950 pb-24">
      <PageMeta
        title="Wishlist templates"
        description="Start faster with KATOA templates — models, fitness, meals, golf, music, mutual aid, and more. Zero platform fees."
        path="/templates"
      />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <PageHero
          title="Wishlist templates"
          subtitle={
            focus
              ? `${focus.emoji} ${focus.label} — pick a shape, paste product links, get paid in sats.`
              : 'Pick a pattern for any creator type. Paste shop links. Fans fund or buy — you keep 100%.'
          }
        />

        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <Link
            href="/templates"
            className={`text-xs px-3 py-2 rounded-full border min-h-[40px] inline-flex items-center ${
              !focus ? 'border-bitcoin-orange-500/50 text-bitcoin-orange-300' : 'border-white/10 text-gray-400'
            }`}
          >
            All
          </Link>
          {CREATOR_VERTICALS.map((v) => (
            <Link
              key={v.id}
              href={`/templates?vertical=${v.id}`}
              className={`text-xs px-3 py-2 rounded-full border min-h-[40px] inline-flex items-center ${
                focus?.id === v.id
                  ? 'border-bitcoin-orange-500/50 text-bitcoin-orange-300'
                  : 'border-white/10 text-gray-400'
              }`}
            >
              {v.emoji} {v.label}
            </Link>
          ))}
        </div>

        {focus && (
          <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-gray-300">
            <p className="font-semibold text-white mb-2">Suggested items</p>
            <ul className="flex flex-wrap gap-2">
              {focus.itemSeeds.map((s) => (
                <li key={s} className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((tpl) => {
            const Icon = tpl.icon;
            return (
              <article
                key={tpl.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col min-h-[220px]"
              >
                <div className="w-11 h-11 rounded-xl bg-bitcoin-orange-500/15 border border-bitcoin-orange-500/25 flex items-center justify-center mb-3">
                  <Icon size={20} className="text-bitcoin-orange-400" aria-hidden />
                </div>
                <h2 className="text-lg font-display font-bold text-white mb-1.5">{tpl.title}</h2>
                <p className="text-sm text-gray-400 leading-relaxed flex-1 mb-3">{tpl.blurb}</p>
                <ul className="flex flex-wrap gap-1.5 mb-4">
                  {tpl.items.map((item) => (
                    <li
                      key={item}
                      className="text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-md bg-white/5 text-gray-400 border border-white/10"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/auth" className="mt-auto">
                  <Button variant="outline" className="w-full min-h-[44px]">
                    Start with this shape
                  </Button>
                </Link>
              </article>
            );
          })}
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          Prefer browsing?{' '}
          <Link href="/explore" className="text-neon-cyan-400 hover:underline">
            Explore wishlists
          </Link>{' '}
          ·{' '}
          <Link href="/creators" className="text-neon-cyan-400 hover:underline">
            For creators
          </Link>
        </p>
      </main>
    </div>
  );
}
