import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { Modal } from './Modal';
import { Input } from './Input';
import { QRScanner } from './QRScanner';
import { supabase } from '../lib/supabase';
import {
  Plus, Edit, Trash2, Bitcoin, Zap, Hash, Shield, Star,
  Check, X, Scan, ExternalLink
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  method_type: 'bitcoin_xpub' | 'bitcoin_address' | 'lightning' | 'nostr' | 'nym' | 'bolt12';
  label: string;
  address: string;
  metadata: any;
  is_primary: boolean;
  is_active: boolean;
}

interface PaymentMethodManagerProps {
  projectId: string;
}

export function PaymentMethodManager({ projectId }: PaymentMethodManagerProps) {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = useState(false);

  const [formData, setFormData] = useState({
    method_type: 'bitcoin_address' as PaymentMethod['method_type'],
    label: '',
    address: '',
    derivation_path: "m/84'/0'/0'/0",
    is_primary: false,
  });

  const [showQRScanner, setShowQRScanner] = useState(false);

  function handleQRScan(data: string) {
    setFormData({ ...formData, address: data });
    setShowQRScanner(false);
  }

  useEffect(() => {
    loadPaymentMethods();
  }, [projectId]);

  async function loadPaymentMethods() {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('project_id', projectId)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMethods(data || []);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
      setLoading(false);
    }
  }

  function openModal(method?: PaymentMethod) {
    if (method) {
      setEditingMethod(method);
      setFormData({
        method_type: method.method_type,
        label: method.label,
        address: method.address,
        derivation_path: method.metadata?.derivation_path || "m/84'/0'/0'/0",
        is_primary: method.is_primary,
      });
    } else {
      setEditingMethod(null);
      setFormData({
        method_type: 'bitcoin_address',
        label: '',
        address: '',
        derivation_path: "m/84'/0'/0'/0",
        is_primary: methods.length === 0,
      });
    }
    setShowModal(true);
  }

  async function handleSaveMethod(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);

    try {
      const metadata = formData.method_type === 'bitcoin_xpub'
        ? { derivation_path: formData.derivation_path }
        : {};

      if (editingMethod) {
        const { error } = await supabase
          .from('payment_methods')
          .update({
            label: formData.label,
            address: formData.address,
            metadata,
            is_primary: formData.is_primary,
          })
          .eq('id', editingMethod.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('payment_methods')
          .insert({
            project_id: projectId,
            method_type: formData.method_type,
            label: formData.label,
            address: formData.address,
            metadata,
            is_primary: formData.is_primary,
            is_active: true,
          });

        if (error) throw error;
      }

      setShowModal(false);
      loadPaymentMethods();
    } catch (error: any) {
      console.error('Error saving payment method:', error);
      alert(error.message || 'Failed to save payment method');
    } finally {
      setProcessing(false);
    }
  }

  async function handleDeleteMethod(id: string) {
    if (!confirm('Are you sure you want to delete this payment method?')) return;

    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadPaymentMethods();
    } catch (error) {
      console.error('Error deleting payment method:', error);
      alert('Failed to delete payment method');
    }
  }

  async function toggleActive(method: PaymentMethod) {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_active: !method.is_active })
        .eq('id', method.id);

      if (error) throw error;
      loadPaymentMethods();
    } catch (error) {
      console.error('Error toggling payment method:', error);
    }
  }

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'bitcoin_xpub':
      case 'bitcoin_address':
        return <Bitcoin className="text-orange-400" size={20} />;
      case 'lightning':
        return <Zap className="text-yellow-400" size={20} />;
      case 'nostr':
        return <Hash className="text-purple-400" size={20} />;
      case 'nym':
        return <Shield className="text-blue-400" size={20} />;
      case 'bolt12':
        return <Zap className="text-cyan-400" size={20} />;
      default:
        return <Bitcoin size={20} />;
    }
  };

  const getMethodLabel = (type: string) => {
    switch (type) {
      case 'bitcoin_xpub':
        return 'Bitcoin xPub (HD Wallet)';
      case 'bitcoin_address':
        return 'Bitcoin Address';
      case 'lightning':
        return 'Lightning Network';
      case 'nostr':
        return 'Nostr (Zaps)';
      case 'nym':
        return 'Nym/Pynym';
      case 'bolt12':
        return 'BOLT12 Offer';
      default:
        return type;
    }
  };

  if (loading) {
    return <div className="text-night-blue-300">Loading payment methods...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <p className="text-night-blue-300 text-sm">
          Add multiple payment methods to accept Bitcoin via different networks
        </p>
        <Button
          onClick={() => openModal()}
          className="bg-gradient-to-r from-emerald-500 to-cyan-600"
        >
          <Plus size={16} className="mr-2" />
          Add Method
        </Button>
      </div>

      {methods.length === 0 ? (
        <Card className="text-center py-8 bg-night-blue-shadow-700/50 border-night-blue-500">
          <Bitcoin size={48} className="mx-auto text-night-blue-400 mb-3" />
          <p className="text-night-blue-300 mb-4">No payment methods configured</p>
          <Button onClick={() => openModal()} variant="outline">
            <Plus size={16} className="mr-2" />
            Add Your First Payment Method
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {methods.map((method) => (
            <Card
              key={method.id}
              className={`bg-night-blue-shadow-700/50 border-night-blue-500 transition-all ${
                !method.is_active && 'opacity-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">{getMethodIcon(method.method_type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-semibold">{method.label}</h4>
                      {method.is_primary && (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full flex items-center gap-1">
                          <Star size={10} />
                          Primary
                        </span>
                      )}
                      {method.is_active ? (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-bold rounded-full flex items-center gap-1">
                          <Check size={10} />
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-night-blue-400/20 text-night-blue-300 text-xs font-bold rounded-full flex items-center gap-1">
                          <X size={10} />
                          Disabled
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-night-blue-400 mb-2">
                      {getMethodLabel(method.method_type)}
                    </p>
                    <code className="text-xs text-night-blue-300 bg-night-blue-500 px-2 py-1 rounded break-all block">
                      {method.address.length > 60
                        ? `${method.address.slice(0, 30)}...${method.address.slice(-30)}`
                        : method.address}
                    </code>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleActive(method)}
                    className="text-night-blue-300 hover:text-white"
                  >
                    {method.is_active ? <X size={16} /> : <Check size={16} />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openModal(method)}
                    className="text-night-blue-300 hover:text-emerald-400"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteMethod(method.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
      >
        <form onSubmit={handleSaveMethod} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-night-blue-200 mb-2">
              Payment Method Type
            </label>
            <select
              value={formData.method_type}
              onChange={(e) => setFormData({ ...formData, method_type: e.target.value as any })}
              className="w-full px-4 py-3 bg-night-blue-shadow-700/50 border border-night-blue-400 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              disabled={!!editingMethod}
            >
              <option value="bitcoin_address">Bitcoin Address</option>
              <option value="bitcoin_xpub">Bitcoin xPub (HD Wallet)</option>
              <option value="lightning">Lightning Address/LNURL</option>
              <option value="nostr">Nostr Public Key (Zaps)</option>
              <option value="nym">Nym/Pynym Address</option>
              <option value="bolt12">BOLT12 Offer</option>
            </select>
          </div>

          <Input
            label="Label"
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            placeholder="e.g., Main Wallet, Lightning Node"
            required
          />

          <div>
            <label className="block text-sm font-medium text-night-blue-200 mb-2">
              {formData.method_type === 'bitcoin_xpub' ? 'Extended Public Key (xpub)' :
              formData.method_type === 'lightning' ? 'Lightning Address or LNURL' :
              formData.method_type === 'nostr' ? 'Nostr Public Key (npub)' :
              formData.method_type === 'nym' ? 'Nym/Pynym Address' :
              'Address'}
            </label>
            <div className="flex gap-2">
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder={
                  formData.method_type === 'bitcoin_xpub' ? 'xpub6...' :
                  formData.method_type === 'lightning' ? 'user@getalby.com' :
                  formData.method_type === 'nostr' ? 'npub1...' :
                  formData.method_type === 'nym' ? 'nym address' :
                  'Enter address'
                }
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowQRScanner(true)}
                className="flex-shrink-0"
              >
                <Scan size={16} />
              </Button>
            </div>
          </div>

          {formData.method_type === 'bitcoin_xpub' && (
            <Input
              label="Derivation Path"
              value={formData.derivation_path}
              onChange={(e) => setFormData({ ...formData, derivation_path: e.target.value })}
              placeholder="m/84'/0'/0'/0"
              helpText="BIP84 path for native SegWit addresses"
            />
          )}

          <div className="flex items-center gap-3 p-4 bg-night-blue-shadow-700/50 rounded-lg border border-night-blue-400">
            <input
              type="checkbox"
              id="is_primary"
              checked={formData.is_primary}
              onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
              className="w-4 h-4 rounded border-night-blue-400 text-emerald-500 focus:ring-emerald-500"
            />
            <label htmlFor="is_primary" className="text-sm text-night-blue-200">
              Set as primary payment method
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
              className="flex-1"
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-600"
              disabled={processing}
            >
              {processing ? 'Saving...' : editingMethod ? 'Update' : 'Add Method'}
            </Button>
          </div>
        </form>
      </Modal>

      {showQRScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowQRScanner(false)}
        />
      )}
    </div>
  );
}
