import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { mockCreatorPosts } from '../data/mockCreatorPosts';
import { isSubscribed, subscribeLocal, unsubscribe } from '../lib/subscriptions';
import { getStorage, setStorage, removeStorage, STORAGE_KEYS } from '../lib/storage';
import { copyToClipboard } from '../lib/clipboard';
import { bitcoinQrData, getQrImageUrl, isBolt11Invoice, isDummyPaymentTarget, lightningQrData } from '../lib/qr';
import { usablePaymentAddress } from '../lib/validateAddress';
import { fetchCreatorReceiveDestinations } from '../lib/creatorProfile';
import { toJsonLdScript } from '../lib/jsonLd';
import { Breadcrumbs, BreadcrumbItem } from '../components/Breadcrumbs';
import { PageMeta } from '../components/PageMeta';
import { useToast } from '../components/Toast';
import { PaymentMethodTabs, PaymentTab } from '../components/PaymentMethodTabs';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Gift, ExternalLink, Zap, Bitcoin, Check, Copy, QrCode, ArrowLeft, Heart, TrendingUp, Package, ChevronUp, ChevronDown, ShoppingBag, Loader2, MessageCircle, BadgeCheck, X } from 'lucide-react';
import { MilestoneBanner } from '../components/MilestoneBanner';
import { ProgressBar } from '../components/ProgressBar';
import { ActivityFeed } from '../components/ActivityFeed';
import { TrustProofStrip } from '../components/TrustProofStrip';
import { EmbedSnippet } from '../components/EmbedSnippet';
import { GiftSuccess } from '../components/GiftSuccess';
import { MobileStickyCta } from '../components/MobileStickyCta';
import { buyLabel, type ParsedProduct } from '../lib/productParser';
import { WalletDeepLinks } from '../components/WalletDeepLinks';
import { hasNip07, nip07UserMessage, nostrService } from '../lib/nostr';
import { NostrPublishWishlist } from '../components/NostrPublishWishlist';
import { ZapTotals } from '../components/ZapTotals';
import { Tooltip } from '../components/Tooltip';
import { ProductUrlImport } from '../components/ProductUrlImport';
import { SubscriptionTiers } from '../components/SubscriptionTiers';
import { TipMenu } from '../components/TipMenu';
import { VisibilityBadge } from '../components/VisibilityBadge';
import { CreatorPostFeed } from '../components/CreatorPostFeed';
import { ManageSubscriptionPanel } from '../components/ManageSubscriptionPanel';
import { DemoBadge } from '../components/DemoBadge';

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
  card_style?: 'creator' | 'default';
  total_sats_goal: number;
  total_sats_raised: number;
  subscriber_count?: number;
  country?: string;
  country_code?: string;
  country_flag?: string;
  city?: string;
  creator_id?: string;
  visibility?: string;
  creator: {
    username: string;
    avatar_url: string | null;
    lightning_address?: string | null;
    nostr_pubkey?: string | null;
    bitcoin_address?: string | null;
    bio?: string;
  };
}

