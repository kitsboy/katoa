import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from './Button';
import { Card } from './Card';
import { QRScanner } from './QRScanner';
import { Wallet, Plus, Trash2, QrCode, Edit2, Check, X, Zap, Bitcoin, Shield } from 'lucide-react';

interface WalletAddress {
  id: string;
  address_type: 'lightning' | 'xpub' | 'pynym';
  address_value: string;
  label: string;
  is_active: boolean;
  created_at: string;
}

export function WalletAddressManager() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<WalletAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    address_type: 'lightning' as 'lightning' | 'xpub' | 'pynym',
    address_value: '',
    label: '',
  });

  useEffect(() => {
    if (user) {
      loadAddresses();
    }
  }, [user]);

  async function loadAddresses() {
    try {
      const { data, error } = await supabase
        .from('wallet_addresses')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddAddress() {
    if (!formData.address_value.trim()) return;

    try {
      const { error } = await supabase.from('wallet_addresses').insert({
        user_id: user?.id,
        address_type: formData.address_type,
        address_value: formData.address_value.trim(),
        label: formData.label.trim(),
        is_active: true,
      });

      if (error) throw error;

      setFormData({ address_type: 'lightning', address_value: '', label: '' });
      setShowAddForm(false);
      loadAddresses();
    } catch (error) {
      console.error('Error adding address:', error);
      alert('Failed to add address');
    }
  }

  async function handleDeleteAddress(id: string) {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const { error } = await supabase
        .from('wallet_addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address');
    }
  }

  async function handleToggleActive(id: string, currentState: boolean) {
    try {
      const { error } = await supabase
        .from('wallet_addresses')
        .update({ is_active: !currentState })
        .eq('id', id);

      if (error) throw error;
      loadAddresses();
    } catch (error) {
      console.error('Error updating address:', error);
    }
  }

  async function handleUpdateLabel(id: string, newLabel: string) {
    try {
      const { error } = await supabase
        .from('wallet_addresses')
        .update({ label: newLabel })
        .eq('id', id);

      if (error) throw error;
      setEditingId(null);
      loadAddresses();
    } catch (error) {
      console.error('Error updating label:', error);
    }
  }

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'lightning':
        return <Zap size={20} className="text-yellow-400" />;
      case 'xpub':
        return <Bitcoin size={20} className="text-orange-500" />;
      case 'pynym':
        return <Shield size={20} className="text-purple-400" />;
      default:
        return <Wallet size={20} />;
    }
  };

  const getAddressTypeName = (type: string) => {
    switch (type) {
      case 'lightning':
        return 'Lightning Address';
      case 'xpub':
        return 'XPUB Address';
      case 'pynym':
        return 'PYNYM Payment Code';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center text-night-blue-300">Loading addresses...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-night-blue-400 to-night-blue-500 border-night-blue-400">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Wallet size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Payment Addresses</h3>
              <p className="text-sm text-night-blue-200">Manage your Bitcoin payment methods</p>
            </div>
          </div>
          {!showAddForm && (
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-emerald-500 to-cyan-600"
            >
              <Plus size={20} className="mr-2" />
              Add Address
            </Button>
          )}
        </div>

        {showAddForm && (
          <div className="mb-6 p-4 bg-night-blue-500 rounded-lg border border-night-blue-400">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-night-blue-200 mb-2">
                  Address Type
                </label>
                <select
                  value={formData.address_type}
                  onChange={(e) =>
                    setFormData({ ...formData, address_type: e.target.value as any })
                  }
                  className="w-full px-4 py-3 bg-night-blue-400 border border-night-blue-400 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="lightning">Lightning Address</option>
                  <option value="xpub">XPUB Address</option>
                  <option value="pynym">PYNYM Payment Code</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-night-blue-200 mb-2">
                  Address / Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.address_value}
                    onChange={(e) =>
                      setFormData({ ...formData, address_value: e.target.value })
                    }
                    placeholder={
                      formData.address_type === 'lightning'
                        ? 'you@getalby.com'
                        : formData.address_type === 'xpub'
                        ? 'xpub...'
                        : 'PM8T...'
                    }
                    className="flex-1 px-4 py-3 bg-night-blue-400 border border-night-blue-400 rounded-lg text-white placeholder-night-blue-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <Button
                    onClick={() => setShowScanner(true)}
                    variant="outline"
                    className="px-4"
                  >
                    <QrCode size={20} />
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-night-blue-200 mb-2">
                  Label (optional)
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="My main wallet"
                  className="w-full px-4 py-3 bg-night-blue-400 border border-night-blue-400 rounded-lg text-white placeholder-night-blue-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleAddAddress}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-600"
                >
                  <Check size={20} className="mr-2" />
                  Add Address
                </Button>
                <Button
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ address_type: 'lightning', address_value: '', label: '' });
                  }}
                  variant="outline"
                >
                  <X size={20} />
                </Button>
              </div>
            </div>
          </div>
        )}

        {addresses.length === 0 ? (
          <div className="text-center py-12">
            <Wallet size={48} className="mx-auto text-night-blue-400 mb-4" />
            <p className="text-night-blue-300 mb-2">No payment addresses yet</p>
            <p className="text-sm text-night-blue-400">
              Add your first address to start receiving Bitcoin payments
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`p-4 rounded-lg border transition-all ${
                  address.is_active
                    ? 'bg-night-blue-400 border-night-blue-400'
                    : 'bg-night-blue-500/50 border-night-blue-400 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getAddressIcon(address.address_type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-night-blue-200">
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
                        className="w-full px-2 py-1 mb-2 bg-night-blue-500 border border-night-blue-400 rounded text-sm text-white"
                        autoFocus
                      />
                    ) : (
                      address.label && (
                        <p className="text-sm text-night-blue-300 mb-2">{address.label}</p>
                      )
                    )}

                    <code className="block text-xs text-night-blue-200 bg-night-blue-500 px-2 py-1 rounded break-all">
                      {address.address_value}
                    </code>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingId(address.id)}
                      className="p-2 text-night-blue-300 hover:text-white transition-colors"
                      title="Edit label"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleToggleActive(address.id, address.is_active)}
                      className="p-2 text-night-blue-300 hover:text-emerald-400 transition-colors"
                      title={address.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {address.is_active ? <Check size={16} /> : <X size={16} />}
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="p-2 text-night-blue-300 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {showScanner && (
        <QRScanner
          onScan={(data) => {
            setFormData({ ...formData, address_value: data });
            setShowScanner(false);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
