import { useEffect, useState, useMemo } from 'react';
import { Card } from '../components/Card';
import { Link } from '../components/Link';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { CategoryBadge } from '../components/CategoryBadge';
import { TrendingBadge } from '../components/TrendingBadge';
import { ProgressBar } from '../components/ProgressBar';
import { MediaCard } from '../components/MediaCard';
import { BTCMapSection } from '../components/BTCMapSection';
import { SatsDisplay } from '../components/SatsDisplay';
import { supabase } from '../lib/supabase';
import { mockWishlists } from '../data/mockWishlists';
import { mergeKatoaPinsWithMap } from '../lib/btcmap';
import { Gift, Search, MapPin, Globe, SlidersHorizontal, Star } from 'lucide-react';

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

export function ExplorePage() {
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [filteredWishlists, setFilteredWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [showMap, setShowMap] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    loadWishlists();
    loadCategories();
  }, []);

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

    if (searchTerm) {
      filtered = filtered.filter(
        (w) =>
          w.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.creator?.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCountry) {
      filtered = filtered.filter((w) => w.country === selectedCountry);
    }

    if (selectedCategory) {
      filtered = filtered.filter((w) => (w as any).category === selectedCategory);
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
  }, [searchTerm, selectedCountry, selectedCategory, sortBy, wishlists]);

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

      const dbWishlists = ((data || []) as unknown as Wishlist[]).filter(w => w.creator && w.creator.username);
      const allWishlists = [...mockWishlists, ...dbWishlists];

      setWishlists(allWishlists);
      setFilteredWishlists(allWishlists);
    } catch (error) {
      console.error('Error loading wishlists:', error);
      setWishlists(mockWishlists);
      setFilteredWishlists(mockWishlists);
    } finally {
      setLoading(false);
    }
  }

  const countries = Array.from(new Set(wishlists.map((w) => w.country).filter(Boolean) as string[])).sort();

  const wishlistsWithLocation = filteredWishlists.filter(
    (w) => w.latitude && w.longitude
  );

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-charcoal-950 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-20 sm:pt-24">

        {/* Hero Featured Project */}
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
            <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-center bg-gradient-to-br from-charcoal-900 to-charcoal-950">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full flex items-center justify-center">
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

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-black/30 rounded-xl border border-gray-700">
                <div className="text-center">
                  <p className="text-2xl font-black text-orange-500">500+</p>
                  <p className="text-xs text-gray-400 font-medium">Youth Served</p>
                </div>
                <div className="text-center border-x border-gray-700">
                  <p className="text-2xl font-black text-emerald-500">65%</p>
                  <p className="text-xs text-gray-400 font-medium">Funded</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-cyan-500">234</p>
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
                  <Button
                    size="lg"
                    variant="bitcoin"
                    className="w-full font-bold"
                  >
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

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Explore All Projects</h1>
          <p className="text-gray-100 mb-6 text-lg">Discover amazing creators and support their dreams around the world</p>

          <div className="space-y-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Search projects, creators, tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 bg-gray-900 border-gray-700 text-white focus:border-orange-500 placeholder:text-gray-400"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant={showFilters ? 'primary' : 'outline'}
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-gray-700 bg-gray-900 text-white hover:bg-gray-800"
                >
                  <SlidersHorizontal size={20} className="mr-2" />
                  Filters
                </Button>

                <Button
                  variant={showMap ? 'primary' : 'outline'}
                  onClick={() => setShowMap(!showMap)}
                  className="border-gray-700 bg-gray-900 text-white hover:bg-gray-800"
                >
                  <Globe size={20} className="mr-2" />
                  Map
                </Button>
              </div>
            </div>

            {showFilters && (
              <Card className="p-4 bg-gray-900 border-gray-700 animate-slide-up">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="trending">Most Funded</option>
                      <option value="funded">Highest Progress</option>
                      <option value="goal">Biggest Goals</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.slug}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Location</label>
                    <select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">All Countries</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {(selectedCategory || selectedCountry || sortBy !== 'recent') && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedCategory('');
                        setSelectedCountry('');
                        setSortBy('recent');
                      }}
                      className="text-gray-300 hover:text-white"
                    >
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </Card>
            )}

            {categories.length > 0 && !showFilters && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-gray-200 text-sm font-medium">Quick filters:</span>
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
            <Card className="mb-8 p-4 sm:p-6" variant="glass">
              <BTCMapSection mapCenter={mapCenter} pins={katoaMapPins} />

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <Card key={i} className="animate-pulse bg-gray-900 border-gray-800">
                <div className="h-48 bg-gray-800" />
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-800 rounded" />
                  <div className="h-4 bg-gray-800 rounded w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredWishlists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredWishlists.map((wishlist) => {
              const progress = wishlist.total_sats_goal > 0
                ? (wishlist.total_sats_raised / wishlist.total_sats_goal) * 100
                : 0;

              const isTrending = wishlist.total_sats_raised > 50000;
              const isNew = wishlist.created_at ? new Date(wishlist.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 : false;
              const w = wishlist as Wishlist & { country_flag?: string };

              return (
                <Link key={wishlist.id} href={`/wishlist/${wishlist.slug}`} className="group">
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
                        w.country_flag ? (
                          <span className="text-2xl drop-shadow-lg">{w.country_flag}</span>
                        ) : undefined
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
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Gift size={64} className="text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              {searchTerm || selectedCountry ? 'No results found' : 'No projects yet'}
            </h3>
            <p className="text-gray-200">
              {searchTerm || selectedCountry ? 'Try adjusting your filters' : 'Check back soon!'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
