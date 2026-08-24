import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { WalletAddressManager } from '../components/WalletAddressManager';
import { CurrencySelector } from '../components/CurrencySelector';
import { Link } from '../components/Link';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ReferralLinkGenerator } from '../components/ReferralLinkGenerator';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { PageMeta } from '../components/PageMeta';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Modal } from '../components/Modal';
import { DemoBadge } from '../components/DemoBadge';
import {
  User, Wallet, MapPin,
  Settings as SettingsIcon, Save, Upload, Camera, Zap, Check, AlertCircle, LayoutDashboard,
  Heart, TrendingUp, Users, FolderOpen, Stamp, ExternalLink, MessageCircle, Trash2
} from 'lucide-react';
import { validateLightningAddress } from '../lib/validateAddress';
import {
  clearDemoAccountStorage,
  DEFAULT_THEME_ACCENT,
  getStorage,
  loadThemeAccent,
  saveThemeAccent,
  setStorage,
  STORAGE_KEYS,
} from '../lib/storage';
import { getDemoProjects } from '../lib/demoProjectStore';
import {
  getApiHealth,
  sha256Hex,
  stampGuideUrl,
  stampHash,
  verifyUrl,
  type StampResult,
} from '../lib/satohash';
import {
  hasNip07,
  nip07UserMessage,
  nostrService,
  PLATFORM_NIP05,
  PLATFORM_NPUB,
} from '../lib/nostr';
import { getCreatorTipPresets, setCreatorTipPresets } from '../lib/dmPrefs';

type Tab = 'profile' | 'wallet' | 'projects' | 'shipping' | 'advanced';

const TIP_PRESET_OPTIONS = [21_000, 50_000, 100_000] as const;
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

type ShippingAddress = {
  id: string;
  name: string;
  line: string;
  city: string;
  country: string;
  notes: string;
};

const EMPTY_SHIPPING: Omit<ShippingAddress, 'id'> = {
  name: '',
  line: '',
  city: '',
  country: '',
  notes: '',
};

type Nip07ChipStatus = 'detected' | 'missing' | 'denied';

function initialNip07Status(): Nip07ChipStatus {
  return hasNip07() ? 'detected' : 'missing';
}

function nip07StatusFromError(err: unknown): Nip07ChipStatus {
  if (!hasNip07()) return 'missing';
  if (/denied|cancelled/i.test(nip07UserMessage(err))) return 'denied';
  return 'detected';
}

