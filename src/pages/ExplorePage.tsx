import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Link } from '../components/Link';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';
import { mockWishlists } from '../data/mockWishlists';
import { Gift, Search, MapPin, Globe } from 'lucide-react';

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
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    loadWishlists();
  }, []);

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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Explore Wishlists</h1>
          <p className="text-gray-400 mb-6">Discover amazing creators and support their dreams around the world</p>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
              <Input
                placeholder="Search wishlists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">All Countries</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>

              <Button
                variant={showMap ? 'default' : 'outline'}
                onClick={() => setShowMap(!showMap)}
              >
                <Globe size={20} className="mr-2" />
                {showMap ? 'Hide' : 'Show'} Map
              </Button>
            </div>
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

              return (
                <Link key={wishlist.id} href={`/wishlist/${wishlist.slug}`}>
                  <Card hover>
                    <div className="relative">
                      {wishlist.cover_image ? (
                        <img
                          src={wishlist.cover_image}
                          alt={wishlist.title}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                          <Gift size={64} className="text-orange-500/50" />
                        </div>
                      )}
                      {wishlist.country_flag && (
                        <div className="absolute top-3 right-3 text-4xl drop-shadow-lg">
                          {wishlist.country_flag}
                        </div>
                      )}
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">
                          {wishlist.title}
                        </h3>
                        <p className="text-gray-400 text-sm line-clamp-2 mb-2">
                          {wishlist.description}
                        </p>
                        {wishlist.country && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin size={12} />
                            <span>{wishlist.city ? `${wishlist.city}, ` : ''}{wishlist.country}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {wishlist.creator.username[0].toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-300">
                          {wishlist.creator.username}
                        </span>
                      </div>

                      {wishlist.total_sats_goal > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">
                              {formatSats(wishlist.total_sats_raised)} raised
                            </span>
                            <span className="text-orange-500 font-medium">
                              {progress.toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
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
