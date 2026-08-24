import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, asRows, isSupabaseConfigured } from '../lib/supabase';
import type { WalletAddressType } from '../types/database';
import type { WalletAddress as DbWalletAddress } from '../types/database';
import { Button } from './Button';
import { Card } from './Card';
import { ConfirmDialog } from './ConfirmDialog';
import { EmptyState } from './EmptyState';
import { QRScanner } from './QRScanner';
import { useToast } from './Toast';
import { Wallet, Plus, Trash2, QrCode, Edit2, Check, X, Zap, Bitcoin, Shield, Globe } from 'lucide-react';
import {
  decodePaymentUri,
  validateLightningAddress,
  validateWalletAddress,
} from '../lib/validateAddress';
import { bitcoinQrData, getQrImageUrl, lightningQrData } from '../lib/qr';
import { getStorage, setStorage, STORAGE_KEYS } from '../lib/storage';

type WalletAddress = DbWalletAddress;

function loadLocalWallets(userId: string): WalletAddress[] {
  const all = getStorage<WalletAddress[]>(STORAGE_KEYS.walletAddresses, []);
  return all.filter((w) => w.user_id === userId);
}

function persistLocalWallets(userId: string, nextForUser: WalletAddress[]): void {
  const all = getStorage<WalletAddress[]>(STORAGE_KEYS.walletAddresses, []);
  const others = all.filter((w) => w.user_id !== userId);
  setStorage(STORAGE_KEYS.walletAddresses, [...others, ...nextForUser]);
}

function newLocalWallet(
  userId: string,
  address_type: WalletAddressType,
  address_value: string,
  label: string
): WalletAddress {
  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return {
    id,
    user_id: userId,
    address_type,
    address_value,
    label,
    is_active: true,
    created_at: new Date().toISOString(),
  };
}

type PrimaryReceiveQr = {
  kind: 'lightning' | 'onchain';
  value: string;
  uri: string;
};

function primaryReceiveQr(
  addresses: WalletAddress[],
  profileLightning?: string | null
): PrimaryReceiveQr | null {
  const active = addresses.filter((a) => a.is_active);
  const ln = active.find((a) => a.address_type === 'lightning');
  if (ln) {
    const value = decodePaymentUri(ln.address_value);
    return { kind: 'lightning', value, uri: lightningQrData(value) };
  }
  const on = active.find((a) => a.address_type === 'onchain');
  if (on) {
    const value = decodePaymentUri(on.address_value);
    return { kind: 'onchain', value, uri: bitcoinQrData(value) };
  }
  const profileLn = profileLightning?.trim();
  if (profileLn) {
    const value = decodePaymentUri(profileLn);
    return { kind: 'lightning', value, uri: lightningQrData(value) };
  }
  return null;
}

