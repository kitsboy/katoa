import { useMemo, useState } from 'react';
import { Search, Users } from 'lucide-react';
import { Link } from './Link';
import { CreatorVideoCard, type CreatorVideoWishlist } from './CreatorVideoCard';
import { CREATOR_VERTICALS } from '../data/creatorVerticals';
import { filterCreators } from '../lib/creatorSearch';
import { formatCompactCount } from '../lib/i18nFormat';

interface CreatorDiscoveryGridProps {
  creators: CreatorVideoWishlist[];
  t: (key: string) => string;
}

/**
 * P3 discovery — OnlyFans-style creator grid for the home page: trending /
 * new sections built from CreatorVideoCard, plus search by vertical/tag and
 * live follower counts.
 */
export function CreatorDiscoveryGrid({ creators, t }: CreatorDiscoveryGridProps) {
  const [query, setQuery] = useState('');
  const [verticalId, setVerticalId] = useState<string>('');

  const { results, verticalTag } = useMemo(
    () => filterCreators(creators, { query, verticalId }),
    [creators, query, verticalId]
  );

  const trending = useMemo(
    () => [...results].sort((a, b) => (b.subscriber_count ?? 0) - (a.subscriber_count ?? 0)),
    [results]
  );
  const newest = useMemo(
    () =>
      [...results].sort(
        (a, b) =>
          new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
      ),
    [results]
  );

  const totalFollowers = useMemo(
    () => results.reduce((sum, w) => sum + (w.subscriber_count ?? 0), 0),
    [results]
  );

  return (
    <section aria-labelledby="creator-discovery-heading">
      <div className="text-center mb-6">
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-bitcoin-orange-400 mb-2">
          {t('creator.discoverEyebrow')}
        </p>
        <h2 id="creator-discovery-heading" className="text-2xl sm:text-3xl font-display font-black mb-3">
          {t('creator.discoverTitle')}
        </h2>
        <p className="text-sm text-gray-400 max-w-xl mx-auto">
          {t('creator.discoverSubtitle')}{' '}
          <span className="inline-flex items-center gap-1 text-white font-semibold">
            <Users size={14} className="text-bitcoin-orange-400" />
            {formatCompactCount(totalFollowers)} {t('creator.followers')}
          </span>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <label className="relative flex-1">
          <span className="sr-only">{t('creator.searchPlaceholder')}</span>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('creator.searchPlaceholder')}
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-bitcoin-orange-500/50 transition-colors"
          />
        </label>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={t('creator.filterByVertical')}>
          <button
            type="button"
            onClick={() => setVerticalId('')}
            aria-pressed={verticalId === ''}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors touch-manipulation ${
              verticalId === ''
                ? 'bg-bitcoin-orange-500 text-charcoal-950 border-bitcoin-orange-500'
                : 'bg-white/[0.04] text-gray-300 border-white/10 hover:border-bitcoin-orange-500/40'
            }`}
          >
            {t('creator.allVertical')}
          </button>
          {CREATOR_VERTICALS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setVerticalId(verticalId === v.id ? '' : v.id)}
              aria-pressed={verticalId === v.id}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors touch-manipulation ${
                verticalId === v.id
                  ? 'bg-bitcoin-orange-500 text-charcoal-950 border-bitcoin-orange-500'
                  : 'bg-white/[0.04] text-gray-300 border-white/10 hover:border-bitcoin-orange-500/40'
              }`}
            >
              {v.emoji} {v.label}
            </button>
          ))}
        </div>
      </div>

      {results.length === 0 ? (
        <p className="text-center text-gray-200 text-sm py-10">{t('creator.noResults')}</p>
      ) : (
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-black text-white mb-3 flex items-center gap-2">
              🔥 {t('creator.trending')}
              {verticalTag && <span className="text-xs font-semibold text-bitcoin-orange-400 normal-case">· {verticalTag}</span>}
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {trending.slice(0, 4).map((w) => (
                <CreatorVideoCard key={w.id} wishlist={w} t={t} compact />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-black text-white mb-3 flex items-center gap-2">
              🆕 {t('creator.newCreators')}
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {newest.slice(0, 4).map((w) => (
                <CreatorVideoCard key={w.id} wishlist={w} t={t} compact />
              ))}
            </div>
          </div>

          <p className="text-center">
            <Link href="/explore?videos=1" className="lp-btn-secondary inline-flex">
              {t('creator.browseAll')}
            </Link>
          </p>
        </div>
      )}
    </section>
  );
}
