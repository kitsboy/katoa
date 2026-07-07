import { useEffect, useState, useMemo, useCallback, lazy, Suspense, memo } from 'react';
import { Card } from '../components/Card';
import { Link } from '../components/Link';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { CategoryBadge } from '../components/CategoryBadge';
import { TrendingBadge } from '../components/TrendingBadge';
import { ProgressBar } from '../components/ProgressBar';
import { MediaCard } from '../components/MediaCard';
import { SatsDisplay } from '../components/SatsDisplay';
import { DemoBanner } from '../components/DemoBanner';
import { EmptyState } from '../components/EmptyState';
import { CardSkeleton } from '../components/Skeleton';
import { supabase, asRows } from '../lib/supabase';
import { mockWishlists } from '../data/mockWishlists';
import { mergeKatoaPinsWithMap } from '../lib/btcmap';
import type { Category } from '../types/database';
import { getStorage, setStorage, STORAGE_KEYS } from '../lib/storage';
import { useLanguage } from '../contexts/LanguageContext';
import { PageMeta } from '../components/PageMeta';
import { Gift, Search, MapPin, Globe, SlidersHorizontal, Star, Heart, X, Video } from 'lucide-react';
import { CreatorVideoCard } from '../components/CreatorVideoCard';

const BTCMapSection = lazy(() =>
  import('../components/BTCMapSection').then((m) => ({ default: m.BTCMapSection }))
);

interface Wishlist {
  id: string;
  title: string;
  description: string;
  slug: string;
  cover_image: string | null;
  cover_video_url?: string | null;
  total_sats_goal: number;
  total_sats_raised: number;
  country?: string;
  country_code?: string;
  country_flag?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  created_at?: string;
  card_style?: 'creator' | 'default';
  category?: string;
  subscriber_count?: number;
  creator: {
    username: string;
    avatar_url: string | null;
    bio?: string;
  };
}

function isCreatorVideoCard(w: Wishlist): boolean {
  return w.card_style === 'creator' && Boolean(w.cover_video_url);
}

interface ExploreFilters {
  searchTerm: string;
  selectedCountry: string;
  selectedCategory: string;
  sortBy: string;
}

const defaultFilters: ExploreFilters = {
  searchTerm: '',
  selectedCountry: '',
  selectedCategory: '',
  sortBy: 'recent',
};

const SORT_OPTIONS = new Set(['recent', 'trending', 'funded', 'goal']);

function readExploreFiltersFromUrl(): {
  filters: ExploreFilters;
  showMap: boolean;
  favoritesOnly: boolean;
  videosOnly: boolean;
} {
  const params = new URLSearchParams(window.location.search);
  const sort = params.get('sort');
  return {
    filters: {
      searchTerm: params.get('search') ?? '',
      selectedCountry: params.get('country') ?? '',
      selectedCategory: params.get('category') ?? '',
      sortBy: sort && SORT_OPTIONS.has(sort) ? sort : 'recent',
    },
    showMap: params.get('map') === '1' || params.get('map') === 'true',
    favoritesOnly: params.get('favorites') === '1' || params.get('favorites') === 'true',
    videosOnly: params.get('videos') === '1' || params.get('videos') === 'true',
  };
}

function hasUrlExploreFilters(): boolean {
  const params = new URLSearchParams(window.location.search);
  return ['search', 'country', 'category', 'sort', 'map', 'favorites', 'videos'].some((key) => params.has(key));
}

const PAGE_SIZE = 12;

