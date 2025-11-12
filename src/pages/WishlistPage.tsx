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
import { Gift, ExternalLink, Zap, Bitcoin, Check, Copy, MapPin, QrCode } from 'lucide-react';

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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!wishlist) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <Gift size={64} className="text-gray-700 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Wishlist not found</h2>
          <p className="text-gray-400">This wishlist doesn't exist or has been removed.</p>
        </Card>
      </div>
    );
  }

  const totalProgress = wishlist.total_sats_goal > 0
    ? (wishlist.total_sats_raised / wishlist.total_sats_goal) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-700 to-black">
      {wishlist.cover_image ? (
        <div className="relative h-80 overflow-hidden">
          <img
            src={wishlist.cover_image}
            alt={wishlist.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-800 via-black/50 to-transparent" />
        </div>
      ) : (
        <div
          className="relative h-80 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${wishlist.theme_color}33 0%, ${wishlist.theme_color}11 100%)`,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <Gift size={128} className="text-white/10" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-800 via-black/50 to-transparent" />
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <Card className="p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <h1 className="text-4xl font-bold text-white flex-1">{wishlist.title}</h1>
                {wishlist.country_flag && (
                  <div className="text-5xl ml-4">{wishlist.country_flag}</div>
                )}
              </div>
              <p className="text-gray-400 text-lg">{wishlist.description}</p>

              {wishlist.country && (
                <div className="flex items-center gap-2 text-gray-400">
                  <MapPin size={16} />
                  <span>{wishlist.city ? `${wishlist.city}, ` : ''}{wishlist.country}</span>
                </div>
              )}

              <div className="flex items-center gap-4 pt-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {wishlist.creator.username[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold">{wishlist.creator.username}</p>
                  {wishlist.creator.lightning_address && (
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                      <Zap size={14} />
                      {wishlist.creator.lightning_address}
                    </p>
                  )}
                </div>
                <ShareButton
                  url={`/wishlist/${wishlist.slug}`}
                  title={wishlist.title}
                  description={wishlist.description}
                />
              </div>

              {wishlist.creator.bio && (
                <p className="text-gray-300 pt-4 border-t border-gray-800">{wishlist.creator.bio}</p>
              )}

              {wishlist.full_story && (
                <div className="pt-6 border-t border-gray-800">
                  <h2 className="text-2xl font-bold text-white mb-4">Our Story</h2>
                  <div className="text-gray-300 whitespace-pre-line leading-relaxed">
                    {wishlist.full_story}
                  </div>
                </div>
              )}
            </div>

            <div className="md:w-80 space-y-4">
              {wishlist.total_sats_goal > 0 && (
                <Card className="p-6 space-y-4 bg-gray-800/50">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-white">
                        {formatSats(wishlist.total_sats_raised)} sats
                      </span>
                      <span className="text-orange-500 font-bold text-lg">
                        {totalProgress.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                        style={{ width: `${Math.min(totalProgress, 100)}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-400">
                      of {formatSats(wishlist.total_sats_goal)} sats goal
                    </p>
                  </div>
                </Card>
              )}

              <Button
                size="lg"
                className="w-full"
                onClick={() => handleGiftClick()}
              >
                <Gift size={20} className="mr-2" />
                Send Gift
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setQrAddress('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');
                  setQrAmount(undefined);
                  setShowQRModal(true);
                }}
              >
                <QrCode size={20} className="mr-2" />
                Show QR Code
              </Button>

              {items.length > 0 && (
                <div className="pt-6 border-t border-gray-700">
                  <WishlistItemsList
                    items={items as any}
                    onItemClick={(item) => {
                      setSelectedItem(item as any);
                      setGiftForm({ ...giftForm, amount: (item.price_sats / 100000).toString() });
                      setShowGiftModal(true);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className="space-y-6 pb-20">
          <h2 className="text-2xl font-bold text-white">Wishlist Items</h2>

          {items.length === 0 ? (
            <Card className="p-12 text-center">
              <Gift size={64} className="text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No items yet</h3>
              <p className="text-gray-400">Check back soon!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.map((item) => {
                const itemProgress = (item.sats_raised / item.price_sats) * 100;

                return (
                  <Card key={item.id} className={`overflow-hidden ${item.is_funded ? 'border-green-500/50' : ''}`}>
                    {item.image_url && (
                      <div className="relative">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-48 object-cover"
                        />
                        {item.is_funded && (
                          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center">
                            <div className="bg-green-500 rounded-full p-4 shadow-2xl ring-4 ring-white/30">
                              <Check size={32} className="text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                        <p className="text-gray-400 text-sm">{item.description}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">
                            {formatSats(item.sats_raised)} / {formatSats(item.price_sats)} sats
                          </span>
                          <span className="text-orange-500 font-medium">
                            {itemProgress.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                            style={{ width: `${Math.min(itemProgress, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          className="flex-1"
                          onClick={() => handleGiftClick(item)}
                          disabled={item.is_funded}
                        >
                          {item.is_funded ? (
                            <>
                              <Check size={18} className="mr-2" />
                              Funded
                            </>
                          ) : (
                            <>
                              <Zap size={18} className="mr-2" />
                              Fund This
                            </>
                          )}
                        </Button>
                        {item.merchant_link && (
                          <Button
                            variant="outline"
                            onClick={() => window.open(item.merchant_link!, '_blank')}
                          >
                            <ExternalLink size={18} />
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
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Leave a message for the creator..."
            />
          </div>
          <Button type="submit" className="w-full" loading={processing}>
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
            <div className="w-full aspect-square bg-slate-700 flex items-center justify-center text-white text-xs p-4 break-all">
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
