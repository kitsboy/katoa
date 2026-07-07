import { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { ShareButton } from '../components/ShareButton';
import { QRCodeModal } from '../components/QRCodeModal';
import { MediaCard } from '../components/MediaCard';
import { SatsDisplay } from '../components/SatsDisplay';
import { Link } from '../components/Link';
import { supabase } from '../lib/supabase';
import { mockWishlists, mockWishlistItems } from '../data/mockWishlists';
import { getStorage, setStorage, STORAGE_KEYS } from '../lib/storage';
import { copyToClipboard } from '../lib/clipboard';
import { getQrImageUrl, lightningQrData } from '../lib/qr';
import { Breadcrumbs, BreadcrumbItem } from '../components/Breadcrumbs';
import { PageMeta } from '../components/PageMeta';
import { PaymentMethodTabs, PaymentTab } from '../components/PaymentMethodTabs';
import { useLanguage } from '../contexts/LanguageContext';
import { Gift, ExternalLink, Zap, Bitcoin, Check, Copy, MapPin, QrCode, ArrowLeft, Heart, TrendingUp, Package, ChevronUp, ChevronDown } from 'lucide-react';

const SAT_PRESETS = [
  { label: '1K', value: 1000 },
  { label: '10K', value: 10000 },
  { label: '21K', value: 21000 },
] as const;

const THEME_PRESETS = [
  { color: '#f97316', label: 'Orange' },
  { color: '#14E6FF', label: 'Cyan' },
  { color: '#a855f7', label: 'Purple' },
  { color: '#22c55e', label: 'Green' },
  { color: '#ec4899', label: 'Pink' },
  { color: '#3b82f6', label: 'Blue' },
] as const;

interface GiftDraft {
  slug: string;
  amount: string;
  name: string;
  message: string;
}

interface RecentWishlist {
  slug: string;
  title: string;
  viewedAt: number;
}

interface WishlistItem {
  id: string;
  title: string;
  description: string;
  price_sats: number;
  sats_raised: number;
  image_url: string | null;
  video_url?: string | null;
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
  cover_video_url?: string | null;
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

export function WishlistPage({ slug, breadcrumbItems = [] }: { slug: string; breadcrumbItems?: BreadcrumbItem[] }) {
  const { t } = useLanguage();
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
  const [paymentQrUrl, setPaymentQrUrl] = useState('');
  const [amountPreset, setAmountPreset] = useState<'custom' | number>('custom');
  const [paymentTab, setPaymentTab] = useState<PaymentTab>('lightning');
  const [themeColor, setThemeColor] = useState(() =>
    getStorage<string>(STORAGE_KEYS.wishlistTheme(slug), '#f97316')
  );
  const [paymentCountdown, setPaymentCountdown] = useState(180);
  const [isDemoWishlist, setIsDemoWishlist] = useState(false);

  useEffect(() => {
    loadWishlist();
  }, [slug]);

  useEffect(() => {
    setThemeColor(getStorage<string>(STORAGE_KEYS.wishlistTheme(slug), '#f97316'));
  }, [slug]);

  useEffect(() => {
    if (!showPaymentModal) return;
    setPaymentCountdown(180);
    const interval = setInterval(() => {
      setPaymentCountdown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [showPaymentModal]);

  function handleThemeChange(color: string) {
    setThemeColor(color);
    setStorage(STORAGE_KEYS.wishlistTheme(slug), color);
    if (wishlist) {
      setWishlist({ ...wishlist, theme_color: color });
    }
  }

  useEffect(() => {
    if (!slug) return;
    const draft = getStorage<GiftDraft | null>(STORAGE_KEYS.giftDraft, null);
    if (draft?.slug === slug) {
      setGiftForm({ amount: draft.amount, name: draft.name, message: draft.message });
      const preset = SAT_PRESETS.find((p) => String(p.value) === draft.amount);
      setAmountPreset(preset ? preset.value : 'custom');
    }
  }, [slug]);

  useEffect(() => {
    if (!wishlist) return;
    const recent = getStorage<RecentWishlist[]>(STORAGE_KEYS.recentlyViewedWishlists, []);
    const updated = [
      { slug: wishlist.slug, title: wishlist.title, viewedAt: Date.now() },
      ...recent.filter((r) => r.slug !== wishlist.slug),
    ].slice(0, 8);
    setStorage(STORAGE_KEYS.recentlyViewedWishlists, updated);
  }, [wishlist?.slug, wishlist?.title]);

  async function loadWishlist() {
    try {
      const mockWishlist = mockWishlists.find(w => w.slug === slug);
      if (mockWishlist) {
        setIsDemoWishlist(true);
        setWishlist({
          ...mockWishlist,
          theme_color: '#f97316',
        } as Wishlist);

        const mockItems = mockWishlistItems[mockWishlist.id] || [];
        setItems(applyItemOrder(mockItems as WishlistItem[], slug));

        setLoading(false);
        return;
      }
      setIsDemoWishlist(false);

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
      setItems(applyItemOrder((itemsData || []) as WishlistItem[], slug));
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  }

  function applyItemOrder(loaded: WishlistItem[], listSlug: string): WishlistItem[] {
    const order = getStorage<string[]>(STORAGE_KEYS.wishlistItemOrder(listSlug), []);
    if (order.length === 0) return loaded;
    const map = new Map(loaded.map((i) => [i.id, i]));
    const sorted = order.map((id) => map.get(id)).filter(Boolean) as WishlistItem[];
    const rest = loaded.filter((i) => !order.includes(i.id));
    return [...sorted, ...rest];
  }

  function moveItem(id: string, direction: 'up' | 'down') {
    const idx = items.findIndex((i) => i.id === id);
    if (idx < 0) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= items.length) return;
    const next = [...items];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    setItems(next);
    setStorage(STORAGE_KEYS.wishlistItemOrder(slug), next.map((i) => i.id));
  }

  function formatSats(sats: number): string {
    return new Intl.NumberFormat().format(sats);
  }

  function handleGiftClick(item: WishlistItem | null = null) {
    setSelectedItem(item);
    const amount = item ? String(item.price_sats - item.sats_raised) : giftForm.amount;
    const preset = SAT_PRESETS.find((p) => String(p.value) === amount);
    setAmountPreset(preset ? preset.value : amount ? 'custom' : 'custom');
    setGiftForm((prev) => ({
      ...prev,
      amount,
    }));
    setShowGiftModal(true);
  }

  function handlePresetSelect(value: number | 'custom') {
    setAmountPreset(value);
    if (value !== 'custom') {
      setGiftForm((prev) => ({ ...prev, amount: String(value) }));
    }
  }

  function persistGiftDraft(form: typeof giftForm) {
    if (!slug) return;
    setStorage(STORAGE_KEYS.giftDraft, { slug, ...form });
  }

  async function handleGiftSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);

    const invoice = `lnbc${giftForm.amount}n1p0xyz...mock_invoice_${Date.now()}`;
    setMockInvoice(invoice);
    setPaymentQrUrl(getQrImageUrl(lightningQrData(invoice), 280));
    persistGiftDraft(giftForm);
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

  async function handleCopyInvoice(text: string) {
    await copyToClipboard(text);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <div className="text-white text-xl font-bold">{t('wishlist.loading')}</div>
        </div>
      </div>
    );
  }

  if (!wishlist) {
    return (
      <div className="min-h-screen bg-charcoal-950 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md" variant="glass">
          <Gift size={64} className="text-gray-600 mx-auto mb-4" />
          <h2 className="text-3xl font-black text-white mb-2">{t('wishlist.notFound')}</h2>
          <p className="text-gray-400 mb-6">{t('wishlist.notFoundDesc')}</p>
          <Link href="/explore">
            <Button variant="bitcoin">
              <ArrowLeft size={18} className="mr-2" />
              {t('wishlist.explore')}
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const totalProgress = wishlist.total_sats_goal > 0
    ? (wishlist.total_sats_raised / wishlist.total_sats_goal) * 100
    : 0;

  const resolvedBreadcrumbs: BreadcrumbItem[] = breadcrumbItems.length > 0
    ? breadcrumbItems.map((item, i) =>
        i === breadcrumbItems.length - 1 && wishlist
          ? { ...item, label: wishlist.title }
          : item
      )
    : [];

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-charcoal-950 pb-24 md:pb-0" style={{ '--wishlist-accent': themeColor } as React.CSSProperties}>
      <PageMeta
        title={wishlist.title}
        description={wishlist.description?.slice(0, 160) || `Support ${wishlist.creator.username}'s wishlist with Bitcoin on KATOA.`}
        path={`/wishlist/${slug}`}
        image={wishlist.cover_image || undefined}
      />
      {isDemoWishlist && (
        <div className="bg-bitcoin-orange-500/10 border-b border-bitcoin-orange-500/30 px-4 py-2 text-center text-sm text-bitcoin-orange-200">
          Demo wishlist — payments auto-complete after 3 seconds for preview.
        </div>
      )}
      <div className="relative">
        <MediaCard
          className="!aspect-auto h-56 sm:h-72 md:h-96"
          media={{
            imageUrl: wishlist.cover_image,
            videoUrl: wishlist.cover_video_url,
            alt: wishlist.title,
          }}
          aspect="wide"
          autoplayOnHover={false}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-charcoal-950 pointer-events-none" />

        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3">
                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white drop-shadow-lg leading-tight">
                    {wishlist.title}
                  </h1>
                  {wishlist.country_flag && (
                    <span className="text-3xl sm:text-4xl" title={wishlist.country}>{wishlist.country_flag}</span>
                  )}
                </div>
                <p className="text-white/90 text-base sm:text-lg leading-relaxed max-w-3xl backdrop-blur-sm bg-black/30 px-3 sm:px-4 py-2 rounded-xl mb-3">
                  {wishlist.description}
                </p>
                {wishlist.country && (
                  <div className="inline-flex items-center gap-2 text-white/80 backdrop-blur-sm bg-black/40 px-3 py-2 rounded-lg text-sm">
                    <MapPin size={16} className="text-bitcoin-orange-500" />
                    <span className="font-medium">{wishlist.city ? `${wishlist.city}, ` : ''}{wishlist.country}</span>
                  </div>
                )}
              </div>

              <div className="flex sm:flex-col gap-3 shrink-0">
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
        {resolvedBreadcrumbs.length > 0 && (
          <Breadcrumbs items={resolvedBreadcrumbs} className="mb-6" />
        )}

        <div className="mb-8 p-4 rounded-xl bg-white/[0.03] border border-white/10">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Theme color</p>
          <div className="flex flex-wrap gap-2">
            {THEME_PRESETS.map((preset) => (
              <button
                key={preset.color}
                type="button"
                onClick={() => handleThemeChange(preset.color)}
                className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 touch-manipulation ${
                  themeColor === preset.color ? 'border-white scale-110' : 'border-white/20'
                }`}
                style={{ backgroundColor: preset.color }}
                aria-label={`${preset.label} theme`}
                aria-pressed={themeColor === preset.color}
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-8">
            <Card className=" p-8 group hover:border-orange-500/50 transition-all duration-300" title="Creator information">
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
                <p className="text-gray-300 leading-relaxed border-t border-white/10 pt-6">{wishlist.creator.bio}</p>
              )}
            </Card>

            {wishlist.full_story && (
              <Card className=" p-8" title="Project story">
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
              <Card className=" p-8 hover:border-emerald-500/50 transition-all duration-300" title="Funding progress">
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
                  <div className="flex items-center justify-between gap-4">
                    <SatsDisplay sats={wishlist.total_sats_raised} size="lg" showBtc />
                    <span className="text-emerald-400 font-black text-xl sm:text-2xl">
                      {totalProgress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
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

            <Card className=" p-6 space-y-4">
              <Button
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 font-black text-lg py-4 shadow-[0_0_30px_rgba(255,135,0,0.3)]"
                onClick={() => handleGiftClick()}
                title="Support this wishlist with Bitcoin"
              >
                <Gift size={22} className="mr-2" />
                {t('wishlist.sendGift')}
              </Button>

              <Button
                variant="outline"
                className="w-full border-white/10 text-gray-300 hover:bg-gray-800 hover:border-orange-500/50 font-bold py-4"
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
              <p className="text-gray-400">{t('wishlist.supportItems')}</p>
            </div>
          </div>

          {items.length === 0 ? (
            <Card className="p-20 text-center ">
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
                    className={`overflow-hidden  hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_0_40px_rgba(168,85,247,0.25)] ${item.is_funded ? 'ring-2 ring-emerald-500/50' : ''}`}
                    title={item.is_funded ? "This item has been fully funded!" : "Click to support this item"}
                  >
                    {(item.image_url || item.video_url) && (
                      <div className="relative">
                        <MediaCard
                          media={{
                            imageUrl: item.image_url,
                            videoUrl: item.video_url,
                            alt: item.title,
                          }}
                          aspect="wide"
                          className="!aspect-[16/10]"
                          showPlayIndicator={Boolean(item.video_url)}
                        />
                        {item.is_funded && (
                          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                            <div className="bg-emerald-500 rounded-full p-4 sm:p-5 shadow-2xl ring-4 ring-white/30">
                              <Check size={32} className="text-white sm:w-10 sm:h-10" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-8 space-y-5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-2xl font-black text-white mb-3 line-clamp-2 flex-1">{item.title}</h3>
                        {items.length > 1 && (
                          <div className="flex flex-col gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => moveItem(item.id, 'up')}
                              disabled={items.indexOf(item) === 0}
                              className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 min-h-[36px] min-w-[36px] flex items-center justify-center touch-manipulation"
                              aria-label="Move item up"
                            >
                              <ChevronUp size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveItem(item.id, 'down')}
                              disabled={items.indexOf(item) === items.length - 1}
                              className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 min-h-[36px] min-w-[36px] flex items-center justify-center touch-manipulation"
                              aria-label="Move item down"
                            >
                              <ChevronDown size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-gray-300 leading-relaxed">{item.description}</p>
                      </div>

                      <div className="space-y-3 p-5 bg-black/40 rounded-xl border border-white/10">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 font-bold uppercase text-xs tracking-wider">
                            Progress
                          </span>
                          <span className={`font-black text-xl ${item.is_funded ? 'text-emerald-400' : 'text-orange-500'}`}>
                            {itemProgress.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
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
                            className="border-white/10 text-gray-300 hover:bg-gray-800 hover:border-purple-500/50 px-5"
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
          <PaymentMethodTabs value={paymentTab} onChange={setPaymentTab} />
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Amount (sats)</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {SAT_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handlePresetSelect(preset.value)}
                  className={`px-4 py-2 min-h-[44px] rounded-xl text-sm font-bold border transition-colors touch-manipulation ${
                    amountPreset === preset.value
                      ? 'bg-bitcoin-orange-500/20 border-bitcoin-orange-500 text-bitcoin-orange-300'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:border-neon-cyan-500/40'
                  }`}
                  aria-pressed={amountPreset === preset.value}
                >
                  {preset.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handlePresetSelect('custom')}
                className={`px-4 py-2 min-h-[44px] rounded-xl text-sm font-bold border transition-colors touch-manipulation ${
                  amountPreset === 'custom'
                    ? 'bg-neon-cyan-500/15 border-neon-cyan-500 text-neon-cyan-300'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:border-neon-cyan-500/40'
                }`}
                aria-pressed={amountPreset === 'custom'}
              >
                Custom
              </button>
            </div>
            <Input
              type="number"
              value={giftForm.amount}
              onChange={(e) => {
                setAmountPreset('custom');
                const next = { ...giftForm, amount: e.target.value };
                setGiftForm(next);
                persistGiftDraft(next);
              }}
              placeholder="21000"
              required
              aria-label="Custom amount in sats"
            />
          </div>
          <Input
            label="Your Name (optional)"
            type="text"
            value={giftForm.name}
            onChange={(e) => {
              const next = { ...giftForm, name: e.target.value };
              setGiftForm(next);
              persistGiftDraft(next);
            }}
            placeholder="Anonymous"
          />
          <div>
            <label htmlFor="gift-message" className="block text-sm font-medium text-gray-300 mb-2">
              Message (optional)
            </label>
            <textarea
              id="gift-message"
              value={giftForm.message}
              onChange={(e) => {
                const next = { ...giftForm, message: e.target.value };
                setGiftForm(next);
                persistGiftDraft(next);
              }}
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-cyan-500/50 focus:border-neon-cyan-500/30 resize-none"
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
          <div className="bg-white p-4 rounded-xl mx-auto max-w-[280px]">
            {paymentQrUrl ? (
              <img src={paymentQrUrl} alt="Lightning invoice QR code" className="w-full aspect-square" />
            ) : (
              <div className="w-full aspect-square bg-gray-200 animate-pulse rounded-lg" aria-hidden />
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Lightning Invoice</label>
            <div className="flex gap-2">
              <input
                value={mockInvoice}
                readOnly
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-mono"
                aria-label="Lightning invoice"
              />
              <Button
                variant="outline"
                onClick={() => handleCopyInvoice(mockInvoice)}
                aria-label="Copy invoice"
              >
                <Copy size={18} />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 text-bitcoin-orange-500" role="status" aria-live="polite">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-bitcoin-orange-500" aria-hidden />
            <span>Waiting for payment…</span>
            <span className="font-mono text-sm text-gray-400 tabular-nums">
              {formatCountdown(paymentCountdown)}
            </span>
          </div>
          {paymentCountdown === 0 && (
            <p className="text-center text-amber-400 text-sm">Invoice expired — close and generate a new one.</p>
          )}

          <p className="text-xs text-gray-500 text-center">
            Demo mode — payment auto-completes in ~3 seconds.
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

      {/* Sticky mobile CTA */}
      <div className="md:hidden fixed bottom-[calc(56px+env(safe-area-inset-bottom))] inset-x-0 z-40 px-4 pb-2 pointer-events-none">
        <div className="pointer-events-auto max-w-lg mx-auto flex gap-2 p-2 rounded-2xl bg-charcoal-950/95 backdrop-blur-xl border border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.5)]">
          <Button
            className="flex-1 bg-gradient-to-r from-bitcoin-orange-500 to-amber-600 font-bold min-h-[48px]"
            onClick={() => handleGiftClick()}
          >
            <Gift size={18} className="mr-2" />
            {t('wishlist.sendGift')}
          </Button>
          <Button
            variant="outline"
            className="min-h-[48px] min-w-[48px] px-3 border-white/15"
            onClick={() => {
              setQrAddress('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');
              setQrAmount(undefined);
              setShowQRModal(true);
            }}
            aria-label="Show QR code"
          >
            <QrCode size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}
