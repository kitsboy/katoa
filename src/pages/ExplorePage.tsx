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
import { CardSkeleton } from '../components/Skeleton';
import { supabase } from '../lib/supabase';
import { mockWishlists } from '../data/mockWishlists';
import { mergeKatoaPinsWithMap } from '../lib/btcmap';
import { getStorage, setStorage, STORAGE_KEYS } from '../lib/storage';
import { Gift, Search, MapPin, Globe, SlidersHorizontal, Star, Heart, X } from 'lucide-react';

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
  creator: {
    username: string;
    avatar_url: string | null;
  };
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

const WishlistCard = memo(function WishlistCard({
  wishlist,
  isFavorite,
  onToggleFavorite,
}: {
  wishlist: Wishlist;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
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
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
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
                Funded
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
}: {
  sortBy: string;
  selectedCategory: string;
  selectedCountry: string;
  categories: { id: string; slug: string; name: string }[];
  countries: string[];
  onSortChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onCountryChange: (v: string) => void;
}) {
  const selectClass =
    'w-full px-4 py-3 min-h-[44px] bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-neon-cyan-500/50 focus:border-neon-cyan-500/30';

  return (
    <div className="grid grid-cols-1 gap-4">
      <div>
        <label htmlFor="explore-sort" className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
        <select id="explore-sort" value={sortBy} onChange={(e) => onSortChange(e.target.value)} className={selectClass}>
          <option value="recent">Most Recent</option>
          <option value="trending">Most Funded</option>
          <option value="funded">Highest Progress</option>
          <option value="goal">Biggest Goals</option>
        </select>
      </div>
      <div>
        <label htmlFor="explore-category" className="block text-sm font-medium text-gray-300 mb-2">Category</label>
        <select id="explore-category" value={selectedCategory} onChange={(e) => onCategoryChange(e.target.value)} className={selectClass}>
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="explore-country" className="block text-sm font-medium text-gray-300 mb-2">Location</label>
        <select id="explore-country" value={selectedCountry} onChange={(e) => onCountryChange(e.target.value)} className={selectClass}>
          <option value="">All Countries</option>
          {countries.map((country) => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function ExplorePage() {
  const savedFilters = getStorage<ExploreFilters>(STORAGE_KEYS.exploreFilters, defaultFilters);

  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [filteredWishlists, setFilteredWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  const [searchTerm, setSearchTerm] = useState(savedFilters.searchTerm);
  const [debouncedSearch, setDebouncedSearch] = useState(savedFilters.searchTerm);
  const [selectedCountry, setSelectedCountry] = useState(savedFilters.selectedCountry);
  const [selectedCategory, setSelectedCategory] = useState(savedFilters.selectedCategory);
  const [sortBy, setSortBy] = useState(savedFilters.sortBy);
  const [showMap, setShowMap] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<{ id: string; slug: string; name: string; icon?: string; color?: string }[]>([]);
  const [favorites, setFavorites] = useState<string[]>(() =>
    getStorage<string[]>(STORAGE_KEYS.exploreFavorites, [])
  );

  useEffect(() => {
    loadWishlists();
    loadCategories();
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

  async function loadCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
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
        break;
    }

    setFilteredWishlists(filtered);
  }, [debouncedSearch, selectedCountry, selectedCategory, sortBy, wishlists]);

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
      const allWishlists = [...mockWishlists, ...dbWishlists];
      setUsingMockData(dbWishlists.length === 0);
      setWishlists(allWishlists);
      setFilteredWishlists(allWishlists);
    } catch (error) {
      console.error('Error loading wishlists:', error);
      setUsingMockData(true);
      setWishlists(mockWishlists);
      setFilteredWishlists(mockWishlists);
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

  const clearFilters = useCallback(() => {
    setSelectedCategory('');
    setSelectedCountry('');
    setSortBy('recent');
    setSearchTerm('');
  }, []);

  const hasActiveFilters = selectedCategory || selectedCountry || sortBy !== 'recent' || searchTerm;

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

  const recentlyViewed = getStorage<{ slug: string; title: string }[]>(STORAGE_KEYS.recentlyViewedWishlists, [])
    .filter((r) => r.slug !== featured.slug)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-charcoal-950 pt-16 pb-20 md:pb-8">
      {usingMockData && (
        <DemoBanner message="Showing sample projects — live database unavailable. Explore freely with demo data." />
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

              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-black/30 rounded-xl border border-white/10">
                <div className="text-center">
                  <p className="text-2xl font-black text-bitcoin-orange-500">500+</p>
                  <p className="text-xs text-gray-400 font-medium">Youth Served</p>
                </div>
                <div className="text-center border-x border-white/10">
                  <p className="text-2xl font-black text-emerald-500">65%</p>
                  <p className="text-xs text-gray-400 font-medium">Funded</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-neon-cyan-500">234</p>
                  <p className="text-xs text-gray-400 font-medium">Supporters</p>
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

        {recentlyViewed.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Recently viewed</h2>
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
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Explore All Projects</h1>
          <p className="text-gray-300 mb-6 text-base sm:text-lg">Discover amazing creators and support their dreams around the world</p>

          <div className="space-y-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} aria-hidden />
                <Input
                  placeholder="Search projects, creators, tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12"
                  aria-label="Search projects"
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
                  Filters
                  {hasActiveFilters && (
                    <span className="ml-2 w-2 h-2 rounded-full bg-neon-cyan-500" aria-label="Filters active" />
                  )}
                </Button>

                <Button
                  variant={showMap ? 'primary' : 'outline'}
                  onClick={() => setShowMap(!showMap)}
                  className="flex-1 sm:flex-none"
                  aria-pressed={showMap}
                >
                  <Globe size={20} className="mr-2" />
                  Map
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
                />
                {hasActiveFilters && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-300 hover:text-white">
                      Clear All Filters
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
                  aria-label="Close filters"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-charcoal-900 border-t border-white/10 rounded-t-[1.75rem] p-5 pb-safe animate-sheet-up max-h-[85dvh] overflow-y-auto">
                  <div className="flex justify-center mb-3">
                    <div className="w-10 h-1 rounded-full bg-white/20" aria-hidden />
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 id="filter-sheet-title" className="text-lg font-bold text-white">Filters</h2>
                    <button
                      type="button"
                      onClick={() => setShowFilters(false)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400"
                      aria-label="Close filters"
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
                  />
                  <div className="mt-6 flex gap-3">
                    {hasActiveFilters && (
                      <Button variant="outline" className="flex-1" onClick={clearFilters}>
                        Clear
                      </Button>
                    )}
                    <Button className="flex-1" onClick={() => setShowFilters(false)}>
                      Show {filteredWishlists.length} results
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {categories.length > 0 && !showFilters && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-gray-300 text-sm font-medium">Quick filters:</span>
                {categories.slice(0, 6).map((cat) => (
                  <CategoryBadge
                    key={cat.id}
                    name={cat.name}
                    icon={cat.icon}
                    color={cat.color}
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
                    Loading map…
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true" aria-label="Loading projects">
            {[...Array(9)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filteredWishlists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredWishlists.map((wishlist) => (
              <WishlistCard
                key={wishlist.id}
                wishlist={wishlist}
                isFavorite={favorites.includes(wishlist.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center" variant="glass">
            <Gift size={64} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              {debouncedSearch || selectedCountry ? 'No results found' : 'No projects yet'}
            </h3>
            <p className="text-gray-300">
              {debouncedSearch || selectedCountry ? 'Try adjusting your filters' : 'Check back soon!'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}