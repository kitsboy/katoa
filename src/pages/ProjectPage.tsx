import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Link } from '../components/Link';

import { PaymentMethodManager } from '../components/PaymentMethodManager';
import { CoverVideoUpload } from '../components/CoverVideoUpload';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { PageMeta } from '../components/PageMeta';
import { EmptyState } from '../components/EmptyState';
import { VisibilityBadge } from '../components/VisibilityBadge';
import { GlassCallout } from '../components/GlassCallout';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { CardSkeleton } from '../components/Skeleton';
import { supabase, asRow, asRows } from '../lib/supabase';
import type { Project as DbProject, Visibility } from '../types/database';
import { parseProductUrl, type ParsedProduct } from '../lib/productParser';
import { ProductUrlImport } from '../components/ProductUrlImport';
import {
  findDemoProjectBySlug,
  getDemoWishlistsForProject,
  setDemoWishlistsForProject,
  upsertDemoProject,
  type DemoProject,
  type DemoWishlist,
  type DemoWishlistItem,
} from '../lib/demoProjectStore';
import {
  Plus, Edit, Trash2, Settings, Gift, ArrowLeft,
  Wallet, ExternalLink, Save, X, Camera, Upload, Package, FolderOpen
} from 'lucide-react';

type Project = DemoProject;

