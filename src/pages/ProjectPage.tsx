import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Link } from '../components/Link';
import { MediaUpload } from '../components/MediaUpload';
import { PaymentMethodManager } from '../components/PaymentMethodManager';
import { supabase } from '../lib/supabase';
import { parseProductUrl } from '../lib/productParser';
import {
  Plus, Edit, Trash2, Settings, Gift, ArrowLeft,
  Image as ImageIcon, Wallet, Globe, Lock, FileText,
  ExternalLink, Save, X
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  slug: string;
  background_url: string | null;
  wallet_address: string | null;
  lightning_address: string | null;
  nostr_pubkey: string | null;
  visibility: 'public' | 'private' | 'draft';
  settings: any;
}

interface Wishlist {
  id: string;
  title: string;
  description: string;
  slug: string;
  visibility: 'public' | 'private' | 'draft';
  total_sats_raised: number;
  total_sats_goal: number;
  created_at: string;
}

export function ProjectPage() {
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showCreateWishlist, setShowCreateWishlist] = useState(false);
  const [editingWishlist, setEditingWishlist] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    wallet_address: '',
    lightning_address: '',
    nostr_pubkey: '',
    visibility: 'draft' as 'public' | 'private' | 'draft',
  });

  const [wishlistForm, setWishlistForm] = useState({
    title: '',
    description: '',
    slug: '',
    url: '',
  });

  const [editWishlistForm, setEditWishlistForm] = useState<{
    title: string;
    description: string;
    visibility: 'public' | 'private' | 'draft';
  } | null>(null);

  const [parsingUrl, setParsingUrl] = useState(false);

  const slug = window.location.pathname.split('/').pop();

  useEffect(() => {
    if (user && slug) {
      loadProject();
      loadWishlists();
    }
  }, [user, slug]);

  async function loadProject() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .eq('creator_id', user!.id)
        .single();

      if (error) throw error;

      setProject(data);
      setFormData({
        title: data.title,
        description: data.description || '',
        wallet_address: data.wallet_address || '',
        lightning_address: data.lightning_address || '',
        nostr_pubkey: data.nostr_pubkey || '',
        visibility: data.visibility,
      });
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadWishlists() {
    try {
      const { data: projectData } = await supabase
        .from('projects')
        .select('id')
        .eq('slug', slug)
        .single();

      if (!projectData) return;

      const { data, error } = await supabase
        .from('wishlists')
        .select('*')
        .eq('project_id', projectData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWishlists(data || []);
    } catch (error) {
      console.error('Error loading wishlists:', error);
    }
  }

  async function handleUpdateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!project) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          title: formData.title,
          description: formData.description,
          wallet_address: formData.wallet_address,
          lightning_address: formData.lightning_address,
          nostr_pubkey: formData.nostr_pubkey,
          visibility: formData.visibility,
        })
        .eq('id', project.id);

      if (error) throw error;

      setEditing(false);
      loadProject();
    } catch (error: any) {
      console.error('Error updating project:', error);
      alert(error.message || 'Failed to update project');
    } finally {
      setProcessing(false);
    }
  }

  async function handleBackgroundUpload(files: File[]) {
    if (!project || files.length === 0) return;

    try {
      const file = files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${project.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('projects')
        .update({ background_url: publicUrl })
        .eq('id', project.id);

      if (updateError) throw updateError;

      loadProject();
    } catch (error) {
      console.error('Error uploading background:', error);
      alert('Failed to upload background');
    }
  }

  async function handleParseUrl() {
    if (!wishlistForm.url) return;

    setParsingUrl(true);
    try {
      const parsed = await parseProductUrl(wishlistForm.url);
      if (parsed) {
        setWishlistForm({
          ...wishlistForm,
          title: parsed.title || wishlistForm.title,
          description: parsed.description || wishlistForm.description,
        });
      }
    } catch (error) {
      console.error('Error parsing URL:', error);
    } finally {
      setParsingUrl(false);
    }
  }

  async function handleCreateWishlist(e: React.FormEvent) {
    e.preventDefault();
    if (!project) return;

    setProcessing(true);
    try {
      const slug = wishlistForm.slug || wishlistForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const { error } = await supabase.from('wishlists').insert({
        project_id: project.id,
        creator_id: user!.id,
        title: wishlistForm.title,
        description: wishlistForm.description,
        slug,
        visibility: 'draft',
      });

      if (error) throw error;

      setShowCreateWishlist(false);
      setWishlistForm({ title: '', description: '', slug: '', url: '' });
      loadWishlists();
    } catch (error: any) {
      console.error('Error creating wishlist:', error);
      alert(error.message || 'Failed to create wishlist');
    } finally {
      setProcessing(false);
    }
  }

  async function handleDeleteWishlist(id: string) {
    if (!confirm('Are you sure you want to delete this wishlist?')) return;

    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadWishlists();
    } catch (error) {
      console.error('Error deleting wishlist:', error);
      alert('Failed to delete wishlist');
    }
  }

  function startEditingWishlist(wishlist: Wishlist) {
    setEditingWishlist(wishlist.id);
    setEditWishlistForm({
      title: wishlist.title,
      description: wishlist.description,
      visibility: wishlist.visibility,
    });
  }

  function cancelWishlistEdit() {
    setEditingWishlist(null);
    setEditWishlistForm(null);
  }

  async function handleUpdateWishlist(wishlistId: string) {
    if (!editWishlistForm) return;
    setProcessing(true);

    try {
      const { error } = await supabase
        .from('wishlists')
        .update({
          title: editWishlistForm.title,
          description: editWishlistForm.description,
          visibility: editWishlistForm.visibility,
        })
        .eq('id', wishlistId);

      if (error) throw error;

      setEditingWishlist(null);
      setEditWishlistForm(null);
      loadWishlists();
    } catch (error: any) {
      console.error('Error updating wishlist:', error);
      alert(error.message || 'Failed to update wishlist');
    } finally {
      setProcessing(false);
    }
  }

  const getVisibilityBadge = (visibility: string) => {
    const badges = {
      public: { icon: Globe, text: 'Public', color: 'emerald' },
      private: { icon: Lock, text: 'Private', color: 'blue' },
      draft: { icon: FileText, text: 'Draft', color: 'slate' },
    };

    const badge = badges[visibility as keyof typeof badges];
    const Icon = badge.icon;

    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-bold bg-${badge.color}-500/20 text-${badge.color}-400 border border-${badge.color}-500/30 flex items-center gap-1`}>
        <Icon size={12} />
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-700 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-700 to-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Project not found</h2>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-700 to-black">
      {project.background_url && (
        <div
          className="h-64 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${project.background_url})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-800" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <Link href="/dashboard" className="inline-flex items-center text-slate-400 hover:text-white mb-6">
          <ArrowLeft size={20} className="mr-2" />
          Back to Projects
        </Link>

        <div className="flex justify-between items-start mb-8">
          <div className="flex-1">
            {editing ? (
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="text-4xl font-black mb-2"
              />
            ) : (
              <h1 className="text-4xl font-black text-white mb-2">{project.title}</h1>
            )}
            {editing ? (
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
                rows={3}
              />
            ) : (
              <p className="text-slate-400">{project.description || 'No description'}</p>
            )}
          </div>

          <div className="flex gap-2">
            {getVisibilityBadge(project.visibility)}
            {editing ? (
              <>
                <Button
                  onClick={handleUpdateProject}
                  className="bg-emerald-500 hover:bg-emerald-600"
                  disabled={processing}
                >
                  <Save size={16} className="mr-2" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      title: project.title,
                      description: project.description || '',
                      wallet_address: project.wallet_address || '',
                      lightning_address: project.lightning_address || '',
                      nostr_pubkey: project.nostr_pubkey || '',
                      visibility: project.visibility,
                    });
                  }}
                >
                  <X size={16} />
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={() => setEditing(true)}
                className="border-emerald-500/30 hover:border-emerald-500"
              >
                <Edit size={16} className="mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>

        {editing && (
          <Card className="mb-8 bg-slate-800/50 border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">Project Settings</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Background Image
                </label>
                <MediaUpload onUpload={handleBackgroundUpload} maxFiles={1} />
              </div>

              <Input
                label="Bitcoin Wallet Address"
                value={formData.wallet_address}
                onChange={(e) => setFormData({ ...formData, wallet_address: e.target.value })}
                placeholder="bc1q..."
                icon={<Wallet size={16} />}
              />

              <Input
                label="Lightning Address"
                value={formData.lightning_address}
                onChange={(e) => setFormData({ ...formData, lightning_address: e.target.value })}
                placeholder="username@wallet.com"
              />

              <Input
                label="Nostr Public Key"
                value={formData.nostr_pubkey}
                onChange={(e) => setFormData({ ...formData, nostr_pubkey: e.target.value })}
                placeholder="npub1..."
              />

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Visibility
                </label>
                <select
                  value={formData.visibility}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value as any })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="draft">Draft (only you)</option>
                  <option value="private">Private (link only)</option>
                  <option value="public">Public (listed)</option>
                </select>
              </div>
            </div>
          </Card>
        )}

        <Card className="mb-8 bg-slate-800/50 border-slate-700">
          <div className="flex items-center gap-2 mb-6">
            <Wallet className="text-emerald-400" size={24} />
            <h3 className="text-xl font-bold text-white">Payment Methods</h3>
          </div>
          <PaymentMethodManager projectId={project.id} />
        </Card>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Wishlists</h2>
          <Button
            onClick={() => setShowCreateWishlist(true)}
            className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700"
          >
            <Plus size={20} className="mr-2" />
            New Wishlist
          </Button>
        </div>

        {wishlists.length === 0 ? (
          <Card className="text-center py-16">
            <Gift size={64} className="mx-auto text-slate-600 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No wishlists yet</h3>
            <p className="text-slate-400 mb-6">Create your first wishlist in this project</p>
            <Button
              onClick={() => setShowCreateWishlist(true)}
              className="bg-gradient-to-r from-emerald-500 to-cyan-600"
            >
              <Plus size={20} className="mr-2" />
              Create Wishlist
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlists.map((wishlist) => (
              <Card
                key={wishlist.id}
                className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 hover:border-emerald-500/50 transition-all group"
              >
                {editingWishlist === wishlist.id && editWishlistForm ? (
                  <div className="space-y-3">
                    <Input
                      value={editWishlistForm.title}
                      onChange={(e) => setEditWishlistForm({ ...editWishlistForm, title: e.target.value })}
                      placeholder="Wishlist title"
                    />
                    <textarea
                      value={editWishlistForm.description}
                      onChange={(e) => setEditWishlistForm({ ...editWishlistForm, description: e.target.value })}
                      placeholder="Description"
                      className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      rows={3}
                    />
                    <select
                      value={editWishlistForm.visibility}
                      onChange={(e) => setEditWishlistForm({ ...editWishlistForm, visibility: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                    >
                      <option value="draft">Draft (only you)</option>
                      <option value="private">Private (link only)</option>
                      <option value="public">Public (listed)</option>
                    </select>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleUpdateWishlist(wishlist.id)}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                        disabled={processing}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={cancelWishlistEdit}
                        className="flex-1"
                        disabled={processing}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {wishlist.title}
                      </h3>
                      {getVisibilityBadge(wishlist.visibility)}
                    </div>

                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                      {wishlist.description || 'No description'}
                    </p>

                    <div className="flex gap-2">
                      <Link href={`/wishlist/${wishlist.slug}`} className="flex-1">
                        <Button variant="outline" className="w-full border-emerald-500/30 hover:border-emerald-500">
                          <ExternalLink size={16} className="mr-2" />
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        onClick={() => startEditingWishlist(wishlist)}
                        className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleDeleteWishlist(wishlist.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showCreateWishlist}
        onClose={() => setShowCreateWishlist(false)}
        title="Create New Wishlist"
      >
        <form onSubmit={handleCreateWishlist} className="space-y-4">
          <Input
            label="Wishlist URL (optional)"
            value={wishlistForm.url}
            onChange={(e) => setWishlistForm({ ...wishlistForm, url: e.target.value })}
            placeholder="https://amazon.com/wishlist/..."
            helpText="Auto-populate details from URL"
            icon={<ExternalLink size={16} />}
          />

          {wishlistForm.url && (
            <Button
              type="button"
              variant="outline"
              onClick={handleParseUrl}
              disabled={parsingUrl}
              className="w-full"
            >
              {parsingUrl ? 'Parsing...' : 'Auto-fill from URL'}
            </Button>
          )}

          <Input
            label="Wishlist Title"
            value={wishlistForm.title}
            onChange={(e) => setWishlistForm({ ...wishlistForm, title: e.target.value })}
            placeholder="My Wishlist"
            required
          />

          <Input
            label="Slug (URL)"
            value={wishlistForm.slug}
            onChange={(e) => setWishlistForm({ ...wishlistForm, slug: e.target.value })}
            placeholder="my-wishlist"
            helpText="Leave blank to auto-generate"
          />

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={wishlistForm.description}
              onChange={(e) => setWishlistForm({ ...wishlistForm, description: e.target.value })}
              placeholder="What is this wishlist for?"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateWishlist(false)}
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
              {processing ? 'Creating...' : 'Create Wishlist'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
