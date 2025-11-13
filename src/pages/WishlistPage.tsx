import { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { ShareButton } from '../components/ShareButton';
import { QRCodeModal } from '../components/QRCodeModal';
import { WishlistItemsList } from '../components/WishlistItemsList';
import { supabase } from '../lib/supabase';
import { nostrService } from '../lib/nostr';
import { mockWishlists, mockWishlistItems } from '../data/mockWishlists';
import { Gift, ExternalLink, Zap, Bitcoin, Check, Copy, MapPin, QrCode, ArrowLeft, Camera, Upload, Heart, TrendingUp, Package } from 'lucide-react';

interface WishlistItem {
  id: string;
  title: string;
  description: string;
  price_sats: number;
  sats_raised: number;
  image_url: string | null;
  merchant_link: string | null;
  is_funded: boolean;
}

interface Wishlist {
  id: string;
  title: string;
  description: string;
  full_story?: string;
  slug: string;
  theme_color?: string;
  cover_image: string | null;
  total_sats_goal: number;
  total_sats_raised: number;
  country?: string;
  country_code?: string;
  country_flag?: string;
  city?: string;
  creator: {
    username: string;
    avatar_url: string | null;
    lightning_address?: string | null;
    nostr_pubkey?: string | null;
    bio?: string;
  };
}

export function WishlistPage({ slug }: { slug: string }) {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);
  const [giftForm, setGiftForm] = useState({
    amount: '',
    name: '',
    message: '',
  });
  const [processing, setProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrAddress, setQrAddress] = useState('');
  const [qrAmount, setQrAmount] = useState<number | undefined>();
  const [mockInvoice, setMockInvoice] = useState('');

  useEffect(() => {
    loadWishlist();
  }, [slug]);

  async function loadWishlist() {
    try {
      const mockWishlist = mockWishlists.find(w => w.slug === slug);
      if (mockWishlist) {
        setWishlist({
          ...mockWishlist,
          theme_color: '#f97316',
        } as Wishlist);

        const mockItems = mockWishlistItems[mockWishlist.id] || [];
        setItems(mockItems as any);

        setLoading(false);
        return;
      }

      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlists')
        .select(`
          id,
          title,
          description,
          slug,
          theme_color,
          cover_image,
          total_sats_goal,
          total_sats_raised,
          country,
          country_code,
          city,
          creator:profiles!wishlists_creator_id_fkey(username, avatar_url, lightning_address, nostr_pubkey, bio)
        `)
        .eq('slug', slug)
        .maybeSingle();

      if (wishlistError) throw wishlistError;
      if (!wishlistData) {
        console.error('Wishlist not found');
        return;
      }

      setWishlist(wishlistData as unknown as Wishlist);

      const { data: itemsData, error: itemsError } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('wishlist_id', wishlistData.id)
        .order('sort_order');

      if (itemsError) throw itemsError;
      setItems(itemsData || []);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatSats(sats: number): string {
    return new Intl.NumberFormat().format(sats);
  }

  function handleGiftClick(item: WishlistItem | null = null) {
    setSelectedItem(item);
    setGiftForm({
      amount: item ? String(item.price_sats - item.sats_raised) : '',
      name: '',
      message: '',
    });
    setShowGiftModal(true);
  }

  async function handleGiftSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);

    const invoice = `lnbc${giftForm.amount}n1p0xyz...mock_invoice_${Date.now()}`;
    setMockInvoice(invoice);
    setShowGiftModal(false);
    setShowPaymentModal(true);

    setTimeout(async () => {
      try {
        const { error } = await supabase.from('transactions').insert({
          wishlist_id: wishlist!.id,
          item_id: selectedItem?.id || null,
          contributor_name: giftForm.name || 'Anonymous',
          amount_sats: parseInt(giftForm.amount),
          message: giftForm.message,
          payment_method: 'lightning',
          payment_hash: invoice,
          status: 'completed',
        });

        if (error) throw error;

        await loadWishlist();
        setShowPaymentModal(false);
        setGiftForm({ amount: '', name: '', message: '' });
      } catch (error) {
        console.error('Error processing gift:', error);
      } finally {
        setProcessing(false);
      }
    }, 3000);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <div className="text-white text-xl font-bold">Loading wishlist...</div>
        </div>
      </div>
    );
  }

  if (!wishlist) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black flex items-center justify-center">
        <Card className="p-12 text-center max-w-md bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
          <Gift size={64} className="text-gray-600 mx-auto mb-4" />
          <h2 className="text-3xl font-black text-white mb-2">Wishlist Not Found</h2>
          <p className="text-gray-400 mb-6">This wishlist doesn't exist or has been removed.</p>
          <Button className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 font-bold">
            <ArrowLeft size={18} className="mr-2" />
            Explore Wishlists
          </Button>
        </Card>
      </div>
    );
  }

  const totalProgress = wishlist.total_sats_goal > 0
    ? (wishlist.total_sats_raised / wishlist.total_sats_goal) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black">
      <div className="relative">
        {wishlist.cover_image ? (
          <div className="relative h-96 overflow-hidden">
            <img
              src={wishlist.cover_image}
              alt={wishlist.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black" />
          </div>
        ) : (
          <div className="relative h-96 overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="absolute inset-0 flex items-center justify-center">
              <Gift size={128} className="text-white/10" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-70" />
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <div className="flex items-end justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <h1
                    className="text-6xl font-black text-white drop-shadow-2xl"
                    style={{ textShadow: '0 4px 12px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.5)' }}
                  >
                    {wishlist.title}
                  </h1>
                  {wishlist.country_flag && (
                    <div className="text-5xl drop-shadow-2xl" title={wishlist.country}>{wishlist.country_flag}</div>
                  )}
                </div>
                <p
                  className="text-white/90 text-xl leading-relaxed max-w-3xl backdrop-blur-sm bg-black/20 px-4 py-2 rounded-lg mb-4"
                  style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
                >
                  {wishlist.description}
                </p>
                {wishlist.country && (
                  <div className="flex items-center gap-2 text-white/80 backdrop-blur-sm bg-black/30 px-4 py-2 rounded-lg inline-flex" title="Location">
                    <MapPin size={18} />
                    <span className="font-medium">{wishlist.city ? `${wishlist.city}, ` : ''}{wishlist.country}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 ml-6">
                <ShareButton
                  url={`/wishlist/${wishlist.slug}`}
                  title={wishlist.title}
                  description={wishlist.description}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 p-8 group hover:border-orange-500/50 transition-all duration-300" title="Creator information">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-white font-black text-2xl ring-4 ring-orange-500/20">
                  {wishlist.creator.username[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-white font-black text-xl">{wishlist.creator.username}</p>
                  {wishlist.creator.lightning_address && (
                    <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-1">
                      <Zap size={14} className="text-orange-500" />
                      {wishlist.creator.lightning_address}
                    </p>
                  )}
                </div>
              </div>

              {wishlist.creator.bio && (
                <p className="text-gray-300 leading-relaxed border-t border-gray-700 pt-6">{wishlist.creator.bio}</p>
              )}
            </Card>

            {wishlist.full_story && (
              <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 p-8" title="Project story">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <Heart size={24} className="text-purple-500" />
                  </div>
                  <h2 className="text-3xl font-black text-white">Our Story</h2>
                </div>
                <div className="text-gray-300 whitespace-pre-line leading-relaxed text-lg">
                  {wishlist.full_story}
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {wishlist.total_sats_goal > 0 && (
              <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 p-8 hover:border-emerald-500/50 transition-all duration-300" title="Funding progress">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-emerald-500/20 rounded-xl">
                    <TrendingUp size={24} className="text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">Progress</h3>
                    <p className="text-gray-400 text-sm">Community support</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-white">
                      {formatSats(wishlist.total_sats_raised)}
                    </span>
                    <span className="text-emerald-400 font-black text-2xl">
                      {totalProgress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-600 transition-all duration-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                      style={{ width: `${Math.min(totalProgress, 100)}%` }}
                    />
                  </div>
                  <p className="text-gray-400 font-medium">
                    of {formatSats(wishlist.total_sats_goal)} sats goal
                  </p>
                </div>
              </Card>
            )}

            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 p-6 space-y-4">
              <Button
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 font-black text-lg py-4 shadow-[0_0_30px_rgba(255,135,0,0.3)]"
                onClick={() => handleGiftClick()}
                title="Support this wishlist with Bitcoin"
              >
                <Gift size={22} className="mr-2" />
                Send Gift
              </Button>

              <Button
                variant="outline"
                className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-orange-500/50 font-bold py-4"
                onClick={() => {
                  setQrAddress('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');
                  setQrAmount(undefined);
                  setShowQRModal(true);
                }}
                title="View Bitcoin QR code"
              >
                <QrCode size={20} className="mr-2" />
                Show QR Code
              </Button>
            </Card>
          </div>
        </div>

        <div className="space-y-8 pb-20">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Package size={28} className="text-purple-500" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white">Wishlist Items</h2>
              <p className="text-gray-400">Support specific items in this wishlist</p>
            </div>
          </div>

          {items.length === 0 ? (
            <Card className="p-20 text-center bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl mb-6 shadow-[0_0_40px_rgba(168,85,247,0.5)]">
                <Gift size={48} className="text-white" />
              </div>
              <h3 className="text-3xl font-black text-white mb-3">No Items Yet</h3>
              <p className="text-gray-300 text-lg">Check back soon for specific items you can support!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {items.map((item) => {
                const itemProgress = (item.sats_raised / item.price_sats) * 100;

                return (
                  <Card
                    key={item.id}
                    className={`overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_0_40px_rgba(168,85,247,0.25)] ${item.is_funded ? 'ring-2 ring-emerald-500/50' : ''}`}
                    title={item.is_funded ? "This item has been fully funded!" : "Click to support this item"}
                  >
                    {item.image_url && (
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                        {item.is_funded && (
                          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                            <div className="bg-emerald-500 rounded-full p-5 shadow-2xl ring-4 ring-white/30 animate-pulse">
                              <Check size={40} className="text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-8 space-y-5">
                      <div>
                        <h3 className="text-2xl font-black text-white mb-3 line-clamp-2">{item.title}</h3>
                        <p className="text-gray-300 leading-relaxed">{item.description}</p>
                      </div>

                      <div className="space-y-3 p-5 bg-black/50 rounded-xl border border-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 font-bold uppercase text-xs tracking-wider">
                            Progress
                          </span>
                          <span className={`font-black text-xl ${item.is_funded ? 'text-emerald-400' : 'text-orange-500'}`}>
                            {itemProgress.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.is_funded ? 'bg-gradient-to-r from-emerald-500 to-cyan-600' : 'bg-gradient-to-r from-orange-500 to-amber-600'} transition-all duration-500`}
                            style={{ width: `${Math.min(itemProgress, 100)}%` }}
                          />
                        </div>
                        <p className="text-gray-300 font-medium text-sm">
                          {formatSats(item.sats_raised)} / {formatSats(item.price_sats)} sats
                        </p>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button
                          className={`flex-1 font-bold text-lg py-4 ${item.is_funded ? 'bg-gradient-to-r from-emerald-500 to-cyan-600 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-[0_0_20px_rgba(255,135,0,0.3)]'}`}
                          onClick={() => handleGiftClick(item)}
                          disabled={item.is_funded}
                          title={item.is_funded ? "This item is fully funded" : "Support this item"}
                        >
                          {item.is_funded ? (
                            <>
                              <Check size={20} className="mr-2" />
                              Fully Funded
                            </>
                          ) : (
                            <>
                              <Zap size={20} className="mr-2" />
                              Fund This Item
                            </>
                          )}
                        </Button>
                        {item.merchant_link && (
                          <Button
                            variant="outline"
                            onClick={() => window.open(item.merchant_link!, '_blank')}
                            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-purple-500/50 px-5"
                            title="View product page"
                          >
                            <ExternalLink size={20} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showGiftModal}
        onClose={() => setShowGiftModal(false)}
        title={selectedItem ? `Fund ${selectedItem.title}` : 'Send a Gift'}
      >
        <form onSubmit={handleGiftSubmit} className="space-y-4">
          <Input
            label="Amount (sats)"
            type="number"
            value={giftForm.amount}
            onChange={(e) => setGiftForm({ ...giftForm, amount: e.target.value })}
            placeholder="21000"
            required
          />
          <Input
            label="Your Name (optional)"
            type="text"
            value={giftForm.name}
            onChange={(e) => setGiftForm({ ...giftForm, name: e.target.value })}
            placeholder="Anonymous"
          />
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Message (optional)
            </label>
            <textarea
              value={giftForm.message}
              onChange={(e) => setGiftForm({ ...giftForm, message: e.target.value })}
              className="w-full px-5 py-4 bg-black border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
              rows={3}
              placeholder="Leave a message for the creator..."
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 font-bold text-lg py-4 shadow-[0_0_20px_rgba(255,135,0,0.3)]"
            loading={processing}
          >
            <Bitcoin size={20} className="mr-2" />
            Generate Invoice
          </Button>
        </form>
      </Modal>

      <Modal
        isOpen={showPaymentModal}
        onClose={() => {}}
        title="Pay with Lightning"
      >
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg">
            <div className="w-full aspect-square bg-night-blue-500 flex items-center justify-center text-white text-xs p-4 break-all">
              QR CODE: {mockInvoice}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Lightning Invoice</label>
            <div className="flex gap-2">
              <input
                value={mockInvoice}
                readOnly
                className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
              />
              <Button
                variant="outline"
                onClick={() => copyToClipboard(mockInvoice)}
              >
                <Copy size={18} />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-orange-500">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-orange-500"></div>
            <span>Waiting for payment...</span>
          </div>

          <p className="text-xs text-gray-500 text-center">
            This is a demo. Payment will auto-complete in 3 seconds.
          </p>
        </div>
      </Modal>

      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        address={qrAddress}
        amount={qrAmount}
        title={wishlist ? `Send to ${wishlist.title}` : 'Send Bitcoin'}
      />
    </div>
  );
}
