import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { MediaUpload } from '../components/MediaUpload';
import { WalletAddressManager } from '../components/WalletAddressManager';
import { supabase } from '../lib/supabase';
import {
  User, Wallet, MapPin, Image as ImageIcon,
  Settings as SettingsIcon, Save, Upload, Camera, Zap, Check, AlertCircle
} from 'lucide-react';

type Tab = 'profile' | 'wallet' | 'shipping' | 'appearance' | 'advanced';

export function SettingsPage() {
  const { user, profile, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
        banner_url: (profile as any).banner_url || '',
        lightning_address: profile.lightning_address || '',
        nostr_pubkey: profile.nostr_pubkey || '',
        preferred_currency: (profile as any).preferred_currency || 'USD',
      });
    }
  }, [profile]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);

    try {
      await updateProfile(profileForm);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setProcessing(false);
    }
  }

  async function handleAvatarUpload(files: File[]) {
    if (files.length === 0) return null;

    setProcessing(true);
    try {
      const file = files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}-avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      const updatedForm = { ...profileForm, avatar_url: publicUrl };
      setProfileForm(updatedForm);
      await updateProfile(updatedForm);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar');
      return null;
    } finally {
      setProcessing(false);
    }
  }

  async function handleBannerUpload(files: File[]) {
    if (files.length === 0) return null;

    setProcessing(true);
    try {
      const file = files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}-banner-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      const updatedForm = { ...profileForm, banner_url: publicUrl };
      setProfileForm(updatedForm);
      await updateProfile(updatedForm);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading banner:', error);
      alert('Failed to upload banner');
      return null;
    } finally {
      setProcessing(false);
    }
  }

  const tabs = [
    { id: 'profile' as Tab, label: 'Profile', icon: User, color: 'from-orange-500 to-amber-600' },
    { id: 'wallet' as Tab, label: 'Wallet', icon: Wallet, color: 'from-emerald-500 to-cyan-600' },
    { id: 'shipping' as Tab, label: 'Shipping', icon: MapPin, color: 'from-purple-500 to-pink-600' },
    { id: 'appearance' as Tab, label: 'Appearance', icon: ImageIcon, color: 'from-blue-500 to-indigo-600' },
    { id: 'advanced' as Tab, label: 'Advanced', icon: SettingsIcon, color: 'from-gray-500 to-gray-700' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">

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
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 sticky top-24 p-3">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left transition-all duration-300 group ${
                        isActive
                          ? `bg-gradient-to-r ${tab.color} shadow-lg text-white font-bold`
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-gray-800 group-hover:bg-gray-700'}`}>
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
              <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-orange-500/20 rounded-xl">
                    <User size={28} className="text-orange-500" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white">Profile Information</h2>
                    <p className="text-gray-400">Update your public profile details</p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-8">
                  <div className="p-6 bg-black rounded-xl border border-gray-700">
                    <label className="block text-sm font-bold text-gray-200 mb-4 uppercase tracking-wider">
                      Profile Picture
                    </label>
                    <div className="flex items-center gap-6">
                      {profileForm.avatar_url ? (
                        <img
                          src={profileForm.avatar_url}
                          alt="Avatar"
                          className="w-32 h-32 rounded-full object-cover border-4 border-orange-500 shadow-[0_0_30px_rgba(255,135,0,0.3)]"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 flex items-center justify-center text-white text-4xl font-black shadow-lg">
                          {profileForm.username?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div className="flex-1">
                        <MediaUpload onUpload={handleAvatarUpload} maxFiles={1} />
                        <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max 5MB.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <Input
                      label="Username"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                      placeholder="johndoe"
                      required
                      className="bg-black border-gray-700 text-white text-lg py-4"
                    />

                    <div>
                      <label className="block text-sm font-bold text-gray-200 mb-3 uppercase tracking-wider">
                        Bio
                      </label>
                      <textarea
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        placeholder="Tell the world about yourself..."
                        className="w-full px-4 py-4 bg-black border border-gray-700 rounded-xl text-white text-lg placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Lightning Address"
                        value={profileForm.lightning_address}
                        onChange={(e) => setProfileForm({ ...profileForm, lightning_address: e.target.value })}
                        placeholder="username@wallet.com"
                        icon={<Zap size={18} className="text-amber-500" />}
                        className="bg-black border-gray-700 text-white"
                      />

                      <div>
                        <label className="block text-sm font-bold text-gray-200 mb-3 uppercase tracking-wider">
                          Preferred Currency
                        </label>
                        <select
                          value={profileForm.preferred_currency}
                          onChange={(e) => setProfileForm({ ...profileForm, preferred_currency: e.target.value })}
                          className="w-full px-4 py-4 bg-black border border-gray-700 rounded-xl text-white text-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                        >
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - British Pound</option>
                          <option value="BTC">BTC - Bitcoin</option>
                        </select>
                      </div>
                    </div>

                    <Input
                      label="Nostr Public Key"
                      value={profileForm.nostr_pubkey}
                      onChange={(e) => setProfileForm({ ...profileForm, nostr_pubkey: e.target.value })}
                      placeholder="npub1..."
                      className="bg-black border-gray-700 text-white font-mono"
                    />
                  </div>

                  <div className="pt-6 border-t border-gray-700">
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-lg py-4 shadow-[0_0_30px_rgba(255,135,0,0.3)]"
                      disabled={processing}
                    >
                      <Save size={24} className="mr-3" />
                      {processing ? 'Saving Changes...' : 'Save Profile'}
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {activeTab === 'wallet' && (
              <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-emerald-500/20 rounded-xl">
                    <Wallet size={28} className="text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white">Bitcoin Wallets</h2>
                    <p className="text-gray-400">Manage your payment addresses and methods</p>
                  </div>
                </div>
                <WalletAddressManager />
              </Card>
            )}

            {activeTab === 'shipping' && (
              <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <MapPin size={28} className="text-purple-500" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white">Shipping Addresses</h2>
                    <p className="text-gray-400">Add locations where you can receive physical items</p>
                  </div>
                </div>
                <div className="text-center py-16 bg-black rounded-xl border border-gray-700">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-500/20 rounded-2xl mb-6">
                    <MapPin size={40} className="text-purple-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">No Addresses Yet</h3>
                  <p className="text-gray-400 mb-6">Add your first shipping address to receive physical gifts</p>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 font-bold text-lg px-8 py-3 shadow-lg">
                    <MapPin size={20} className="mr-2" />
                    Add Address
                  </Button>
                </div>
              </Card>
            )}

            {activeTab === 'appearance' && (
              <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <ImageIcon size={28} className="text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white">Appearance</h2>
                    <p className="text-gray-400">Customize your profile's visual style</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="p-6 bg-black rounded-xl border border-gray-700">
                    <label className="block text-sm font-bold text-gray-200 mb-4 uppercase tracking-wider">
                      Profile Banner
                    </label>
                    {profileForm.banner_url ? (
                      <div className="mb-6 relative group">
                        <img
                          src={profileForm.banner_url}
                          alt="Banner"
                          className="w-full h-64 rounded-xl object-cover border-2 border-gray-700 shadow-lg"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                          <Button
                            onClick={() => setProfileForm({ ...profileForm, banner_url: '' })}
                            variant="outline"
                            className="border-red-500 text-red-400 hover:bg-red-500/10"
                          >
                            Remove Banner
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-6 h-64 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 border-2 border-dashed border-gray-700 flex items-center justify-center">
                        <div className="text-center">
                          <Camera size={48} className="mx-auto text-gray-600 mb-3" />
                          <p className="text-gray-500 font-medium">No banner uploaded</p>
                        </div>
                      </div>
                    )}
                    <MediaUpload onUpload={handleBannerUpload} maxFiles={1} />
                    <p className="text-xs text-gray-500 mt-3">Recommended: 1500x500px. JPG or PNG. Max 10MB.</p>
                    {processing && (
                      <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                        <p className="text-blue-400 text-sm font-medium">Uploading banner...</p>
                      </div>
                    )}
                  </div>

                  <div className="p-6 bg-black rounded-xl border border-gray-700">
                    <label className="block text-sm font-bold text-gray-200 mb-4 uppercase tracking-wider">
                      Theme Accent Color
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="color"
                        className="w-20 h-20 rounded-xl cursor-pointer border-4 border-gray-700 hover:border-blue-500 transition-colors"
                        defaultValue="#ff8700"
                      />
                      <div>
                        <p className="text-white font-bold mb-1">Choose Your Color</p>
                        <p className="text-sm text-gray-500">This color will accent your profile</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'advanced' && (
              <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-gray-500/20 rounded-xl">
                    <SettingsIcon size={28} className="text-gray-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white">Advanced Settings</h2>
                    <p className="text-gray-400">Account details and security options</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-black rounded-xl border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <User size={20} className="text-gray-400" />
                      Account Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg border border-gray-700">
                        <div>
                          <p className="text-gray-400 text-sm font-medium">Email Address</p>
                          <p className="text-white font-bold text-lg">{user?.email}</p>
                        </div>
                        <Check size={20} className="text-emerald-500" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg border border-gray-700">
                        <div>
                          <p className="text-gray-400 text-sm font-medium">Account ID</p>
                          <p className="text-white font-mono text-sm">{user?.id}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-red-500/10 rounded-xl border border-red-500/30">
                    <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                      <AlertCircle size={20} />
                      Danger Zone
                    </h3>
                    <p className="text-gray-300 mb-4 leading-relaxed">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <Button
                      variant="outline"
                      className="border-red-500 text-red-400 hover:bg-red-500/20 hover:border-red-400 font-bold"
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
