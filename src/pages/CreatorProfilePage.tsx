import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Copy, Gift, MapPin, MessageCircle, Package, Play, QrCode, User, UserPlus, UserCheck, Zap } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { PageMeta } from '../components/PageMeta';
import { ShareButton } from '../components/ShareButton';
import { MediaCard } from '../components/MediaCard';
import { SatsDisplay } from '../components/SatsDisplay';
import { ProgressBar } from '../components/ProgressBar';
import { Link } from '../components/Link';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { TipMenu } from '../components/TipMenu';
import { CreatorPostFeed } from '../components/CreatorPostFeed';
import { ManageSubscriptionPanel } from '../components/ManageSubscriptionPanel';
import { SubscriptionTiers } from '../components/SubscriptionTiers';
import { DonateQRModal } from '../components/DonateQRModal';
import { ZapTotals } from '../components/ZapTotals';
import { DemoBadge } from '../components/DemoBadge';
import { MobileStickyCta } from '../components/MobileStickyCta';
import { WalletDeepLinks } from '../components/WalletDeepLinks';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { mockCreatorPosts, type CreatorPost } from '../data/mockCreatorPosts';
import {
  loadCreatorProfile,
  type CreatorProfile,
  type ProfileWishlist,
} from '../lib/creatorProfile';
import { isSubscribed, subscribeLocal, unsubscribe } from '../lib/subscriptions';
import { followLocal, isFollowing, unfollowLocal } from '../lib/follows';
import { toJsonLdScript } from '../lib/jsonLd';
import { copyToClipboard } from '../lib/clipboard';
import { formatCompactCount, formatNumber } from '../lib/i18nFormat';
import { bitcoinQrData, getQrImageUrl, lightningQrData } from '../lib/qr';
import { nostrService } from '../lib/nostr';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const SITE_URL = (import.meta.env.VITE_SITE_URL ?? 'https://katoa.org').replace(/\/$/, '');

function decodeUsername(raw: string | undefined): string {
  if (!raw) return '';
  try {
    return decodeURIComponent(raw).trim();
  } catch {
    return raw.trim();
  }
}

function locationLabel(wishlists: ProfileWishlist[]): string | null {
  const withPlace = wishlists.find((w) => w.city || w.country);
  if (!withPlace) return null;
  if (withPlace.city && withPlace.country) return `${withPlace.city}, ${withPlace.country}`;
  return withPlace.city || withPlace.country || null;
}

function subscriptionKeys(profile: CreatorProfile): string[] {
  return [profile.username, ...profile.wishlists.map((w) => w.slug)];
}

function isProfileSubscribed(profile: CreatorProfile): boolean {
  return subscriptionKeys(profile).some((key) => isSubscribed(key));
}

function displayNpub(pubkey: string | null | undefined): string | null {
  const v = pubkey?.trim();
  if (!v) return null;
  if (v.startsWith('npub1')) return v;
  try {
    return nostrService.encodeNpub(v);
  } catch {
    return v;
  }
}

