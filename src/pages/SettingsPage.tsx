import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { MediaUpload } from '../components/MediaUpload';
import { WalletAddressManager } from '../components/WalletAddressManager';
import { supabase } from '../lib/supabase';
import { MapPin, Plus, Edit, Trash2, Check, User, Upload, Bitcoin, Zap, Shield, CheckCircle, XCircle } from 'lucide-react';

interface ShippingAddress {
  id: string;
  full_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string | null;
  is_default: boolean;
}

export function SettingsPage() {
  const { user, profile, updateProfile } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: '',
    bio: '',
    avatar_url: '',
    lightning_address: '',
    nostr_pubkey: '',
    preferred_currency: 'USD',
    banner_url: '',
    banner_video_url: '',
    profile_video_url: '',
    video_title: '',
    video_date: '',
  });
  const [verifyingNostr, setVerifyingNostr] = useState(false);
  const [nostrVerified, setNostrVerified] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(null);
  const [processing, setProcessing] = useState(false);
  const [addressForm, setAddressForm] = useState({
    full_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'United States',
    phone: '',
    is_default: false,
  });

  useEffect(() => {
    if (user) {
      loadAddresses();
    }
    if (profile) {
      setProfileForm({
        username: profile.username || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || '',
        lightning_address: profile.lightning_address || '',
        nostr_pubkey: profile.nostr_pubkey || '',
        preferred_currency: (profile as any).preferred_currency || 'USD',
        banner_url: profile.banner_url || '',
        banner_video_url: profile.banner_video_url || '',
        profile_video_url: profile.profile_video_url || '',
        video_title: profile.video_title || '',
        video_date: profile.video_date || '',
      });
      setNostrVerified((profile as any).nostr_pubkey_verified || false);
    }
  }, [user, profile]);

  async function loadAddresses() {
    try {
      const { data, error } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('user_id', user!.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setLoading(false);
    }
  }

  function openAddressModal(address?: ShippingAddress) {
    if (address) {
      setEditingAddress(address);
      setAddressForm({
        full_name: address.full_name,
        address_line1: address.address_line1,
        address_line2: address.address_line2 || '',
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: address.country,
        phone: address.phone || '',
        is_default: address.is_default,
      });
    } else {
      setEditingAddress(null);
      setAddressForm({
        full_name: profile?.username || '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'United States',
        phone: '',
        is_default: addresses.length === 0,
      });
    }
    setShowAddressModal(true);
  }

  async function handleSaveAddress(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);

    try {
      if (editingAddress) {
        const { error } = await supabase
          .from('shipping_addresses')
          .update(addressForm)
          .eq('id', editingAddress.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('shipping_addresses')
          .insert({
            user_id: user!.id,
            ...addressForm,
          });

        if (error) throw error;
      }

      await loadAddresses();
      setShowAddressModal(false);
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address. Please try again.');
    } finally {
      setProcessing(false);
    }
  }

  async function handleDeleteAddress(id: string) {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const { error } = await supabase
        .from('shipping_addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  }

  async function handleSetDefault(id: string) {
    try {
      const { error } = await supabase
        .from('shipping_addresses')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;
      await loadAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  }

  async function handleAvatarUpload(files: File[]) {
    if (files.length === 0 || !user) return;

    setUploadingAvatar(true);
    try {
      const file = files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      setProfileForm({ ...profileForm, avatar_url: publicUrl });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleBannerUpload(files: File[]) {
    if (files.length === 0 || !user) return;

    setUploadingBanner(true);
    try {
      const file = files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-banner-${Math.random()}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      setProfileForm({ ...profileForm, banner_url: publicUrl, banner_video_url: '' });
    } catch (error) {
      console.error('Error uploading banner:', error);
      alert('Failed to upload banner image');
    } finally {
      setUploadingBanner(false);
    }
  }

  async function handleBannerVideoUpload(files: File[]) {
    if (files.length === 0 || !user) return;

    setUploadingBanner(true);
    try {
      const file = files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-banner-video-${Math.random()}.${fileExt}`;
      const filePath = `banner-videos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      setProfileForm({ ...profileForm, banner_video_url: publicUrl, banner_url: '' });
    } catch (error) {
      console.error('Error uploading banner video:', error);
      alert('Failed to upload banner video');
    } finally {
      setUploadingBanner(false);
    }
  }

  async function handleProfileVideoUpload(files: File[]) {
    if (files.length === 0 || !user) return;

    setUploadingVideo(true);
    try {
      const file = files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-profile-video-${Math.random()}.${fileExt}`;
      const filePath = `profile-videos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      setProfileForm({ ...profileForm, profile_video_url: publicUrl });
    } catch (error) {
      console.error('Error uploading profile video:', error);
      alert('Failed to upload profile video');
    } finally {
      setUploadingVideo(false);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);

    try {
      const { error } = await updateProfile(profileForm);
      if (error) throw error;
      setShowProfileModal(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setProcessing(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">Sign in to continue</h2>
          <p className="text-gray-400">You need to be signed in to manage settings</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-700 to-black">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent mb-8">Settings</h1>

        <div className="space-y-8">
          {/* Profile Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Profile</h2>
                <p className="text-gray-400">Manage your public profile information</p>
              </div>
              <Button onClick={() => setShowProfileModal(true)}>
                <Edit size={20} className="mr-2" />
                Edit Profile
              </Button>
            </div>

            <Card className="overflow-hidden">
              {/* Banner Section */}
              {(profile?.banner_url || profile?.banner_video_url) && (
                <div className="relative w-full aspect-[21/9] max-h-64 bg-gradient-to-br from-slate-700 to-slate-800">
                  {profile.banner_video_url ? (
                    <video
                      src={profile.banner_video_url}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <img
                      src={profile.banner_url}
                      alt="Profile Banner"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              )}

              <div className="p-6">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div className="relative -mt-16 sm:-mt-20">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.username}
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-slate-800 shadow-xl"
                      />
                    ) : (
                      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-orange-500 to-yellow-600 flex items-center justify-center border-4 border-slate-800 shadow-xl">
                        <User size={40} className="text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 break-words">@{profile?.username}</h3>
                    <p className="text-gray-400 mb-4 break-words">{profile?.bio || 'No bio yet'}</p>
                    <div className="flex flex-wrap gap-4">
                      {profile?.lightning_address && (
                        <div className="flex items-center gap-2 text-sm">
                          <Zap size={16} className="text-orange-500 flex-shrink-0" />
                          <span className="text-gray-300 truncate">{profile.lightning_address}</span>
                        </div>
                      )}
                      {profile?.nostr_pubkey && (
                        <div className="flex items-center gap-2 text-sm">
                          <Shield size={16} className="text-purple-500 flex-shrink-0" />
                          <span className="text-gray-300 truncate">{profile.nostr_pubkey.slice(0, 16)}...</span>
                          {nostrVerified && <CheckCircle size={16} className="text-green-400 flex-shrink-0" />}
                        </div>
                      )}
                    </div>

                    {/* Profile Video */}
                    {profile?.profile_video_url && (
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-white">
                            {profile.video_title || 'My Video'}
                          </h4>
                          {profile.video_date && (
                            <span className="text-xs text-gray-500">
                              {new Date(profile.video_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <div className="rounded-lg overflow-hidden max-w-md">
                          <video
                            src={profile.profile_video_url}
                            className="w-full"
                            controls
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Wallet Addresses Section */}
          <WalletAddressManager />

          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Shipping Addresses</h2>
                <p className="text-gray-400">Manage where your gifts will be shipped</p>
                <p className="text-sm text-amber-500 mt-1">
                  🔒 Private - Only you can see your addresses
                </p>
              </div>
              <Button onClick={() => openAddressModal()}>
                <Plus size={20} className="mr-2" />
                Add Address
              </Button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => (
                  <Card key={i} className="p-6 animate-pulse">
                    <div className="h-6 bg-gray-800 rounded mb-4" />
                    <div className="h-4 bg-gray-800 rounded mb-2" />
                    <div className="h-4 bg-gray-800 rounded w-2/3" />
                  </Card>
                ))}
              </div>
            ) : addresses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((address) => (
                  <Card key={address.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={20} className="text-orange-500" />
                        <h3 className="font-bold text-white">{address.full_name}</h3>
                      </div>
                      {address.is_default && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                          Default
                        </span>
                      )}
                    </div>

                    <div className="text-gray-300 text-sm space-y-1 mb-4">
                      <p>{address.address_line1}</p>
                      {address.address_line2 && <p>{address.address_line2}</p>}
                      <p>
                        {address.city}, {address.state} {address.postal_code}
                      </p>
                      <p>{address.country}</p>
                      {address.phone && <p>{address.phone}</p>}
                    </div>

                    <div className="flex gap-2">
                      {!address.is_default && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(address.id)}
                          className="flex-1"
                        >
                          <Check size={16} className="mr-1" />
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAddressModal(address)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAddress(address.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <MapPin size={64} className="text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No addresses yet</h3>
                <p className="text-gray-400 mb-6">
                  Add a shipping address so gifters know where to send items
                </p>
                <Button onClick={() => openAddressModal()}>
                  <Plus size={20} className="mr-2" />
                  Add Your First Address
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        title={editingAddress ? 'Edit Address' : 'Add New Address'}
        size="lg"
      >
        <form onSubmit={handleSaveAddress} className="space-y-4">
          <Input
            label="Full Name"
            value={addressForm.full_name}
            onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
            required
          />

          <Input
            label="Address Line 1"
            value={addressForm.address_line1}
            onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })}
            placeholder="Street address, P.O. box"
            required
          />

          <Input
            label="Address Line 2 (Optional)"
            value={addressForm.address_line2}
            onChange={(e) => setAddressForm({ ...addressForm, address_line2: e.target.value })}
            placeholder="Apartment, suite, unit, building, floor, etc."
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              value={addressForm.city}
              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
              required
            />

            <Input
              label="State / Province"
              value={addressForm.state}
              onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Postal Code"
              value={addressForm.postal_code}
              onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
              required
            />

            <Input
              label="Country"
              value={addressForm.country}
              onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
              required
            />
          </div>

          <Input
            label="Phone Number (Optional)"
            type="tel"
            value={addressForm.phone}
            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
            placeholder="+1 (555) 123-4567"
          />

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={addressForm.is_default}
              onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
              className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-orange-500 focus:ring-orange-500"
            />
            <span className="text-sm text-gray-300">Set as default shipping address</span>
          </label>

          <Button type="submit" className="w-full" loading={processing}>
            {editingAddress ? 'Update Address' : 'Add Address'}
          </Button>
        </form>
      </Modal>

      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="Edit Profile"
        size="lg"
      >
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Avatar Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Profile Picture</label>
            <div className="flex items-center gap-6">
              {profileForm.avatar_url ? (
                <img
                  src={profileForm.avatar_url}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-2 border-orange-500"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-yellow-600 flex items-center justify-center">
                  <User size={40} className="text-white" />
                </div>
              )}
              <div className="flex-1">
                <MediaUpload
                  onFilesSelected={handleAvatarUpload}
                  accept="image/*"
                  maxFiles={1}
                  maxSizeMB={5}
                />
                {uploadingAvatar && <p className="text-sm text-orange-500 mt-2">Uploading...</p>}
              </div>
            </div>
          </div>

          {/* Banner Upload */}
          <div className="border-t border-gray-700 pt-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">Profile Banner</label>
            {(profileForm.banner_url || profileForm.banner_video_url) && (
              <div className="mb-4 rounded-lg overflow-hidden aspect-[21/9] max-h-48">
                {profileForm.banner_video_url ? (
                  <video
                    src={profileForm.banner_video_url}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                  />
                ) : (
                  <img
                    src={profileForm.banner_url}
                    alt="Banner"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            )}
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 mb-2">Upload Banner Image (recommended: 2100x900px)</p>
                <MediaUpload
                  onFilesSelected={handleBannerUpload}
                  accept="image/*"
                  maxFiles={1}
                  maxSizeMB={10}
                />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2">Or Upload Banner Video (max 50MB, MP4/WebM)</p>
                <MediaUpload
                  onFilesSelected={handleBannerVideoUpload}
                  accept="video/*"
                  maxFiles={1}
                  maxSizeMB={50}
                />
              </div>
              {uploadingBanner && <p className="text-sm text-orange-500">Uploading banner...</p>}
            </div>
          </div>

          {/* Profile Video */}
          <div className="border-t border-gray-700 pt-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">Profile Video (Optional)</label>
            <p className="text-xs text-gray-400 mb-3">Add a short intro video to your profile</p>
            {profileForm.profile_video_url && (
              <div className="mb-4 rounded-lg overflow-hidden max-w-md">
                <video
                  src={profileForm.profile_video_url}
                  className="w-full"
                  controls
                />
              </div>
            )}
            <MediaUpload
              onFilesSelected={handleProfileVideoUpload}
              accept="video/*"
              maxFiles={1}
              maxSizeMB={100}
            />
            {uploadingVideo && <p className="text-sm text-orange-500 mt-2">Uploading video...</p>}

            {profileForm.profile_video_url && (
              <div className="mt-4 space-y-3">
                <Input
                  label="Video Title"
                  value={profileForm.video_title}
                  onChange={(e) => setProfileForm({ ...profileForm, video_title: e.target.value })}
                  placeholder="My Story"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Video Date</label>
                  <input
                    type="date"
                    value={profileForm.video_date}
                    onChange={(e) => setProfileForm({ ...profileForm, video_date: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          <Input
            label="Username"
            value={profileForm.username}
            onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
            placeholder="your_username"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
            <textarea
              value={profileForm.bio}
              onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-700 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <Input
            label="Lightning Address (Optional)"
            value={profileForm.lightning_address}
            onChange={(e) => setProfileForm({ ...profileForm, lightning_address: e.target.value })}
            placeholder="you@getalby.com"
            icon={<Zap size={18} className="text-orange-500" />}
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              NOSTR Public Key (Optional)
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={profileForm.nostr_pubkey}
                  onChange={(e) => setProfileForm({ ...profileForm, nostr_pubkey: e.target.value })}
                  placeholder="npub1... or hex pubkey"
                  className="flex-1 px-4 py-3 bg-slate-700 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <Button
                  type="button"
                  onClick={async () => {
                    if (!window.nostr) {
                      alert('No Nostr extension found. Please install a Nostr browser extension.');
                      return;
                    }
                    setVerifyingNostr(true);
                    try {
                      const pubkey = await window.nostr.getPublicKey();
                      setProfileForm({ ...profileForm, nostr_pubkey: pubkey });
                      setNostrVerified(true);
                    } catch (error) {
                      console.error('Nostr verification error:', error);
                      alert('Failed to verify with Nostr extension');
                    } finally {
                      setVerifyingNostr(false);
                    }
                  }}
                  variant="outline"
                  disabled={verifyingNostr}
                >
                  {verifyingNostr ? 'Verifying...' : (
                    <>
                      <Shield size={18} className="mr-2" />
                      Verify
                    </>
                  )}
                </Button>
              </div>
              {nostrVerified && (
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <CheckCircle size={16} />
                  <span>Verified with Nostr extension</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Preferred Currency
            </label>
            <select
              value={profileForm.preferred_currency}
              onChange={(e) => setProfileForm({ ...profileForm, preferred_currency: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="JPY">JPY - Japanese Yen</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="AUD">AUD - Australian Dollar</option>
              <option value="CHF">CHF - Swiss Franc</option>
              <option value="CNY">CNY - Chinese Yuan</option>
              <option value="SEK">SEK - Swedish Krona</option>
              <option value="NZD">NZD - New Zealand Dollar</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Used for displaying Bitcoin prices on your pages
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-sm text-blue-400">
              <strong>Tip:</strong> Your profile is public and will be visible on your wishlists.
              Adding your NOSTR public key helps verify your identity in the decentralized web.
            </p>
          </div>

          <Button type="submit" className="w-full" loading={processing}>
            Save Profile
          </Button>
        </form>
      </Modal>
    </div>
  );
}
