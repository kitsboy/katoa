import { Link } from './Link';
import { CreatorVideoCard, type CreatorVideoWishlist } from './CreatorVideoCard';

interface CreatorDiscoveryGridProps {
  creators: CreatorVideoWishlist[];
  t: (key: string) => string;
}

/** A small curated shelf for the homepage; full discovery belongs on /explore. */
export function CreatorDiscoveryGrid({ creators, t }: CreatorDiscoveryGridProps) {
  return (
    <section aria-labelledby="creator-discovery-heading">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">
        <div>
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-bitcoin-orange-400 mb-2">
            {t('creator.discoverEyebrow')}
          </p>
          <h2 id="creator-discovery-heading" className="text-2xl sm:text-3xl font-display font-black text-white">
            A few good reasons to explore
          </h2>
          <p className="text-sm text-gray-400 mt-2 max-w-xl">
            Real-looking demo pages for now. Open one, see the flow, then make your own.
          </p>
        </div>
        <Link href="/explore" className="lp-btn-secondary shrink-0 self-start sm:self-auto">
          {t('creator.browseAll')}
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {creators.map((creator) => (
          <CreatorVideoCard key={creator.id} wishlist={creator} t={t} compact />
        ))}
      </div>
    </section>
  );
}