interface Wishlist {
  id: string;
  title: string;
  description: string;
  slug: string;
  visibility: 'public' | 'private' | 'draft';
  total_sats_raised: number;
  total_sats_goal: number;
  created_at: string;
  project_id?: string;
  items?: DemoWishlistItem[];
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function toDemoWishlists(projectId: string, list: Wishlist[]): DemoWishlist[] {
  return list.map((w) => ({
    id: w.id,
    project_id: w.project_id || projectId,
    title: w.title,
    description: w.description,
    slug: w.slug,
    visibility: w.visibility,
    total_sats_raised: w.total_sats_raised,
    total_sats_goal: w.total_sats_goal,
    created_at: w.created_at,
    items: w.items ?? [],
  }));
}

function newId(prefix: string) {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? `${prefix}-${crypto.randomUUID()}`
    : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ProjectPage() {
  const { user, isDemoUser } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { slug: slugParam } = useParams<{ slug: string }>();
  const slug = slugParam?.trim() || undefined;

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
    cover_video_url: '' as string,
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
  const [addItemWishlistId, setAddItemWishlistId] = useState<string | null>(null);

  const applyProject = useCallback((next: Project) => {
    setProject(next);
    setFormData({
      title: next.title,
      description: next.description || '',
      wallet_address: next.wallet_address || '',
      lightning_address: next.lightning_address || '',
      nostr_pubkey: next.nostr_pubkey || '',
      visibility: next.visibility,
      cover_video_url: (next.settings?.cover_video_url as string) || '',
    });
  }, []);

  const loadProject = useCallback(async () => {
    if (!slug) {
      setProject(null);
      setLoading(false);
      return;
    }
    try {
      if (isDemoUser) {
        const found = findDemoProjectBySlug(slug);
        if (found) applyProject(found);
        else setProject(null);
        return;
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .eq('creator_id', user!.id)
        .single();

      if (error) throw error;

      const loaded = asRow<Project>(data);
      if (!loaded) {
        setProject(null);
        return;
      }

      applyProject(loaded);
    } catch (error) {
      console.error('Error loading project:', error);
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [slug, user, isDemoUser, applyProject]);

  const loadWishlists = useCallback(async () => {
    if (!slug) return;
    try {
      if (isDemoUser) {
        const found = findDemoProjectBySlug(slug);
        if (!found) {
          setWishlists([]);
          return;
        }
        setWishlists(getDemoWishlistsForProject(found.id, found.slug));
        return;
      }

      const { data: projectData } = await supabase
        .from('projects')
        .select('id')
        .eq('slug', slug)
        .single();

      const loaded = asRow<Pick<DbProject, 'id'>>(projectData);
      if (!loaded) return;

      const { data, error } = await supabase
        .from('wishlists')
        .select('*')
        .eq('project_id', loaded.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWishlists(asRows<Wishlist>(data));
    } catch (error) {
      console.error('Error loading wishlists:', error);
    }
  }, [slug, isDemoUser]);

  useEffect(() => {
    if (!user) return;
    if (!slug) {
      setProject(null);
      setWishlists([]);
      setLoading(false);
      return;
    }
    loadProject();
    loadWishlists();
  }, [user, slug, loadProject, loadWishlists]);

  function persistDemoWishlists(next: Wishlist[]) {
    if (!project) return;
    setWishlists(next);
    setDemoWishlistsForProject(project.id, toDemoWishlists(project.id, next));
  }

  async function handleUpdateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!project) return;

    setProcessing(true);
    try {
      if (isDemoUser) {
        const next: Project = {
          ...project,
          title: formData.title,
          description: formData.description,
          wallet_address: formData.wallet_address || null,
          lightning_address: formData.lightning_address || null,
          nostr_pubkey: formData.nostr_pubkey || null,
          visibility: formData.visibility,
          settings: { ...(project.settings || {}), cover_video_url: formData.cover_video_url },
        };
        upsertDemoProject(next);
        applyProject(next);
        setEditing(false);
        toast(t('success.saved'));
        return;
      }

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
    } catch (error: unknown) {
      console.error('Error updating project:', error);
      const message = error instanceof Error ? error.message : t('error.updateProject');
      toast(message, 'error');
    } finally {
      setProcessing(false);
    }
  }

  async function handleBackgroundUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!project || !files || files.length === 0) return;

    const file = files[0];
    if (isDemoUser) {
      const url = URL.createObjectURL(file);
      const next: Project = { ...project, background_url: url };
      upsertDemoProject(next);
      applyProject(next);
      toast('Demo cover is a session preview — a live account is required to persist uploads.', 'info');
      e.target.value = '';
      return;
    }

    setProcessing(true);
    try {
      const fileExt = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
      const fileName = `${user!.id}/project-${project.id}-${Date.now()}.${fileExt || 'bin'}`;

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

      const { error: updateError } = await supabase
        .from('projects')
        .update({ background_url: publicUrl })
        .eq('id', project.id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      await loadProject();
    } catch (error) {
      console.error('Error uploading background:', error);
      toast(`${t('error.uploadBackground')}: ${(error as Error).message}`, 'error');
    } finally {
      setProcessing(false);
    }
  }

  function handleDemoCoverVideo(url: string) {
    setFormData((prev) => ({ ...prev, cover_video_url: url }));
    if (!isDemoUser || !project) return;
    const next: Project = {
      ...project,
      settings: { ...(project.settings || {}), cover_video_url: url },
    };
    upsertDemoProject(next);
    setProject(next);
    toast('Demo cover video stays on this device for the session.', 'info');
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
        toast('Details filled from product page — create wishlist, then add items from links', 'success');
      } else {
        toast('Could not read that URL — fill details manually', 'error');
      }
    } catch (error) {
      console.error('Error parsing URL:', error);
      toast('Could not parse URL', 'error');
    } finally {
      setParsingUrl(false);
    }
  }

  async function handleImportProductItem(product: ParsedProduct) {
    if (!addItemWishlistId || !user) throw new Error('No wishlist selected');

    if (isDemoUser) {
      const next = wishlists.map((w) => {
        if (w.id !== addItemWishlistId) return w;
        const nextOrder = Math.max(0, ...(w.items || []).map((i) => i.sort_order)) + 1;
        const item: DemoWishlistItem = {
          id: newId('demo-item'),
          title: product.title.slice(0, 200),
          description: (product.description || '').slice(0, 2000),
          price_sats: product.price_sats || 21000,
          sats_raised: 0,
          image_url: product.image_url || '',
          product_url: product.product_url,
          merchant: product.merchant || 'Store',
          is_funded: false,
          sort_order: nextOrder,
        };
        return {
          ...w,
          items: [...(w.items || []), item],
          total_sats_goal: (w.total_sats_goal || 0) + (product.price_sats || 21000),
        };
      });
      persistDemoWishlists(next);
      toast('Demo only — this item stays on this device. Live accounts save products to your project.', 'info');
      setAddItemWishlistId(null);
      return;
    }

    const { data: existing } = await supabase
      .from('wishlist_items')
      .select('sort_order')
      .eq('wishlist_id', addItemWishlistId)
      .order('sort_order', { ascending: false })
      .limit(1);

    const nextOrder = (existing?.[0]?.sort_order ?? 0) + 1;

    const { error } = await supabase.from('wishlist_items').insert({
      wishlist_id: addItemWishlistId,
      title: product.title.slice(0, 200),
      description: (product.description || '').slice(0, 2000),
      price_sats: product.price_sats || 21000,
      sats_raised: 0,
      image_url: product.image_url || null,
      video_url: null,
      merchant_link: product.product_url,
      is_funded: false,
      sort_order: nextOrder,
    });

    if (error) throw error;

    const { data: wl } = await supabase
      .from('wishlists')
      .select('total_sats_goal')
      .eq('id', addItemWishlistId)
      .maybeSingle();
    if (wl) {
      await supabase
        .from('wishlists')
        .update({
          total_sats_goal: (wl.total_sats_goal || 0) + (product.price_sats || 21000),
        })
        .eq('id', addItemWishlistId);
    }

    toast('Product added — supporters can fund sats or buy the item for you', 'success');
    setAddItemWishlistId(null);
    loadWishlists();
  }

  async function handleCreateWishlist(e: React.FormEvent) {
    e.preventDefault();
    if (!project) return;

    setProcessing(true);
    try {
      const nextSlug = slugify(wishlistForm.slug || wishlistForm.title);

      if (isDemoUser) {
        const created: Wishlist = {
          id: newId('demo-wl'),
          project_id: project.id,
          title: wishlistForm.title,
          description: wishlistForm.description,
          slug: nextSlug || `wishlist-${Date.now()}`,
          visibility: 'draft',
          total_sats_raised: 0,
          total_sats_goal: 0,
          created_at: new Date().toISOString(),
          items: [],
        };
        persistDemoWishlists([created, ...wishlists]);
        setShowCreateWishlist(false);
        setWishlistForm({ title: '', description: '', slug: '', url: '' });
        toast(t('success.saved'));
        return;
      }

      const { error } = await supabase.from('wishlists').insert({
        project_id: project.id,
        creator_id: user!.id,
        title: wishlistForm.title,
        description: wishlistForm.description,
        slug: nextSlug,
        visibility: 'draft',
      });

      if (error) throw error;

      setShowCreateWishlist(false);
      setWishlistForm({ title: '', description: '', slug: '', url: '' });
      loadWishlists();
    } catch (error: unknown) {
      console.error('Error creating wishlist:', error);
      const message = error instanceof Error ? error.message : t('error.createWishlist');
      toast(message, 'error');
    } finally {
      setProcessing(false);
    }
  }

  async function handleDeleteWishlist(id: string) {
    setProcessing(true);
    try {
      if (isDemoUser) {
        persistDemoWishlists(wishlists.filter((w) => w.id !== id));
        setDeleteWishlistId(null);
        toast(t('success.deleted'));
        return;
      }

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
      if (isDemoUser) {
        persistDemoWishlists(
          wishlists.map((w) =>
            w.id === wishlistId
              ? {
                  ...w,
                  title: editWishlistForm.title,
                  description: editWishlistForm.description,
                  visibility: editWishlistForm.visibility,
                }
              : w
          )
        );
        setEditingWishlist(null);
        setEditWishlistForm(null);
        toast(t('success.saved'));
        return;
      }

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
    } catch (error: unknown) {
      console.error('Error updating wishlist:', error);
      const message = error instanceof Error ? error.message : t('error.updateWishlist');
      toast(message, 'error');
    } finally {
      setProcessing(false);
    }
  }

  const coverVideoUrl = formData.cover_video_url || (project?.settings?.cover_video_url as string) || '';

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal-950 pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6" role="status" aria-label={t('common.loading')}>
          <CardSkeleton variant="tall" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-charcoal-950 pt-24 px-4">
        <PageMeta title="Project not found" description="This project is missing or you don't have access." path="/project" noindex />
        <EmptyState
          icon={<FolderOpen size={32} />}
          title="Project not found"
          description="This project doesn't exist or you don't have access to it."
          actionLabel="Back to Dashboard"
          actionHref="/dashboard"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal-950 pb-24 md:pb-8">
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
          {coverVideoUrl ? (
            <div className="h-52 sm:h-64 lg:h-72 relative overflow-hidden bg-charcoal-900">
              <video
                src={coverVideoUrl}
                className="absolute inset-0 w-full h-full object-cover"
                muted
                playsInline
                loop
                autoPlay
                preload="metadata"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-black/30 to-black/20" />
            </div>
          ) : project.background_url ? (
            <div
              className="h-52 sm:h-64 lg:h-72 bg-cover bg-center relative"
              style={{ backgroundImage: `url(${project.background_url})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-black/25 to-black/20" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/banner:opacity-100 transition-opacity flex items-center justify-center">
                <div className="text-center">
                  <Camera size={36} className="mx-auto text-white mb-2" />
                  <p className="text-white text-sm font-semibold">Change cover</p>
                  <p className="text-gray-300 text-xs mt-1">1500×400 recommended</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-52 sm:h-64 lg:h-72 bg-charcoal-900 relative flex items-center justify-center hover:bg-white/5 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 to-transparent" />
              <div className="text-center relative z-10">
                <Upload size={40} className="mx-auto text-gray-600 group-hover/banner:text-bitcoin-orange-400 transition-colors mb-2" />
                <p className="text-gray-500 text-sm font-semibold group-hover/banner:text-white transition-colors">Upload cover</p>
                <p className="text-gray-600 text-xs mt-1">1500×400 recommended</p>
              </div>
            </div>
          )}
          {processing && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-bitcoin-orange-500 border-t-transparent mx-auto mb-3" />
                <p className="text-white text-sm font-semibold">Uploading…</p>
              </div>
            </div>
          )}
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <Card variant="glass" className="p-5 sm:p-7 mb-8">
          <Breadcrumbs
            items={[
              { label: t('dashboard.title'), href: '/dashboard' },
              { label: project.title },
            ]}
            className="mb-4"
          />
          <Link
            href="/dashboard"
            className="inline-flex items-center text-gray-400 hover:text-white mb-5 group transition-colors text-sm"
            title="Return to your projects dashboard"
          >
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-start gap-5">
            <div className="flex-1 min-w-0">
              {editing ? (
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="font-display text-2xl sm:text-3xl font-bold text-white bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-bitcoin-orange-500/40 w-full mb-3 px-4 py-2 rounded-xl"
                  placeholder={t('project.placeholder.title')}
                  title="Edit your project title"
                />
              ) : (
                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight">
                  {project.title}
                </h1>
              )}
              {editing ? (
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bitcoin-orange-500/40"
                  rows={3}
                  placeholder={t('project.placeholder.description')}
                  title="Edit your project description"
                />
              ) : (
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-3xl">
                  {project.description || 'Add a description to tell people about your project'}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
              <VisibilityBadge visibility={project.visibility} className="self-start" />
              {editing ? (
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdateProject}
                    variant="bitcoin"
                    loading={processing}
                    title="Save your changes"
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
                        cover_video_url: (project.settings?.cover_video_url as string) || '',
                      });
                    }}
                    title="Cancel editing"
                  >
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setEditing(true)}
                  variant="bitcoin"
                  title="Edit project details and settings"
                >
                  <Edit size={16} className="mr-2" />
                  Edit Project
                </Button>
              )}
            </div>
          </div>
        </Card>

        {editing && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
            <Card variant="glass" className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-bitcoin-orange-500/15 rounded-xl">
                  <Camera size={20} className="text-bitcoin-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Banner image</h3>
                  <p className="text-gray-400 text-sm">Project header background</p>
                </div>
              </div>
              <GlassCallout variant="bitcoin">
                <p className="font-semibold text-bitcoin-orange-200 mb-1">How to update</p>
                <p>
                  Click the cover at the top of this page to upload or change it. Recommended size: 1500×400.
                  {isDemoUser ? ' Demo covers stay on this device for the session.' : ''}
                </p>
              </GlassCallout>
            </Card>

            <Card variant="glass" className="p-6">
              <CoverVideoUpload
                currentUrl={formData.cover_video_url || null}
                onVideoUrl={handleDemoCoverVideo}
              />
              <Input
                label="Cover video URL (optional)"
                value={formData.cover_video_url}
                onChange={(e) => {
                  setFormData({ ...formData, cover_video_url: e.target.value });
                }}
                placeholder="https://…/preview.mp4"
                helperText={isDemoUser
                  ? 'Object URLs and pasted links persist locally for this demo session.'
                  : 'Demo preview URL — persisted when project settings support is enabled.'}
                className="mt-4"
              />
            </Card>

            <Card variant="glass" className="p-6 lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-white/5 rounded-xl">
                  <Settings size={20} className="text-gray-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Visibility</h3>
                  <p className="text-gray-400 text-sm">Control who can see this</p>
                </div>
              </div>
              <select
                value={formData.visibility}
                onChange={(e) => setFormData({ ...formData, visibility: e.target.value as Visibility })}
                className="w-full px-4 py-3 bg-charcoal-900 border border-white/10 rounded-xl text-white font-semibold focus:outline-none focus:ring-2 focus:ring-bitcoin-orange-500/40 cursor-pointer"
              >
                <option value="draft">Draft — only you can see this project</option>
                <option value="private">Private — anyone with the link can view</option>
                <option value="public">Public — listed on Explore</option>
              </select>
            </Card>
          </div>
        )}

        <Card variant="glass" className="mb-10 p-6 sm:p-8" title="Configure where you receive Bitcoin payments">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-emerald-500/15 rounded-xl">
              <Wallet size={22} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Payment methods</h2>
              <p className="text-gray-400 text-sm">Where supporters send Bitcoin contributions</p>
            </div>
          </div>
          <GlassCallout variant="info" className="mb-6">
            Add Bitcoin addresses and Lightning details so supporters can send you sats. You can add multiple methods.
          </GlassCallout>
          <PaymentMethodManager projectId={project.id} />
        </Card>

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-white">Wishlists</h2>
              <p className="text-gray-400 text-sm">Items and goals within this project</p>
            </div>
            <Button
              onClick={() => setShowCreateWishlist(true)}
              variant="bitcoin"
              title="Create a new wishlist to organize items or goals"
            >
              <Plus size={18} className="mr-2" />
              Create Wishlist
            </Button>
          </div>
          <GlassCallout variant="bitcoin" className="mb-6">
            Wishlists let you organize items, goals, or campaigns. Paste product links so supporters can fund in sats or buy the item for you.
          </GlassCallout>
        </div>

        {wishlists.length === 0 ? (
          <Card variant="glass">
            <EmptyState
              icon={<Gift size={32} />}
              title="Create your first wishlist"
              description="Wishlists help you organize specific items or goals. Start by creating your first wishlist."
              actionLabel="Create Wishlist"
              onAction={() => setShowCreateWishlist(true)}
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {wishlists.map((wishlist) => (
              <Card
                key={wishlist.id}
                data-testid="wishlist-card"
                variant="glass"
                className="p-6 group hover:border-bitcoin-orange-500/35 transition-colors"
              >
                {editingWishlist === wishlist.id && editWishlistForm ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Wishlist Title
                      </label>
                      <input
                        type="text"
                        value={editWishlistForm.title}
                        onChange={(e) => setEditWishlistForm({ ...editWishlistForm, title: e.target.value })}
                        placeholder={t('project.placeholder.wishlistTitle')}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-semibold placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-bitcoin-orange-500/40"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Description
                      </label>
                      <textarea
                        value={editWishlistForm.description}
                        onChange={(e) => setEditWishlistForm({ ...editWishlistForm, description: e.target.value })}
                        placeholder={t('project.placeholder.wishlistDescription')}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-bitcoin-orange-500/40 leading-relaxed"
                        rows={4}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Visibility
                      </label>
                      <select
                        value={editWishlistForm.visibility}
                        onChange={(e) => setEditWishlistForm({ ...editWishlistForm, visibility: e.target.value as Visibility })}
                        className="w-full px-4 py-3 bg-charcoal-900 border border-white/10 rounded-xl text-white font-semibold focus:outline-none focus:ring-2 focus:ring-bitcoin-orange-500/40 cursor-pointer"
                      >
                        <option value="draft">Draft — only you</option>
                        <option value="private">Private — anyone with the link</option>
                        <option value="public">Public — listed everywhere</option>
                      </select>
                    </div>
                    <div className="flex gap-3 pt-3 border-t border-white/10">
                      <Button
                        onClick={() => handleUpdateWishlist(wishlist.id)}
                        variant="bitcoin"
                        className="flex-1"
                        loading={processing}
                      >
                        <Save size={16} className="mr-2" />
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={cancelWishlistEdit}
                        className="flex-1"
                        disabled={processing}
                      >
                        <X size={16} className="mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white group-hover:text-bitcoin-orange-300 transition-colors mb-1">
                          {wishlist.title}
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                          {wishlist.description || 'No description provided'}
                        </p>
                      </div>
                      <VisibilityBadge visibility={wishlist.visibility} />
                    </div>

                    {(wishlist.total_sats_goal > 0 || wishlist.total_sats_raised > 0) && (
                      <div className="mb-5 p-4 bg-white/[0.03] rounded-xl border border-white/10">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Progress</span>
                          <span className="text-white text-sm font-semibold">
                            {wishlist.total_sats_raised.toLocaleString()} / {wishlist.total_sats_goal.toLocaleString()} sats
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-bitcoin-orange-500 to-amber-400"
                            style={{
                              width: `${wishlist.total_sats_goal > 0 ? Math.min((wishlist.total_sats_raised / wishlist.total_sats_goal) * 100, 100) : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full min-h-[48px] border-bitcoin-orange-500/30 text-bitcoin-orange-300 hover:bg-bitcoin-orange-500/10 font-semibold"
                        onClick={() => setAddItemWishlistId(wishlist.id)}
                      >
                        <Package size={18} className="mr-2" />
                        Add product from link
                      </Button>
                      <div className="flex gap-2">
                        <Link href={`/wishlist/${wishlist.slug}`} className="flex-1">
                          <Button variant="bitcoin" className="w-full min-h-[48px]">
                            <ExternalLink size={16} className="mr-2" />
                            View Wishlist
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          onClick={() => startEditingWishlist(wishlist)}
                          className="px-4 min-h-[48px] min-w-[48px]"
                        >
                          <Edit size={18} />
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setDeleteWishlistId(wishlist.id)}
                          className="px-4 min-h-[48px] min-w-[48px] hover:text-red-400 hover:border-red-500/40"
                          aria-label={t('confirm.deleteWishlist.title')}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={!!addItemWishlistId}
        onClose={() => setAddItemWishlistId(null)}
        title="Add product from URL"
      >
        <p className="text-sm text-gray-400 mb-4 leading-relaxed">
          Paste a link from Amazon, Nike, Etsy, Shopify stores, or any shop. Supporters can send sats
          <strong className="text-gray-300"> or open the link to buy the item for you</strong>.
          {isDemoUser ? ' Demo items stay on this device.' : ''}
        </p>
        <ProductUrlImport
          compact
          onImport={handleImportProductItem}
        />
      </Modal>

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
            placeholder={t('project.placeholder.url')}
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
            placeholder={t('project.placeholder.wishlistName')}
            required
          />

          <Input
            label="Slug (URL)"
            value={wishlistForm.slug}
            onChange={(e) => setWishlistForm({ ...wishlistForm, slug: e.target.value })}
            placeholder={t('project.placeholder.slug')}
            helperText="Leave blank to auto-generate"
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={wishlistForm.description}
              onChange={(e) => setWishlistForm({ ...wishlistForm, description: e.target.value })}
              placeholder={t('project.placeholder.wishlistDesc')}
              className="w-full px-4 py-2 bg-white/[0.03] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-bitcoin-orange-500"
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
              variant="bitcoin"
              className="flex-1"
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