export function WishlistPage({ slug, breadcrumbItems = [] }: { slug: string; breadcrumbItems?: BreadcrumbItem[] }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showGiftSuccess, setShowGiftSuccess] = useState(false);
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
  const [demoAutoProgress, setDemoAutoProgress] = useState(0);
  const [zapBusy, setZapBusy] = useState(false);
  const [zapInvoice, setZapInvoice] = useState<string | null>(null);
  const [zapError, setZapError] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [onchainAddress, setOnchainAddress] = useState<string | null>(null);
  const [paymentUri, setPaymentUri] = useState('');
  const [giftIntent, setGiftIntent] = useState<{ amount: number; method: PaymentTab } | null>(null);
  const [showDraftBanner, setShowDraftBanner] = useState(false);

  useEffect(() => {
    setThemeColor(getStorage<string>(STORAGE_KEYS.wishlistTheme(slug), '#f97316'));
  }, [slug]);

  useEffect(() => {
    setSubscribed(isSubscribed(slug));
  }, [slug]);

  useEffect(() => {
    if (!showPaymentModal) return;
    setPaymentCountdown(180);
    setDemoAutoProgress(0);
    const interval = setInterval(() => {
      setPaymentCountdown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [showPaymentModal]);

  // Demo wishlist: auto-complete gift flow after ~3s (mobile-friendly preview)
  useEffect(() => {
    if (!showPaymentModal || !isDemoWishlist) return;
    setDemoAutoProgress(0);
    const started = Date.now();
    const tick = window.setInterval(() => {
      const p = Math.min(100, Math.round(((Date.now() - started) / 3000) * 100));
      setDemoAutoProgress(p);
    }, 100);
    const done = window.setTimeout(() => {
      setDemoAutoProgress(100);
      // Demo lists only: local preview bump. Live lists never increment sats_raised in the browser.
      if (isDemoWishlist && selectedItem) {
        setItems((prev) =>
          prev.map((it) => {
            if (it.id !== selectedItem.id) return it;
            const add = Math.min(
              selectedItem.price_sats - selectedItem.sats_raised,
              Number.parseInt(giftForm.amount, 10) || 1000
            );
            const raised = Math.min(it.price_sats, it.sats_raised + Math.max(add, 0));
            return { ...it, sats_raised: raised, is_funded: raised >= it.price_sats };
          })
        );
      }
      setShowPaymentModal(false);
      removeStorage(STORAGE_KEYS.giftDraft);
      setShowDraftBanner(false);
      setShowGiftSuccess(true);
      toast('Demo gift complete — live sites confirm via wallet + server only', 'success');
    }, 3000);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(done);
    };
  }, [showPaymentModal, isDemoWishlist, selectedItem?.id, giftForm.amount, toast]);

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
    const hasDraft =
      draft?.slug === slug && Boolean(draft.amount?.trim() || draft.name?.trim() || draft.message?.trim());
    if (hasDraft && draft) {
      setGiftForm({ amount: draft.amount, name: draft.name, message: draft.message });
      const preset = SAT_PRESETS.find((p) => String(p.value) === draft.amount);
      setAmountPreset(preset ? preset.value : 'custom');
      setShowDraftBanner(true);
    } else {
      setShowDraftBanner(false);
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

  const loadWishlist = useCallback(async (signal?: { cancelled: boolean }) => {
    const isCancelled = () => signal?.cancelled === true;
    try {
      const mockWishlist = mockWishlists.find(w => w.slug === slug);
      if (mockWishlist) {
        if (isCancelled()) return;
        setIsDemoWishlist(true);
        setWishlist({
          ...mockWishlist,
          creator_id: (mockWishlist as { creator_id?: string }).creator_id || 'demo',
          theme_color: '#f97316',
          card_style: (mockWishlist as { card_style?: 'creator' | 'default' }).card_style ?? 'default',
          cover_video_url: (mockWishlist as { cover_video_url?: string }).cover_video_url,
        } as Wishlist);

        const mockItems = mockWishlistItems[mockWishlist.id] || [];
        setItems(
          applyItemOrder(
            mockItems.map((item) => ({
              id: item.id,
              wishlist_id: mockWishlist.id,
              title: item.title,
              description: item.description,
              price_sats: item.price_sats,
              sats_raised: item.sats_raised,
              image_url: item.image_url,
              video_url: null,
              merchant_link: item.product_url,
              is_funded: item.is_funded,
              sort_order: item.sort_order,
            })),
            slug
          )
        );
        setOnchainAddress(
          (mockWishlist.creator as { bitcoin_address?: string | null }).bitcoin_address?.trim() || null
        );
        setLoading(false);
        return;
      }
      setIsDemoWishlist(false);

      // Prefer RPC so unlisted (private) wishlists resolve by slug without full-table enumeration
      const { data: rpcRows, error: rpcError } = await supabase.rpc('get_wishlist_by_slug', {
        p_slug: slug,
      });

      let wishlistRow: Record<string, unknown> | null = null;

      if (!rpcError && rpcRows && Array.isArray(rpcRows) && rpcRows.length > 0) {
        wishlistRow = rpcRows[0] as Record<string, unknown>;
      } else {
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
            creator_id,
            visibility,
            creator:profiles!wishlists_creator_id_fkey(username, avatar_url, lightning_address, nostr_pubkey, bio)
          `)
          .eq('slug', slug)
          .maybeSingle();

        if (wishlistError) throw wishlistError;
        wishlistRow = wishlistData as Record<string, unknown> | null;
      }

      if (isCancelled()) return;

      if (!wishlistRow) {
        toast(t('wishlist.notFound'), 'error');
        navigate('/explore', { replace: true });
        return;
      }

      if (!wishlistRow.creator && wishlistRow.creator_id) {
        const { data: creator } = await supabase
          .from('profiles')
          .select('username, avatar_url, lightning_address, nostr_pubkey, bio')
          .eq('id', wishlistRow.creator_id as string)
          .maybeSingle();
        if (creator) wishlistRow = { ...wishlistRow, creator };
      } else if (!wishlistRow.creator && wishlistRow.id) {
        const { data: full } = await supabase
          .from('wishlists')
          .select(`
            id, title, description, slug, theme_color, cover_image,
            total_sats_goal, total_sats_raised, country, country_code, city,
            creator:profiles!wishlists_creator_id_fkey(username, avatar_url, lightning_address, nostr_pubkey, bio)
          `)
          .eq('id', wishlistRow.id as string)
          .maybeSingle();
        if (full) wishlistRow = full as Record<string, unknown>;
      }

      if (isCancelled()) return;
      const creatorId = wishlistRow.creator_id as string | undefined;
      const creator = wishlistRow.creator as Wishlist['creator'] | undefined;
      const dest = await fetchCreatorReceiveDestinations(creatorId, creator?.lightning_address);
      if (creator) {
        wishlistRow = { ...wishlistRow, creator: { ...creator, lightning_address: dest.lightning } };
      }
      if (isCancelled()) return;
      setWishlist(wishlistRow as unknown as Wishlist);
      if (!isCancelled()) setOnchainAddress(dest.onchain);

      const { data: itemsData, error: itemsError } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('wishlist_id', wishlistRow.id as string)
        .order('sort_order');

      if (itemsError) throw itemsError;
      if (!isCancelled()) {
        setItems(applyItemOrder((itemsData || []) as WishlistItem[], slug));
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      if (!isCancelled()) {
        toast(t('wishlist.notFound'), 'error');
        navigate('/explore', { replace: true });
      }
    } finally {
      if (!isCancelled()) setLoading(false);
    }
  }, [slug, navigate, t, toast]);

  useEffect(() => {
    const signal = { cancelled: false };
    setLoading(true);
    void loadWishlist(signal);
    return () => {
      signal.cancelled = true;
    };
  }, [loadWishlist]);

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
    if (!form.amount.trim() && !form.name.trim() && !form.message.trim()) {
      removeStorage(STORAGE_KEYS.giftDraft);
      return;
    }
    setStorage(STORAGE_KEYS.giftDraft, { slug, ...form });
  }

  function draftHasContent(draft: GiftDraft | null): boolean {
    return Boolean(draft && (draft.amount?.trim() || draft.name?.trim() || draft.message?.trim()));
  }

  function dismissDraftBanner() {
    removeStorage(STORAGE_KEYS.giftDraft);
    setShowDraftBanner(false);
  }

  function continueLastGift() {
    setSelectedItem(null);
    setShowDraftBanner(false);
    setShowGiftModal(true);
  }

  function clearGiftDraft() {
    removeStorage(STORAGE_KEYS.giftDraft);
    setShowDraftBanner(false);
  }

  async function buildPayment(
    amountSats: number,
    method: PaymentTab
  ): Promise<boolean> {
    if (!wishlist) return false;

    const lightningAddr = usablePaymentAddress(wishlist.creator?.lightning_address);
    const npubOrHex = wishlist.creator?.nostr_pubkey?.trim();
    const onchain = onchainAddress?.trim() || null;
    const hasLightning = Boolean(lightningAddr && !isDummyPaymentTarget(lightningAddr));
    const hasOnchain = Boolean(onchain && !isDummyPaymentTarget(onchain));

    if (!isDemoWishlist && !hasLightning && !hasOnchain && !(method === 'nostr' && npubOrHex)) {
      toast('This creator has no Lightning or on-chain address yet.', 'error');
      return false;
    }

    setZapError(null);
    setZapInvoice(null);
    setPaymentUri('');
    setPaymentQrUrl('');

    if (method === 'onchain') {
      if (!hasOnchain || !onchain) {
        toast('This creator has no on-chain address. Use Lightning or buy the product.', 'error');
        return false;
      }
      const uri = bitcoinQrData(onchain, amountSats);
      if (!uri) {
        toast('This creator has no on-chain address. Use Lightning or buy the product.', 'error');
        return false;
      }
      setMockInvoice(onchain);
      setPaymentUri(uri);
      setPaymentQrUrl(getQrImageUrl(uri, 280));
      setPaymentCountdown(180);
      return true;
    }

    if (method === 'nostr') {
      const lud16 =
        lightningAddr ||
        (npubOrHex
          ? await (async () => {
              try {
                const hex = nostrService.normalizePubkey(npubOrHex);
                return (await nostrService.getLightningAddress(hex)) || null;
              } catch {
                return null;
              }
            })()
          : null);

      if (!lud16) {
        toast('Creator has no Lightning address (lud16) for zaps. Use Lightning tab or buy product.', 'error');
        return false;
      }

      setZapBusy(true);
      try {
        let zapRequestJson: string | undefined;
        if (hasNip07() && npubOrHex) {
          try {
            const recipient = nostrService.normalizePubkey(npubOrHex);
            zapRequestJson = await nostrService.createZapRequest({
              recipientPubkey: recipient,
              amountSats,
              comment: giftForm.message || `KATOA gift for ${wishlist.title}`,
            });
          } catch (err) {
            toast(nip07UserMessage(err), 'error');
          }
        } else if (!hasNip07()) {
          toast('Optional: install Alby/nos2x for signed NIP-57 zaps. Fetching LN invoice…', 'info');
        }

        const inv = await nostrService.fetchZapInvoice({
          lud16,
          amountSats,
          comment: giftForm.message || undefined,
          zapRequestJson,
        });
        if (inv.error || !inv.bolt11) {
          toast(inv.error || 'Could not fetch zap invoice', 'error');
          setZapError(inv.error || 'No invoice');
          return false;
        }
        const bolt11Uri = lightningQrData(inv.bolt11);
        if (!bolt11Uri) {
          toast('Could not build a payable invoice', 'error');
          return false;
        }
        setZapInvoice(inv.bolt11);
        setMockInvoice(inv.bolt11);
        setPaymentUri(bolt11Uri);
        setPaymentQrUrl(getQrImageUrl(bolt11Uri, 280));
        setPaymentCountdown(180);
        toast(zapRequestJson ? 'Zap invoice ready (NIP-57)' : 'Lightning invoice ready', 'success');
        return true;
      } finally {
        setZapBusy(false);
      }
    }

    if (lightningAddr?.includes('@') && !isDummyPaymentTarget(lightningAddr)) {
      setZapBusy(true);
      try {
        const inv = await nostrService.fetchZapInvoice({
          lud16: lightningAddr,
          amountSats,
          comment: giftForm.message || undefined,
        });
        if (inv.bolt11) {
          const bolt11Uri = lightningQrData(inv.bolt11);
          if (!bolt11Uri) {
            toast('Could not build a payable invoice', 'error');
            return false;
          }
          setZapInvoice(inv.bolt11);
          setMockInvoice(inv.bolt11);
          setPaymentUri(bolt11Uri);
          setPaymentQrUrl(getQrImageUrl(bolt11Uri, 280));
          toast('Lightning invoice ready — pay in your wallet. Totals update after confirmation.', 'info');
        } else {
          const lnUri = lightningQrData(lightningAddr);
          if (!lnUri) {
            toast('This creator has no Lightning address. Try on-chain if available, or buy the product.', 'error');
            return false;
          }
          setMockInvoice(lightningAddr);
          setPaymentUri(lnUri);
          setPaymentQrUrl(getQrImageUrl(lnUri, 280));
          toast(inv.error || 'Could not fetch bolt11 — QR is the Lightning address, not an invoice.', 'info');
        }
      } finally {
        setZapBusy(false);
      }
    } else if (lightningAddr && !isDummyPaymentTarget(lightningAddr)) {
      const lnUri = lightningQrData(lightningAddr);
      if (!lnUri) {
        toast('This creator has no Lightning address. Try on-chain if available, or buy the product.', 'error');
        return false;
      }
      setMockInvoice(lightningAddr);
      setPaymentUri(lnUri);
      setPaymentQrUrl(getQrImageUrl(lnUri, 280));
    } else if (isDemoWishlist) {
      const demoRef = `demo:pending:${wishlist.id}:${amountSats}:${Date.now()}`;
      setMockInvoice(demoRef);
      setPaymentUri('');
      setPaymentQrUrl(getQrImageUrl(`Demo invoice — pay ${amountSats} sats to support ${wishlist.title}`, 280));
    } else {
      toast('This creator has no Lightning address. Try on-chain if available, or buy the product.', 'error');
      return false;
    }

    setPaymentCountdown(180);
    return true;
  }

  async function handleGiftSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (processing || !wishlist) return;

    const amountSats = Number.parseInt(giftForm.amount, 10);
    if (!Number.isFinite(amountSats) || amountSats <= 0) {
      toast(t('gift.invalidAmount'), 'error');
      return;
    }
    if (amountSats > 21_000_000 * 100_000_000) {
      toast('Amount exceeds maximum allowed', 'error');
      return;
    }

    const lightningAddr = wishlist.creator?.lightning_address?.trim() || '';
    const onchain = onchainAddress?.trim() || '';
    const hasLightning = Boolean(lightningAddr) && !isDummyPaymentTarget(lightningAddr);
    const hasOnchain = Boolean(onchain) && !isDummyPaymentTarget(onchain);
    const hasNostrKey = Boolean(wishlist.creator?.nostr_pubkey?.trim());
    if (!isDemoWishlist && !hasLightning && !hasOnchain && !(paymentTab === 'nostr' && hasNostrKey)) {
      toast('This creator has no Lightning or on-chain address yet.', 'error');
      return;
    }

    setProcessing(true);
    setGiftIntent({ amount: amountSats, method: paymentTab });

    try {
      const ok = await buildPayment(amountSats, paymentTab);
      if (!ok) return;
      persistGiftDraft(giftForm);
      setShowGiftModal(false);
      setShowGiftSuccess(false);
      setShowPaymentModal(true);
      if (!isDemoWishlist) {
        await recordGiftIntent(amountSats, paymentTab === 'onchain' ? 'onchain' : paymentTab === 'nostr' ? 'nostr' : 'lightning');
      }
    } catch (error) {
      console.error('Error processing gift:', error);
      toast(error instanceof Error ? error.message : 'Could not start gift', 'error');
    } finally {
      setProcessing(false);
    }
  }

  async function handleGenerateNew() {
    if (processing || !wishlist) return;
    const amountSats = giftIntent?.amount ?? Number.parseInt(giftForm.amount, 10);
    const method = giftIntent?.method ?? paymentTab;
    if (!Number.isFinite(amountSats) || amountSats <= 0) {
      toast(t('gift.invalidAmount'), 'error');
      return;
    }
    setProcessing(true);
    try {
      const ok = await buildPayment(amountSats, method);
      if (!ok) return;
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Could not generate payment', 'error');
    } finally {
      setProcessing(false);
    }
  }

  async function recordGiftIntent(amountSats: number, method: 'lightning' | 'onchain' | 'nostr') {
    if (!wishlist) return;
    const { error } = await supabase.from('transactions').insert({
      wishlist_id: wishlist.id,
      item_id: selectedItem?.id || null,
      contributor_name: (giftForm.name || 'Anonymous').slice(0, 120),
      amount_sats: amountSats,
      message: (giftForm.message || '').slice(0, 2000),
      payment_method: method,
      payment_hash: null,
      status: 'pending',
    });

    if (error) {
      console.warn('Could not record pending gift:', error.message);
      const msg = error.message?.toLowerCase() ?? '';
      if (msg.includes('row-level security') || msg.includes('permission') || msg.includes('policy')) {
        toast('Sign in to log your gift, or pay the address directly.', 'info');
      } else {
        toast(error.message || 'Could not record gift intent', 'error');
      }
    } else {
      toast('Gift intent recorded — complete payment in your wallet', 'info');
    }
  }

  function dismissPaymentModal(mode: 'paid' | 'later' | 'cancel') {
    setShowPaymentModal(false);
    setProcessing(false);
    if (mode === 'paid') {
      clearGiftDraft();
      setShowGiftSuccess(true);
      return;
    }
    setShowGiftSuccess(false);
    if (mode === 'later') {
      const draft = getStorage<GiftDraft | null>(STORAGE_KEYS.giftDraft, null);
      setShowDraftBanner(draftHasContent(draft) && draft?.slug === slug);
    }
    if (mode === 'cancel') {
      setZapInvoice(null);
      setPaymentUri('');
      const draft = getStorage<GiftDraft | null>(STORAGE_KEYS.giftDraft, null);
      setShowDraftBanner(draftHasContent(draft) && draft?.slug === slug);
    }
  }

  async function handleCopyInvoice(text: string) {
    await copyToClipboard(text);
    toast('Copied', 'success');
  }

  async function handleShareWishlist() {
    const url = `${window.location.origin}/wishlist/${slug}`;
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: wishlist?.title || 'KATOA wishlist', url });
        return;
      } catch {
        /* user cancelled */
      }
    }
    const result = await copyToClipboard(url);
    toast(result === 'success' ? 'Link copied' : 'Could not copy', result === 'success' ? 'success' : 'error');
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

  const resolvedBreadcrumbs: BreadcrumbItem[] = (() => {
    if (breadcrumbItems.length === 0) return [];
    const items = breadcrumbItems.map((item, i) =>
      i === breadcrumbItems.length - 1 && wishlist
        ? { ...item, label: wishlist.title }
        : item
    );
    const isVideoPage =
      wishlist?.card_style === 'creator' || Boolean(wishlist?.cover_video_url);
    if (isVideoPage && !items.some((item) => item.href === '/explore?videos=1')) {
      const exploreIdx = items.findIndex((item) => item.href === '/explore');
      const insertAt = exploreIdx >= 0 ? exploreIdx + 1 : items.length - 1;
      items.splice(insertAt, 0, {
        label: t('explore.videoCreators'),
        href: '/explore?videos=1',
      });
    }
    return items;
  })();

  const videoObjectSchema =
    wishlist?.cover_video_url
      ? {
          '@context': 'https://schema.org',
          '@type': 'VideoObject',
          name: wishlist.title,
          description: wishlist.description,
          thumbnailUrl: wishlist.cover_image ?? undefined,
          contentUrl: wishlist.cover_video_url,
        }
      : null;

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isOwner =
    Boolean(user && wishlist?.creator_id && user.id === wishlist.creator_id) ||
    Boolean(user && profile?.username && wishlist?.creator?.username === profile.username);

  const handleSubscribe = (tierId = 'supporter') => {
    if (!wishlist) return;
    subscribeLocal(wishlist.slug, tierId);
    setSubscribed(true);
    toast('Unlocks on this device until Lightning webhooks exist', 'info');
  };

  const isCreatorSurface = wishlist.card_style === 'creator';
  const creatorPosts = mockCreatorPosts[wishlist.slug] || [];
  const showSubscribe = isCreatorSurface || isDemoWishlist;
  const creatorInitial = (wishlist.creator.username?.[0] || '?').toUpperCase();
  const lightningAddr = wishlist.creator.lightning_address?.trim() || '';
  const hasLightning = Boolean(lightningAddr) && !isDummyPaymentTarget(lightningAddr);
  const hasOnchain = Boolean(onchainAddress?.trim()) && !isDummyPaymentTarget(onchainAddress || '');
  const hasNostrKey = Boolean(wishlist.creator.nostr_pubkey?.trim());
  const noPayDestinations = !isDemoWishlist && !hasLightning && !hasOnchain;
  const methodBlocked =
    !isDemoWishlist &&
    ((paymentTab === 'onchain' && !hasOnchain) ||
      (paymentTab === 'lightning' && !hasLightning) ||
      (paymentTab === 'nostr' && !hasLightning && !hasNostrKey));
  const submitBlocked = noPayDestinations || methodBlocked;
  const invoiceExpired = paymentCountdown === 0 && !isDemoWishlist && showPaymentModal;

  const handleUnsubscribe = () => {
    if (!wishlist) return;
    unsubscribe(wishlist.slug);
    setSubscribed(false);
    toast(t('creator.unsubscribed'), 'info');
  };

  async function handleOwnerImportProduct(product: ParsedProduct) {
    if (!wishlist) return;
    if (isDemoWishlist) {
      const id = `local-${Date.now()}`;
      setItems((prev) => [
        ...prev,
        {
          id,
          wishlist_id: wishlist.id,
          title: product.title,
          description: product.description,
          price_sats: product.price_sats || 21000,
          sats_raised: 0,
          image_url: product.image_url || null,
          video_url: null,
          merchant_link: product.product_url,
          is_funded: false,
          sort_order: prev.length + 1,
        },
      ]);
      toast('Demo item added locally (not saved to server)', 'success');
      return;
    }
    if (!user) {
      toast('Sign in to add products', 'error');
      return;
    }
    const { data: existing } = await supabase
      .from('wishlist_items')
      .select('sort_order')
      .eq('wishlist_id', wishlist.id)
      .order('sort_order', { ascending: false })
      .limit(1);
    const nextOrder = (existing?.[0]?.sort_order ?? 0) + 1;
    const { error } = await supabase.from('wishlist_items').insert({
      wishlist_id: wishlist.id,
      title: product.title.slice(0, 200),
      description: (product.description || '').slice(0, 2000),
      price_sats: product.price_sats || 21000,
      sats_raised: 0,
      image_url: product.image_url || null,
      video_url: null,
      merchant_link: product.product_url,
      is_funded: false,
      sort_order: nextOrder,
    });
    if (error) throw error;
    toast('Product added — fans can fund sats or buy it for you', 'success');
    // reload items
    const { data: itemsData } = await supabase
      .from('wishlist_items')
      .select('*')
      .eq('wishlist_id', wishlist.id)
      .order('sort_order');
    if (itemsData) setItems(applyItemOrder(itemsData as WishlistItem[], slug));
  }

  return (
    <div className="min-h-screen bg-charcoal-950 pb-24 md:pb-0" style={{ '--wishlist-accent': themeColor } as React.CSSProperties}>
      <PageMeta
        title={wishlist.title}
        description={wishlist.description?.slice(0, 160) || `Support ${wishlist.creator.username}'s wishlist with Bitcoin on KATOA.`}
        path={`/wishlist/${slug}`}
        image={wishlist.cover_image || undefined}
        ogVideo={wishlist.cover_video_url || undefined}
      />
      {videoObjectSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLdScript(videoObjectSchema) }}
        />
      )}
      {isDemoWishlist && (
        <div className="bg-bitcoin-orange-500/10 border-b border-bitcoin-orange-500/30 px-4 py-2.5 text-center text-sm text-bitcoin-orange-200 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-bitcoin-orange-500/20 border border-bitcoin-orange-500/40">
            Demo
          </span>
          <span>Sample wishlist for preview — payments auto-complete after 3s. Not a live creator account.</span>
        </div>
      )}
      {showDraftBanner && !showGiftModal && !showPaymentModal && !showGiftSuccess && (
        <div className="flex items-center justify-center gap-3 px-4 py-1.5 text-sm text-gray-400 border-b border-white/10 bg-white/[0.03]">
          <button
            type="button"
            onClick={continueLastGift}
            className="hover:text-white transition-colors min-h-[36px]"
          >
            Continue last gift
          </button>
          <button
            type="button"
            onClick={dismissDraftBanner}
            className="p-1.5 rounded-md text-gray-500 hover:text-white min-h-[36px] min-w-[36px] inline-flex items-center justify-center"
            aria-label="Dismiss draft"
          >
            <X size={14} />
          </button>
        </div>
      )}
      <header className="relative">
        <div className="relative h-52 sm:h-72 lg:h-[22rem] overflow-hidden">
          <MediaCard
            className="!aspect-auto h-full w-full"
            media={{
              imageUrl: wishlist.cover_image,
              videoUrl: wishlist.cover_video_url,
              alt: wishlist.title,
            }}
            aspect="wide"
            variant="default"
            autoplayOnHover={Boolean(wishlist.cover_video_url)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/40 to-black/25 pointer-events-none" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {resolvedBreadcrumbs.length > 0 && (
          <Breadcrumbs items={resolvedBreadcrumbs} className="pt-4 mb-2" />
        )}

        <Card variant="glass" className="relative z-10 -mt-16 sm:-mt-24 p-5 sm:p-7 mb-10">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {wishlist.creator.avatar_url ? (
                <img
                  src={wishlist.creator.avatar_url}
                  alt=""
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-white/15 shrink-0"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-bitcoin-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-2xl shrink-0 border border-white/10">
                  {creatorInitial}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <VisibilityBadge
                    visibility={isDemoWishlist ? 'public' : wishlist.visibility || 'public'}
                  />
                  {wishlist.country_flag && (
                    <span
                      className="text-xl"
                      title={wishlist.country}
                      aria-label={
                        wishlist.country
                          ? t('wishlist.countryFlag').replace('${country}', wishlist.country)
                          : t('wishlist.countryFlagGeneric')
                      }
                    >
                      {wishlist.country_flag}
                    </span>
                  )}
                </div>
                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                  {wishlist.title}
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  <Link
                    href={`/u/${wishlist.creator.username}`}
                    className="hover:text-bitcoin-orange-400 transition-colors"
                  >
                    @{wishlist.creator.username}
                  </Link>
                  {wishlist.country ? ` · ${wishlist.city ? `${wishlist.city}, ` : ''}${wishlist.country}` : ''}
                </p>
                {wishlist.description && (
                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed mt-3 max-w-2xl">
                    {wishlist.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <ShareButton
                url={`/wishlist/${wishlist.slug}`}
                title={wishlist.title}
                description={wishlist.description}
              />
              <Button variant="bitcoin" onClick={() => handleGiftClick()} className="min-h-[44px]">
                <Gift size={18} className="mr-2" />
                {t('wishlist.sendGift')}
              </Button>
            </div>
          </div>

          {wishlist.total_sats_goal > 0 && (
            <div className="mt-6 pt-5 border-t border-white/10">
              <ProgressBar
                current={wishlist.total_sats_raised}
                goal={wishlist.total_sats_goal}
                height="lg"
                gradient="from-bitcoin-orange-500 to-amber-400"
              />
            </div>
          )}
        </Card>

        {subscribed && (
          <ManageSubscriptionPanel
            creatorSlug={wishlist.slug}
            onUnsubscribe={handleUnsubscribe}
            t={t}
          />
        )}

        {creatorPosts.length > 0 && (
          <CreatorPostFeed
            creatorName={wishlist.creator.username}
            subscriberCount={wishlist.subscriber_count}
            posts={creatorPosts}
            subscribed={subscribed}
            onSubscribe={() => handleSubscribe()}
            onTip={() => handleGiftClick()}
            t={t}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-14">
          <div className="lg:col-span-8 space-y-8">
            <Card variant="glass" className="p-5 sm:p-7" title="Creator information">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-bitcoin-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {creatorInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/u/${wishlist.creator.username}`} className="text-white font-bold text-lg leading-tight hover:text-bitcoin-orange-300 transition-colors">
                    {wishlist.creator.username}
                  </Link>
                  {wishlist.creator.lightning_address && (
                    <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-1 truncate">
                      <Zap size={14} className="text-bitcoin-orange-400 shrink-0" />
                      {wishlist.creator.lightning_address}
                    </p>
                  )}
                </div>
              </div>
              {wishlist.creator.nostr_pubkey && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                  <ZapTotals pubkey={wishlist.creator.nostr_pubkey} />
                  <Link
                    href={`/messages?to=${encodeURIComponent(wishlist.creator.nostr_pubkey)}`}
                    className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3 rounded-full border border-neon-cyan-500/25 bg-neon-cyan-500/10 text-xs font-semibold text-neon-cyan-200 hover:bg-neon-cyan-500/15"
                  >
                    <MessageCircle size={14} />
                    Message (optional DM)
                  </Link>
                </div>
              )}
              {wishlist.creator.bio && (
                <p className="text-gray-300 leading-relaxed border-t border-white/10 pt-4 text-sm sm:text-base">
                  {wishlist.creator.bio}
                </p>
              )}
            </Card>

            {wishlist.full_story && (
              <Card variant="glass" className="p-5 sm:p-7" title="Project story">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 bg-bitcoin-orange-500/15 rounded-xl">
                    <Heart size={20} className="text-bitcoin-orange-400" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-white">Our story</h2>
                </div>
                <div className="text-gray-300 whitespace-pre-line leading-relaxed text-sm sm:text-base">
                  {wishlist.full_story}
                </div>
              </Card>
            )}
          </div>

          <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-24 lg:self-start">
            {wishlist.total_sats_goal > 0 && (
              <Card variant="glass" className="p-5 sm:p-6" title="Funding progress">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-emerald-500/15 rounded-xl">
                    <TrendingUp size={20} className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Progress</h3>
                    <p className="text-gray-500 text-xs">Community support</p>
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
                      className="wishlist-jewel-progress h-full transition-all duration-500"
                      style={{ width: `${Math.min(totalProgress, 100)}%` }}
                      data-tip={`${totalProgress.toFixed(0)}% funded — ${formatSats(wishlist.total_sats_raised)} of ${formatSats(wishlist.total_sats_goal)} sats. Every zap lands straight in the creator's non-custodial wallet. Katoa takes 0%.`}
                    />
                  </div>
                  <p className="text-gray-400 font-medium">
                    of {formatSats(wishlist.total_sats_goal)} sats goal
                  </p>
                </div>
              </Card>
            )}

            <MilestoneBanner percent={totalProgress} />

            <ActivityFeed
              items={
                isDemoWishlist
                  ? [
                      { id: 'a1', label: 'Anonymous gifter', amountSats: 21000, ago: '2h ago', isDemo: true },
                      { id: 'a2', label: 'Nostr supporter', amountSats: 5000, ago: '1d ago', isDemo: true },
                      { id: 'a3', label: 'Community member', amountSats: 10000, ago: '3d ago', isDemo: true },
                    ]
                  : []
              }
            />

            {(isOwner || isDemoWishlist) && (
              <div className="space-y-3">
                <ProductUrlImport compact onImport={handleOwnerImportProduct} />
                <NostrPublishWishlist
                  title={wishlist.title}
                  description={wishlist.description || ''}
                  slug={wishlist.slug}
                  items={items.map((i) => ({
                    title: i.title,
                    price_sats: i.price_sats,
                    description: i.description || '',
                  }))}
                />
              </div>
            )}

            <TipMenu
              onSelect={(sats) => {
                setGiftForm((prev) => ({ ...prev, amount: String(sats) }));
                setAmountPreset(
                  SAT_PRESETS.some((p) => p.value === sats) ? sats : 'custom'
                );
                handleGiftClick();
              }}
            />

            <Card variant="glass" className="p-5 space-y-3">
              <TrustProofStrip compact />
              <Button
                variant="bitcoin"
                className="w-full font-black text-lg py-4 min-h-[52px] wishlist-jewel-ring"
                onClick={() => handleGiftClick()}
                title="Support this wishlist with Bitcoin"
              >
                <Gift size={20} className="mr-2" />
                {t('wishlist.sendGift')}
              </Button>
              {onchainAddress ? (
                <Button
                  variant="outline"
                  className="w-full min-h-[44px]"
                  onClick={() => {
                    setQrAddress(onchainAddress);
                    setQrAmount(undefined);
                    setShowQRModal(true);
                  }}
                  title="View Bitcoin QR code"
                >
                  <QrCode size={18} className="mr-2" />
                  Show QR Code
                </Button>
              ) : (
                <p className="text-[11px] text-center text-gray-500">
                  No on-chain address published — Lightning QR appears after you continue to pay.
                </p>
              )}
              <EmbedSnippet path={`/wishlist/${wishlist.slug}`} title={`Support ${wishlist.title}`} />
              <details className="pt-1">
                <summary className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 cursor-pointer">
                  Theme color
                </summary>
                <div className="flex flex-wrap gap-2 mt-3">
                  {THEME_PRESETS.map((preset) => (
                    <button
                      key={preset.color}
                      type="button"
                      onClick={() => handleThemeChange(preset.color)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 touch-manipulation ${
                        themeColor === preset.color ? 'border-white scale-110' : 'border-white/20'
                      }`}
                      style={{ backgroundColor: preset.color }}
                      aria-label={`${preset.label} theme`}
                      aria-pressed={themeColor === preset.color}
                    />
                  ))}
                </div>
              </details>
            </Card>
          </aside>
        </div>

        {showSubscribe && (
          <div className="mb-14 py-10 px-4 sm:px-6 lg:px-8 -mx-4 sm:-mx-6 lg:-mx-8 rounded-3xl border border-white/10 bg-white/[0.02]">
            <SubscriptionTiers
              creatorName={wishlist.creator.username}
              onSubscribe={(tierId) => handleSubscribe(tierId)}
            />
          </div>
        )}

        <div className="space-y-8 pb-20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-bitcoin-orange-500/15 rounded-xl">
              <Package size={22} className="text-bitcoin-orange-400" />
            </div>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">Wishlist items</h2>
              <p className="text-gray-400 text-sm">{t('wishlist.supportItems')}</p>
            </div>
          </div>

          {items.length === 0 ? (
            <Card variant="glass" className="p-12 sm:p-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-bitcoin-orange-500/15 border border-bitcoin-orange-500/25 rounded-2xl mb-5">
                <Gift size={28} className="text-bitcoin-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No items yet</h3>
              <p className="text-gray-400">Check back soon for specific items you can support.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {items.map((item) => {
                const itemProgress = (item.sats_raised / item.price_sats) * 100;

                return (
                  <Card
                    key={item.id}
                    className={`overflow-hidden hover:border-bitcoin-orange-500/40 transition-all duration-300 ${item.is_funded ? 'ring-2 ring-emerald-500/40' : ''}`}
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
                    <div className="p-5 sm:p-6 space-y-4">
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
                            className={`h-full ${item.is_funded ? 'bg-gradient-to-r from-emerald-500 to-cyan-600' : 'wishlist-jewel-progress'} transition-all duration-500`}
                            style={{ width: `${Math.min(itemProgress, 100)}%` }}
                            data-tip={item.is_funded ? "Fully funded — thank you!" : `${itemProgress.toFixed(0)}% of ${formatSats(item.price_sats)} sats funded. Supporters zap directly to the creator's wallet — no middleman, 0% fee.`}
                          />
                        </div>
                        <p className="text-gray-300 font-medium text-sm">
                          {formatSats(item.sats_raised)} / {formatSats(item.price_sats)} sats
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 pt-2">
                        <div className="flex gap-2 sm:gap-3">
                          <Button
                            className={`flex-1 font-bold text-base sm:text-lg py-4 min-h-[52px] ${item.is_funded ? 'bg-gradient-to-r from-emerald-500 to-cyan-600 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-[0_0_20px_rgba(255,135,0,0.3)]'}`}
                            onClick={() => handleGiftClick(item)}
                            disabled={item.is_funded}
                            title={item.is_funded ? "This item is fully funded" : "Support this item with sats"}
                          >
                            {item.is_funded ? (
                              <>
                                <Check size={20} className="mr-2 shrink-0" />
                                Fully Funded
                              </>
                            ) : (
                              <>
                                <Zap size={20} className="mr-2 shrink-0" />
                                Fund with sats
                              </>
                            )}
                          </Button>
                          {!item.is_funded && (
                            <Tooltip
                              position="bottom"
                              content="A zap is a Bitcoin payment sent over Lightning — near-instant, near-zero fee, straight into the creator's wallet. No account, no sign-up, no third party holding your sats (non-custodial). Katoa takes 0%."
                            >
                              <span className="self-center inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-amber-500/25 bg-amber-500/10 text-[10px] text-amber-200/90 font-semibold cursor-help touch-manipulation min-h-[28px]">
                                <BadgeCheck size={12} className="text-amber-300 shrink-0" aria-hidden />
                                0% fee · non-custodial
                              </span>
                            </Tooltip>
                          )}
                        </div>
                        {item.merchant_link && (
                          <a
                            href={item.merchant_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 w-full min-h-[48px] px-4 rounded-xl border border-neon-cyan-500/35 bg-neon-cyan-500/10 text-neon-cyan-300 font-bold text-sm hover:bg-neon-cyan-500/15 transition-colors touch-manipulation"
                          >
                            <ShoppingBag size={18} className="shrink-0" />
                            {buyLabel(
                              (() => {
                                try {
                                  const h = new URL(item.merchant_link!).hostname.replace(/^www\./, '');
                                  if (h.includes('amazon')) return 'Amazon';
                                  if (h.includes('etsy')) return 'Etsy';
                                  if (h.includes('nike')) return 'Nike';
                                  if (h.includes('adidas')) return 'Adidas';
                                  if (h.includes('zappos')) return 'Zappos';
                                  if (h.includes('walmart')) return 'Walmart';
                                  if (h.includes('target')) return 'Target';
                                  if (h.includes('ebay')) return 'eBay';
                                  if (h.includes('shopify') || h.includes('myshopify')) return 'Store';
                                  return h.split('.')[0];
                                } catch {
                                  return undefined;
                                }
                              })()
                            )}
                            <ExternalLink size={14} className="opacity-70" />
                          </a>
                        )}
                        <p className="text-[11px] text-center text-gray-500 leading-snug">
                          {item.merchant_link
                            ? 'Send sats here, or buy this product and ship it to the creator.'
                            : 'Fund this goal in Bitcoin sats.'}
                        </p>
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
        onClose={() => {
          setShowGiftModal(false);
          const draft = getStorage<GiftDraft | null>(STORAGE_KEYS.giftDraft, null);
          setShowDraftBanner(draftHasContent(draft) && draft?.slug === slug);
        }}
        title={selectedItem ? `Fund ${selectedItem.title}` : 'Send a Gift'}
      >
        <form onSubmit={handleGiftSubmit} className="space-y-4">
          {selectedItem?.merchant_link && (
            <a
              href={selectedItem.merchant_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl border border-neon-cyan-500/30 bg-neon-cyan-500/10 min-h-[52px] touch-manipulation"
            >
              <ShoppingBag size={20} className="text-neon-cyan-400 shrink-0" />
              <div className="min-w-0 flex-1 text-left">
                <p className="text-sm font-bold text-white">Buy this product for them</p>
                <p className="text-[11px] text-gray-400 truncate">{selectedItem.merchant_link}</p>
              </div>
              <ExternalLink size={16} className="text-neon-cyan-400 shrink-0" />
            </a>
          )}
          <PaymentMethodTabs value={paymentTab} onChange={setPaymentTab} />
          {paymentTab === 'nostr' && (
            <p className="text-xs text-gray-400 leading-relaxed">
              Nostr Zap (NIP-57): signs a zap request with your extension when available, then fetches a Lightning
              invoice from the creator’s lud16. No private keys leave your browser.
            </p>
          )}
          {paymentTab === 'lightning' && (
            <p className="text-xs text-gray-400 leading-relaxed">
              If this creator has a Lightning address, we fetch a bolt11 invoice so the QR is payable — not a
              lightning:email string.
            </p>
          )}
          {paymentTab === 'onchain' && (
            <p className="text-xs text-gray-400 leading-relaxed">
              {onchainAddress
                ? 'BIP-21 bitcoin: URI with amount. Funding still waits for on-chain confirmation — this page will not bump totals.'
                : 'This creator has not published an on-chain address. Use Lightning or buy the product.'}
            </p>
          )}
          {zapError && (
            <p className="text-sm text-amber-400" role="alert">
              {zapError}
            </p>
          )}
          {noPayDestinations && (
            <p className="text-sm text-amber-300" role="alert">
              This creator has no Lightning or on-chain address yet.
              {selectedItem?.merchant_link ? ' You can still buy the product for them.' : ''}
            </p>
          )}
          <div id="payment-method-panel" role="tabpanel" aria-labelledby={`payment-tab-${paymentTab}`}>
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
              inputMode="numeric"
              min={1}
              step={1}
              value={giftForm.amount}
              onChange={(e) => {
                setAmountPreset('custom');
                const next = { ...giftForm, amount: e.target.value };
                setGiftForm(next);
                persistGiftDraft(next);
              }}
              placeholder={t('wishlist.placeholder.amount')}
              required
              aria-label="Custom amount in sats"
            />
          </div>
          <Input
            label="Your Name (optional)"
            type="text"
            value={giftForm.name}
            autoComplete="name"
            onChange={(e) => {
              const next = { ...giftForm, name: e.target.value };
              setGiftForm(next);
              persistGiftDraft(next);
            }}
            placeholder={t('wishlist.placeholder.name')}
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
              maxLength={2000}
              placeholder={t('wishlist.placeholder.message')}
            />
          </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 font-bold text-lg py-4 shadow-[0_0_20px_rgba(255,135,0,0.3)]"
            loading={processing || zapBusy}
            disabled={processing || zapBusy || submitBlocked}
          >
            <Bitcoin size={20} className="mr-2" />
            {paymentTab === 'nostr'
              ? 'Request Zap Invoice'
              : paymentTab === 'onchain'
                ? 'Show on-chain QR'
                : 'Continue to Pay'}
          </Button>
        </form>
      </Modal>

      <Modal
        isOpen={showPaymentModal}
        onClose={() => dismissPaymentModal('cancel')}
        title={giftIntent?.method === 'onchain' ? 'Pay on-chain' : 'Pay with Lightning'}
      >
        <div className="space-y-5">
          {isDemoWishlist && (
            <div className="rounded-xl border border-bitcoin-orange-500/30 bg-bitcoin-orange-500/10 p-3" role="status">
              <div className="flex items-center gap-2 text-bitcoin-orange-300 text-sm font-semibold mb-2">
                <Loader2 size={16} className={demoAutoProgress < 100 ? 'animate-spin' : ''} />
                Demo gift auto-completing…
                <DemoBadge label="Demo" />
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-bitcoin-orange-500 to-amber-400 transition-all duration-100"
                  style={{ width: `${demoAutoProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-2">
                Preview only — no real payment. Live wishlists use your wallet.
              </p>
            </div>
          )}

          <div className={`bg-white p-3 sm:p-4 rounded-xl mx-auto w-full max-w-[min(100%,280px)] ${invoiceExpired ? 'opacity-40' : ''}`}>
            {paymentQrUrl ? (
              <img
                src={paymentQrUrl}
                alt={giftIntent?.method === 'onchain' ? 'Bitcoin payment QR' : 'Lightning invoice QR code'}
                className="w-full aspect-square"
              />
            ) : (
              <div className="w-full aspect-square bg-gray-200 animate-pulse rounded-lg" aria-hidden />
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              {giftIntent?.method === 'onchain'
                ? 'Bitcoin address (BIP-21)'
                : zapInvoice && isBolt11Invoice(zapInvoice)
                  ? 'Lightning invoice (bolt11)'
                  : wishlist?.creator?.lightning_address
                    ? 'Lightning address'
                    : 'Payment reference'}
            </label>
            <div className="flex gap-2">
              <input
                value={paymentUri || mockInvoice}
                readOnly
                className="flex-1 min-w-0 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-mono min-h-[48px]"
                aria-label="Payment URI or reference"
              />
              <Button
                variant="outline"
                onClick={() => handleCopyInvoice(paymentUri || mockInvoice)}
                aria-label="Copy payment details"
                className="min-h-[48px] min-w-[48px]"
              >
                <Copy size={18} />
              </Button>
            </div>
          </div>

          {paymentUri && !isDemoWishlist && !invoiceExpired && <WalletDeepLinks paymentUri={paymentUri} />}

          {selectedItem?.merchant_link && (
            <a
              href={selectedItem.merchant_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full min-h-[48px] rounded-xl border border-neon-cyan-500/35 bg-neon-cyan-500/10 text-neon-cyan-300 font-bold text-sm touch-manipulation"
            >
              <ShoppingBag size={18} />
              Prefer to buy the product instead?
            </a>
          )}

          <div className="flex items-center justify-center gap-3 text-bitcoin-orange-500" role="status" aria-live="polite">
            <span className="font-mono text-sm text-gray-400 tabular-nums">
              Session {formatCountdown(paymentCountdown)}
            </span>
          </div>

          {!invoiceExpired && (
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              {isDemoWishlist
                ? 'Demo mode simulates a gift. Real pages never mark funded from the browser alone.'
                : 'Pay from your wallet. Funding totals update only after payment is confirmed on the server — this page will not bump sats raised.'}
            </p>
          )}

          <div className="flex flex-col gap-2">
            {invoiceExpired ? (
              <Button
                type="button"
                variant="bitcoin"
                className="w-full min-h-[48px]"
                onClick={() => void handleGenerateNew()}
                loading={processing || zapBusy}
                disabled={processing || zapBusy}
              >
                Generate new
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="bitcoin"
                  className="w-full min-h-[48px]"
                  onClick={() => dismissPaymentModal('paid')}
                  disabled={invoiceExpired}
                >
                  I paid (waiting)
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full min-h-[48px]"
                  onClick={() => dismissPaymentModal('later')}
                >
                  I&apos;ll pay later
                </Button>
              </>
            )}
            <Button
              type="button"
              variant="ghost"
              className="w-full min-h-[44px]"
              onClick={() => dismissPaymentModal('cancel')}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showGiftSuccess}
        onClose={() => {
          clearGiftDraft();
          setShowGiftSuccess(false);
        }}
        title="Thank you"
      >
        <GiftSuccess
          onClose={() => {
            clearGiftDraft();
            setShowGiftSuccess(false);
          }}
          onShare={() => void handleShareWishlist()}
          amountSats={giftIntent?.amount}
          method={giftIntent?.method}
          status={isDemoWishlist ? 'demo' : 'pending'}
          buyUrl={selectedItem?.merchant_link}
          buyLabel={
            selectedItem?.merchant_link?.includes('amazon')
              ? 'Still want to buy on Amazon?'
              : 'Buy this product for them'
          }
          message={
            isDemoWishlist
              ? 'Demo gift complete. Not a live settlement. Try “Buy product” on an item with a merchant link — or fund with sats again.'
              : 'If you paid in your wallet, confirmed sats appear after the server records them. This page does not mark the list funded.'
          }
        />
      </Modal>

      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        address={qrAddress}
        amount={qrAmount}
        title={wishlist ? `Send to ${wishlist.title}` : 'Send Bitcoin'}
      />

      {!showGiftModal && !showPaymentModal && !showGiftSuccess && (
        <MobileStickyCta>
          <Button
            className="w-full bg-gradient-to-r from-bitcoin-orange-500 to-amber-600 font-bold min-h-[48px] text-sm"
            onClick={() => handleGiftClick()}
          >
            <Gift size={18} className="mr-1.5 shrink-0" />
            {t('wishlist.sendGift')}
          </Button>
        </MobileStickyCta>
      )}
    </div>
  );
}