const WishlistCard = memo(function WishlistCard({
  wishlist,
  isFavorite,
  onToggleFavorite,
  t,
}: {
  wishlist: Wishlist;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  t: (key: string) => string;
}) {
  const progress = wishlist.total_sats_goal > 0
    ? (wishlist.total_sats_raised / wishlist.total_sats_goal) * 100
    : 0;
  const isTrending = wishlist.total_sats_raised > 50000;
  const isNew = wishlist.created_at
    ? new Date(wishlist.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    : false;
  const w = wishlist as Wishlist & { country_flag?: string };

  return (
    <Link href={`/wishlist/${wishlist.slug}`} className="group">
      <Card hover className="overflow-hidden animate-fade-in h-full flex flex-col">
        <MediaCard
          media={{
            imageUrl: wishlist.cover_image,
            videoUrl: wishlist.cover_video_url,
            alt: wishlist.title,
          }}
          aspect="wide"
          className="!aspect-[16/11]"
          topLeft={
            <>
              {isTrending && <TrendingBadge type="trending" />}
              {isNew && !isTrending && <TrendingBadge type="new" />}
            </>
          }
          topRight={
            <div className="flex items-center gap-2">
              {w.country_flag && (
                <span className="text-2xl drop-shadow-lg">{w.country_flag}</span>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleFavorite(wishlist.id);
                }}
                className="p-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 hover:border-rose-500/50 transition-colors touch-manipulation"
                aria-label={isFavorite ? t('explore.removeFavorite') : t('explore.addFavorite')}
                aria-pressed={isFavorite}
              >
                <Heart
                  size={18}
                  className={isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white'}
                />
              </button>
            </div>
          }
          bottomLeft={
            progress >= 100 ? (
              <div className="px-2.5 py-1 bg-emerald-500 rounded-full text-white text-xs font-bold flex items-center gap-1">
                <Star size={11} className="fill-white" />
                {t('explore.funded')}
              </div>
            ) : undefined
          }
          bottomRight={
            <>
              <span className="px-2 py-0.5 bg-bitcoin-orange-500/90 rounded text-white text-[10px] font-black">⚡ LN</span>
              <span className="px-2 py-0.5 bg-amber-600/90 rounded text-white text-[10px] font-black">₿</span>
            </>
          }
        />

        <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1.5 line-clamp-1 group-hover:text-neon-cyan-400 transition-colors">
              {wishlist.title}
            </h3>
            <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
              {wishlist.description}
            </p>
            {wishlist.country && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mt-2">
                <MapPin size={12} className="text-bitcoin-orange-500" />
                <span>{wishlist.city ? `${wishlist.city}, ` : ''}{wishlist.country}</span>
              </div>
            )}
          </div>

          {wishlist.creator?.username && (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-r from-bitcoin-orange-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {wishlist.creator.username[0].toUpperCase()}
              </div>
              <span className="text-sm text-gray-300 font-medium">{wishlist.creator.username}</span>
            </div>
          )}

          {wishlist.total_sats_goal > 0 && (
            <div className="space-y-2 pt-1">
              <SatsDisplay sats={wishlist.total_sats_raised} size="sm" />
              <ProgressBar
                current={wishlist.total_sats_raised}
                goal={wishlist.total_sats_goal}
                showPercentage={true}
                showValues={false}
                height="sm"
                animated={true}
              />
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
});

function FilterFields({
  sortBy,
  selectedCategory,
  selectedCountry,
  categories,
  countries,
  onSortChange,
  onCategoryChange,
  onCountryChange,
  t,
}: {
  sortBy: string;
  selectedCategory: string;
  selectedCountry: string;
  categories: { id: string; slug: string; name: string }[];
  countries: string[];
  onSortChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onCountryChange: (v: string) => void;
  t: (key: string) => string;
}) {
  const selectClass =
    'w-full px-4 py-3 min-h-[44px] bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-neon-cyan-500/50 focus:border-neon-cyan-500/30';

  return (
    <div className="grid grid-cols-1 gap-4">
      <div>
        <label htmlFor="explore-sort" className="block text-sm font-medium text-gray-300 mb-2">{t('explore.sortBy')}</label>
        <select id="explore-sort" value={sortBy} onChange={(e) => onSortChange(e.target.value)} className={selectClass}>
          <option value="recent">{t('explore.sortRecent')}</option>
          <option value="trending">{t('explore.sortTrending')}</option>
          <option value="funded">{t('explore.sortFunded')}</option>
          <option value="goal">{t('explore.sortGoal')}</option>
        </select>
      </div>
      <div>
        <label htmlFor="explore-category" className="block text-sm font-medium text-gray-300 mb-2">{t('explore.category')}</label>
        <select id="explore-category" value={selectedCategory} onChange={(e) => onCategoryChange(e.target.value)} className={selectClass}>
          <option value="">{t('explore.allCategories')}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="explore-country" className="block text-sm font-medium text-gray-300 mb-2">{t('explore.location')}</label>
        <select id="explore-country" value={selectedCountry} onChange={(e) => onCountryChange(e.target.value)} className={selectClass}>
          <option value="">{t('explore.allCountries')}</option>
          {countries.map((country) => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function ExplorePage() {
  const { t } = useLanguage();
  const urlState = readExploreFiltersFromUrl();
  const savedFilters = getStorage<ExploreFilters>(STORAGE_KEYS.exploreFilters, defaultFilters);
  const useUrlFilters = hasUrlExploreFilters();

  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [filteredWishlists, setFilteredWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  const [searchTerm, setSearchTerm] = useState(
    useUrlFilters ? urlState.filters.searchTerm : savedFilters.searchTerm
  );
  const [debouncedSearch, setDebouncedSearch] = useState(
    useUrlFilters ? urlState.filters.searchTerm : savedFilters.searchTerm
  );
  const [selectedCountry, setSelectedCountry] = useState(
    useUrlFilters ? urlState.filters.selectedCountry : savedFilters.selectedCountry
  );
  const [selectedCategory, setSelectedCategory] = useState(
    useUrlFilters ? urlState.filters.selectedCategory : savedFilters.selectedCategory
  );
  const [sortBy, setSortBy] = useState(
    useUrlFilters ? urlState.filters.sortBy : savedFilters.sortBy
  );
  const [showMap, setShowMap] = useState(() =>
    useUrlFilters ? urlState.showMap : getStorage<boolean>(STORAGE_KEYS.exploreShowMap, false)
  );

  useEffect(() => {
    setStorage(STORAGE_KEYS.exploreShowMap, showMap);
  }, [showMap]);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [favorites, setFavorites] = useState<string[]>(() =>
    getStorage<string[]>(STORAGE_KEYS.exploreFavorites, [])
  );
  const [favoritesOnly, setFavoritesOnly] = useState(() =>
    useUrlFilters ? urlState.favoritesOnly : getStorage<boolean>(STORAGE_KEYS.exploreFavoritesOnly, false)
  );
  const [videosOnly, setVideosOnly] = useState(() =>
    useUrlFilters ? urlState.videosOnly : getStorage<boolean>(STORAGE_KEYS.exploreVideosOnly, false)
  );
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [debouncedSearch, selectedCountry, selectedCategory, sortBy, favoritesOnly, videosOnly]);

  useEffect(() => {
    loadWishlists();
    loadCategories();
    const savedY = sessionStorage.getItem('katoa_explore_scroll');
    if (savedY) {
      requestAnimationFrame(() => window.scrollTo(0, parseInt(savedY, 10)));
      sessionStorage.removeItem('katoa_explore_scroll');
    }
    return () => {
      sessionStorage.setItem('katoa_explore_scroll', String(window.scrollY));
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setStorage(STORAGE_KEYS.exploreFilters, {
      searchTerm,
      selectedCountry,
      selectedCategory,
      sortBy,
    });
  }, [searchTerm, selectedCountry, selectedCategory, sortBy]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const params = url.searchParams;

    if (searchTerm) params.set('search', searchTerm);
    else params.delete('search');

    if (selectedCountry) params.set('country', selectedCountry);
    else params.delete('country');

    if (selectedCategory) params.set('category', selectedCategory);
    else params.delete('category');

    if (sortBy !== 'recent') params.set('sort', sortBy);
    else params.delete('sort');

    if (showMap) params.set('map', '1');
    else params.delete('map');

    if (favoritesOnly) params.set('favorites', '1');
    else params.delete('favorites');

    if (videosOnly) params.set('videos', '1');
    else params.delete('videos');

    const nextSearch = params.toString();
    const nextUrl = `${url.pathname}${nextSearch ? `?${nextSearch}` : ''}`;
    const currentUrl = `${url.pathname}${url.search}`;
    if (currentUrl !== nextUrl) {
      window.history.replaceState({}, '', nextUrl);
    }
  }, [searchTerm, selectedCountry, selectedCategory, sortBy, showMap, favoritesOnly, videosOnly]);

  async function loadCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(asRows<Category>(data));
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  useEffect(() => {
    let filtered = [...wishlists];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (w) =>
          w.title?.toLowerCase().includes(q) ||
          w.description?.toLowerCase().includes(q) ||
          w.creator?.username?.toLowerCase().includes(q)
      );
    }

    if (selectedCountry) {
      filtered = filtered.filter((w) => w.country === selectedCountry);
    }

    if (selectedCategory) {
      filtered = filtered.filter((w) => (w as Wishlist & { category?: string }).category === selectedCategory);
    }

    if (favoritesOnly) {
      filtered = filtered.filter((w) => favorites.includes(w.id));
    }

    if (videosOnly) {
      filtered = filtered.filter((w) => isCreatorVideoCard(w) || Boolean(w.cover_video_url));
    }

    switch (sortBy) {
      case 'trending':
        filtered.sort((a, b) => (b.total_sats_raised || 0) - (a.total_sats_raised || 0));
        break;
      case 'funded':
        filtered.sort((a, b) => {
          const aProgress = a.total_sats_goal > 0 ? (a.total_sats_raised / a.total_sats_goal) : 0;
          const bProgress = b.total_sats_goal > 0 ? (b.total_sats_raised / b.total_sats_goal) : 0;
          return bProgress - aProgress;
        });
        break;
      case 'goal':
        filtered.sort((a, b) => (b.total_sats_goal || 0) - (a.total_sats_goal || 0));
        break;
      default:
        filtered.sort((a, b) => {
          const aVid = isCreatorVideoCard(a) ? 1 : 0;
          const bVid = isCreatorVideoCard(b) ? 1 : 0;
          return bVid - aVid;
        });
        break;
    }

    setFilteredWishlists(filtered);
  }, [debouncedSearch, selectedCountry, selectedCategory, sortBy, wishlists, favoritesOnly, favorites, videosOnly]);

  async function loadWishlists() {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          id,
          title,
          description,
          slug,
          cover_image,
          cover_video_url,
          total_sats_goal,
          total_sats_raised,
          country,
          country_code,
          city,
          latitude,
          longitude,
          visibility,
          created_at,
          creator:profiles!wishlists_creator_id_fkey(username, avatar_url)
        `)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const dbWishlists = ((data || []) as unknown as Wishlist[]).filter((w) => w.creator && w.creator.username);
      const mocks = mockWishlists as Wishlist[];
      const allWishlists = [...mocks, ...dbWishlists];
      setUsingMockData(dbWishlists.length === 0);
      setWishlists(allWishlists);
      setFilteredWishlists(allWishlists);
    } catch (error) {
      console.error('Error loading wishlists:', error);
      setUsingMockData(true);
      setWishlists(mockWishlists as Wishlist[]);
      setFilteredWishlists(mockWishlists as Wishlist[]);
    } finally {
      setLoading(false);
    }
  }

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      setStorage(STORAGE_KEYS.exploreFavorites, next);
      return next;
    });
  }, []);

  const toggleFavoritesOnly = useCallback(() => {
    setFavoritesOnly((prev) => {
      const next = !prev;
      setStorage(STORAGE_KEYS.exploreFavoritesOnly, next);
      return next;
    });
  }, []);

  const toggleVideosOnly = useCallback(() => {
    setVideosOnly((prev) => {
      const next = !prev;
      setStorage(STORAGE_KEYS.exploreVideosOnly, next);
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategory('');
    setSelectedCountry('');
    setSortBy('recent');
    setSearchTerm('');
    setFavoritesOnly(false);
    setVideosOnly(false);
    setStorage(STORAGE_KEYS.exploreFavoritesOnly, false);
    setStorage(STORAGE_KEYS.exploreVideosOnly, false);
  }, []);

  const hasActiveFilters =
    selectedCategory || selectedCountry || sortBy !== 'recent' || searchTerm || favoritesOnly || videosOnly;

  const videoCreators = useMemo(
    () => wishlists.filter((w) => isCreatorVideoCard(w)),
    [wishlists]
  );

  const countries = Array.from(new Set(wishlists.map((w) => w.country).filter(Boolean) as string[])).sort();

  const wishlistsWithLocation = filteredWishlists.filter((w) => w.latitude && w.longitude);

  const { pins: katoaMapPins, mapCenter } = useMemo(() => {
    const pins = wishlistsWithLocation.map((w) => ({
      id: w.id,
      title: w.title,
      slug: w.slug,
      latitude: w.latitude!,
      longitude: w.longitude!,
      total_sats_raised: w.total_sats_raised,
      cover_image: w.cover_image,
    }));
    return mergeKatoaPinsWithMap(pins);
  }, [wishlistsWithLocation]);

  const featured = mockWishlists.find((w) => w.slug === 'medellin-skate-park') ?? mockWishlists[0];

  const recentlyViewed = useMemo(
    () =>
      getStorage<{ slug: string; title: string }[]>(STORAGE_KEYS.recentlyViewedWishlists, [])
        .filter((r) => r.slug !== featured.slug)
        .slice(0, 4),
    [featured.slug]
  );

  const itemListSchema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: t('explore.schemaName'),
      numberOfItems: filteredWishlists.length,
      itemListElement: filteredWishlists.slice(0, 20).map((w, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${import.meta.env.VITE_SITE_URL ?? 'https://katoa.org'}/wishlist/${w.slug}`,
        name: w.title,
      })),
    }),
    [filteredWishlists, t]
  );

  const resultCountLabel = loading
    ? t('explore.loadingResults')
    : filteredWishlists.length === 1
      ? t('explore.resultsCountOne')
      : t('explore.resultsCount').replace('${count}', String(filteredWishlists.length));

  const mapStatusLabel = showMap ? t('explore.mapOpened') : t('explore.mapClosed');

  return (
    <div className="min-h-screen bg-charcoal-950 pt-16 pb-20 md:pb-8">
      <PageMeta title={t('explore.metaTitle')} description={t('explore.metaDesc')} path="/explore" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      {usingMockData && (
        <DemoBanner message={t('explore.demoBanner')} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-20 sm:pt-24">
        <Card className="mb-8 overflow-hidden border-2 border-bitcoin-orange-500/40 shadow-[0_0_40px_rgba(255,135,0,0.2)] hover:shadow-[0_0_60px_rgba(255,135,0,0.35)] transition-all duration-300 animate-slide-up group">
          <div className="grid md:grid-cols-2 gap-0">
            <MediaCard
              className="h-64 sm:h-80 md:h-auto md:min-h-[360px]"
              media={{
                imageUrl: featured.cover_image,
                videoUrl: (featured as { cover_video_url?: string }).cover_video_url,
                alt: featured.title,
              }}
              aspect="wide"
              topLeft={<TrendingBadge type="featured" />}
              bottomLeft={
                <div className="bg-emerald-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg">
                  <Star size={14} className="fill-white" />
                  {Math.round((featured.total_sats_raised / featured.total_sats_goal) * 100)}% Funded
                </div>
              }
            />
            <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-center bg-charcoal-900/80">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-bitcoin-orange-500 to-amber-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-black text-lg">SK</span>
                </div>
                <div>
                  <p className="text-white font-bold">Skate Colombia Foundation</p>
                  <p className="text-gray-400 text-sm">Verified Creator</p>
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                {featured.title}
              </h2>
              <p className="text-gray-300 mb-6 leading-relaxed font-medium text-base sm:text-lg">
                {featured.description}
              </p>

              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 p-3 sm:p-4 bg-black/30 rounded-xl border border-white/10">
                <div className="text-center min-w-0">
                  <p className="text-lg sm:text-2xl font-black text-bitcoin-orange-500">500+</p>
                  <p className="text-[10px] sm:text-xs text-gray-400 font-medium leading-tight">Youth Served</p>
                </div>
                <div className="text-center border-x border-white/10 min-w-0">
                  <p className="text-lg sm:text-2xl font-black text-emerald-500">65%</p>
                  <p className="text-[10px] sm:text-xs text-gray-400 font-medium leading-tight">Funded</p>
                </div>
                <div className="text-center min-w-0">
                  <p className="text-lg sm:text-2xl font-black text-neon-cyan-500">234</p>
                  <p className="text-[10px] sm:text-xs text-gray-400 font-medium leading-tight">Supporters</p>
                </div>
              </div>

              <ProgressBar
                current={featured.total_sats_raised}
                goal={featured.total_sats_goal}
                showPercentage={false}
                showValues={true}
                gradient="from-bitcoin-orange-500 to-amber-600"
                height="md"
                animated={true}
              />
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6">
                <Link href={`/wishlist/${featured.slug}`} className="flex-1">
                  <Button size="lg" variant="bitcoin" className="w-full font-bold">
                    <Gift size={20} className="mr-2" />
                    Support This Project
                  </Button>
                </Link>
                <div className="flex items-center justify-center gap-2 text-gray-200 text-sm font-bold px-4 py-3 bg-white/5 rounded-xl border border-white/10">
                  <MapPin size={16} className="text-bitcoin-orange-500" />
                  <span>{featured.city}, {featured.country} {featured.country_flag}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {videoCreators.length > 0 && (
          <section className="mb-10" aria-labelledby="video-creators-heading">
            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <h2 id="video-creators-heading" className="text-xl sm:text-2xl font-display font-bold text-white">
                  {t('explore.videoCreators')}
                </h2>
                <p className="text-gray-400 text-sm mt-1">{t('explore.videoCreatorsDesc')}</p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00aff0]/15 border border-[#00aff0]/30 text-[#00aff0] text-xs font-bold">
                <Video size={14} />
                {t('explore.hoverPreview')}
              </span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto lg:max-w-4xl">
              {videoCreators.slice(0, 2).map((wishlist) => (
                <CreatorVideoCard
                  key={wishlist.id}
                  wishlist={wishlist}
                  isFavorite={favorites.includes(wishlist.id)}
                  onToggleFavorite={toggleFavorite}
                  t={t}
                />
              ))}
            </div>
          </section>
        )}

        {recentlyViewed.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">{t('explore.recentlyViewed')}</h2>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
              {recentlyViewed.map((item) => (
                <Link
                  key={item.slug}
                  href={`/wishlist/${item.slug}`}
                  className="shrink-0 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-200 hover:border-neon-cyan-500/40 hover:text-neon-cyan-400 transition-colors touch-manipulation"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t('explore.allProjects')}</h1>
          <p className="text-gray-300 mb-2 text-base sm:text-lg">{t('explore.subtitle')}</p>
          <p className="sr-only" aria-live="polite" aria-atomic="true">
            {resultCountLabel}. {mapStatusLabel}
          </p>

          <div className="space-y-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} aria-hidden />
                <Input
                  placeholder={t('explore.searchProjects')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12"
                  aria-label={t('explore.searchAria')}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant={showFilters ? 'primary' : 'outline'}
                  onClick={() => setShowFilters(true)}
                  className="flex-1 sm:flex-none"
                  aria-expanded={showFilters}
                  aria-haspopup="dialog"
                >
                  <SlidersHorizontal size={20} className="mr-2" />
                  {t('explore.filters')}
                  {hasActiveFilters && (
                    <span className="ml-2 w-2 h-2 rounded-full bg-neon-cyan-500" aria-label={t('explore.filtersActive')} />
                  )}
                </Button>

                <Button
                  variant={showMap ? 'primary' : 'outline'}
                  onClick={() => setShowMap(!showMap)}
                  className="flex-1 sm:flex-none"
                  aria-pressed={showMap}
                >
                  <Globe size={20} className="mr-2" />
                  {t('explore.map')}
                </Button>

                <Button
                  variant={favoritesOnly ? 'primary' : 'outline'}
                  onClick={toggleFavoritesOnly}
                  className="flex-1 sm:flex-none"
                  aria-pressed={favoritesOnly}
                >
                  <Heart size={20} className={`mr-2 ${favoritesOnly ? 'fill-current' : ''}`} />
                  {t('explore.favoritesOnly')}
                </Button>

                <Button
                  variant={videosOnly ? 'primary' : 'outline'}
                  onClick={toggleVideosOnly}
                  className="flex-1 sm:flex-none border-[#00aff0]/30 hover:border-[#00aff0]/60"
                  aria-pressed={videosOnly}
                >
                  <Video size={20} className={`mr-2 ${videosOnly ? 'text-[#00aff0]' : ''}`} />
                  {t('explore.videosOnly')}
                </Button>
              </div>
            </div>

            {/* Desktop inline filters */}
            {showFilters && (
              <Card variant="glass" padding="md" className="hidden md:block animate-slide-up">
                <FilterFields
                  sortBy={sortBy}
                  selectedCategory={selectedCategory}
                  selectedCountry={selectedCountry}
                  categories={categories}
                  countries={countries}
                  onSortChange={setSortBy}
                  onCategoryChange={setSelectedCategory}
                  onCountryChange={setSelectedCountry}
                  t={t}
                />
                {hasActiveFilters && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-300 hover:text-white">
                      {t('explore.clearFilters')}
                    </Button>
                  </div>
                )}
              </Card>
            )}

            {/* Mobile filter bottom sheet */}
            {showFilters && (
              <div className="md:hidden fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-labelledby="filter-sheet-title">
                <button
                  type="button"
                  className="absolute inset-0 bg-black/75 backdrop-blur-sm"
                  onClick={() => setShowFilters(false)}
                  aria-label={t('explore.closeFilters')}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-charcoal-900 border-t border-white/10 rounded-t-[1.75rem] p-5 pb-safe animate-sheet-up max-h-[85dvh] overflow-y-auto">
                  <div className="flex justify-center mb-3">
                    <div className="w-10 h-1 rounded-full bg-white/20" aria-hidden />
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 id="filter-sheet-title" className="text-lg font-bold text-white">{t('explore.filtersTitle')}</h2>
                    <button
                      type="button"
                      onClick={() => setShowFilters(false)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400"
                      aria-label={t('explore.closeFilters')}
                    >
                      <X size={22} />
                    </button>
                  </div>
                  <FilterFields
                    sortBy={sortBy}
                    selectedCategory={selectedCategory}
                    selectedCountry={selectedCountry}
                    categories={categories}
                    countries={countries}
                    onSortChange={setSortBy}
                    onCategoryChange={setSelectedCategory}
                    onCountryChange={setSelectedCountry}
                    t={t}
                  />
                  <div className="mt-6 flex gap-3">
                    {hasActiveFilters && (
                      <Button variant="outline" className="flex-1" onClick={clearFilters}>
                        {t('explore.clear')}
                      </Button>
                    )}
                    <Button className="flex-1" onClick={() => setShowFilters(false)}>
                      {t('explore.showResults').replace('${count}', String(filteredWishlists.length))}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {categories.length > 0 && !showFilters && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-gray-300 text-sm font-medium">{t('explore.quickFilters')}</span>
                {categories.slice(0, 6).map((cat) => (
                  <CategoryBadge
                    key={cat.id}
                    name={cat.name}
                    icon={cat.icon ?? undefined}
                    color={cat.color ?? undefined}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.slug)}
                  />
                ))}
              </div>
            )}
          </div>

          {showMap && (
            <Card className="mb-8" variant="glass" padding="md">
              <Suspense
                fallback={
                  <div className="h-64 sm:h-96 rounded-xl border border-white/10 flex items-center justify-center text-gray-400">
                    {t('explore.loadingMap')}
                  </div>
                }
              >
                <BTCMapSection mapCenter={mapCenter} pins={katoaMapPins} />
              </Suspense>

              {wishlistsWithLocation.length > 0 && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {wishlistsWithLocation.slice(0, 8).map((wishlist) => (
                    <Link
                      key={wishlist.id}
                      href={`/wishlist/${wishlist.slug}`}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-neon-cyan/30 transition-all"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <MapPin size={16} className="text-bitcoin-orange-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-bold line-clamp-2">{wishlist.title}</p>
                          <p className="text-gray-400 text-xs mt-1">
                            {wishlist.city}, {wishlist.country}
                          </p>
                        </div>
                      </div>
                      <ProgressBar
                        current={wishlist.total_sats_raised}
                        goal={wishlist.total_sats_goal}
                        showPercentage={false}
                        showValues={false}
                        height="sm"
                      />
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true" aria-label={t('explore.loadingProjects')}>
            {[...Array(9)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filteredWishlists.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredWishlists.slice(0, visibleCount).map((wishlist) =>
                isCreatorVideoCard(wishlist) ? (
                  <CreatorVideoCard
                    key={wishlist.id}
                    wishlist={wishlist}
                    isFavorite={favorites.includes(wishlist.id)}
                    onToggleFavorite={toggleFavorite}
                    t={t}
                  />
                ) : (
                  <WishlistCard
                    key={wishlist.id}
                    wishlist={wishlist}
                    isFavorite={favorites.includes(wishlist.id)}
                    onToggleFavorite={toggleFavorite}
                    t={t}
                  />
                )
              )}
            </div>
            {visibleCount < filteredWishlists.length && (
              <div className="mt-8 text-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  className="min-h-[48px] px-8"
                >
                  {t('explore.loadMore')} ({filteredWishlists.length - visibleCount} {t('explore.remaining')})
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card variant="glass">
            <EmptyState
              icon={<Gift size={32} />}
              title={favoritesOnly ? t('explore.noFavorites') : debouncedSearch || selectedCountry ? t('explore.noResults') : t('explore.noProjects')}
              description={
                favoritesOnly
                  ? t('explore.emptyDescFavorites')
                  : debouncedSearch || selectedCountry
                  ? t('explore.tryAgain')
                  : t('explore.emptyDescNone')
              }
              actionLabel={favoritesOnly ? t('explore.browseAll') : hasActiveFilters ? t('explore.clearFiltersAction') : undefined}
              onAction={favoritesOnly || hasActiveFilters ? clearFilters : undefined}
            />
          </Card>
        )}
      </div>
    </div>
  );
}