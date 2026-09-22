import { useState } from 'react';
import { ArrowRight, Check, ChevronRight, Eye, Play, Sparkles, Users } from 'lucide-react';
import { Card } from './Card';
import { Link } from './Link';
import { MediaCard } from './MediaCard';
import { DemoPreviewBadge } from './DemoPreviewBadge';

interface StoryChapter {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  imageUrl: string;
  videoUrl?: string;
  detail: string;
  outcome: string;
}

const chapters: StoryChapter[] = [
  {
    id: 'discover',
    eyebrow: '01 · Discover',
    title: 'Start with a story, not a blank grid.',
    description: 'Supporters see the person, the place, and the reason before they ever see a payment button.',
    imageUrl: '/images/mock/pexels-2a6bfc8ddf.jpeg',
    videoUrl: 'https://videos.pexels.com/video-files/9724317/9724317-sd_480_360_30fps.mp4',
    detail: 'A strong cover, short story, location, and visible goal create context in seconds.',
    outcome: 'Clear context',
  },
  {
    id: 'choose',
    eyebrow: '02 · Choose',
    title: 'Turn a big goal into visible steps.',
    description: 'Each wishlist item explains what support unlocks, so people can choose a meaningful next step.',
    imageUrl: '/images/mock/pexels-0627eaa705.jpeg',
    detail: 'Progress bars, item detail, media, and updates make the goal feel tangible rather than abstract.',
    outcome: 'Tangible impact',
  },
  {
    id: 'support',
    eyebrow: '03 · Support',
    title: 'Make the next action obvious.',
    description: 'One focused call to action keeps the experience calm while trust details stay close at hand.',
    imageUrl: '/images/mock/pexels-5e89e84d08.jpeg',
    detail: 'The demo shows the checkout, wallet, proof, and confirmation language without claiming a live settlement.',
    outcome: 'Confident action',
  },
];

const paths = [
  {
    icon: Users,
    label: 'I want to support',
    description: 'Browse stories, compare goals, and save a project for later.',
    href: '/explore',
  },
  {
    icon: Sparkles,
    label: 'I want to create',
    description: 'Preview the creator path: wallet, wishlist, publish, share.',
    href: '/auth?next=%2Fdashboard',
  },
  {
    icon: Eye,
    label: 'I am evaluating KATOA',
    description: 'Walk through the product story before choosing a direction.',
    href: '#demo-story',
  },
];

export function DemoExperience() {
  const [activeChapter, setActiveChapter] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const chapter = chapters[activeChapter];

  return (
    <section id="demo-story" className="lp-section py-12 sm:py-16" aria-labelledby="demo-experience-title">
      <div className="lp-container">
        <div className="max-w-3xl mb-8 sm:mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <DemoPreviewBadge />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neon-cyan-300">Guided preview</span>
          </div>
          <h2 id="demo-experience-title" className="lp-section-title">See the whole idea in three calm steps.</h2>
          <p className="lp-section-subtitle">
            A richer product demo for the weeks before launch: enough detail to feel real, without pretending sample data is live.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3 mb-8" aria-label="Choose a demo path">
          {paths.map(({ icon: Icon, label, description, href }) => (
            <Link
              key={label}
              href={href}
              className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5 transition-all hover:-translate-y-0.5 hover:border-neon-cyan-400/40 hover:bg-white/[0.07]"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-cyan-400/10 text-neon-cyan-300">
                  <Icon size={19} aria-hidden />
                </span>
                <ArrowRight size={17} className="mt-1 text-gray-500 transition-transform group-hover:translate-x-1 group-hover:text-neon-cyan-300" aria-hidden />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">{label}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-400">{description}</p>
            </Link>
          ))}
        </div>

        <Card variant="glass" className="overflow-hidden border-white/15">
          <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)]">
            <div className="relative min-h-[19rem] sm:min-h-[27rem] lg:min-h-[34rem]">
              <MediaCard
                media={{ imageUrl: chapter.imageUrl, videoUrl: chapter.videoUrl, alt: chapter.title }}
                aspect="wide"
                className="!aspect-auto h-full min-h-[19rem] sm:min-h-[27rem] lg:min-h-[34rem]"
                variant="creator"
                alwaysPlay={Boolean(chapter.videoUrl)}
                priority
                topLeft={<DemoPreviewBadge compact />}
                topRight={chapter.videoUrl ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                    <Play size={10} className="fill-current text-neon-cyan-300" aria-hidden />
                    Motion preview
                  </span>
                ) : undefined}
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-5 sm:p-7 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-neon-cyan-300">{chapter.eyebrow}</p>
                <p className="mt-2 max-w-lg text-xl sm:text-2xl font-black leading-tight text-white">{chapter.title}</p>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-6 p-5 sm:p-7 lg:p-9">
              <div>
                <div className="flex items-center justify-between gap-3 mb-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Product story</p>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    <Check size={11} aria-hidden /> {chapter.outcome}
                  </span>
                </div>
                <p className="text-base leading-relaxed text-gray-300">{chapter.description}</p>

                <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 text-left"
                    aria-expanded={showDetails}
                    onClick={() => setShowDetails((value) => !value)}
                  >
                    <span className="text-sm font-bold text-white">What the user gets</span>
                    <ChevronRight size={17} className={`text-gray-400 transition-transform ${showDetails ? 'rotate-90' : ''}`} aria-hidden />
                  </button>
                  {showDetails && <p className="mt-3 text-sm leading-relaxed text-gray-400">{chapter.detail}</p>}
                </div>
              </div>

              <div>
                <div className="grid grid-cols-3 gap-2 mb-5" role="tablist" aria-label="Demo story chapters">
                  {chapters.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      aria-selected={activeChapter === index}
                      aria-label={`0${index + 1} ${item.id}`}
                      onClick={() => {
                        setActiveChapter(index);
                        setShowDetails(false);
                      }}
                      className={`min-h-[48px] rounded-xl border px-2 text-left transition-colors ${
                        activeChapter === index
                          ? 'border-neon-cyan-400/50 bg-neon-cyan-400/10 text-white'
                          : 'border-white/10 bg-white/[0.03] text-gray-500 hover:text-gray-200'
                      }`}
                    >
                      <span className="block text-[10px] font-black uppercase tracking-wider">0{index + 1}</span>
                      <span className="mt-1 block truncate text-xs font-semibold">{item.id}</span>
                    </button>
                  ))}
                </div>
                <Link href={`/wishlist/medellin-skate-park`} className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-bitcoin-orange-500 px-5 text-sm font-bold text-white shadow-[0_12px_32px_rgba(247,147,26,0.2)] transition-colors hover:bg-bitcoin-orange-400">
                  Open the sample story
                  <ArrowRight size={17} aria-hidden />
                </Link>
                <p className="mt-3 text-center text-[11px] leading-relaxed text-gray-500">Demo interaction only · no live payment is claimed</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