export function CreatorProfilePage() {
  const { username: rawUsername } = useParams();
  const username = decodeUsername(rawUsername);
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user, isDemoUser } = useAuth();
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [following, setFollowing] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [showDonateQr, setShowDonateQr] = useState(false);
  const [showIdentityQr, setShowIdentityQr] = useState<'lightning' | 'onchain' | null>(null);
  const [tipInvoice, setTipInvoice] = useState<string | null>(null);
  const [tipQrUrl, setTipQrUrl] = useState('');
  const [tipSats, setTipSats] = useState<number | null>(null);
  const [tipBusy, setTipBusy] = useState(false);

  const loadProfile = useCallback(
    async (signal?: { cancelled: boolean }) => {
      const isCancelled = () => signal?.cancelled === true;
      if (!username) {
        if (!isCancelled()) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      const loaded = await loadCreatorProfile(username);
      if (!isCancelled()) {
        setProfile(loaded);
        setLoading(false);
      }
    },
    [username]
  );

  useEffect(() => {
    const signal = { cancelled: false };
    setLoading(true);
    setProfile(null);
    void loadProfile(signal);
    return () => {
      signal.cancelled = true;
    };
  }, [loadProfile]);

  useEffect(() => {
    if (!profile) {
      setSubscribed(false);
      setFollowing(false);
      return;
    }
    setSubscribed(isProfileSubscribed(profile));
    setFollowing(isFollowing(profile.username));
  }, [profile]);

  const posts: CreatorPost[] = useMemo(() => {
    if (!profile) return [];
    return profile.wishlists.flatMap((w) => mockCreatorPosts[w.slug] || []);
  }, [profile]);

  const cover = useMemo(() => {
    if (!profile) return { imageUrl: null as string | null, videoUrl: null as string | null };
    const withVideo = profile.wishlists.find((w) => w.cover_video_url);
    const withImage = profile.wishlists.find((w) => w.cover_image);
    return {
      imageUrl: profile.banner_url || withVideo?.cover_image || withImage?.cover_image || null,
      videoUrl: withVideo?.cover_video_url || null,
    };
  }, [profile]);

  const satsRaised = profile?.wishlists.reduce((sum, w) => sum + (w.total_sats_raised || 0), 0) ?? 0;
  const subscriberCount = profile
    ? profile.wishlists.reduce<number | undefined>((max, w) => {
        if (typeof w.subscriber_count !== 'number') return max;
        return max === undefined ? w.subscriber_count : Math.max(max, w.subscriber_count);
      }, undefined)
    : undefined;
  const place = profile ? locationLabel(profile.wishlists) : null;
  const flag = profile?.wishlists.find((w) => w.country_flag)?.country_flag;
  const country = profile?.wishlists.find((w) => w.country)?.country;
  const creatorInitial = (profile?.username?.[0] || '?').toUpperCase();
  const path = username ? `/u/${encodeURIComponent(profile?.username || username)}` : '/explore';
  const npub = displayNpub(profile?.nostr_pubkey);
  const lightning = profile?.lightning_address?.trim() || null;
  const onchain = profile?.bitcoin_address?.trim() || null;
  const messageHref = `/messages?to=${encodeURIComponent(npub || profile?.username || '')}`;

  const handleSubscribe = (tierId = 'supporter') => {
    if (!profile) return;
    for (const key of subscriptionKeys(profile)) {
      subscribeLocal(key, tierId);
    }
    setSubscribed(true);
    toast('Unlocks on this device until Lightning webhooks exist', 'info');
  };

  const handleUnsubscribe = () => {
    if (!profile) return;
    for (const key of subscriptionKeys(profile)) {
      unsubscribe(key);
    }
    setSubscribed(false);
    toast(t('creator.unsubscribed'), 'info');
  };

  const handleFollow = async () => {
    if (!profile) return;
    if (following) {
      unfollowLocal(profile.username);
      setFollowing(false);
      if (user && profile.id && isSupabaseConfigured() && !isDemoUser) {
        void supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', profile.id);
      }
      toast('Unfollowed on this device', 'info');
      return;
    }
    followLocal(profile.username);
    setFollowing(true);
    if (user && profile.id && isSupabaseConfigured() && !isDemoUser) {
      const { error } = await supabase.from('follows').insert({
        follower_id: user.id,
        following_id: profile.id,
      });
      if (error) {
        /* local follow still stands — do not pretend kind-3 */
      }
    }
    toast('Following on this device — not a Nostr kind-3 follow', 'success');
  };

  const handleCopy = async (value: string, label: string) => {
    const result = await copyToClipboard(value);
    toast(result === 'success' ? `${label} copied` : 'Could not copy', result === 'success' ? 'success' : 'error');
  };

  const resetTip = () => {
    setShowTip(false);
    setTipInvoice(null);
    setTipQrUrl('');
    setTipSats(null);
    setTipBusy(false);
  };

  const handleTip = async (sats: number) => {
    if (!profile) return;
    setTipSats(sats);
    setTipInvoice(null);
    setTipQrUrl('');
    const ln = lightning;
    if (ln?.includes('@')) {
      setTipBusy(true);
      try {
        const inv = await nostrService.fetchZapInvoice({
          lud16: ln,
          amountSats: sats,
          comment: `KATOA tip for @${profile.username}`,
        });
        if (inv.bolt11) {
          setTipInvoice(inv.bolt11);
          setTipQrUrl(getQrImageUrl(lightningQrData(inv.bolt11), 280));
          toast('Lightning invoice ready — pay in your wallet. This page does not settle.', 'info');
          return;
        }
        toast(inv.error || 'Could not fetch invoice — copy the Lightning address instead.', 'info');
      } finally {
        setTipBusy(false);
      }
    }
    if (ln) {
      setTipQrUrl(getQrImageUrl(lightningQrData(ln), 280));
      void handleCopy(ln, 'Lightning address');
      return;
    }
    if (onchain) {
      setShowTip(false);
      setShowDonateQr(true);
      return;
    }
    toast('No Lightning or on-chain address on this profile yet.', 'info');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal-950 flex items-center justify-center">
        <div className="text-center" role="status" aria-busy="true">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-bitcoin-orange-500 border-t-transparent mx-auto mb-4" />
          <p className="text-white text-xl font-bold">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-charcoal-950 pt-24 pb-20">
        <PageMeta
          title={t('creator.profileNotFound')}
          description={t('creator.profileNotFoundDesc')}
          path={username ? `/u/${encodeURIComponent(username)}` : '/explore'}
          noindex
        />
        <EmptyState
          icon={<User size={32} />}
          title={t('creator.profileNotFound')}
          description={
            username
              ? `No public profile for @${username}. Browse live creators instead.`
              : t('creator.profileNotFoundDesc')
          }
          actionLabel={t('creator.exploreCreators')}
          actionHref="/explore"
        />
      </div>
    );
  }

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.username,
    url: `${SITE_URL}${path}`,
    description: profile.bio || `Bitcoin creator @${profile.username} on KATOA.`,
    ...(cover.imageUrl ? { image: cover.imageUrl.startsWith('http') ? cover.imageUrl : `${SITE_URL}${cover.imageUrl}` } : {}),
    ...(lightning ? { identifier: lightning } : {}),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Explore', item: `${SITE_URL}/explore` },
      { '@type': 'ListItem', position: 3, name: `@${profile.username}`, item: `${SITE_URL}${path}` },
    ],
  };

  const identityQrValue =
    showIdentityQr === 'lightning' && lightning
      ? lightningQrData(lightning)
      : showIdentityQr === 'onchain' && onchain
        ? bitcoinQrData(onchain)
        : '';

  return (
    <div className="min-h-screen bg-charcoal-950 pb-28 md:pb-0">
      <PageMeta
        title={`@${profile.username}`}
        description={
          profile.bio?.slice(0, 160) ||
          `Support @${profile.username} with Bitcoin Lightning on KATOA — 0% platform fees.`
        }
        path={path}
        image={cover.imageUrl || undefined}
        ogVideo={cover.videoUrl || undefined}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLdScript(personSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLdScript(breadcrumbSchema) }} />

      {profile.fromMock && (
        <div className="bg-bitcoin-orange-500/10 border-b border-bitcoin-orange-500/30 px-4 py-2.5 text-center text-sm text-bitcoin-orange-200">
          Sample creator profile — subscribe and tips are a local demo seam, not a live settlement.
        </div>
      )}

      <header className="relative">
        <div className="relative h-52 sm:h-72 lg:h-[22rem] overflow-hidden">
          <MediaCard
            className="!aspect-auto h-full w-full"
            media={{
              imageUrl: cover.imageUrl,
              videoUrl: cover.videoUrl,
              alt: `@${profile.username}`,
            }}
            aspect="wide"
            variant="default"
            autoplayOnHover={Boolean(cover.videoUrl)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/40 to-black/25 pointer-events-none" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Breadcrumbs
          items={[
            { label: t('nav.explore'), href: '/explore' },
            { label: `@${profile.username}` },
          ]}
          className="pt-4 mb-2"
        />

        <Card variant="glass" className="relative z-10 -mt-16 sm:-mt-24 p-5 sm:p-7 mb-10">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-white/15 shrink-0"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-bitcoin-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-2xl shrink-0 border border-white/10">
                  {creatorInitial}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-bitcoin-orange-400 mb-1">
                  Creator
                </p>
                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                  @{profile.username}
                </h1>
                {(place || flag) && (
                  <p className="text-sm text-gray-400 mt-1.5 flex items-center gap-1.5">
                    {flag && (
                      <span className="text-lg" title={country || undefined} aria-hidden>
                        {flag}
                      </span>
                    )}
                    {place && (
                      <>
                        <MapPin size={14} className="text-bitcoin-orange-400 shrink-0" aria-hidden />
                        <span>{place}</span>
                      </>
                    )}
                  </p>
                )}
                {profile.bio && (
                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed mt-3 max-w-2xl">{profile.bio}</p>
                )}

                <div className="mt-4 space-y-2">
                  {lightning && (
                    <div className="flex items-center gap-2 min-w-0">
                      <Zap size={14} className="text-bitcoin-orange-400 shrink-0" aria-hidden />
                      <span className="font-mono text-sm text-gray-300 truncate">{lightning}</span>
                      <button
                        type="button"
                        className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg border border-white/10 text-gray-300 hover:text-white touch-manipulation"
                        onClick={() => handleCopy(lightning, 'Lightning address')}
                        aria-label="Copy Lightning address"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        type="button"
                        className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg border border-white/10 text-gray-300 hover:text-white touch-manipulation"
                        onClick={() => setShowIdentityQr('lightning')}
                        aria-label="Show Lightning QR"
                      >
                        <QrCode size={16} />
                      </button>
                    </div>
                  )}
                  {npub && (
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 shrink-0">npub</span>
                      <span className="font-mono text-xs text-gray-400 truncate">{npub}</span>
                      <button
                        type="button"
                        className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg border border-white/10 text-gray-300 hover:text-white touch-manipulation"
                        onClick={() => handleCopy(npub, 'npub')}
                        aria-label="Copy npub"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  )}
                  {onchain && (
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 shrink-0">BTC</span>
                      <span className="font-mono text-xs text-gray-400 truncate">{onchain}</span>
                      <button
                        type="button"
                        className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg border border-white/10 text-gray-300 hover:text-white touch-manipulation"
                        onClick={() => handleCopy(onchain, 'Bitcoin address')}
                        aria-label="Copy Bitcoin address"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        type="button"
                        className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg border border-white/10 text-gray-300 hover:text-white touch-manipulation"
                        onClick={() => setShowDonateQr(true)}
                        aria-label="Show Bitcoin QR"
                      >
                        <QrCode size={16} />
                      </button>
                    </div>
                  )}
                  {profile.nostr_pubkey && <ZapTotals pubkey={profile.nostr_pubkey} className="mt-1" />}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <ShareButton
                url={path}
                title={`@${profile.username} on KATOA`}
                description={profile.bio || `Support @${profile.username} with Bitcoin Lightning.`}
              />
              <Button variant="outline" onClick={() => setShowTip(true)} className="min-h-[44px]">
                <Zap size={18} className="mr-2" />
                {t('creator.tip')}
              </Button>
              <Button
                variant="bitcoin"
                onClick={() => (subscribed ? undefined : handleSubscribe())}
                disabled={subscribed}
                className="min-h-[44px]"
              >
                {subscribed ? t('creator.subscribed') : t('creator.subscribe')}
                {!subscribed && <DemoBadge label="Demo" className="ml-2" />}
              </Button>
              <Button variant="secondary" onClick={() => void handleFollow()} className="min-h-[44px]">
                {following ? <UserCheck size={18} className="mr-2" /> : <UserPlus size={18} className="mr-2" />}
                {following ? t('dashboard.following') : 'Follow'}
              </Button>
              <Link
                href={messageHref}
                className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-xl border border-neon-cyan-500/25 bg-neon-cyan-500/10 text-sm font-semibold text-neon-cyan-200 hover:bg-neon-cyan-500/15"
              >
                <MessageCircle size={18} className="mr-2" />
                Message
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                {t('creator.wishlists')}
              </p>
              <p className="text-2xl font-black text-white">{formatNumber(profile.wishlists.length)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                {t('creator.satsRaised')}
              </p>
              <SatsDisplay sats={satsRaised} size="sm" />
            </div>
            {typeof subscriberCount === 'number' && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                  {t('creator.subscribers')}
                </p>
                <p className="text-2xl font-black text-white">{formatCompactCount(subscriberCount)}</p>
              </div>
            )}
          </div>
        </Card>

        {subscribed && (
          <ManageSubscriptionPanel
            creatorSlug={subscriptionKeys(profile).find((key) => isSubscribed(key)) ?? profile.username}
            onUnsubscribe={handleUnsubscribe}
            t={t}
          />
        )}

        {posts.length > 0 ? (
          <CreatorPostFeed
            creatorName={profile.username}
            subscriberCount={subscriberCount}
            posts={posts}
            subscribed={subscribed}
            onSubscribe={() => handleSubscribe()}
            onTip={() => setShowTip(true)}
            t={t}
          />
        ) : (
          <Card variant="glass" className="p-8 sm:p-10 text-center mb-12">
            <Play size={28} className="text-gray-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-white mb-1">No posts yet</h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              {profile.wishlists.length > 0
                ? 'Wishlist-only profile — no feed drops here. Gift a list below or subscribe locally.'
                : 'This creator has not published posts or wishlists yet.'}
            </p>
          </Card>
        )}

        <section className="mb-14" aria-labelledby="creator-wishlists-heading">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-bitcoin-orange-500/15 rounded-xl">
              <Package size={22} className="text-bitcoin-orange-400" />
            </div>
            <div>
              <h2 id="creator-wishlists-heading" className="font-display text-2xl sm:text-3xl font-bold text-white">
                {t('creator.wishlists')}
              </h2>
              <p className="text-gray-400 text-sm">
                {profile.wishlists.length === 1
                  ? 'One public wishlist funded with Lightning.'
                  : `${formatNumber(profile.wishlists.length)} public wishlists funded with Lightning.`}
              </p>
            </div>
          </div>

          {profile.wishlists.length === 0 ? (
            <Card variant="glass" className="p-12 text-center">
              <Gift size={28} className="text-bitcoin-orange-400 mx-auto mb-3" />
              <p className="text-gray-400">No public wishlists yet.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {profile.wishlists.map((wishlist) => (
                <Link key={wishlist.id} href={`/wishlist/${wishlist.slug}`} className="group block h-full">
                  <Card variant="glass" hover className="overflow-hidden h-full flex flex-col">
                    <div className="shrink-0 overflow-hidden">
                      <MediaCard
                        media={{
                          imageUrl: wishlist.cover_image,
                          videoUrl: wishlist.cover_video_url,
                          alt: wishlist.title,
                        }}
                        aspect="wide"
                        className="!aspect-[16/10]"
                        autoplayOnHover={Boolean(wishlist.cover_video_url)}
                      />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-bitcoin-orange-300 transition-colors">
                        {wishlist.title}
                      </h3>
                      {wishlist.description && (
                        <p className="text-gray-400 text-sm line-clamp-2 mt-1.5 flex-1">{wishlist.description}</p>
                      )}
                      {wishlist.total_sats_goal > 0 && (
                        <div className="mt-4">
                          <ProgressBar
                            current={wishlist.total_sats_raised}
                            goal={wishlist.total_sats_goal}
                            height="sm"
                            showValues={false}
                            gradient="from-bitcoin-orange-500 to-amber-400"
                          />
                          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                            <span>
                              {Math.round((wishlist.total_sats_raised / wishlist.total_sats_goal) * 100)}%
                            </span>
                            <SatsDisplay sats={wishlist.total_sats_raised} size="sm" />
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        <div className="mb-14 py-10 px-4 sm:px-6 lg:px-8 -mx-4 sm:-mx-6 lg:-mx-8 rounded-3xl border border-white/10 bg-white/[0.02]">
          <SubscriptionTiers creatorName={profile.username} onSubscribe={(tierId) => handleSubscribe(tierId)} />
        </div>
      </div>

      <Modal isOpen={showTip} onClose={resetTip} title={t('creator.tip')} size="sm">
        <TipMenu onSelect={(sats) => void handleTip(sats)} />
        {tipBusy && <p className="mt-3 text-xs text-gray-400 text-center">Fetching Lightning invoice…</p>}
        {tipSats && (tipQrUrl || tipInvoice) && (
          <div className="mt-4 space-y-3">
            <p className="text-xs text-center text-gray-400">
              {tipSats.toLocaleString()} sats · {tipInvoice ? 'bolt11 invoice' : 'Lightning address'} — not settled here
            </p>
            {tipQrUrl && (
              <div className="bg-white p-3 rounded-xl mx-auto w-full max-w-[220px]">
                <img src={tipQrUrl} alt="Tip payment QR" className="w-full aspect-square" />
              </div>
            )}
            {(tipInvoice || lightning) && (
              <WalletDeepLinks paymentUri={tipInvoice || lightningQrData(lightning || '')} />
            )}
          </div>
        )}
        {lightning && (
          <p className="mt-3 text-xs text-gray-500 text-center font-mono break-all">{lightning}</p>
        )}
      </Modal>

      <Modal
        isOpen={Boolean(showIdentityQr && identityQrValue)}
        onClose={() => setShowIdentityQr(null)}
        title={showIdentityQr === 'lightning' ? 'Lightning QR' : 'Bitcoin QR'}
        size="sm"
      >
        {identityQrValue && (
          <div className="space-y-3">
            <div className="bg-white p-3 rounded-xl mx-auto w-full max-w-[240px]">
              <img src={getQrImageUrl(identityQrValue, 280)} alt="Payment QR" className="w-full aspect-square" />
            </div>
            <WalletDeepLinks paymentUri={identityQrValue} />
          </div>
        )}
      </Modal>

      {onchain && (
        <DonateQRModal
          isOpen={showDonateQr}
          onClose={() => setShowDonateQr(false)}
          address={onchain}
          lightningUri={lightning ? lightningQrData(lightning) : undefined}
          recipientLabel={`@${profile.username}`}
        />
      )}

      <MobileStickyCta>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 min-h-[44px] text-sm" onClick={() => setShowTip(true)}>
            <Zap size={16} className="mr-1.5" />
            {t('creator.tip')}
          </Button>
          <Button
            variant="bitcoin"
            className="flex-1 min-h-[44px] text-sm"
            onClick={() => (subscribed ? undefined : handleSubscribe())}
            disabled={subscribed}
          >
            {subscribed ? t('creator.subscribed') : t('creator.subscribe')}
          </Button>
          <Link
            href={messageHref}
            className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-3 rounded-xl border border-white/15 text-neon-cyan-200"
            aria-label="Message"
          >
            <MessageCircle size={18} />
          </Link>
        </div>
      </MobileStickyCta>
    </div>
  );
}
