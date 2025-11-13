import { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Link } from '../components/Link';
import { BitcoinStats } from '../components/BitcoinStats';
import { FeeComparison } from '../components/FeeComparison';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import {
  Zap, Gift, ArrowRight, CheckCircle2, Sparkles, Star
} from 'lucide-react';

interface Wishlist {
  id: string;
  title: string;
  description: string;
  slug: string;
  cover_image: string | null;
  total_sats_goal: number;
  total_sats_raised: number;
  creator: {
    username: string;
    avatar_url: string | null;
  };
}

export function HomePage() {
  const { t } = useLanguage();
  const [featuredWishlists, setFeaturedWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedWishlists();
  }, []);

  async function loadFeaturedWishlists() {
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
          creator:profiles!wishlists_creator_id_fkey(username, avatar_url)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setFeaturedWishlists(data as unknown as Wishlist[]);
    } catch (error) {
      console.error('Error loading wishlists:', error);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-700 via-slate-600 to-slate-700 text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-32 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-full mb-8 backdrop-blur-sm">
            <Sparkles className="text-emerald-400" size={18} />
            <span className="text-sm font-medium text-emerald-300">
              Bitcoin Lightning • BOLT12 • Nostr
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="block text-white mb-2">
              Privacy-First Zero-Fee
            </span>
            <span className="block bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Bitcoin Commerce Platform
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-slate-200 max-w-3xl mx-auto mb-12 leading-relaxed">
            Decentralized marketplace powered by Lightning Network and Nostr. Create wishlists, receive gifts, and trade peer-to-peer with complete privacy.
            <br />
            <span className="text-emerald-400 font-semibold">Zero fees. Instant settlements. Self-sovereign.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="min-w-[260px] h-16 text-lg font-bold bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.5)] transition-all duration-300"
              >
                <Gift className="mr-2" size={24} />
                Create Your Wishlist
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            <Link href="/explore">
              <Button
                size="lg"
                variant="outline"
                className="min-w-[260px] h-16 text-lg font-bold border-2 border-slate-600 hover:border-emerald-500 hover:bg-emerald-500/10"
              >
                Explore Wishlists
              </Button>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-2">Instant</div>
              <div className="text-slate-400 text-sm">Lightning Fast</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-cyan-400 mb-2">Private</div>
              <div className="text-slate-400 text-sm">Your Data</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">Global</div>
              <div className="text-slate-400 text-sm">No Borders</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Clean 3 Steps */}
      <section className="py-32 bg-gradient-to-b from-slate-700 to-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Three simple steps to start giving and receiving gifts with Bitcoin
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="relative mx-auto w-64 h-64 mb-8 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-700 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent"></div>
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                    <Gift size={40} className="text-white" />
                  </div>
                  <div className="text-6xl font-black text-emerald-500/20">01</div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Create Your List</h3>
              <p className="text-slate-400 leading-relaxed">
                Add items you want, set a Bitcoin address, and customize your wishlist in minutes
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="relative mx-auto w-64 h-64 mb-8 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-700 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-transparent"></div>
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                    <Zap size={40} className="text-white" />
                  </div>
                  <div className="text-6xl font-black text-cyan-500/20">02</div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Share Instantly</h3>
              <p className="text-slate-400 leading-relaxed">
                Send via Lightning invoice, QR code, or link. Works with any Bitcoin wallet
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="relative mx-auto w-64 h-64 mb-8 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-700 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent"></div>
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                    <CheckCircle2 size={40} className="text-white" />
                  </div>
                  <div className="text-6xl font-black text-blue-500/20">03</div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Get Gifted</h3>
              <p className="text-slate-400 leading-relaxed">
                Receive Bitcoin donations directly to your wallet. Track progress in real-time
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700"
              >
                Get Started Now
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid - Clean & Centered */}
      <section className="py-32 bg-gradient-to-b from-slate-800 to-slate-700">
        <div className="max-w-6xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why KATOA?
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Everything you need for modern gift-giving with Bitcoin
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-700 rounded-2xl p-8 hover:border-emerald-500/50 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6">
                <Zap size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Lightning Fast</h3>
              <p className="text-slate-400 leading-relaxed">
                Instant Bitcoin donations via Lightning Network. Funds arrive in seconds, not days.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-700 rounded-2xl p-8 hover:border-cyan-500/50 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Private & Secure</h3>
              <p className="text-slate-400 leading-relaxed">
                BOLT12 offers and Nostr integration. Your data stays yours. No tracking or surveillance.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-700 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Truly Global</h3>
              <p className="text-slate-400 leading-relaxed">
                Support anyone, anywhere on Earth. No borders, no restrictions, no banks required.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-700 rounded-2xl p-8 hover:border-emerald-500/50 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6">
                <Gift size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Easy to Use</h3>
              <p className="text-slate-400 leading-relaxed">
                Create your wishlist in 60 seconds. No technical knowledge required. Works with any wallet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fee Comparison Calculator */}
      <section className="py-32 bg-gradient-to-b from-slate-700 to-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <FeeComparison />
        </div>
      </section>

      {/* Bitcoin Stats - Centered */}
      <section className="py-20 bg-slate-800">
        <div className="max-w-4xl mx-auto px-6">
          <BitcoinStats />
        </div>
      </section>

      {/* Featured Wishlists */}
      {!loading && featuredWishlists.length > 0 && (
        <section className="py-32 bg-gradient-to-b from-slate-700 to-slate-800">
          <div className="max-w-6xl mx-auto px-6">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Trending Wishlists
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                Discover popular gift lists from the community
              </p>
            </div>

            {/* Wishlists Grid */}
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {featuredWishlists.map((wishlist) => (
                <Link key={wishlist.id} href={`/wishlist/${wishlist.slug}`}>
                  <Card className="group hover:border-emerald-500/50 transition-all duration-300 hover:transform hover:scale-105 overflow-hidden bg-gradient-to-br from-slate-800 to-slate-700">
                    {wishlist.cover_image && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={wishlist.cover_image}
                          alt={wishlist.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-700 via-slate-900/50 to-transparent"></div>
                        <div className="absolute top-3 right-3 bg-slate-700/90 backdrop-blur-sm px-3 py-1 rounded-full border border-emerald-500/30">
                          <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1">
                            <Star size={12} className="fill-emerald-400" />
                            Trending
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                        {wishlist.title}
                      </h3>
                      <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                        {wishlist.description}
                      </p>
                      <div className="flex items-center justify-between text-sm mb-4">
                        <span className="text-slate-500">by @{wishlist.creator.username}</span>
                        <span className="text-emerald-400 font-semibold">
                          {formatSats(wishlist.total_sats_raised)}
                        </span>
                      </div>
                      {wishlist.total_sats_goal > 0 && (
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-cyan-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min((wishlist.total_sats_raised / wishlist.total_sats_goal) * 100, 100)}%`
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* View All CTA */}
            <div className="text-center mt-12">
              <Link href="/explore">
                <Button variant="outline" className="border-slate-600 hover:border-emerald-500">
                  View All Wishlists
                  <ArrowRight className="ml-2" size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Final CTA - Clean & Centered */}
      <section className="py-32 bg-gradient-to-b from-slate-800 to-slate-700">
        <div className="max-w-4xl mx-auto px-6 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-2xl mb-8 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.5)]">
            <Gift size={40} className="text-white" />
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to Start?
          </h2>

          {/* Description */}
          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands using Bitcoin Lightning for effortless gift-giving.
            <br />
            <span className="text-emerald-400 font-semibold">Create your wishlist in 60 seconds.</span>
          </p>

          {/* CTA Button */}
          <Link href="/dashboard">
            <Button
              size="lg"
              className="h-16 px-12 text-xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.5)]"
            >
              <Gift className="mr-3" size={28} />
              Create Your Wishlist Now
              <ArrowRight className="ml-3" size={24} />
            </Button>
          </Link>

          {/* Trust Badges */}
          <div className="mt-10 flex items-center justify-center gap-8 text-slate-400 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>Free Forever</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>No Credit Card</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>Instant Setup</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
