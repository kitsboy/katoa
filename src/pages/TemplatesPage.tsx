import { Link } from '../components/Link';
import { PageMeta } from '../components/PageMeta';
import { PageHero } from '../components/PageHero';
import { Button } from '../components/Button';
import { Heart, Music, Stethoscope, Code2, GraduationCap, Users } from 'lucide-react';

const TEMPLATES = [
  {
    id: 'mutual-aid',
    icon: Heart,
    title: 'Mutual aid',
    blurb: 'Community fund for food, rent, or emergency support. Clear goal, transparent updates.',
    items: ['Emergency fund', 'Food packages', 'Transport'],
  },
  {
    id: 'album',
    icon: Music,
    title: 'Album / release',
    blurb: 'Fund studio time, mastering, or vinyl. Reward tiers as wishlist items.',
    items: ['Studio days', 'Mastering', 'Artwork'],
  },
  {
    id: 'clinic',
    icon: Stethoscope,
    title: 'Clinic / health',
    blurb: 'Medical equipment or community health drives with item-level funding.',
    items: ['Supplies', 'Equipment', 'Outreach'],
  },
  {
    id: 'oss',
    icon: Code2,
    title: 'Open-source sprint',
    blurb: 'Ship a library or protocol upgrade. Sponsors fund milestones in sats.',
    items: ['Dev sprint', 'Docs', 'Security review'],
  },
  {
    id: 'education',
    icon: GraduationCap,
    title: 'Education',
    blurb: 'Courses, workshops, or school supplies — global supporters, local impact.',
    items: ['Curriculum', 'Devices', 'Scholarships'],
  },
  {
    id: 'collective',
    icon: Users,
    title: 'Collective project',
    blurb: 'Multi-creator pot with a shared story and co-admins (roadmap).',
    items: ['Shared goal', 'Roles', 'Public ledger'],
  },
] as const;

export function TemplatesPage() {
  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-charcoal-950 pt-16 pb-24">
      <PageMeta
        title="Wishlist templates"
        description="Start faster with KATOA wishlist templates — mutual aid, music, health, open source, and more."
        path="/templates"
      />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pt-24">
        <PageHero
          title="Wishlist templates"
          subtitle="Pick a pattern, then make it yours. Zero platform fees either way."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEMPLATES.map((tpl) => {
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
          Prefer browsing live examples?{' '}
          <Link href="/explore" className="text-neon-cyan-400 hover:underline">
            Explore wishlists
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
