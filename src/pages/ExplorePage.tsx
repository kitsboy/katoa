import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Link } from '../components/Link';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { CategoryBadge } from '../components/CategoryBadge';
import { TrendingBadge } from '../components/TrendingBadge';
import { ProgressBar } from '../components/ProgressBar';
import { supabase } from '../lib/supabase';
import { mockWishlists } from '../data/mockWishlists';
import { Gift, Search, MapPin, Globe, SlidersHorizontal, Star, TrendingUp } from 'lucide-react';

interface Wishlist {
  id: string;
  title: string;
  description: string;
  slug: string;
  cover_image: string | null;
  total_sats_goal: number;
  total_sats_raised: number;
  country?: string;
  country_code?: string;
  country_flag?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
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
    let filtered = wishlists;

    if (searchTerm) {
      filtered = filtered.filter(
        (w) =>
          w.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.creator.username.toLowerCase().includes(searchTerm.toLowerCase())
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
        filtered.sort((a, b) => b.total_sats_raised - a.total_sats_raised);
        break;
      case 'funded':
        filtered.sort((a, b) => {
          const aProgress = a.total_sats_goal > 0 ? (a.total_sats_raised / a.total_sats_goal) : 0;
          const bProgress = b.total_sats_goal > 0 ? (b.total_sats_raised / b.total_sats_goal) : 0;
          return bProgress - aProgress;
        });
        break;
      case 'goal':
        filtered.sort((a, b) => b.total_sats_goal - a.total_sats_goal);
        break;
      default:
        break;
    }

    setFilteredWishlists(filtered);
  }, [searchTerm, selectedCountry, wishlists]);

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
          creator:profiles!wishlists_creator_id_fkey(username, avatar_url)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const dbWishlists = (data as unknown as Wishlist[]) || [];
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

  function formatSats(sats: number): string {
    if (sats >= 100000000) {
      return `${(sats / 100000000).toFixed(2)} BTC`;
    }
    return `${(sats / 1000).toFixed(0)}k sats`;
  }

  const countries = Array.from(new Set(wishlists.map((w) => w.country).filter(Boolean))).sort();

  const wishlistsWithLocation = filteredWishlists.filter(
    (w) => w.latitude && w.longitude
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-700 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">

        {/* Hero Featured Wishlist */}
        <Card className="mb-8 overflow-hidden bg-gradient-to-br from-slate-800 to-slate-700 border-slate-700 animate-slide-up">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative h-64 md:h-auto overflow-hidden">
              <img
                src="https://images.pexels.com/photos/5793678/pexels-photo-5793678.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Skateboard Park Colombia"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-transparent" />
              <div className="absolute top-4 left-4">
                <TrendingBadge type="featured" />
              </div>
            </div>
            <div className="p-8 flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-white mb-3">
                Skateboard Park for Medellín Youth
              </h2>
              <p className="text-slate-300 mb-4 leading-relaxed">
                Help us build a safe community space where kids can skate, learn, and grow together.
                This project will provide free skateboarding lessons and mentorship to 500+ youth in Medellín, Colombia.
              </p>
              <ProgressBar
                current={3250000}
                goal={5000000}
                showPercentage={true}
                showValues={true}
                gradient="from-emerald-500 to-cyan-600"
                height="md"
                animated={true}
              />
              <div className="flex items-center gap-4 mt-6">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700"
                  onClick={() => window.location.hash = '/wishlist/medellin-skate-park'}
                >
                  Support This Project
                </Button>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <MapPin size={16} />
                  <span>Medellín, Colombia 🇨🇴</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Explore All Wishlists</h1>
          <p className="text-gray-400 mb-6">Discover amazing creators and support their dreams around the world</p>

          <div className="space-y-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500" size={20} />
                <Input
                  placeholder="Search wishlists, creators, tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 bg-slate-800 border-slate-700 focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant={showFilters ? 'default' : 'outline'}
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-slate-700"
                >
                  <SlidersHorizontal size={20} className="mr-2" />
                  Filters
                </Button>

                <Button
                  variant={showMap ? 'default' : 'outline'}
                  onClick={() => setShowMap(!showMap)}
                  className="border-slate-700"
                >
                  <Globe size={20} className="mr-2" />
                  Map
                </Button>
              </div>
            </div>

            {showFilters && (
              <Card className="p-4 bg-slate-800/50 border-slate-700 animate-slide-up">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="trending">Most Funded</option>
                      <option value="funded">Highest Progress</option>
                      <option value="goal">Biggest Goals</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.slug}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                    <select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">All Countries</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {(selectedCategory || selectedCountry || sortBy !== 'recent') && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedCategory('');
                        setSelectedCountry('');
                        setSortBy('recent');
                      }}
                      className="text-slate-400 hover:text-white"
                    >
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </Card>
            )}

            {categories.length > 0 && !showFilters && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-400 text-sm">Quick filters:</span>
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

          {showMap && wishlistsWithLocation.length > 0 && (
            <Card className="mb-8 p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <MapPin size={24} className="text-orange-500" />
                Wishlists Around the World
              </h2>
              <div className="bg-slate-700 rounded-lg p-8 min-h-[400px] relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <svg viewBox="0 0 1000 500" className="w-full h-full">
                    <rect width="1000" height="500" fill="#1a1a1a" />
                    <path
                      d="M 150,150 L 200,120 L 280,140 L 320,130 L 360,150 L 400,140 L 450,160 L 500,150 L 550,140 L 600,160 L 650,150 L 700,140 L 750,160 L 800,150 L 850,140"
                      stroke="#333"
                      strokeWidth="1"
                      fill="none"
                    />
                  </svg>
                </div>

                <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4">
                  {wishlistsWithLocation.map((wishlist) => (
                    <div
                      key={wishlist.id}
                      className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-lg p-4 hover:bg-gray-700/80 transition-all cursor-pointer"
                      onClick={() => (window.location.hash = `/wishlist/${wishlist.slug}`)}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <MapPin size={16} className="text-orange-500 flex-shrink-0 mt-1" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-semibold line-clamp-2">
                            {wishlist.title}
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            {wishlist.city}, {wishlist.country}
                          </p>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden mt-3">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
                          style={{
                            width: `${Math.min((wishlist.total_sats_raised / wishlist.total_sats_goal) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-800" />
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-800 rounded" />
                  <div className="h-4 bg-gray-800 rounded w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredWishlists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWishlists.map((wishlist) => {
              const progress = wishlist.total_sats_goal > 0
                ? (wishlist.total_sats_raised / wishlist.total_sats_goal) * 100
                : 0;

              const isTrending = wishlist.total_sats_raised > 50000;
              const isNew = new Date(wishlist.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;

              return (
                <Link key={wishlist.id} href={`/wishlist/${wishlist.slug}`}>
                  <Card className="hover-lift overflow-hidden bg-gradient-to-br from-slate-800 to-slate-700 border-slate-700 animate-fade-in">
                    <div className="relative overflow-hidden group">
                      {wishlist.cover_image ? (
                        <img
                          src={wishlist.cover_image}
                          alt={wishlist.title}
                          className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-56 bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                          <Gift size={80} className="text-emerald-500/40 animate-float" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>

                      {wishlist.country_flag && (
                        <div className="absolute top-3 right-3 text-3xl drop-shadow-lg">
                          {wishlist.country_flag}
                        </div>
                      )}

                      <div className="absolute top-3 left-3">
                        {isTrending && <TrendingBadge type="trending" />}
                        {isNew && !isTrending && <TrendingBadge type="new" />}
                      </div>

                      {progress >= 100 && (
                        <div className="absolute bottom-3 left-3">
                          <div className="px-3 py-1 bg-emerald-500 rounded-full text-white text-xs font-bold flex items-center gap-1">
                            <Star size={12} className="fill-white" />
                            Fully Funded
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-emerald-400 transition-colors">
                          {wishlist.title}
                        </h3>
                        <p className="text-slate-400 text-sm line-clamp-2 mb-3 leading-relaxed">
                          {wishlist.description}
                        </p>
                        {wishlist.country && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <MapPin size={12} />
                            <span>{wishlist.city ? `${wishlist.city}, ` : ''}{wishlist.country}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                          {wishlist.creator.username[0].toUpperCase()}
                        </div>
                        <div>
                          <span className="text-sm text-white font-medium block">
                            {wishlist.creator.username}
                          </span>
                          <span className="text-xs text-slate-500">Creator</span>
                        </div>
                      </div>

                      {wishlist.total_sats_goal > 0 && (
                        <ProgressBar
                          current={wishlist.total_sats_raised}
                          goal={wishlist.total_sats_goal}
                          showPercentage={true}
                          showValues={false}
                          height="md"
                          animated={true}
                        />
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
              {searchTerm || selectedCountry ? 'No results found' : 'No wishlists yet'}
            </h3>
            <p className="text-gray-400">
              {searchTerm || selectedCountry ? 'Try adjusting your filters' : 'Check back soon!'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