function Nip07StatusChip({
  status,
  onRecheck,
}: {
  status: Nip07ChipStatus;
  onRecheck: () => void;
}) {
  const tone =
    status === 'detected'
      ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200'
      : status === 'denied'
        ? 'border-red-500/40 bg-red-500/15 text-red-200'
        : 'border-amber-500/40 bg-amber-500/15 text-amber-200';
  const label = status === 'detected' ? 'Detected' : status === 'denied' ? 'Denied' : 'Missing';
  const hint =
    status === 'detected'
      ? 'Nostr browser extension found. Tap to re-check.'
      : nip07UserMessage(
          new Error(status === 'denied' ? 'Nostr extension denied permission' : 'Nostr extension not found')
        );
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <button
        type="button"
        onClick={onRecheck}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider min-h-[32px] touch-manipulation ${tone}`}
        title={hint}
        aria-label={`NIP-07 ${label}. ${hint}`}
      >
        NIP-07 {label}
      </button>
      <p className="text-xs text-gray-300">Uses public relays</p>
    </div>
  );
}

function loadShipping(userId: string): ShippingAddress[] {
  const all = getStorage<Record<string, ShippingAddress[]>>(STORAGE_KEYS.shippingAddresses, {});
  return all[userId] ?? [];
}

function saveShipping(userId: string, list: ShippingAddress[]): void {
  const all = getStorage<Record<string, ShippingAddress[]>>(STORAGE_KEYS.shippingAddresses, {});
  all[userId] = list;
  setStorage(STORAGE_KEYS.shippingAddresses, all);
}

export function SettingsPage() {
  const { user, profile, updateProfile, syncNostrProfile, signOut, isDemoUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [tipPresets, setTipPresets] = useState<number[]>(() => getCreatorTipPresets());
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [statsAreDemo, setStatsAreDemo] = useState(false);
  const [stats, setStats] = useState({
    wishlists: 0,
    following: 0,
    contributions: 0,
    projectFollowers: 0,
  });
  const [themeAccent, setThemeAccent] = useState(() => loadThemeAccent() ?? DEFAULT_THEME_ACCENT);
  const [shipping, setShipping] = useState<ShippingAddress[]>([]);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [shippingForm, setShippingForm] = useState(EMPTY_SHIPPING);
  const [deleteShippingId, setDeleteShippingId] = useState<string | null>(null);
  const [confirmImportNostr, setConfirmImportNostr] = useState(false);
  const [confirmDeleteDemo, setConfirmDeleteDemo] = useState(false);
  const [deletingDemo, setDeletingDemo] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [satohashBusy, setSatohashBusy] = useState(false);
  const [satohashHealth, setSatohashHealth] = useState<'unknown' | 'ok' | 'down'>('unknown');
  const [lastStamp, setLastStamp] = useState<StampResult | null>(null);
  const [nostrBusy, setNostrBusy] = useState(false);
  const [nip07Status, setNip07Status] = useState<Nip07ChipStatus>(initialNip07Status);
  const [profileForm, setProfileForm] = useState({
    username: '',
    bio: '',
    avatar_url: '',
    banner_url: '',
    lightning_address: '',
    nostr_pubkey: '',
    preferred_currency: 'USD',
  });

  useEffect(() => {
    if (profile) {
      setProfileForm({
        username: profile.username || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || '',
        banner_url: profile.banner_url || '',
        lightning_address: profile.lightning_address || '',
        nostr_pubkey: profile.nostr_pubkey || '',
        preferred_currency: profile.preferred_currency || 'USD',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      loadStats();
      setShipping(loadShipping(user.id));
    }
    // loadStats reads isDemoUser; shipping is keyed by user id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isDemoUser]);

  async function loadStats() {
    if (!user) return;

    if (isDemoUser) {
      const projects = getDemoProjects();
      const wishlists = projects.reduce((n, p) => n + (p.wishlist_count ?? 0), 0);
      setStatsAreDemo(true);
      setStats({
        wishlists,
        following: 0,
        contributions: 0,
        projectFollowers: 0,
      });
      return;
    }

    if (!isSupabaseConfigured()) {
      setStatsAreDemo(true);
      setStats({ wishlists: 0, following: 0, contributions: 0, projectFollowers: 0 });
      return;
    }

    try {
      const [wishlistsRes, followingRes, contributionsRes, followersRes] = await Promise.all([
        supabase.from('wishlists').select('id', { count: 'exact', head: true }).eq('creator_id', user.id),
        supabase.from('follows').select('id', { count: 'exact', head: true }).eq('follower_id', user.id),
        supabase.from('contributions').select('id', { count: 'exact', head: true }).eq('contributor_id', user.id),
        supabase.from('project_follows').select('id', { count: 'exact', head: true }).eq('project_creator_id', user.id),
      ]);

      setStatsAreDemo(false);
      setStats({
        wishlists: wishlistsRes.count || 0,
        following: followingRes.count || 0,
        contributions: contributionsRes.count || 0,
        projectFollowers: followersRes.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      setStatsAreDemo(true);
      setStats({ wishlists: 0, following: 0, contributions: 0, projectFollowers: 0 });
      toast('Could not load live stats — not showing empty counts as live', 'error');
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (processing) return;

    const ln = profileForm.lightning_address.trim();
    if (ln) {
      const lnError = validateLightningAddress(ln);
      if (lnError) {
        toast(lnError, 'error');
        return;
      }
    }

    setProcessing(true);

    try {
      const { error } = await updateProfile({ ...profileForm, lightning_address: ln || null });
      if (error) {
        toast(error.message || t('error.updateProfile'), 'error');
        return;
      }
      setShowSuccess(true);
      toast(t('success.saved'), 'success');
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast(t('error.updateProfile'), 'error');
    } finally {
      setProcessing(false);
    }
  }

  async function checkSatohashHealth() {
    const health = await getApiHealth();
    setSatohashHealth(health.ok ? 'ok' : 'down');
    return health.ok;
  }

  /** Timestamp a canonical snapshot of the profile with Satohash (OTS on Bitcoin). */
  async function handleTimestampProfile() {
    if (!user || satohashBusy) return;
    setSatohashBusy(true);
    try {
      const snapshot = JSON.stringify({
        app: 'katoa',
        kind: 'profile-snapshot',
        user_id: user.id,
        email: user.email ?? null,
        username: profileForm.username,
        bio: profileForm.bio,
        lightning_address: profileForm.lightning_address,
        nostr_pubkey: profileForm.nostr_pubkey,
        stamped_at: new Date().toISOString(),
      });
      const hash = await sha256Hex(snapshot);
      const filename = `katoa-profile-${profileForm.username || user.id.slice(0, 8)}.json`;
      const result = await stampHash(hash, { filename });
      setLastStamp(result);
      toast('Profile snapshot timestamped with Satohash', 'success');
    } catch (err) {
      console.error('Satohash stamp error:', err);
      toast(
        err instanceof Error ? err.message : 'Satohash timestamp failed',
        'error'
      );
    } finally {
      setSatohashBusy(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > MAX_AVATAR_BYTES) {
      toast('Avatar must be 5MB or smaller', 'error');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);

    setProcessing(true);
    try {
      if (isDemoUser) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(String(r.result));
          r.onerror = () => reject(new Error('Could not read image'));
          r.readAsDataURL(file);
        });
        const result = await updateProfile({ avatar_url: dataUrl });
        if (result.error) throw result.error;
        setProfileForm({ ...profileForm, avatar_url: dataUrl });
        setAvatarPreview(null);
        setShowSuccess(true);
        toast('Avatar saved on this device (demo)', 'success');
        setTimeout(() => setShowSuccess(false), 3000);
        return;
      }

      const fileExt = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
      const fileName = `${user!.id}/avatar-${Date.now()}.${fileExt || 'bin'}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, file, { contentType: file.type || undefined });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      const result = await updateProfile({ avatar_url: publicUrl });

      if (result.error) {
        console.error('Profile update error:', result.error);
        throw result.error;
      }

      setProfileForm({ ...profileForm, avatar_url: publicUrl });
      setAvatarPreview(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setAvatarPreview(null);
      toast(`${t('error.uploadAvatar')}: ${(error as Error).message}`, 'error');
    } finally {
      setProcessing(false);
      e.target.value = '';
    }
  }

  function persistShipping(next: ShippingAddress[]) {
    if (!user) return;
    setShipping(next);
    saveShipping(user.id, next);
  }

  function handleSaveShipping(e: React.FormEvent) {
    e.preventDefault();
    if (!shippingForm.name.trim() || !shippingForm.line.trim()) {
      toast('Name and street line are required', 'error');
      return;
    }
    const row: ShippingAddress = {
      id:
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `ship-${Date.now()}`,
      name: shippingForm.name.trim(),
      line: shippingForm.line.trim(),
      city: shippingForm.city.trim(),
      country: shippingForm.country.trim(),
      notes: shippingForm.notes.trim(),
    };
    persistShipping([row, ...shipping]);
    setShippingForm(EMPTY_SHIPPING);
    setShowShippingModal(false);
    toast('Address saved on this device', 'success');
  }

  async function recheckNip07() {
    if (!hasNip07()) {
      setNip07Status('missing');
      toast(nip07UserMessage(new Error('Nostr extension not found')), 'error');
      return;
    }
    try {
      await window.nostr!.getPublicKey();
      setNip07Status('detected');
    } catch (e) {
      const next = nip07StatusFromError(e);
      setNip07Status(next);
      toast(nip07UserMessage(e), 'error');
    }
  }

  async function handleDeleteDemoAccount() {
    setDeletingDemo(true);
    try {
      clearDemoAccountStorage();
      await signOut();
      toast('Demo data cleared on this device', 'success');
      navigate('/', { replace: true });
    } finally {
      setDeletingDemo(false);
      setConfirmDeleteDemo(false);
    }
  }

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setProcessing(true);
    try {
      const file = files[0];
      if (isDemoUser) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(String(r.result));
          r.onerror = () => reject(new Error('Could not read image'));
          r.readAsDataURL(file);
        });
        const result = await updateProfile({ banner_url: dataUrl });
        if (result.error) throw result.error;
        setProfileForm({ ...profileForm, banner_url: dataUrl });
        setShowSuccess(true);
        toast('Banner saved on this device (demo)', 'success');
        setTimeout(() => setShowSuccess(false), 3000);
        return;
      }

      const fileExt = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
      const fileName = `${user!.id}/banner-${Date.now()}.${fileExt || 'bin'}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, file, { contentType: file.type || undefined });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      const result = await updateProfile({ banner_url: publicUrl });

      if (result.error) {
        console.error('Profile update error:', result.error);
        throw result.error;
      }

      setProfileForm({ ...profileForm, banner_url: publicUrl });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error uploading banner:', error);
      toast(`${t('error.uploadBanner')}: ${(error as Error).message}`, 'error');
    } finally {
      setProcessing(false);
    }
  }

  const tabs = [
    { id: 'profile' as Tab, label: 'Profile', icon: User, color: 'from-orange-500 to-amber-600' },
    { id: 'wallet' as Tab, label: 'Wallet', icon: Wallet, color: 'from-emerald-500 to-cyan-600' },
    { id: 'projects' as Tab, label: 'Projects', icon: LayoutDashboard, color: 'from-cyan-500 to-blue-600' },
    { id: 'shipping' as Tab, label: 'Shipping', icon: MapPin, color: 'from-purple-500 to-pink-600' },
    { id: 'advanced' as Tab, label: 'Advanced', icon: SettingsIcon, color: 'from-gray-500 to-gray-700' },
  ];

  return (
    <div className="min-h-screen bg-charcoal-950">
      <PageMeta title="Settings" description="Manage your KATOA profile, wallet, and preferences." path="/settings" noindex />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Settings' }]} className="mb-6" />

        <div className="mb-12">
          <h1 className="text-5xl font-black text-white mb-3 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-gray-300 text-lg">Customize your profile, wallet, and preferences</p>
        </div>

        {showSuccess && (
          <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-xl flex items-center gap-3 animate-slide-up shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Check size={24} className="text-emerald-400" />
            <p className="text-emerald-400 font-bold">Changes saved successfully!</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-80 flex-shrink-0">
            <Card className=" sticky top-24 p-3">
              <nav className="space-y-2" role="tablist" aria-label="Settings sections">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      id={`settings-tab-${tab.id}`}
                      aria-selected={isActive}
                      aria-controls={`settings-panel-${tab.id}`}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left transition-all duration-300 group min-h-[44px] ${
                        isActive
                          ? `bg-gradient-to-r ${tab.color} shadow-lg text-white font-bold`
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'}`} aria-hidden>
                        <Icon size={22} />
                      </div>
                      <span className="text-lg">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          <div className="flex-1">
            {activeTab === 'profile' && (
              <Card className=" p-8" role="tabpanel" id="settings-panel-profile" aria-labelledby="settings-tab-profile">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-orange-500/20 rounded-xl">
                    <User size={28} className="text-orange-500" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white">Profile Information</h2>
                    <p className="text-gray-400">Update your public profile and appearance</p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-8">

                  {/* Live Profile Preview */}
                  <div className="p-1 bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl" style={{ background: `linear-gradient(90deg, var(--theme-accent, #ff8700), #d97706)` }}>
                    <div className="bg-black rounded-xl overflow-hidden">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => document.getElementById('banner-upload')?.click()}
                          className="block w-full text-left min-h-[44px]"
                          aria-label="Upload banner"
                          disabled={processing}
                        >
                          {profileForm.banner_url ? (
                            <div
                              className="w-full h-64 bg-cover bg-center"
                              style={{ backgroundImage: `url(${profileForm.banner_url})` }}
                            />
                          ) : (
                            <div className="w-full h-64 bg-charcoal-900 flex items-center justify-center">
                              <Camera size={64} className="text-gray-700" />
                            </div>
                          )}
                        </button>
                        <div className="absolute -bottom-16 left-8">
                          <button
                            type="button"
                            onClick={() => document.getElementById('avatar-upload')?.click()}
                            className="block rounded-full min-h-[44px] min-w-[44px]"
                            aria-label="Upload avatar"
                            disabled={processing}
                          >
                            {(avatarPreview || profileForm.avatar_url) ? (
                              <img
                                src={avatarPreview || profileForm.avatar_url}
                                alt="Avatar Preview"
                                className="w-32 h-32 rounded-full object-cover border-4 border-black shadow-2xl"
                              />
                            ) : (
                              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 flex items-center justify-center text-white text-5xl font-black border-4 border-black shadow-2xl">
                                {profileForm.username?.[0]?.toUpperCase() || '?'}
                              </div>
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="pt-20 px-8 pb-6">
                        <h3 className="text-2xl font-black text-white mb-2">
                          {profileForm.username || 'Your Username'}
                        </h3>
                        {profileForm.bio && (
                          <p className="text-gray-400 mb-4 leading-relaxed">
                            {profileForm.bio}
                          </p>
                        )}
                        {profileForm.lightning_address && (
                          <div className="flex items-center gap-2 text-amber-500">
                            <Zap size={16} />
                            <span className="text-sm font-mono">{profileForm.lightning_address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-center py-4 bg-orange-500/10 rounded-xl border border-orange-500/30">
                    <p className="text-orange-400 font-bold text-sm">
                      👆 Live Preview - Click on the banner or avatar to upload images
                    </p>
                  </div>

                  {/* Hidden file inputs */}
                  <input
                    type="file"
                    id="banner-upload"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                  />
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />

                  {/* Clickable Banner Upload Section */}
                  <div className="p-6 bg-black rounded-xl border border-white/10">
                    <label className="block text-sm font-bold text-gray-200 mb-4 uppercase tracking-wider">
                      Profile Banner
                    </label>
                    <button
                      type="button"
                      onClick={() => document.getElementById('banner-upload')?.click()}
                      className="w-full relative group cursor-pointer"
                      disabled={processing}
                    >
                      {profileForm.banner_url ? (
                        <div className="relative">
                          <img
                            src={profileForm.banner_url}
                            alt="Banner"
                            className="w-full h-48 rounded-xl object-cover border-2 border-white/10 shadow-lg"
                          />
                          <div className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="text-center">
                              <Upload size={48} className="mx-auto text-white mb-2" />
                              <p className="text-white font-bold">Click to change banner</p>
                              <p className="text-gray-300 text-sm">1500x500px recommended</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-48 rounded-xl bg-charcoal-900 border-2 border-dashed border-white/10 flex items-center justify-center hover:border-orange-500 transition-colors">
                          <div className="text-center">
                            <Upload size={64} className="mx-auto text-gray-600 mb-3 group-hover:text-orange-500 transition-colors" />
                            <p className="text-gray-300 font-bold group-hover:text-white transition-colors">Click to upload banner</p>
                            <p className="text-gray-600 text-sm mt-1">1500x500px recommended</p>
                          </div>
                        </div>
                      )}
                    </button>
                    {processing && (
                      <div className="mt-3 p-3 bg-orange-500/20 border border-orange-500/50 rounded-lg flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent"></div>
                        <p className="text-orange-400 text-sm font-medium">Uploading banner...</p>
                      </div>
                    )}
                  </div>

                  {/* Clickable Avatar Upload Section */}
                  <div className="p-6 bg-black rounded-xl border border-white/10">
                    <label className="block text-sm font-bold text-gray-200 mb-4 uppercase tracking-wider">
                      Profile Picture
                    </label>
                    <div className="flex items-center gap-6">
                      <button
                        type="button"
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                        className="relative group cursor-pointer"
                        disabled={processing}
                      >
                        {(avatarPreview || profileForm.avatar_url) ? (
                          <div className="relative">
                            <img
                              src={avatarPreview || profileForm.avatar_url}
                              alt="Avatar"
                              className="w-32 h-32 rounded-full object-cover border-4 border-orange-500 shadow-[0_0_30px_rgba(255,135,0,0.3)]"
                            />
                            <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Camera size={32} className="text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 flex items-center justify-center text-white text-4xl font-black shadow-lg hover:shadow-2xl transition-shadow">
                            {profileForm.username?.[0]?.toUpperCase() || <Camera size={48} />}
                          </div>
                        )}
                      </button>
                      <div className="flex-1">
                        <p className="text-white font-bold mb-2">Click on the image to upload</p>
                        <p className="text-xs text-gray-300">JPG, PNG or GIF. Max 5MB.</p>
                        {processing && (
                          <div className="mt-3 p-2 bg-orange-500/20 border border-orange-500/50 rounded-lg flex items-center gap-2">
                            <div className="animate-spin rounded-full h-3 w-3 border-2 border-orange-500 border-t-transparent"></div>
                            <p className="text-orange-400 text-xs font-medium">Uploading...</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <Input
                      label="Username"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                      placeholder={t('settings.placeholder.username')}
                      required
                      className="bg-black border-white/10 text-white text-lg py-4"
                    />

                    <div>
                      <label className="block text-sm font-bold text-gray-200 mb-3 uppercase tracking-wider">
                        Bio
                      </label>
                      <textarea
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        placeholder={t('settings.placeholder.bio')}
                        className="w-full px-4 py-4 bg-black border border-white/10 rounded-xl text-white text-lg placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Lightning Address"
                        value={profileForm.lightning_address}
                        onChange={(e) => setProfileForm({ ...profileForm, lightning_address: e.target.value })}
                        placeholder={t('settings.placeholder.lightning')}
                        icon={<Zap size={18} className="text-amber-500" />}
                        className="bg-black border-white/10 text-white"
                        error={
                          profileForm.lightning_address.trim()
                            ? validateLightningAddress(profileForm.lightning_address) ?? undefined
                            : undefined
                        }
                        helperText="Lightning address (user@domain), lnurl, or lnbc/lntb. Katoa never settles Lightning for you."
                      />

                      <div>
                        <label className="block text-sm font-bold text-gray-200 mb-3 uppercase tracking-wider">
                          Display Currency
                        </label>
                        <div className="px-4 py-4 bg-black border border-white/10 rounded-xl">
                          <CurrencySelector />
                          <p className="text-xs text-gray-300 mt-2">All amounts stored in sats — display preference only</p>
                        </div>
                      </div>
                    </div>

                    <Input
                      label="Nostr Public Key"
                      value={profileForm.nostr_pubkey}
                      onChange={(e) => setProfileForm({ ...profileForm, nostr_pubkey: e.target.value })}
                      placeholder={t('settings.placeholder.nostr')}
                      className="bg-black border-white/10 text-white font-mono"
                    />
                    <p className="text-xs text-gray-300 -mt-2">{t('settings.nostrHint')}</p>
                    <div className="flex flex-col sm:flex-row flex-wrap gap-2 -mt-1">
                      <Button
                        type="button"
                        variant="outline"
                        className="min-h-[44px]"
                        disabled={nostrBusy}
                        onClick={async () => {
                          setNostrBusy(true);
                          try {
                            if (!hasNip07()) {
                              setNip07Status('missing');
                              toast(nip07UserMessage(new Error('Nostr extension not found')), 'error');
                              return;
                            }
                            const pk = await window.nostr!.getPublicKey();
                            const npub = nostrService.encodeNpub(pk);
                            setProfileForm((f) => ({ ...f, nostr_pubkey: npub }));
                            await updateProfile({ nostr_pubkey: npub });
                            setNip07Status('detected');
                            toast('Linked NIP-07 public key (we never see your private key)', 'success');
                          } catch (e) {
                            setNip07Status(nip07StatusFromError(e));
                            toast(nip07UserMessage(e), 'error');
                          } finally {
                            setNostrBusy(false);
                          }
                        }}
                      >
                        Link NIP-07 extension
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="min-h-[44px]"
                        disabled={nostrBusy}
                        onClick={() => setConfirmImportNostr(true)}
                      >
                        Import from Nostr (kind-0)
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="min-h-[44px]"
                        disabled={nostrBusy || !profileForm.lightning_address}
                        onClick={async () => {
                          setNostrBusy(true);
                          try {
                            const lud16 = profileForm.lightning_address.trim();
                            const result = await nostrService.publishProfile({
                              lud16,
                              name: profileForm.username || undefined,
                              about: profileForm.bio || undefined,
                              picture: profileForm.avatar_url || undefined,
                              website: 'https://katoa.org',
                            });
                            if (!result.ok) {
                              toast(result.message || 'Publish failed', 'error');
                              return;
                            }
                            toast(`Published kind 0 with lud16 to ${result.accepted.length} relay(s)`, 'success');
                            await nostrService.publishRelayList();
                          } catch (e) {
                            toast(nip07UserMessage(e), 'error');
                          } finally {
                            setNostrBusy(false);
                          }
                        }}
                      >
                        Publish lud16 + relays (NIP-65)
                      </Button>
                    </div>
                    <p className="text-[11px] text-gray-600">
                      Platform NIP-05: <span className="text-gray-400">{PLATFORM_NIP05}</span>
                      {' · '}
                      <span className="font-mono text-gray-300 break-all">{PLATFORM_NPUB.slice(0, 16)}…</span>
                      {' · '}
                      Creator handles (you@katoa.org) — see docs/NOSTR-NIP05.md
                    </p>

                    <div className="p-6 bg-black rounded-xl border border-white/10">
                      <label className="block text-sm font-bold text-gray-200 mb-2 uppercase tracking-wider">
                        {t('tipMenu.presetsLabel')}
                      </label>
                      <p className="text-xs text-gray-300 mb-3">{t('tipMenu.help')}</p>
                      <div className="flex flex-wrap gap-2" role="group" aria-label={t('tipMenu.presetsLabel')}>
                        {TIP_PRESET_OPTIONS.map((sats) => {
                          const active = tipPresets.includes(sats);
                          return (
                            <button
                              key={sats}
                              type="button"
                              aria-pressed={active}
                              className={`min-h-[44px] px-4 rounded-xl border font-bold text-sm transition-colors ${
                                active
                                  ? 'border-bitcoin-orange-500/50 bg-bitcoin-orange-500/20 text-bitcoin-orange-200'
                                  : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                              }`}
                              onClick={() => {
                                const next = active
                                  ? tipPresets.filter((n) => n !== sats)
                                  : [...tipPresets, sats].sort((a, b) => a - b).slice(0, 6);
                                const saved = next.length ? next : [21000, 50000, 100000];
                                setCreatorTipPresets(saved);
                                setTipPresets(saved);
                                toast(
                                  `Tip presets: ${saved.map((n) => `${n / 1000}k`).join(', ')}`,
                                  'success'
                                );
                              }}
                            >
                              {(sats / 1000).toFixed(0)}k
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[11px] text-gray-600 mt-2">
                        Stored on this device. Used on wishlist tip menus.
                      </p>
                    </div>

                    <div className="p-6 bg-black rounded-xl border border-white/10">
                      <p className="text-sm font-bold text-gray-200 mb-3 uppercase tracking-wider">
                        Public links
                      </p>
                      <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                        <Link
                          href={profileForm.username ? `/u/${encodeURIComponent(profileForm.username)}` : '/explore'}
                          className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-xl border border-white/10 text-sm text-neon-cyan-400 hover:bg-white/5"
                        >
                          <User size={16} className="mr-2" />
                          Public profile {profileForm.username ? `/u/${profileForm.username}` : ''}
                        </Link>
                        <Link
                          href="/nip05"
                          className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-xl border border-white/10 text-sm text-gray-300 hover:bg-white/5"
                        >
                          NIP-05 claim
                        </Link>
                        <Link
                          href="/messages"
                          className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-xl border border-white/10 text-sm text-gray-300 hover:bg-white/5"
                        >
                          <MessageCircle size={16} className="mr-2" />
                          Messages
                        </Link>
                      </div>
                    </div>

                    <div className="p-6 bg-black rounded-xl border border-white/10">
                      <label className="block text-sm font-bold text-gray-200 mb-4 uppercase tracking-wider" htmlFor="theme-accent">
                        Theme Accent Color
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          id="theme-accent"
                          type="color"
                          value={themeAccent}
                          onChange={(e) => {
                            const color = e.target.value;
                            setThemeAccent(color);
                            saveThemeAccent(color);
                          }}
                          className="w-20 h-20 min-h-[44px] min-w-[44px] rounded-xl cursor-pointer border-4 border-white/10 hover:border-orange-500 transition-colors"
                        />
                        <div>
                          <p className="text-white font-bold mb-1">Choose Your Color</p>
                          <p className="text-sm text-gray-300">
                            Saved on this device as <code className="text-gray-400">--theme-accent</code>
                          </p>
                          <p className="text-xs font-mono text-gray-300 mt-1">{themeAccent}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <ReferralLinkGenerator />

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-lg py-4 shadow-[0_0_30px_rgba(255,135,0,0.3)]"
                      loading={processing}
                    >
                      <Save size={24} className="mr-3" />
                      Save Profile
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {activeTab === 'wallet' && (
              <Card className=" p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-emerald-500/20 rounded-xl">
                    <Wallet size={28} className="text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white">Bitcoin Wallets</h2>
                    <p className="text-gray-400">Manage your payment addresses and methods</p>
                  </div>
                </div>
                <div className="mb-6">
                  <Nip07StatusChip status={nip07Status} onRecheck={() => void recheckNip07()} />
                </div>
                <WalletAddressManager />
              </Card>
            )}

            {activeTab === 'projects' && (
              <Card className=" p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-cyan-500/20 rounded-xl">
                    <LayoutDashboard size={28} className="text-cyan-500" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white">Projects & Analytics</h2>
                    <p className="text-gray-400">
                      {statsAreDemo
                        ? 'Device preview — not live Katoa stats'
                        : 'Overview of your wishlists and activity'}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {statsAreDemo && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <DemoBadge title="Counts from this device, not the live Katoa database" />
                      <span>Demo/offline counts are labeled so empty live numbers are not shown as real.</span>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-xl border border-orange-500/30 hover:border-orange-500/50 transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-500/20 rounded-lg">
                          <FolderOpen size={24} className="text-orange-500" />
                        </div>
                        <span className="text-4xl font-black text-white">{stats.wishlists}</span>
                      </div>
                      <h4 className="text-lg font-bold text-white mb-1">Wishlists</h4>
                      <p className="text-orange-400 text-sm font-medium">
                        {statsAreDemo ? 'On this device' : 'Active projects'}
                      </p>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-xl border border-emerald-500/30 hover:border-emerald-500/50 transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-emerald-500/20 rounded-lg">
                          <Heart size={24} className="text-emerald-500" />
                        </div>
                        <span className="text-4xl font-black text-white">{stats.following}</span>
                      </div>
                      <h4 className="text-lg font-bold text-white mb-1">Following</h4>
                      <p className="text-emerald-400 text-sm font-medium">
                        {statsAreDemo ? 'Not tracked in demo' : 'Creators you support'}
                      </p>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 rounded-xl border border-cyan-500/30 hover:border-cyan-500/50 transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-cyan-500/20 rounded-lg">
                          <Wallet size={24} className="text-cyan-500" />
                        </div>
                        <span className="text-4xl font-black text-white">{stats.contributions}</span>
                      </div>
                      <h4 className="text-lg font-bold text-white mb-1">Contributions</h4>
                      <p className="text-cyan-400 text-sm font-medium">
                        {statsAreDemo ? 'Not tracked in demo' : 'Payments made'}
                      </p>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl border border-purple-500/30 hover:border-purple-500/50 transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-500/20 rounded-lg">
                          <Users size={24} className="text-purple-500" />
                        </div>
                        <span className="text-4xl font-black text-white">{stats.projectFollowers}</span>
                      </div>
                      <h4 className="text-lg font-bold text-white mb-1">Followers</h4>
                      <p className="text-purple-400 text-sm font-medium">
                        {statsAreDemo ? 'Not tracked in demo' : 'Project supporters'}
                      </p>
                    </div>
                  </div>

                  <div className="p-8 bg-black rounded-xl border border-white/10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-4 bg-cyan-500/20 rounded-xl">
                        <TrendingUp size={32} className="text-cyan-500" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-white mb-1">Manage Your Projects</h3>
                        <p className="text-gray-400">Create, edit, and track all your wishlists and campaigns</p>
                      </div>
                    </div>
                    <Link href="/dashboard">
                      <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 font-black text-lg py-6 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                        <LayoutDashboard size={28} className="mr-3" />
                        Open Dashboard
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'shipping' && (
              <Card className=" p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <MapPin size={28} className="text-purple-500" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white">Shipping Addresses</h2>
                    <p className="text-gray-400">
                      Stored on this device. Shown to gifters you choose — Katoa does not ship items.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end mb-4">
                  <Button
                    type="button"
                    onClick={() => {
                      setShippingForm(EMPTY_SHIPPING);
                      setShowShippingModal(true);
                    }}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 font-bold min-h-[44px]"
                  >
                    <MapPin size={20} className="mr-2" />
                    Add Address
                  </Button>
                </div>

                {shipping.length === 0 ? (
                  <div className="text-center py-16 bg-black rounded-xl border border-white/10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-500/20 rounded-2xl mb-6">
                      <MapPin size={40} className="text-purple-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">No Addresses Yet</h3>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                      Add a shipping address if you want physical gifts. It stays on this device and is only shown to gifters you choose.
                    </p>
                    <Button
                      type="button"
                      onClick={() => setShowShippingModal(true)}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 font-bold text-lg px-8 py-3 shadow-lg min-h-[44px]"
                    >
                      <MapPin size={20} className="mr-2" />
                      Add Address
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {shipping.map((addr) => (
                      <div
                        key={addr.id}
                        className="p-4 rounded-xl border border-white/10 bg-black flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-white font-bold">{addr.name}</p>
                          <p className="text-gray-300 text-sm">{addr.line}</p>
                          <p className="text-gray-400 text-sm">
                            {[addr.city, addr.country].filter(Boolean).join(', ')}
                          </p>
                          {addr.notes && <p className="text-gray-300 text-xs mt-1">{addr.notes}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => setDeleteShippingId(addr.id)}
                          className="p-2 text-gray-400 hover:text-red-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
                          aria-label={`Delete ${addr.name}`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {activeTab === 'advanced' && (
              <Card className=" p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-gray-500/20 rounded-xl">
                    <SettingsIcon size={28} className="text-gray-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white">Advanced Settings</h2>
                    <p className="text-gray-400">Account details and security options</p>
                  </div>
                </div>
                <div className="mb-6">
                  <Nip07StatusChip status={nip07Status} onRecheck={() => void recheckNip07()} />
                </div>

                <div className="space-y-6">
                  <div className="p-5 rounded-xl border border-neon-cyan-500/20 bg-neon-cyan-500/5">
                    <p className="text-sm text-gray-300 leading-relaxed mb-3">
                      KATOA is non-custodial — we never hold your sats. Read how keys, data, and payments work.
                    </p>
                    <Link
                      href="/security"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-neon-cyan-400 hover:underline min-h-[44px]"
                    >
                      <AlertCircle size={16} />
                      Security & custody →
                    </Link>
                  </div>

                  <div className="p-6 bg-black rounded-xl border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <User size={20} className="text-gray-400" />
                      Account Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-lg border border-white/10">
                        <div>
                          <p className="text-gray-400 text-sm font-medium">Email Address</p>
                          <p className="text-white font-bold text-lg">{user?.email}</p>
                        </div>
                        <Check size={20} className="text-emerald-500" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-lg border border-white/10">
                        <div>
                          <p className="text-gray-400 text-sm font-medium">Account ID</p>
                          <p className="text-white font-mono text-sm">{user?.id}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-black rounded-xl border border-bitcoin-orange-500/30">
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                      <Stamp size={20} className="text-bitcoin-orange-500" />
                      Timestamp with Satohash
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                      Anchor a SHA-256 snapshot of your profile to Bitcoin via OpenTimestamps.
                      Your data stays local until you stamp — only the hash is sent to Satohash.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <Button
                        type="button"
                        onClick={handleTimestampProfile}
                        loading={satohashBusy}
                        className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold"
                      >
                        <Stamp size={18} className="mr-2" />
                        Timestamp profile snapshot
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={async () => {
                          const ok = await checkSatohashHealth();
                          toast(
                            ok ? 'Satohash API is reachable' : 'Satohash API unreachable',
                            ok ? 'success' : 'error'
                          );
                        }}
                        className="border-white/15 text-white"
                      >
                        Check API
                      </Button>
                      <a
                        href={stampGuideUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-bitcoin-orange-400 hover:text-bitcoin-orange-300 font-medium"
                      >
                        Open Satohash
                        <ExternalLink size={14} />
                      </a>
                      {satohashHealth !== 'unknown' && (
                        <span
                          className={`text-xs font-semibold uppercase tracking-wider ${
                            satohashHealth === 'ok' ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          API {satohashHealth}
                        </span>
                      )}
                    </div>
                    {lastStamp && (
                      <div className="p-4 bg-white/[0.03] rounded-lg border border-white/10 space-y-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Last stamp
                        </p>
                        <p className="text-white font-mono text-xs break-all">
                          {lastStamp.hash}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Status: <span className="text-white font-medium">{lastStamp.status}</span>
                          {lastStamp.id ? (
                            <>
                              {' · '}
                              <a
                                href={verifyUrl(lastStamp.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-bitcoin-orange-400 hover:underline"
                              >
                                Verify on Satohash
                              </a>
                            </>
                          ) : null}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-6 bg-red-500/10 rounded-xl border border-red-500/30">
                    <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                      <AlertCircle size={20} />
                      Danger Zone
                    </h3>
                    {isDemoUser ? (
                      <>
                        <p className="text-gray-300 mb-4 leading-relaxed">
                          This is a demo session. Delete clears this device&apos;s demo storage and signs you out.
                          It does not wipe a live Katoa account.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          className="border-red-500 text-red-400 hover:bg-red-500/20 hover:border-red-400 font-bold min-h-[44px]"
                          onClick={() => setConfirmDeleteDemo(true)}
                        >
                          Delete demo data
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-300 mb-4 leading-relaxed">
                          Self-serve account deletion is not available in the app. Email{' '}
                          <a
                            href="mailto:hello@giveabit.io?subject=Katoa%20account%20deletion"
                            className="text-red-300 underline"
                          >
                            hello@giveabit.io
                          </a>{' '}
                          to request a real wipe. We will not pretend this button deleted your account.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          disabled
                          className="border-red-500/40 text-red-400/60 font-bold min-h-[44px] cursor-not-allowed"
                          title="Email hello@giveabit.io — in-app delete is not available"
                        >
                          Delete Account
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showShippingModal}
        onClose={() => setShowShippingModal(false)}
        title="Add shipping address"
        size="md"
      >
        <form onSubmit={handleSaveShipping} className="space-y-4">
          <p className="text-sm text-gray-400">
            Saved on this device. Shown to gifters you choose — not a public listing.
          </p>
          <Input
            label="Name"
            value={shippingForm.name}
            onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
            required
            autoComplete="name"
          />
          <Input
            label="Street line"
            value={shippingForm.line}
            onChange={(e) => setShippingForm({ ...shippingForm, line: e.target.value })}
            required
            autoComplete="street-address"
          />
          <Input
            label="City"
            value={shippingForm.city}
            onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
            autoComplete="address-level2"
          />
          <Input
            label="Country"
            value={shippingForm.country}
            onChange={(e) => setShippingForm({ ...shippingForm, country: e.target.value })}
            autoComplete="country-name"
          />
          <div>
            <label htmlFor="shipping-notes" className="block text-sm font-medium text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              id="shipping-notes"
              value={shippingForm.notes}
              onChange={(e) => setShippingForm({ ...shippingForm, notes: e.target.value })}
              className="w-full px-4 py-3 min-h-[88px] bg-white/5 border border-white/10 rounded-xl text-white text-base"
              placeholder="Apartment, pickup notes…"
            />
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 min-h-[44px]" onClick={() => setShowShippingModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 min-h-[44px]">
              Save address
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteShippingId !== null}
        title="Remove shipping address?"
        message="This only deletes the address stored on this device."
        confirmLabel="Remove"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => {
          if (deleteShippingId) persistShipping(shipping.filter((a) => a.id !== deleteShippingId));
          setDeleteShippingId(null);
        }}
        onCancel={() => setDeleteShippingId(null)}
      />

      <ConfirmDialog
        isOpen={confirmImportNostr}
        title="Import from Nostr (kind-0)"
        message="Replace avatar, bio, and Lightning address with your kind-0 profile from relays? Katoa never sees your private key."
        confirmLabel="Import"
        cancelLabel="Cancel"
        variant="primary"
        loading={nostrBusy}
        onConfirm={async () => {
          setNostrBusy(true);
          try {
            const { error } = await syncNostrProfile();
            if (error) {
              toast(error.message, 'error');
              return;
            }
            toast('Imported kind-0 profile from relays', 'success');
            setConfirmImportNostr(false);
          } finally {
            setNostrBusy(false);
          }
        }}
        onCancel={() => setConfirmImportNostr(false)}
      />

      <ConfirmDialog
        isOpen={confirmDeleteDemo}
        title="Clear demo data?"
        message="This clears demo projects, wallets, shipping, and inbox stored on this device, then signs you out. It does not delete a live Katoa account."
        confirmLabel="Clear and sign out"
        cancelLabel="Cancel"
        variant="danger"
        loading={deletingDemo}
        onConfirm={handleDeleteDemoAccount}
        onCancel={() => setConfirmDeleteDemo(false)}
      />
    </div>
  );
}