export function WalletAddressManager() {
  const { user, isDemoUser, updateProfile, profile } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<WalletAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    address_type: WalletAddressType;
    address_value: string;
    label: string;
  }>({
    address_type: 'lightning',
    address_value: '',
    label: '',
  });
  const [deleteAddressId, setDeleteAddressId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [useLocal, setUseLocal] = useState(isDemoUser || !isSupabaseConfigured());
  const [settingProfileLn, setSettingProfileLn] = useState<string | null>(null);

  const persistLocal = useCallback(
    (next: WalletAddress[]) => {
      if (!user?.id) return;
      persistLocalWallets(user.id, next);
      setAddresses(next);
    },
    [user?.id]
  );

  const loadAddresses = useCallback(async () => {
    if (!user?.id) return;
    const preferLocal = isDemoUser || !isSupabaseConfigured();
    if (preferLocal) {
      setUseLocal(true);
      setAddresses(loadLocalWallets(user.id));
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('wallet_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUseLocal(false);
      setAddresses(asRows<WalletAddress>(data));
    } catch (error) {
      console.error('Error loading addresses:', error);
      setUseLocal(true);
      setAddresses(loadLocalWallets(user.id));
    } finally {
      setLoading(false);
    }
  }, [user?.id, isDemoUser]);

  useEffect(() => {
    if (user) {
      loadAddresses();
    }
  }, [user, loadAddresses]);

  const receiveQr = useMemo(
    () => primaryReceiveQr(addresses, profile?.lightning_address),
    [addresses, profile?.lightning_address]
  );

  async function handleAddAddress() {
    if (adding || !user?.id) return;

    const addressValue = decodePaymentUri(formData.address_value);
    const validationError = validateWalletAddress(formData.address_type, addressValue);
    if (validationError) {
      setFormError(validationError);
      toast(validationError, 'error');
      return;
    }

    setFormError(null);
    setAdding(true);

    const payload = {
      user_id: user.id,
      address_type: formData.address_type,
      address_value: addressValue,
      label: formData.label.trim(),
      is_active: true,
    };

    try {
      if (!useLocal) {
        const { error } = await supabase.from('wallet_addresses').insert(payload);
        if (error) throw error;
        setFormData({ address_type: 'lightning', address_value: '', label: '' });
        setShowAddForm(false);
        await loadAddresses();
        return;
      }

      persistLocal([newLocalWallet(user.id, payload.address_type, payload.address_value, payload.label), ...addresses]);
      setFormData({ address_type: 'lightning', address_value: '', label: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding address:', error);
      persistLocal([newLocalWallet(user.id, payload.address_type, payload.address_value, payload.label), ...addresses]);
      setUseLocal(true);
      setFormData({ address_type: 'lightning', address_value: '', label: '' });
      setShowAddForm(false);
      toast('Saved on this device (live wallet table unavailable)', 'info');
    } finally {
      setAdding(false);
    }
  }

  async function handleDeleteAddress(id: string) {
    setDeleting(true);
    try {
      if (!useLocal) {
        const { error } = await supabase.from('wallet_addresses').delete().eq('id', id);
        if (error) throw error;
        setDeleteAddressId(null);
        await loadAddresses();
        toast(t('success.deleted'));
        return;
      }
      persistLocal(addresses.filter((a) => a.id !== id));
      setDeleteAddressId(null);
      toast(t('success.deleted'));
    } catch (error) {
      console.error('Error deleting address:', error);
      persistLocal(addresses.filter((a) => a.id !== id));
      setUseLocal(true);
      setDeleteAddressId(null);
      toast(t('success.deleted'));
    } finally {
      setDeleting(false);
    }
  }

  async function handleToggleActive(id: string, currentState: boolean) {
    const next = addresses.map((a) => (a.id === id ? { ...a, is_active: !currentState } : a));
    try {
      if (!useLocal) {
        const { error } = await supabase
          .from('wallet_addresses')
          .update({ is_active: !currentState })
          .eq('id', id);
        if (error) throw error;
        await loadAddresses();
        return;
      }
      persistLocal(next);
    } catch (error) {
      console.error('Error updating address:', error);
      persistLocal(next);
      setUseLocal(true);
    }
  }

  async function handleUpdateLabel(id: string, newLabel: string) {
    const next = addresses.map((a) => (a.id === id ? { ...a, label: newLabel } : a));
    try {
      if (!useLocal) {
        const { error } = await supabase.from('wallet_addresses').update({ label: newLabel }).eq('id', id);
        if (error) throw error;
        setEditingId(null);
        await loadAddresses();
        return;
      }
      persistLocal(next);
      setEditingId(null);
    } catch (error) {
      console.error('Error updating label:', error);
      persistLocal(next);
      setUseLocal(true);
      setEditingId(null);
    }
  }

  async function handleSetProfileLightning(address: WalletAddress) {
    const value = decodePaymentUri(address.address_value);
    const err = validateLightningAddress(value);
    if (err) {
      toast(err, 'error');
      return;
    }
    setSettingProfileLn(address.id);
    try {
      const { error } = await updateProfile({ lightning_address: value });
      if (error) {
        toast(error.message || 'Could not update profile Lightning', 'error');
        return;
      }
      toast('Profile Lightning address updated', 'success');
    } finally {
      setSettingProfileLn(null);
    }
  }

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'lightning':
        return <Zap size={20} className="text-yellow-400" />;
      case 'onchain':
        return <Bitcoin size={20} className="text-orange-400" />;
      case 'xpub':
        return <Bitcoin size={20} className="text-orange-500" />;
      case 'pynym':
        return <Shield size={20} className="text-purple-400" />;
      case 'nostr':
        return <Globe size={20} className="text-cyan-400" />;
      default:
        return <Wallet size={20} />;
    }
  };

  const getAddressTypeName = (type: string) => {
    switch (type) {
      case 'lightning':
        return 'Lightning Address';
      case 'onchain':
        return 'On-chain Bitcoin';
      case 'xpub':
        return 'XPUB Address';
      case 'pynym':
        return 'PYNYM Payment Code';
      case 'nostr':
        return 'Nostr Public Key';
      default:
        return type;
    }
  };

  const addressPlaceholder = (type: WalletAddressType) => {
    switch (type) {
      case 'lightning':
        return 'you@getalby.com';
      case 'onchain':
        return 'bc1q...';
      case 'xpub':
        return 'xpub...';
      case 'nostr':
        return 'npub1...';
      case 'pynym':
        return 'PM8T...';
      default:
        return 'Address';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-400">Loading addresses...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card variant="glass" className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Wallet size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Payment Addresses</h3>
              <p className="text-sm text-gray-300">
                {useLocal
                  ? 'Saved on this device (demo/offline — not a live wallet table)'
                  : 'Manage your Bitcoin payment methods'}
              </p>
            </div>
          </div>
          {!showAddForm && (
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-emerald-500 to-cyan-600 min-h-[44px]"
            >
              <Plus size={20} className="mr-2" />
              Add Address
            </Button>
          )}
        </div>

        {receiveQr && (
          <div className="mb-6 p-4 rounded-xl border border-white/10 bg-black/40 flex flex-col sm:flex-row items-center gap-4">
            <div className="bg-white p-3 rounded-lg shrink-0">
              <img
                src={getQrImageUrl(receiveQr.uri, 180)}
                alt={receiveQr.kind === 'onchain' ? 'BIP-21 Bitcoin receive QR' : 'Lightning receive QR'}
                className="w-36 h-36"
                width={144}
                height={144}
              />
            </div>
            <div className="min-w-0 text-center sm:text-left">
              <p className="text-sm font-bold text-white">
                {receiveQr.kind === 'onchain' ? 'BIP-21 receive QR' : 'Lightning receive QR'}
              </p>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                Primary {receiveQr.kind === 'onchain' ? 'on-chain' : 'Lightning'} address.
                Katoa never settles Lightning for you — scan pays this address in your wallet.
              </p>
              <code className="mt-2 block text-[11px] text-gray-200 break-all">{receiveQr.uri}</code>
            </div>
          </div>
        )}

        {showAddForm && (
          <div className="mb-6 p-4 bg-charcoal-900 rounded-lg border border-white/20">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="wallet-address-type">
                  Address Type
                </label>
                <select
                  id="wallet-address-type"
                  value={formData.address_type}
                  onChange={(e) => {
                    setFormError(null);
                    setFormData({ ...formData, address_type: e.target.value as WalletAddress['address_type'] });
                  }}
                  className="w-full px-4 py-3 min-h-[44px] bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="lightning">Lightning Address</option>
                  <option value="onchain">On-chain Bitcoin</option>
                  <option value="xpub">XPUB Address</option>
                  <option value="pynym">PYNYM Payment Code</option>
                  <option value="nostr">Nostr Public Key</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="wallet-address-value">
                  Address / Code
                </label>
                <div className="flex gap-2">
                  <input
                    id="wallet-address-value"
                    type="text"
                    value={formData.address_value}
                    onChange={(e) => {
                      setFormError(null);
                      setFormData({ ...formData, address_value: e.target.value });
                    }}
                    aria-invalid={formError ? true : undefined}
                    aria-describedby={formError ? 'wallet-address-error' : undefined}
                    placeholder={addressPlaceholder(formData.address_type)}
                    className="flex-1 px-4 py-3 min-h-[44px] bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <Button
                    type="button"
                    onClick={() => setShowScanner(true)}
                    variant="outline"
                    className="px-4 min-h-[44px] min-w-[44px]"
                    aria-label="Scan or paste QR"
                  >
                    <QrCode size={20} />
                  </Button>
                </div>
                {formError && (
                  <p id="wallet-address-error" className="mt-1 text-sm text-red-400" role="alert">
                    {formError}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="wallet-address-label">
                  Label (optional)
                </label>
                <input
                  id="wallet-address-label"
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="My main wallet"
                  className="w-full px-4 py-3 min-h-[44px] bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleAddAddress}
                  disabled={adding}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-600 min-h-[44px]"
                >
                  <Check size={20} className="mr-2" />
                  Add Address
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormError(null);
                    setFormData({ address_type: 'lightning', address_value: '', label: '' });
                  }}
                  variant="outline"
                  className="min-h-[44px] min-w-[44px]"
                  aria-label="Cancel"
                >
                  <X size={20} />
                </Button>
              </div>
            </div>
          </div>
        )}

        {addresses.length === 0 ? (
          <EmptyState
            icon={<Wallet size={32} />}
            title="No payment addresses yet"
            description="Add your first address to start receiving Bitcoin payments"
            actionLabel="Add Address"
            onAction={() => setShowAddForm(true)}
          />
        ) : (
          <div className="space-y-3">
            {addresses.map((address) => {
              const isReusableLightning =
                address.address_type === 'lightning' &&
                (address.address_value.includes('@') || address.address_value.toLowerCase().startsWith('lnurl'));
              return (
                <div
                  key={address.id}
                  className={`p-4 rounded-lg border transition-all ${
                    address.is_active
                      ? 'bg-white/5 border-white/20'
                      : 'bg-white/[0.03] border-white/20 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getAddressIcon(address.address_type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-medium text-gray-300">
                          {getAddressTypeName(address.address_type)}
                        </span>
                        {address.is_active && (
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                            Active
                          </span>
                        )}
                      </div>

                      {editingId === address.id ? (
                        <input
                          type="text"
                          defaultValue={address.label}
                          onBlur={(e) => handleUpdateLabel(address.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleUpdateLabel(address.id, e.currentTarget.value);
                            }
                          }}
                          className="w-full px-2 py-2 mb-2 min-h-[44px] bg-charcoal-900 border border-white/20 rounded text-sm text-white"
                          autoFocus
                        />
                      ) : (
                        address.label && (
                          <p className="text-sm text-gray-400 mb-2">{address.label}</p>
                        )
                      )}

                      <code className="block text-xs text-gray-300 bg-charcoal-900 px-2 py-1 rounded break-all">
                        {address.address_value}
                      </code>

                      {isReusableLightning && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="mt-2 min-h-[44px] text-amber-400 hover:text-amber-300"
                          loading={settingProfileLn === address.id}
                          onClick={() => handleSetProfileLightning(address)}
                        >
                          <Zap size={14} className="mr-1" />
                          Set as profile Lightning
                        </Button>
                      )}
                    </div>

                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingId(address.id)}
                        className="p-2 text-gray-400 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                        aria-label="Edit label"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(address.id, address.is_active)}
                        className="p-2 text-gray-400 hover:text-emerald-400 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                        aria-label={address.is_active ? 'Deactivate address' : 'Activate address'}
                      >
                        {address.is_active ? <Check size={16} /> : <X size={16} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteAddressId(address.id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                        aria-label={t('confirm.deleteAddress.title')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {showScanner && (
        <QRScanner
          onScan={(data) => {
            setFormData({ ...formData, address_value: decodePaymentUri(data) });
            setShowScanner(false);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}

      <ConfirmDialog
        isOpen={deleteAddressId !== null}
        title={t('confirm.deleteAddress.title')}
        message={t('confirm.deleteAddress.message')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        loading={deleting}
        onConfirm={() => deleteAddressId && handleDeleteAddress(deleteAddressId)}
        onCancel={() => setDeleteAddressId(null)}
      />
    </div>
  );
}
