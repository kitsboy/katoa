import { Link } from './Link';
import { CreatorSplashCard } from './CreatorSplashCard';
import type { CreatorVideoWishlist } from './CreatorVideoCard';

interface CreatorDiscoveryGridProps {
  creators: CreatorVideoWishlist[];
  t: (key: string) => string;
}

/** A cinematic curated shelf for the homepage; full discovery belongs on /explore. */
export function CreatorDiscoveryGrid({ creators, t }: CreatorDiscoveryGridProps) {
  return (
    <section aria-labelledby="creator-discovery-heading">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-bitcoin-orange-400 sm:text-xs">
            {t('creator.discoverEyebrow')}
          </p>
          <h2 id="creator-discovery-heading" className="font-display text-2xl font-black text-white sm:text-3xl">
            A few good reasons to explore
          </h2>
          <p className="mt-2 max-w-xl text-sm text-gray-400">
            Real-looking demo pages for now. Open one, see the flow, then make your own.
          </p>
        </div>
        <Link href="/explore" className="lp-btn-secondary shrink-0 self-start sm:self-auto">
          {t('creator.browseAll')}
        </Link>
      </div>

      <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {creators.map((creator, index) => (
          <CreatorSplashCard key={creator.id} creator={creator} featured={index === 0} />
        ))}
      </div>
    </section>
  );
}
