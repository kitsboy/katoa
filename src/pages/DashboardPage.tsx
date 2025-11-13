import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Link } from '../components/Link';
import { StatsCard } from '../components/StatsCard';
import { ProgressBar } from '../components/ProgressBar';
import { supabase } from '../lib/supabase';
import { nostrService } from '../lib/nostr';
import { parseProductUrl, isValidUrl } from '../lib/productParser';
import { getBitcoinPrice, usdToSats, formatSats as formatSatsUtil, formatUsd } from '../lib/bitcoinPrice';
import { Plus, Edit, Trash2, ExternalLink, Settings, Gift, DollarSign, Users, Share2, RefreshCw, Wallet, TrendingUp, Zap, Target, Heart, UserPlus } from 'lucide-react';

interface Wishlist {
  id: string;
  title: string;
  description: string;
  slug: string;
  total_sats_raised: number;
  total_sats_goal: number;
  is_public: boolean;
  created_at: string;
}

interface WishlistItem {
  id: string;
  title: string;
  description: string;
  price_sats: number;
  sats_raised: number;
  is_funded: boolean;
}

export function DashboardPage() {
  const { user, profile, syncNostrProfile } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [publishingWishlist, setPublishingWishlist] = useState<string | null>(null);
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [selectedWishlist, setSelectedWishlist] = useState<Wishlist | null>(null);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    slug: '',
    total_sats_goal: '',
    wallet_address_id: '',
  });
  const [walletAddresses, setWalletAddresses] = useState<any[]>([]);
  const [itemFormData, setItemFormData] = useState({
    title: '',
    description: '',
    price_sats: '',
    image_url: '',
    product_url: '',
    merchant_link: '',
  });
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState({
    totalRaised: 0,
    totalWishlists: 0,
    totalSupporters: 0,
  });
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [parsingUrl, setParsingUrl] = useState(false);
  const [following, setFollowing] = useState<any[]>([]);
  const [loadingFollowing, setLoadingFollowing] = useState(false);

  useEffect(() => {
    if (user) {
      loadWishlists();
      loadStats();
      loadWalletAddresses();
      loadFollowing();
    }
  }, [user]);

  async function loadWalletAddresses() {
    try {
      const { data, error } = await supabase
        .from('wallet_addresses')
        .select('*')
        .eq('user_id', user!.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWalletAddresses(data || []);
    } catch (error) {
      console.error('Error loading wallet addresses:', error);
    }
  }

  async function loadWishlists() {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('*')
        .eq('creator_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWishlists(data || []);
    } catch (error) {
      console.error('Error loading wishlists:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const { data: wishlistData } = await supabase
        .from('wishlists')
        .select('total_sats_raised')
        .eq('creator_id', user!.id);

      const totalRaised = wishlistData?.reduce((sum, w) => sum + w.total_sats_raised, 0) || 0;

      const { count: supportersCount } = await supabase
        .from('transactions')
        .select('contributor_name', { count: 'exact', head: true })
        .in('wishlist_id', wishlistData?.map(w => w.id) || []);

      setStats({
        totalRaised,
        totalWishlists: wishlistData?.length || 0,
        totalSupporters: supportersCount || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  async function handleCreateWishlist(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);

    try {
      const { error } = await supabase.from('wishlists').insert({
        creator_id: user!.id,
        title: formData.title,
        description: formData.description,
        slug: formData.slug,
        total_sats_goal: parseInt(formData.total_sats_goal) || 0,
        wallet_address_id: formData.wallet_address_id || null,
      });

      if (error) throw error;

      await loadWishlists();
      setShowCreateModal(false);
      setFormData({ title: '', description: '', slug: '', total_sats_goal: '', wallet_address_id: '' });
    } catch (error) {
      console.error('Error creating wishlist:', error);
    } finally {
      setProcessing(false);
    }
  }

  async function handleSyncNostrProfile() {
    setSyncing(true);
    try {
      const result = await syncNostrProfile();
      if (result.error) throw result.error;
      alert('Profile synced successfully from Nostr!');
    } catch (error) {
      console.error('Error syncing profile:', error);
      alert('Failed to sync profile. Make sure you have a Nostr extension installed.');
    } finally {
      setSyncing(false);
    }
  }

  async function handlePublishToNostr(wishlist: Wishlist) {
    setPublishingWishlist(wishlist.id);
    try {
      const itemsData = await supabase
        .from('wishlist_items')
        .select('title, description, price_sats')
        .eq('wishlist_id', wishlist.id)
        .order('sort_order');

      const eventId = await nostrService.publishWishlist({
        title: wishlist.title,
        description: wishlist.description,
        slug: wishlist.slug,
        items: itemsData.data || [],
      });

      if (!eventId) throw new Error('Failed to publish');

      alert('Wishlist published to Nostr relays successfully!');
    } catch (error) {
      console.error('Error publishing to Nostr:', error);
      alert('Failed to publish. Make sure you have a Nostr extension installed.');
    } finally {
      setPublishingWishlist(null);
    }
  }

  async function handleDeleteWishlist(id: string) {
    if (!confirm('Are you sure you want to delete this wishlist?')) return;

    try {
      const { error } = await supabase.from('wishlists').delete().eq('id', id);
      if (error) throw error;
      await loadWishlists();
    } catch (error) {
      console.error('Error deleting wishlist:', error);
    }
  }

  async function loadItems(wishlistId: string) {
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('wishlist_id', wishlistId)
        .order('sort_order');

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);

    try {
      const { error } = await supabase.from('wishlist_items').insert({
        wishlist_id: selectedWishlist!.id,
        title: itemFormData.title,
        description: itemFormData.description,
        price_sats: parseInt(itemFormData.price_sats),
        image_url: itemFormData.image_url || null,
        product_url: itemFormData.product_url || null,
        merchant_link: itemFormData.merchant_link || null,
      });

      if (error) throw error;

      await loadItems(selectedWishlist!.id);
      setItemFormData({ title: '', description: '', price_sats: '', image_url: '', product_url: '', merchant_link: '' });
    } catch (error) {
      console.error('Error adding item:', error);
    } finally {
      setProcessing(false);
    }
  }

  async function handleDeleteItem(itemId: string) {
    try {
      const { error } = await supabase.from('wishlist_items').delete().eq('id', itemId);
      if (error) throw error;
      await loadItems(selectedWishlist!.id);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  }

  async function handleEditWishlist(wishlist: Wishlist) {
    setSelectedWishlist(wishlist);
    setFormData({
      title: wishlist.title,
      description: wishlist.description,
      slug: wishlist.slug,
      total_sats_goal: wishlist.total_sats_goal.toString(),
      wallet_address_id: '',
    });
    setShowEditModal(true);
  }

  async function handleUpdateWishlist(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedWishlist) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('wishlists')
        .update({
          title: formData.title,
          description: formData.description,
          slug: formData.slug,
          total_sats_goal: parseInt(formData.total_sats_goal) || 0,
        })
        .eq('id', selectedWishlist.id);

      if (error) throw error;

      setShowEditModal(false);
      await loadWishlists();
      setFormData({ title: '', description: '', slug: '', total_sats_goal: '', wallet_address_id: '' });
    } catch (error) {
      console.error('Error updating wishlist:', error);
      alert('Failed to update wishlist');
    } finally {
      setProcessing(false);
    }
  }

  async function handleEditItem(item: WishlistItem) {
    setEditingItem(item);
    setItemFormData({
      title: item.title,
      description: item.description,
      price_sats: item.price_sats.toString(),
      image_url: (item as any).image_url || '',
      product_url: (item as any).product_url || '',
      merchant_link: (item as any).merchant_link || '',
    });
  }

  async function handleUpdateItem(e: React.FormEvent) {
    e.preventDefault();
    if (!editingItem) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .update({
          title: itemFormData.title,
          description: itemFormData.description,
          price_sats: parseInt(itemFormData.price_sats),
          image_url: itemFormData.image_url || null,
          product_url: itemFormData.product_url || null,
          merchant_link: itemFormData.merchant_link || null,
        })
        .eq('id', editingItem.id);

      if (error) throw error;

      await loadItems(selectedWishlist!.id);
      setEditingItem(null);
      setItemFormData({ title: '', description: '', price_sats: '', image_url: '', product_url: '', merchant_link: '' });
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item');
    } finally {
      setProcessing(false);
    }
  }

  async function handleParseUrl() {
    if (!urlInput || !isValidUrl(urlInput)) {
      alert('Please enter a valid URL');
      return;
    }

    setParsingUrl(true);
    try {
      const product = await parseProductUrl(urlInput);
      if (product) {
        setItemFormData({
          title: product.title || '',
          description: product.description || '',
          price_sats: product.price_sats?.toString() || '',
          image_url: product.image_url || '',
          product_url: product.product_url || '',
          merchant_link: product.product_url || '',
        });
        setUrlInput('');
        alert('Product info extracted! Review and save.');
      } else {
        alert('Could not extract product information from this URL');
      }
    } catch (error) {
      console.error('Error parsing URL:', error);
      alert('Failed to parse URL');
    } finally {
      setParsingUrl(false);
    }
  }

  async function loadFollowing() {
    if (!user) return;

    setLoadingFollowing(true);
    try {
      const { data: profileFollows, error: profileError } = await supabase
        .from('follows')
        .select(`
          following_id,
          profiles:following_id (
            id,
            username,
            avatar_url,
            bio
          )
        `)
        .eq('follower_id', user.id);

      if (profileError) throw profileError;

      const { data: wishlistFollows, error: wishlistError } = await supabase
        .from('wishlist_follows')
        .select(`
          wishlist_id,
          wishlists:wishlist_id (
            id,
            title,
            description,
            slug,
            total_sats_raised,
            total_sats_goal,
            profiles:creator_id (
              username,
              avatar_url
            )
          )
        `)
        .eq('user_id', user.id);

      if (wishlistError) throw wishlistError;

      const combined = [
        ...(profileFollows || []).map(f => ({ type: 'profile', data: f.profiles })),
        ...(wishlistFollows || []).map(f => ({ type: 'wishlist', data: f.wishlists }))
      ];

      setFollowing(combined);
    } catch (error) {
      console.error('Error loading following:', error);
    } finally {
      setLoadingFollowing(false);
    }
  }

  function formatSats(sats: number): string {
    return new Intl.NumberFormat().format(sats);
  }

  if (!user) {
    window.location.href = '/auth';
    return (
      <div className="min-h-screen bg-slate-700 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md bg-slate-600 border-slate-700">
          <Gift size={64} className="text-slate-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Redirecting to sign in...</h2>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-700 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-400">
              Welcome back, {profile?.username}
              {profile?.nostr_pubkey && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                  </svg>
                  Nostr Connected
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            {profile?.nostr_pubkey && (
              <Button variant="outline" size="sm" onClick={handleSyncNostrProfile} loading={syncing}>
                <RefreshCw size={18} className="mr-2" />
                Sync Nostr Profile
              </Button>
            )}
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus size={20} className="mr-2" />
              Create Wishlist
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Raised"
            value={formatSats(stats.totalRaised)}
            subtitle="sats"
            icon={DollarSign}
            gradient="from-emerald-500 to-cyan-600"
            trend={{ value: 12, isPositive: true }}
            delay={0}
          />

          <StatsCard
            title="Wishlists"
            value={stats.totalWishlists}
            subtitle="active"
            icon={Gift}
            gradient="from-orange-500 to-amber-500"
            delay={100}
          />

          <StatsCard
            title="Supporters"
            value={stats.totalSupporters}
            subtitle="contributors"
            icon={Users}
            gradient="from-blue-500 to-indigo-600"
            delay={200}
          />

          <StatsCard
            title="Avg. Contribution"
            value={stats.totalSupporters > 0 ? formatSats(Math.floor(stats.totalRaised / stats.totalSupporters)) : '0'}
            subtitle="sats"
            icon={TrendingUp}
            gradient="from-pink-500 to-rose-600"
            delay={300}
          />
        </div>

        {following.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Heart className="text-red-500" size={24} />
              Following
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {following.map((item, idx) => (
                <Card key={idx} className="p-4 hover-lift bg-gradient-to-br from-slate-800 to-slate-700 border-slate-700">
                  {item.type === 'profile' ? (
                    <Link href={`/profile/${item.data.username}`} className="block">
                      <div className="flex items-center gap-3">
                        {item.data.avatar_url ? (
                          <img
                            src={item.data.avatar_url}
                            alt={item.data.username}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                            <UserPlus className="text-orange-500" size={20} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{item.data.username}</p>
                          {item.data.bio && (
                            <p className="text-gray-400 text-sm truncate">{item.data.bio}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <Link href={`/wishlist/${item.data.slug}`} className="block">
                      <div className="flex items-center gap-3 mb-2">
                        {item.data.profiles?.avatar_url ? (
                          <img
                            src={item.data.profiles.avatar_url}
                            alt={item.data.profiles.username}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                            <Gift className="text-orange-500" size={14} />
                          </div>
                        )}
                        <p className="text-xs text-gray-400">{item.data.profiles?.username}</p>
                      </div>
                      <h3 className="text-white font-medium mb-2 line-clamp-2">{item.data.title}</h3>
                      {item.data.total_sats_goal > 0 && (
                        <ProgressBar
                          current={item.data.total_sats_raised}
                          goal={item.data.total_sats_goal}
                          showPercentage={true}
                          gradient="from-emerald-500 to-cyan-600"
                          height="sm"
                        />
                      )}
                    </Link>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Your Wishlists</h2>

          {loading ? (
            <div className="grid grid-cols-1 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-6 bg-gray-800 rounded w-1/3 mb-4" />
                  <div className="h-4 bg-gray-800 rounded w-2/3" />
                </Card>
              ))}
            </div>
          ) : wishlists.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {wishlists.map((wishlist) => {
                const progress = wishlist.total_sats_goal > 0
                  ? (wishlist.total_sats_raised / wishlist.total_sats_goal) * 100
                  : 0;

                return (
                  <Card key={wishlist.id} className="p-6 hover-lift bg-gradient-to-br from-slate-800 to-slate-700 border-slate-700 animate-slide-up">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                              {wishlist.title}
                              {progress >= 100 && (
                                <span className="text-xl">🎉</span>
                              )}
                            </h3>
                            <p className="text-slate-400 leading-relaxed">{wishlist.description}</p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                              wishlist.is_public
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-700 text-slate-400 border border-slate-600'
                            }`}>
                              {wishlist.is_public ? '👁️ Public' : '🔒 Private'}
                            </span>
                            {progress >= 100 && (
                              <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                ✨ Funded
                              </span>
                            )}
                          </div>
                        </div>

                        {wishlist.total_sats_goal > 0 && (
                          <ProgressBar
                            current={wishlist.total_sats_raised}
                            goal={wishlist.total_sats_goal}
                            showPercentage={true}
                            showValues={true}
                            gradient="from-emerald-500 to-cyan-600"
                            height="md"
                            animated={true}
                          />
                        )}
                      </div>

                      <div className="flex md:flex-col gap-2">
                        <Link href={`/wishlist/${wishlist.slug}`} className="flex-1 md:flex-none">
                          <Button variant="outline" size="sm" className="w-full">
                            <ExternalLink size={16} />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditWishlist(wishlist)}
                          className="flex-1 md:flex-none text-blue-400 hover:text-blue-300"
                          title="Edit Wishlist"
                        >
                          <Edit size={16} />
                        </Button>
                        {profile?.nostr_pubkey && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePublishToNostr(wishlist)}
                            loading={publishingWishlist === wishlist.id}
                            className="flex-1 md:flex-none text-purple-400 hover:text-purple-300"
                            title="Publish to Nostr"
                          >
                            <Share2 size={16} />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedWishlist(wishlist);
                            loadItems(wishlist.id);
                            setShowItemsModal(true);
                          }}
                          className="flex-1 md:flex-none"
                        >
                          <Settings size={16} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteWishlist(wishlist.id)}
                          className="flex-1 md:flex-none text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Gift size={64} className="text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No wishlists yet</h3>
              <p className="text-gray-400 mb-6">Create your first wishlist to get started!</p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus size={20} className="mr-2" />
                Create Wishlist
              </Button>
            </Card>
          )}
        </div>
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Wishlist"
      >
        <form onSubmit={handleCreateWishlist} className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>
          <Input
            label="URL Slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
            placeholder="my-wishlist"
            required
          />
          <Input
            label="Funding Goal (sats, optional)"
            type="number"
            value={formData.total_sats_goal}
            onChange={(e) => setFormData({ ...formData, total_sats_goal: e.target.value })}
            placeholder="1000000"
          />

          {walletAddresses.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Wallet size={16} className="inline mr-2" />
                Payment Address (Optional)
              </label>
              <select
                value={formData.wallet_address_id}
                onChange={(e) => setFormData({ ...formData, wallet_address_id: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select a wallet address...</option>
                {walletAddresses.map((addr) => (
                  <option key={addr.id} value={addr.id}>
                    {addr.label || addr.address_type.toUpperCase()} - {addr.address_value.slice(0, 30)}...
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose which wallet address will receive payments for this wishlist
              </p>
            </div>
          )}
          <Button type="submit" className="w-full" loading={processing}>
            Create Wishlist
          </Button>
        </form>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedWishlist(null);
          setFormData({ title: '', description: '', slug: '', total_sats_goal: '', wallet_address_id: '' });
        }}
        title="Edit Wishlist"
      >
        <form onSubmit={handleUpdateWishlist} className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>
          <Input
            label="URL Slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
            placeholder="my-wishlist"
            required
          />
          <Input
            label="Funding Goal (sats, optional)"
            type="number"
            value={formData.total_sats_goal}
            onChange={(e) => setFormData({ ...formData, total_sats_goal: e.target.value })}
            placeholder="1000000"
          />
          <Button type="submit" className="w-full" loading={processing}>
            Update Wishlist
          </Button>
        </form>
      </Modal>

      <Modal
        isOpen={showItemsModal}
        onClose={() => setShowItemsModal(false)}
        title={`Manage Items - ${selectedWishlist?.title}`}
        size="xl"
      >
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
            <h3 className="text-lg font-bold text-white mb-3">Quick Add from URL</h3>
            <p className="text-sm text-gray-400 mb-4">Paste a product URL to automatically extract info</p>
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://amazon.com/product/..."
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button onClick={handleParseUrl} loading={parsingUrl} variant="outline">
                <Zap size={18} className="mr-2" />
                Extract
              </Button>
            </div>
          </div>

          <form onSubmit={editingItem ? handleUpdateItem : handleAddItem} className="space-y-4 p-6 bg-gray-800/50 rounded-lg">
            <h3 className="text-lg font-bold text-white">{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Title"
                value={itemFormData.title}
                onChange={(e) => setItemFormData({ ...itemFormData, title: e.target.value })}
                required
              />
              <Input
                label="Price (sats)"
                type="number"
                value={itemFormData.price_sats}
                onChange={(e) => setItemFormData({ ...itemFormData, price_sats: e.target.value })}
                required
              />
            </div>
            <Input
              label="Description"
              value={itemFormData.description}
              onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
            />
            <Input
              label="Product URL"
              value={itemFormData.product_url}
              onChange={(e) => setItemFormData({ ...itemFormData, product_url: e.target.value })}
              placeholder="https://amazon.com/product/..."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Image URL (optional)"
                value={itemFormData.image_url}
                onChange={(e) => setItemFormData({ ...itemFormData, image_url: e.target.value })}
              />
              <Input
                label="Merchant Link (optional)"
                value={itemFormData.merchant_link}
                onChange={(e) => setItemFormData({ ...itemFormData, merchant_link: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" loading={processing} className="flex-1">
                {editingItem ? (
                  <>
                    <Edit size={18} className="mr-2" />
                    Update Item
                  </>
                ) : (
                  <>
                    <Plus size={18} className="mr-2" />
                    Add Item
                  </>
                )}
              </Button>
              {editingItem && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingItem(null);
                    setItemFormData({ title: '', description: '', price_sats: '', image_url: '', product_url: '', merchant_link: '' });
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>

          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white">Current Items</h3>
            {items.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No items yet</p>
            ) : (
              items.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">{item.title}</h4>
                      <p className="text-sm text-gray-400">
                        {formatSats(item.sats_raised)} / {formatSats(item.price_sats)} sats
                        {item.is_funded && <span className="ml-2 text-green-400">Funded</span>}
                      </p>
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditItem(item)}
                        className="text-blue-400"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-400"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
