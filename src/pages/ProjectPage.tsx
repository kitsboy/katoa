import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Link } from '../components/Link';

import { PaymentMethodManager } from '../components/PaymentMethodManager';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { PageMeta } from '../components/PageMeta';
import { supabase } from '../lib/supabase';
import { parseProductUrl } from '../lib/productParser';
import {
  Plus, Edit, Trash2, Settings, Gift, ArrowLeft,
  Wallet, Globe, Lock, FileText,
  ExternalLink, Save, X, Camera, Upload
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
  const { toast } = useToast();
  const { t } = useLanguage();
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
  const [deleteWishlistId, setDeleteWishlistId] = useState<string | null>(null);

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
      toast(error.message || t('error.updateProject'), 'error');
    } finally {
      setProcessing(false);
    }
  }

  async function handleBackgroundUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!project || !files || files.length === 0) return;

    setProcessing(true);
    try {
      const file = files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${project.id}-${Date.now()}.${fileExt}`;

      console.log('Uploading project background:', fileName);

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      console.log('Background uploaded, URL:', publicUrl);

      const { error: updateError } = await supabase
        .from('projects')
        .update({ background_url: publicUrl })
        .eq('id', project.id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      await loadProject();
      console.log('Project background saved successfully');
    } catch (error) {
      console.error('Error uploading background:', error);
      toast(`${t('error.uploadBackground')}: ${(error as Error).message}`, 'error');
    } finally {
      setProcessing(false);
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
      toast(error.message || t('error.createWishlist'), 'error');
    } finally {
      setProcessing(false);
    }
  }

  async function handleDeleteWishlist(id: string) {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setDeleteWishlistId(null);
      loadWishlists();
      toast(t('success.deleted'));
    } catch (error) {
      console.error('Error deleting wishlist:', error);
      toast(t('error.deleteWishlist'), 'error');
    } finally {
      setProcessing(false);
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
      toast(error.message || t('error.updateWishlist'), 'error');
    } finally {
      setProcessing(false);
    }
  }

  const getVisibilityBadge = (visibility: string) => {
    if (visibility === 'public') {
      return (
        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.3)] whitespace-nowrap">
          <Globe size={14} />
          Public
        </span>
      );
    } else if (visibility === 'private') {
      return (
        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/50 flex items-center gap-1.5 shadow-[0_0_10px_rgba(59,130,246,0.3)] whitespace-nowrap">
          <Lock size={14} />
          Private
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-gray-500/20 text-gray-400 border border-gray-500/50 flex items-center gap-1.5 whitespace-nowrap">
          <FileText size={14} />
          Draft
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <div className="text-white text-xl font-bold">Loading project...</div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-charcoal-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-black text-white mb-4">Project Not Found</h2>
          <p className="text-gray-400 mb-8">This project doesn't exist or you don't have access to it.</p>
          <Link href="/dashboard">
            <Button className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 font-bold">
              <ArrowLeft size={18} className="mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal-950">
      <PageMeta
        title={project.title}
        description={project.description || 'Manage your KATOA creator project.'}
        path="/project"
        noindex
      />
      <div className="relative">
        <input
          type="file"
          id="project-background-upload"
          accept="image/*"
          onChange={handleBackgroundUpload}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => document.getElementById('project-background-upload')?.click()}
          className="w-full relative group/banner cursor-pointer"
          disabled={processing}
          title="Click to upload or change banner image"
        >
          {project.background_url ? (
            <div
              className="h-96 bg-cover bg-center relative"
              style={{ backgroundImage: `url(${project.background_url})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/banner:opacity-100 transition-opacity flex items-center justify-center">
                <div className="text-center">
                  <Camera size={64} className="mx-auto text-white mb-3" />
                  <p className="text-white text-xl font-bold">Click to change banner</p>
                  <p className="text-gray-300 text-sm mt-1">1500x400px recommended</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-96 bg-charcoal-900 relative flex items-center justify-center hover:bg-white/5 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-70" />
              <div className="text-center relative z-10">
                <Upload size={80} className="mx-auto text-gray-600 group-hover/banner:text-orange-500 transition-colors mb-3" />
                <p className="text-gray-500 text-xl font-bold group-hover/banner:text-white transition-colors">Click to upload banner</p>
                <p className="text-gray-600 text-sm mt-1">1500x400px recommended</p>
              </div>
            </div>
          )}
          {processing && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-3"></div>
                <p className="text-white font-bold">Uploading...</p>
              </div>
            </div>
          )}
        </button>

        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-white/80 hover:text-white mb-6 group transition-colors backdrop-blur-sm bg-black/30 px-4 py-2 rounded-lg"
              title="Return to your projects dashboard"
            >
              <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="font-bold">Back to Dashboard</span>
            </Link>

            <div className="flex items-end justify-between">
              <div className="flex-1">
                {editing ? (
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="text-5xl font-black text-white bg-black/50 backdrop-blur-md border-b-4 border-orange-500 focus:outline-none focus:border-orange-400 w-full mb-4 px-4 py-2 rounded-t-lg"
                    placeholder="Project Title"
                    title="Edit your project title"
                  />
                ) : (
                  <h1
                    className="text-6xl font-black text-white mb-4 drop-shadow-2xl"
                    style={{ textShadow: '0 4px 12px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.5)' }}
                  >
                    {project.title}
                  </h1>
                )}
                {editing ? (
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-5 py-4 bg-black/50 backdrop-blur-md border-2 border-white/10 rounded-xl text-white text-lg placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    rows={3}
                    placeholder="Describe your project and what you're building..."
                    title="Edit your project description"
                  />
                ) : (
                  <p
                    className="text-white/90 text-xl leading-relaxed max-w-3xl backdrop-blur-sm bg-black/20 px-4 py-2 rounded-lg"
                    style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
                  >
                    {project.description || 'Add a description to tell people about your project'}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 ml-6">
                <div title={`This project is ${project.visibility}`}>
                  {getVisibilityBadge(project.visibility)}
                </div>
                {editing ? (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpdateProject}
                      className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                      loading={processing}
                      title="Save your changes"
                    >
                      <Save size={18} className="mr-2" />
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
                      className="border-white/10 text-gray-300 hover:bg-white/5 backdrop-blur-sm bg-black/30"
                      title="Cancel editing"
                    >
                      <X size={18} />
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setEditing(true)}
                    className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 font-bold shadow-[0_0_20px_rgba(255,135,0,0.3)]"
                    title="Edit project details and settings"
                  >
                    <Edit size={18} className="mr-2" />
                    Edit Project
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {editing && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            <Card className=" p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-orange-500/20 rounded-xl">
                  <Camera size={24} className="text-orange-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">Banner Image</h3>
                  <p className="text-gray-400 text-sm">Project header background</p>
                </div>
              </div>
              <div className="p-5 bg-orange-500/10 border-2 border-orange-500/30 rounded-xl hover:border-orange-500/50 transition-colors">
                <p className="text-orange-400 font-bold flex items-center gap-2 mb-2">
                  <Upload size={18} />
                  How to Update Banner
                </p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Click on the large banner image at the top of this page to upload or change your project's background image. Recommended size: 1500x400px.
                </p>
              </div>
            </Card>

            <Card className=" p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Settings size={24} className="text-purple-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">Visibility</h3>
                  <p className="text-gray-400 text-sm">Control who can see this</p>
                </div>
              </div>
              <select
                value={formData.visibility}
                onChange={(e) => setFormData({ ...formData, visibility: e.target.value as any })}
                className="w-full px-5 py-4 bg-black border-2 border-white/10 rounded-xl text-white font-bold text-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 cursor-pointer hover:border-purple-500/50 transition-colors"
              >
                <option value="draft">�� Draft - Only you can see this project</option>
                <option value="private">🔗 Private - Anyone with the link can view</option>
                <option value="public">🌍 Public - Listed on Explore page</option>
              </select>
              <p className="text-gray-400 text-sm mt-4 leading-relaxed">
                Choose how your project appears to others. You can change this anytime.
              </p>
            </Card>
          </div>
        )}

        <Card className="mb-12  p-8 group/payment hover:border-emerald-500/50 transition-all duration-300" title="Configure where you receive Bitcoin payments">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-500/20 rounded-xl group-hover/payment:bg-emerald-500/30 transition-colors">
              <Wallet size={28} className="text-emerald-500 group-hover/payment:scale-110 transition-transform" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white group-hover/payment:text-emerald-400 transition-colors">Payment Methods</h2>
              <p className="text-gray-400 text-sm">Where supporters send Bitcoin contributions</p>
            </div>
          </div>
          <div className="p-5 bg-blue-500/10 border-2 border-blue-500/30 rounded-xl mb-6 hover:border-blue-500/50 transition-colors">
            <p className="text-blue-400 font-bold flex items-center gap-2 mb-2">
              <Wallet size={18} />
              Why Payment Methods Matter
            </p>
            <p className="text-gray-300 text-sm leading-relaxed">
              Add your Bitcoin addresses and Lightning Network details so supporters can send you sats. You can add multiple payment methods and they'll all be displayed on your public project page.
            </p>
          </div>
          <PaymentMethodManager projectId={project.id} />
        </Card>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 group/wishlist-header">
              <div className="p-3 bg-purple-500/20 rounded-xl group-hover/wishlist-header:bg-purple-500/30 transition-colors">
                <Gift size={28} className="text-purple-500 group-hover/wishlist-header:scale-110 transition-transform" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white group-hover/wishlist-header:text-purple-400 transition-colors">Wishlists</h2>
                <p className="text-gray-400">Items and goals within this project</p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateWishlist(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 font-black text-lg px-6 py-3 shadow-[0_0_30px_rgba(168,85,247,0.3)]"
              title="Create a new wishlist to organize items or goals"
            >
              <Plus size={22} className="mr-2" />
              Create Wishlist
            </Button>
          </div>
          <div className="p-5 bg-purple-500/10 border-2 border-purple-500/30 rounded-xl mb-8 hover:border-purple-500/50 transition-colors" title="Learn about wishlists">
            <p className="text-purple-400 font-bold flex items-center gap-2 mb-2">
              <Gift size={18} />
              About Wishlists
            </p>
            <p className="text-gray-300 text-sm leading-relaxed">
              Wishlists let you organize specific items, goals, or campaigns within your project. Each wishlist has its own page where supporters can see what you need and contribute directly.
            </p>
          </div>
        </div>

        {wishlists.length === 0 ? (
          <Card className="text-center py-20 ">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl mb-6 shadow-[0_0_40px_rgba(168,85,247,0.5)]">
              <Gift size={48} className="text-white" />
            </div>
            <h3 className="text-3xl font-black text-white mb-3">Create Your First Wishlist</h3>
            <p className="text-gray-300 text-lg mb-8 max-w-md mx-auto leading-relaxed">
              Wishlists help you organize specific items or goals. Start building your project by creating your first wishlist.
            </p>
            <Button
              onClick={() => setShowCreateWishlist(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 font-black text-lg px-8 py-4 shadow-[0_0_30px_rgba(168,85,247,0.4)]"
            >
              <Plus size={24} className="mr-2" />
              Create Wishlist
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {wishlists.map((wishlist) => (
              <Card
                key={wishlist.id}
                className=" hover:border-purple-500/50 transition-all duration-300 p-8 group hover:shadow-[0_0_40px_rgba(168,85,247,0.25)]"
              >
                {editingWishlist === wishlist.id && editWishlistForm ? (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">
                        Wishlist Title
                      </label>
                      <input
                        type="text"
                        value={editWishlistForm.title}
                        onChange={(e) => setEditWishlistForm({ ...editWishlistForm, title: e.target.value })}
                        placeholder="e.g., Recording Equipment Fund"
                        className="w-full px-5 py-4 bg-black border-2 border-white/10 rounded-xl text-white text-lg font-bold placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">
                        Description
                      </label>
                      <textarea
                        value={editWishlistForm.description}
                        onChange={(e) => setEditWishlistForm({ ...editWishlistForm, description: e.target.value })}
                        placeholder="Tell supporters what this wishlist is for and why it matters..."
                        className="w-full px-5 py-4 bg-black border-2 border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 leading-relaxed"
                        rows={4}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">
                        Visibility
                      </label>
                      <select
                        value={editWishlistForm.visibility}
                        onChange={(e) => setEditWishlistForm({ ...editWishlistForm, visibility: e.target.value as any })}
                        className="w-full px-5 py-4 bg-black border-2 border-white/10 rounded-xl text-white font-bold text-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
                      >
                        <option value="draft">🔒 Draft - Only you can see this</option>
                        <option value="private">🔗 Private - Anyone with the link</option>
                        <option value="public">🌍 Public - Listed everywhere</option>
                      </select>
                    </div>
                    <div className="flex gap-3 pt-4 border-t border-white/10">
                      <Button
                        onClick={() => handleUpdateWishlist(wishlist.id)}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 font-black text-lg py-4 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                        loading={processing}
                      >
                        <Save size={20} className="mr-2" />
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={cancelWishlistEdit}
                        className="flex-1 border-white/10 text-gray-300 hover:bg-white/5 font-bold text-lg py-4"
                        disabled={processing}
                      >
                        <X size={20} className="mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <h3 className="text-2xl font-black text-white group-hover:text-purple-400 transition-colors mb-2">
                          {wishlist.title}
                        </h3>
                        <p className="text-gray-300 leading-relaxed">
                          {wishlist.description || 'No description provided'}
                        </p>
                      </div>
                      <div className="ml-4">
                        {getVisibilityBadge(wishlist.visibility)}
                      </div>
                    </div>

                    {(wishlist.total_sats_goal > 0 || wishlist.total_sats_raised > 0) && (
                      <div className="mb-6 p-5 bg-black/50 rounded-xl border border-white/10">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">Progress</span>
                          <span className="text-white font-bold">
                            {wishlist.total_sats_raised.toLocaleString()} / {wishlist.total_sats_goal.toLocaleString()} sats
                          </span>
                        </div>
                        <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                            style={{
                              width: `${Math.min((wishlist.total_sats_raised / wishlist.total_sats_goal) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Link href={`/wishlist/${wishlist.slug}`} className="flex-1">
                        <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 font-bold text-lg py-4">
                          <ExternalLink size={20} className="mr-2" />
                          View Wishlist
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        onClick={() => startEditingWishlist(wishlist)}
                        className="border-white/10 text-gray-300 hover:bg-white/5 hover:text-purple-400 hover:border-purple-500/50 px-5"
                      >
                        <Edit size={20} />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setDeleteWishlistId(wishlist.id)}
                        className="border-white/10 text-gray-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 px-5"
                        aria-label={t('confirm.deleteWishlist.title')}
                      >
                        <Trash2 size={20} />
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
            helperText="Auto-populate details from URL"
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
            helperText="Leave blank to auto-generate"
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={wishlistForm.description}
              onChange={(e) => setWishlistForm({ ...wishlistForm, description: e.target.value })}
              placeholder="What is this wishlist for?"
              className="w-full px-4 py-2 bg-white/[0.03] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan-500"
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
              loading={processing}
            >
              Create Wishlist
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteWishlistId !== null}
        title={t('confirm.deleteWishlist.title')}
        message={t('confirm.deleteWishlist.message')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        loading={processing}
        onConfirm={() => deleteWishlistId && handleDeleteWishlist(deleteWishlistId)}
        onCancel={() => setDeleteWishlistId(null)}
      />
    </div>
  );
}
