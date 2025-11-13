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
  Settings as SettingsIcon, Save, Upload
} from 'lucide-react';

type Tab = 'profile' | 'wallet' | 'shipping' | 'appearance' | 'advanced';

export function SettingsPage() {
  const { user, profile, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [processing, setProcessing] = useState(false);

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
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setProcessing(false);
    }
  }

  async function handleAvatarUpload(files: File[]) {
    if (files.length === 0) return null;

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

      setProfileForm({ ...profileForm, avatar_url: publicUrl });
      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar');
      return null;
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
      alert('Banner uploaded successfully!');
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
    { id: 'profile' as Tab, label: 'Profile', icon: User },
    { id: 'wallet' as Tab, label: 'Wallet', icon: Wallet },
    { id: 'shipping' as Tab, label: 'Shipping', icon: MapPin },
    { id: 'appearance' as Tab, label: 'Appearance', icon: ImageIcon },
    { id: 'advanced' as Tab, label: 'Advanced', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-700 to-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <h1 className="text-4xl font-black text-white mb-2">Settings</h1>
        <p className="text-slate-400 mb-8">Manage your account settings and preferences</p>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-64 flex-shrink-0">
            <Card className="bg-slate-800/50 border-slate-700 sticky top-24">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                        activeTab === tab.id
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          <div className="flex-1">
            {activeTab === 'profile' && (
              <Card className="bg-slate-800/50 border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6">Profile Information</h2>
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Avatar
                    </label>
                    {profileForm.avatar_url && (
                      <div className="mb-4">
                        <img
                          src={profileForm.avatar_url}
                          alt="Avatar"
                          className="w-24 h-24 rounded-full object-cover border-2 border-slate-600"
                        />
                      </div>
                    )}
                    <MediaUpload onUpload={handleAvatarUpload} maxFiles={1} />
                  </div>

                  <Input
                    label="Username"
                    value={profileForm.username}
                    onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                    placeholder="johndoe"
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      rows={4}
                    />
                  </div>

                  <Input
                    label="Lightning Address"
                    value={profileForm.lightning_address}
                    onChange={(e) => setProfileForm({ ...profileForm, lightning_address: e.target.value })}
                    placeholder="username@wallet.com"
                    icon={<Wallet size={16} />}
                  />

                  <Input
                    label="Nostr Public Key"
                    value={profileForm.nostr_pubkey}
                    onChange={(e) => setProfileForm({ ...profileForm, nostr_pubkey: e.target.value })}
                    placeholder="npub1..."
                  />

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Preferred Currency
                    </label>
                    <select
                      value={profileForm.preferred_currency}
                      onChange={(e) => setProfileForm({ ...profileForm, preferred_currency: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="BTC">BTC</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700"
                    disabled={processing}
                  >
                    <Save size={20} className="mr-2" />
                    {processing ? 'Saving...' : 'Save Profile'}
                  </Button>
                </form>
              </Card>
            )}

            {activeTab === 'wallet' && (
              <Card className="bg-slate-800/50 border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6">Bitcoin Wallets</h2>
                <p className="text-slate-400 mb-6">
                  Manage your Bitcoin wallet addresses for receiving payments
                </p>
                <WalletAddressManager />
              </Card>
            )}

            {activeTab === 'shipping' && (
              <Card className="bg-slate-800/50 border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6">Shipping Addresses</h2>
                <p className="text-slate-400 mb-6">
                  Add addresses where you can receive physical gifts
                </p>
                <div className="text-center py-8">
                  <MapPin size={48} className="mx-auto text-slate-600 mb-3" />
                  <p className="text-slate-400">No shipping addresses yet</p>
                  <Button className="mt-4">
                    <MapPin size={16} className="mr-2" />
                    Add Address
                  </Button>
                </div>
              </Card>
            )}

            {activeTab === 'appearance' && (
              <Card className="bg-slate-800/50 border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6">Appearance</h2>
                <p className="text-slate-400 mb-6">
                  Customize how your profile looks to others
                </p>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Banner Image
                    </label>
                    {profileForm.banner_url && (
                      <div className="mb-4">
                        <img
                          src={profileForm.banner_url}
                          alt="Banner"
                          className="w-full h-48 rounded-lg object-cover border-2 border-slate-600"
                        />
                      </div>
                    )}
                    <MediaUpload onUpload={handleBannerUpload} maxFiles={1} />
                    {processing && (
                      <p className="text-emerald-400 text-sm mt-2">Uploading and saving banner...</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Theme Color
                    </label>
                    <input
                      type="color"
                      className="w-full h-12 rounded-lg cursor-pointer"
                      defaultValue="#10b981"
                    />
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'advanced' && (
              <Card className="bg-slate-800/50 border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6">Advanced Settings</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Account</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-600">
                        <div>
                          <p className="text-white font-medium">Email</p>
                          <p className="text-sm text-slate-400">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Danger Zone</h3>
                    <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                      <p className="text-red-400 mb-3">
                        Delete your account and all associated data
                      </p>
                      <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                        Delete Account
                      </Button>
                    </div>
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
