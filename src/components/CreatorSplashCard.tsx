import { ArrowUpRight, Play } from 'lucide-react';
import { Link } from './Link';
import { DemoPreviewBadge } from './DemoPreviewBadge';
import { MediaCard } from './MediaCard';
import type { CreatorVideoWishlist } from './CreatorVideoCard';

interface CreatorSplashCardProps {
  creator: CreatorVideoWishlist;
  featured?: boolean;
}

/** Editorial, image-led creator card for the homepage discovery shelf. */
export function CreatorSplashCard({ creator, featured = false }: CreatorSplashCardProps) {
  const story = creator.description.split(/[.!?]/)[0].trim();

  return (
    <Link
      href={`/u/${creator.creator.username}`}
      className={`creator-splash-card group relative block overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#120d1d] shadow-[0_18px_60px_rgba(0,0,0,0.35)] ${
        featured ? 'min-h-[31rem] sm:min-h-[38rem] lg:col-span-2' : 'min-h-[25rem] sm:min-h-[31rem]'
      }`}
      data-testid="creator-splash-card"
    >
      <MediaCard
        media={{ imageUrl: creator.cover_image, videoUrl: creator.cover_video_url, alt: creator.title }}
        aspect="tall"
        variant="creator"
        priority={featured}
        className="absolute inset-0 !aspect-auto h-full w-full"
        overlay={<div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,7,15,0.1)_10%,rgba(9,7,15,0.16)_38%,rgba(9,7,15,0.94)_100%)]" />}
        topLeft={
          <DemoPreviewBadge />
        }
        topRight={
          creator.cover_video_url ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/35 px-2.5 py-1.5 text-[10px] font-bold text-white backdrop-blur-md">
              <Play size={10} className="fill-current text-neon-cyan-300" /> Video
            </span>
          ) : undefined
        }
      />

      <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-7">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-neon-cyan-300">
          @{creator.creator.username}
        </p>
        <h3 className={`${featured ? 'text-3xl sm:text-5xl' : 'text-2xl sm:text-3xl'} max-w-2xl font-display font-black leading-[0.98] text-white`}>
          {creator.title}
        </h3>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
          {story || 'A creator-led project worth seeing.'}
        </p>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white transition-colors group-hover:text-neon-cyan-300">
          See the story <ArrowUpRight size={17} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
