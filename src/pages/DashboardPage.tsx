import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Link } from '../components/Link';
import { supabase, asRows } from '../lib/supabase';
import type { Project as DbProject, Profile } from '../types/database';
import {
  Plus,
  Edit,
  Trash2,
  Settings,
  Gift,
  Users,
  FolderOpen,
  ExternalLink,
  Heart,
  Camera,
  Upload,
  Zap,
  MessageCircle,
  LayoutTemplate,
  Compass,
  Wallet,
  Search,
  type LucideIcon,
} from 'lucide-react';
import { PageMeta } from '../components/PageMeta';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { EmbedSnippet } from '../components/EmbedSnippet';
import { ReferralLinkGenerator } from '../components/ReferralLinkGenerator';
import { StatsCard } from '../components/StatsCard';
import { VisibilityBadge } from '../components/VisibilityBadge';
import { OnboardingChecklist } from '../components/OnboardingChecklist';
import { GlassCallout } from '../components/GlassCallout';
import { CardSkeleton } from '../components/Skeleton';
import { EarningsPanel } from '../components/EarningsPanel';

import { getStorage, setStorage, STORAGE_KEYS } from '../lib/storage';
import { DEMO_USER_ID } from '../lib/demoAuth';
import { mockWishlists } from '../data/mockWishlists';

type Project = DbProject & { wishlist_count?: number };

type FollowedProject = Pick<DbProject, 'id' | 'title' | 'description' | 'slug' | 'background_url' | 'visibility'>;
type FollowedWishlist = {
  id: string;
  title: string;
  description: string;
  slug: string;
  cover_image: string | null;
  total_sats_goal: number;
  total_sats_raised: number;
  visibility: string;
};
type FollowedCreator = Pick<Profile, 'id' | 'username' | 'avatar_url' | 'bio'>;

const DEMO_PROJECTS: Project[] = [
  {
    id: 'demo-proj-skate',
    creator_id: DEMO_USER_ID,
    title: 'Skate Colombia',
    description: 'A community skatepark and youth program in Medellín — ramps, safety gear, and after-school sessions.',
    slug: 'skate-colombia',
    background_url: '/images/mock/pexels-2a6bfc8ddf.jpeg',
    wallet_address: null,
    lightning_address: 'demo@getalby.com',
    nostr_pubkey: null,
    visibility: 'public',
    created_at: '2026-06-01T00:00:00Z',
    wishlist_count: 5,
  },
  {
    id: 'demo-proj-studio',
    creator_id: DEMO_USER_ID,
    title: 'Studio drops',
    description: 'Members-only video series funded directly in sats. Draft until you’re ready to publish.',
    slug: 'studio-drops',
    background_url: '/images/mock/pexels-7867fa1faf.jpeg',
    wallet_address: null,
    lightning_address: 'demo@getalby.com',
    nostr_pubkey: null,
    visibility: 'draft',
    created_at: '2026-07-12T00:00:00Z',
    wishlist_count: 2,
  },
];

type OwnedWishlist = {
  id: string;
  title: string;
  slug: string;
  cover_image: string | null;
  total_sats_goal: number;
  total_sats_raised: number;
  visibility: string;
  projectSlug: string;
};

function demoOwnedWishlists(): OwnedWishlist[] {
  const map: Record<string, string> = {
    'medellin-skate-park': 'skate-colombia',
    'luna-exclusive-videos': 'studio-drops',
    'sasha-vip-content': 'studio-drops',
  };
  return mockWishlists
    .filter((w) => map[w.slug])
    .map((w) => ({
      id: w.id,
      title: w.title,
      slug: w.slug,
      cover_image: w.cover_image,
      total_sats_goal: w.total_sats_goal,
      total_sats_raised: w.total_sats_raised,
      visibility: 'public',
      projectSlug: map[w.slug],
    }));
}

function demoFollowing() {
  const featured = mockWishlists.filter((w) =>
    ['medellin-skate-park', 'luna-exclusive-videos', 'sasha-vip-content'].includes(w.slug)
  );
  return {
    projects: [] as FollowedProject[],
    wishlists: featured.map((w) => ({
      id: w.id,
      title: w.title,
      description: w.description,
      slug: w.slug,
      cover_image: w.cover_image,
      total_sats_goal: w.total_sats_goal,
      total_sats_raised: w.total_sats_raised,
      visibility: 'public',
    })),
    creators: featured.map((w) => ({
      id: w.id,
      username: w.creator.username,
      avatar_url: w.creator.avatar_url,
      bio: w.creator.bio || '',
    })),
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function formatSats(sats: number): string {
  if (sats >= 100_000_000) return `${(sats / 100_000_000).toFixed(2)} BTC`;
  if (sats >= 1000) return `${(sats / 1000).toFixed(sats >= 10_000 ? 0 : 1)}k`;
  return `${sats}`;
}

export function DashboardPage() {
  const { user, profile, isDemoUser } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    slug: '',
  });
  const [editFormData, setEditFormData] = useState<{
    title: string;
    description: string;
    visibility: 'public' | 'private' | 'draft';
  } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalWishlists: 0,
    totalRaised: 0,
  });
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [followFilter, setFollowFilter] = useState<'all' | 'projects' | 'wishlists' | 'creators'>('all');
  const [mainTab, setMainTab] = useState<'projects' | 'wishlists' | 'earnings'>('projects');
  const [projectQuery, setProjectQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [following, setFollowing] = useState<{
    projects: FollowedProject[];
    wishlists: FollowedWishlist[];
    creators: FollowedCreator[];
  }>({
    projects: [],
    wishlists: [],
    creators: [],
  });

  const persistDemoProjects = useCallback((next: Project[]) => {
    setStorage(STORAGE_KEYS.demoDashboardProjects, next);
  }, []);

  const loadFollowing = useCallback(async () => {
    if (!user) return;
    if (isDemoUser) {
      setFollowing(demoFollowing());
      return;
    }

    try {
      const { data: projectFollows } = await supabase
        .from('project_follows')
        .select('project_id')
        .eq('user_id', user.id);

      const { data: wishlistFollows } = await supabase
        .from('wishlist_follows')
        .select('wishlist_id')
        .eq('user_id', user.id);

      const { data: creatorFollows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const creatorIds = (creatorFollows || []).map((f) => f.following_id);
      const projectIds = (projectFollows || []).map((f) => f.project_id);
      const wishlistIds = (wishlistFollows || []).map((f) => f.wishlist_id);

      const [creatorProfiles, followedProjects, followedWishlists] = await Promise.all([
        creatorIds.length > 0
          ? supabase.from('profiles').select('id, username, avatar_url, bio').in('id', creatorIds).then((r) => r.data || [])
          : Promise.resolve([] as FollowedCreator[]),
        projectIds.length > 0
          ? supabase
              .from('projects')
              .select('id, title, description, slug, background_url, visibility')
              .in('id', projectIds)
              .then((r) => r.data || [])
          : Promise.resolve([] as FollowedProject[]),
        wishlistIds.length > 0
          ? supabase
              .from('wishlists')
              .select('id, title, description, slug, cover_image, total_sats_goal, total_sats_raised, visibility')
              .in('id', wishlistIds)
              .then((r) => r.data || [])
          : Promise.resolve([] as FollowedWishlist[]),
      ]);

      setFollowing({
        projects: followedProjects,
        wishlists: followedWishlists,
        creators: creatorProfiles,
      });
    } catch (error) {
      console.error('Error loading following:', error);
      toast(t('error.loadDashboard'), 'error');
    }
  }, [user, isDemoUser, toast, t]);

  const loadProjects = useCallback(async () => {
    if (!user) return;
    try {
      if (isDemoUser) {
        const stored = getStorage<Project[]>(STORAGE_KEYS.demoDashboardProjects, []);
        const list = stored.length > 0 ? stored : DEMO_PROJECTS;
        if (stored.length === 0) persistDemoProjects(DEMO_PROJECTS);
        setProjects(list);
        return;
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const projectList = asRows<DbProject>(data);
      const projectIds = projectList.map((p) => p.id);
      const countByProject: Record<string, number> = {};

      if (projectIds.length > 0) {
        const { data: wishlistRows } = await supabase
          .from('wishlists')
          .select('project_id')
          .in('project_id', projectIds);

        (wishlistRows || []).forEach((row) => {
          if (row.project_id) {
            countByProject[row.project_id] = (countByProject[row.project_id] || 0) + 1;
          }
        });
      }

      setProjects(
        projectList.map((p) => ({
          ...p,
          wishlist_count: countByProject[p.id] || 0,
        }))
      );
    } catch (error) {
      console.error('Error loading projects:', error);
      toast(t('error.loadDashboard'), 'error');
    } finally {
      setLoading(false);
    }
  }, [user, isDemoUser, persistDemoProjects, toast, t]);

  const loadStats = useCallback(async () => {
    if (!user) return;
    if (isDemoUser) {
      const list = getStorage<Project[]>(STORAGE_KEYS.demoDashboardProjects, DEMO_PROJECTS);
      setStats({
        totalProjects: list.length,
        totalWishlists: list.reduce((sum, p) => sum + (p.wishlist_count || 0), 0),
        totalRaised: 3_250_000,
      });
      return;
    }

    try {
      const { data: projectData, count: projectCount } = await supabase
        .from('projects')
        .select('id', { count: 'exact' })
        .eq('creator_id', user.id);

      const projectIds = projectData?.map((p) => p.id) || [];

      const { data: wishlistData, count: wishlistCount } = await supabase
        .from('wishlists')
        .select('total_sats_raised', { count: 'exact' })
        .in('project_id', projectIds.length ? projectIds : ['__none__']);

      const totalRaised = wishlistData?.reduce((sum, w) => sum + (w.total_sats_raised || 0), 0) || 0;

      setStats({
        totalProjects: projectCount || 0,
        totalWishlists: wishlistCount || 0,
        totalRaised,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      toast(t('error.loadDashboard'), 'error');
    }
  }, [user, isDemoUser, toast, t]);

  useEffect(() => {
    if (user) {
      void loadProjects();
      void loadStats();
      void loadFollowing();
    }
  }, [user, loadProjects, loadStats, loadFollowing]);

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!user || processing) return;

    setProcessing(true);
    const slug = formData.slug || slugify(formData.title);
    try {
      if (isDemoUser) {
        const created: Project = {
          id: `demo-${Date.now()}`,
          creator_id: user.id,
          title: formData.title,
          description: formData.description,
          slug,
          background_url: null,
          wallet_address: null,
          lightning_address: profile?.lightning_address || null,
          nostr_pubkey: null,
          visibility: 'draft',
          created_at: new Date().toISOString(),
          wishlist_count: 0,
        };
        const next = [created, ...projects];
        setProjects(next);
        persistDemoProjects(next);
        setStats((s) => ({ ...s, totalProjects: next.length }));
        setShowCreateModal(false);
        setFormData({ title: '', description: '', slug: '' });
        toast(t('dashboard.createDemo'), 'success');
        return;
      }

      const { error } = await supabase.from('projects').insert({
        creator_id: user.id,
        title: formData.title,
        description: formData.description,
        slug,
        visibility: 'draft',
      });

      if (error) throw error;

      await loadProjects();
      await loadStats();
      setShowCreateModal(false);
      setFormData({ title: '', description: '', slug: '' });
      toast(t('success.saved'), 'success');
    } catch (error: unknown) {
      console.error('Error creating project:', error);
      const message = error instanceof Error ? error.message : t('error.createProject');
      toast(message, 'error');
    } finally {
      setProcessing(false);
    }
  }

  async function handleDeleteProject(projectId: string) {
    setProcessing(true);
    try {
      if (isDemoUser) {
        const next = projects.filter((p) => p.id !== projectId);
        setProjects(next);
        persistDemoProjects(next);
        setStats((s) => ({ ...s, totalProjects: next.length }));
        setDeleteProjectId(null);
        toast(t('success.deleted'));
        return;
      }

      const { error } = await supabase.from('projects').delete().eq('id', projectId);
      if (error) throw error;

      await loadProjects();
      await loadStats();
      setDeleteProjectId(null);
      toast(t('success.deleted'));
    } catch (error) {
      console.error('Error deleting project:', error);
      toast(t('error.deleteProject'), 'error');
    } finally {
      setProcessing(false);
    }
  }

  async function handleBackgroundUpload(e: React.ChangeEvent<HTMLInputElement>, projectId: string) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (isDemoUser) {
      toast(t('dashboard.uploadDemo'), 'info');
      e.target.value = '';
      return;
    }

    setProcessing(true);
    try {
      const file = files[0];
      const fileExt = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
      const fileName = `${user!.id}/project-${projectId}-${Date.now()}.${fileExt || 'bin'}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, file, { contentType: file.type || undefined });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('media').getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('projects')
        .update({ background_url: publicUrl })
        .eq('id', projectId);

      if (updateError) throw updateError;

      await loadProjects();
    } catch (error) {
      console.error('Error uploading background:', error);
      toast(`${t('error.uploadBackground')}: ${(error as Error).message}`, 'error');
    } finally {
      setProcessing(false);
    }
  }

  function startEditingProject(project: Project) {
    setEditingProject(project.id);
    setEditFormData({
      title: project.title,
      description: project.description,
      visibility: project.visibility,
    });
  }

  function cancelEditing() {
    setEditingProject(null);
    setEditFormData(null);
  }

  async function handleUpdateProject(projectId: string) {
    if (!editFormData || processing) return;

    setProcessing(true);
    try {
      if (isDemoUser) {
        const next = projects.map((p) =>
          p.id === projectId
            ? { ...p, title: editFormData.title, description: editFormData.description, visibility: editFormData.visibility }
            : p
        );
        setProjects(next);
        persistDemoProjects(next);
        cancelEditing();
        toast(t('success.saved'), 'success');
        return;
      }

      const { error } = await supabase
        .from('projects')
        .update({
          title: editFormData.title,
          description: editFormData.description,
          visibility: editFormData.visibility,
        })
        .eq('id', projectId);

      if (error) throw error;

      await loadProjects();
      cancelEditing();
    } catch (error) {
      console.error('Error updating project:', error);
      toast(t('error.updateProject'), 'error');
    } finally {
      setProcessing(false);
    }
  }

  async function handleBulkVisibility(visibility: Project['visibility']) {
    if (selectedIds.length === 0 || processing) return;
    setProcessing(true);
    try {
      if (isDemoUser) {
        const next = projects.map((p) => (selectedIds.includes(p.id) ? { ...p, visibility } : p));
        setProjects(next);
        persistDemoProjects(next);
        setSelectedIds([]);
        toast(t('success.saved'), 'success');
        return;
      }
      await Promise.all(
        selectedIds.map((id) => supabase.from('projects').update({ visibility }).eq('id', id))
      );
      await loadProjects();
      setSelectedIds([]);
      toast(t('success.saved'), 'success');
    } catch {
      toast(t('error.updateProject'), 'error');
    } finally {
      setProcessing(false);
    }
  }

  const followingCount = following.projects.length + following.wishlists.length + following.creators.length;
  const displayName = profile?.username || user?.email?.split('@')[0] || 'creator';
  const initial = displayName[0]?.toUpperCase() || 'K';
  const missingLightning = !profile?.lightning_address;
  const publicProject = projects.find((p) => p.visibility === 'public');
  const embedPath = publicProject ? `/project/${publicProject.slug}` : '/explore';

  const filteredFollows = useMemo(() => {
    const showP = followFilter === 'all' || followFilter === 'projects';
    const showW = followFilter === 'all' || followFilter === 'wishlists';
    const showC = followFilter === 'all' || followFilter === 'creators';
    return {
      projects: showP ? following.projects : [],
      wishlists: showW ? following.wishlists : [],
      creators: showC ? following.creators : [],
    };
  }, [followFilter, following]);

  const filteredFollowCount =
    filteredFollows.projects.length + filteredFollows.wishlists.length + filteredFollows.creators.length;

  const q = projectQuery.trim().toLowerCase();
  const visibleProjects = q
    ? projects.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q)
      )
    : projects;
  const ownedWishlists = isDemoUser ? demoOwnedWishlists() : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal-950 pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6" role="status" aria-label={t('dashboard.loading')}>
          <CardSkeleton />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div className="grid lg:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal-950 pb-24 md:pb-8">
      <PageMeta
        title={t('dashboard.title')}
        description="Manage your KATOA projects, wishlists, and Bitcoin donations from your creator dashboard."
        path="/dashboard"
        noindex
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        <Breadcrumbs items={[{ label: t('dashboard.title') }]} className="mb-6" />

        <header className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-5">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-white/15 shrink-0"
                />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-bitcoin-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
                  {initial}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.18em] text-bitcoin-orange-400 font-semibold mb-1">
                  {t('dashboard.welcome')}
                </p>
                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight truncate">
                  @{displayName}
                </h1>
                <p className="text-gray-400 text-sm mt-1">{t('dashboard.subtitle')}</p>
                {profile?.lightning_address && (
                  <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1.5 truncate">
                    <Zap size={12} className="text-bitcoin-orange-400 shrink-0" />
                    {profile.lightning_address}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Link href="/settings">
                <Button variant="outline">
                  <Settings size={16} className="mr-2" />
                  {t('dashboard.quick.settings')}
                </Button>
              </Link>
              <Button variant="bitcoin" onClick={() => setShowCreateModal(true)}>
                <Plus size={16} className="mr-2" />
                {t('dashboard.newProject')}
              </Button>
            </div>
          </div>
        </header>

        {missingLightning && (
          <GlassCallout variant="bitcoin" className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm">{t('dashboard.lightningMissing')}</p>
            <Link href="/settings">
              <Button variant="bitcoin" size="sm">
                <Wallet size={14} className="mr-1.5" />
                {t('dashboard.lightningMissingCta')}
              </Button>
            </Link>
          </GlassCallout>
        )}

        <nav className="flex flex-wrap gap-2 mb-8" aria-label="Dashboard shortcuts">
          <QuickLink href="/messages" icon={MessageCircle} label={t('dashboard.quick.messages')} />
          <QuickLink href="/templates" icon={LayoutTemplate} label={t('dashboard.quick.templates')} />
          <QuickLink href="/explore" icon={Compass} label={t('dashboard.quick.explore')} />
          <QuickLink href="/creators" icon={Users} label="Creators" />
        </nav>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
          <StatsCard
            title={t('dashboard.projects')}
            value={stats.totalProjects}
            icon={FolderOpen}
            gradient="from-bitcoin-orange-500 to-amber-600"
          />
          <StatsCard
            title={t('dashboard.wishlists')}
            value={stats.totalWishlists}
            icon={Gift}
            gradient="from-neon-cyan-500 to-sky-600"
            delay={60}
          />
          <StatsCard
            title={t('dashboard.raised')}
            value={formatSats(stats.totalRaised)}
            subtitle="sats"
            icon={Zap}
            gradient="from-emerald-500 to-teal-600"
            delay={120}
          />
          <StatsCard
            title={t('dashboard.stats.following')}
            value={followingCount}
            icon={Heart}
            gradient="from-rose-500 to-orange-500"
            delay={180}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-12">
            <section>
              <div className="flex flex-wrap gap-2 mb-5" role="tablist" aria-label="Dashboard views">
                {(
                  [
                    ['projects', t('dashboard.yourProjects'), projects.length],
                    ['wishlists', t('dashboard.wishlists'), isDemoUser ? demoOwnedWishlists().length : stats.totalWishlists],
                    ['earnings', t('dashboard.raised'), null],
                  ] as const
                ).map(([id, label, count]) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={mainTab === id}
                    onClick={() => setMainTab(id)}
                    className={`min-h-[40px] px-4 rounded-full text-sm font-semibold border transition-colors ${
                      mainTab === id
                        ? 'bg-bitcoin-orange-500/15 border-bitcoin-orange-500/40 text-bitcoin-orange-200'
                        : 'bg-white/[0.03] border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    {label}
                    {count !== null ? ` · ${count}` : ''}
                  </button>
                ))}
              </div>

              {mainTab === 'projects' && (
                <>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
                <div>
                  <h2 className="font-display text-2xl font-bold text-white">{t('dashboard.yourProjects')}</h2>
                  <p className="text-gray-400 text-sm">{t('dashboard.yourProjectsSub')}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowCreateModal(true)}>
                  <Plus size={16} className="mr-1.5" />
                  {t('dashboard.newProject')}
                </Button>
              </div>

              {projects.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-2 mb-5">
                  <label className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      value={projectQuery}
                      onChange={(e) => setProjectQuery(e.target.value)}
                      placeholder="Search projects…"
                      className="w-full min-h-[44px] pl-9 pr-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500"
                      aria-label="Search projects"
                    />
                  </label>
                  {selectedIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-xs text-gray-400">{selectedIds.length} selected</span>
                      <Button size="sm" variant="outline" onClick={() => handleBulkVisibility('public')}>
                        Public
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleBulkVisibility('private')}>
                        Private
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleBulkVisibility('draft')}>
                        Draft
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {projects.length === 0 ? (
                <Card variant="glass">
                  <EmptyState
                    icon={<FolderOpen size={32} />}
                    title={t('dashboard.empty.title')}
                    description={t('dashboard.empty.description')}
                    actionLabel={t('dashboard.empty.action')}
                    onAction={() => setShowCreateModal(true)}
                    secondaryLabel="Browse templates"
                    secondaryHref="/templates"
                  />
                </Card>
              ) : visibleProjects.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center">No projects match that search.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {visibleProjects.map((project) => (
                    <div key={project.id} className="relative">
                      <label className="absolute top-3 left-3 z-20">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(project.id)}
                          onChange={() =>
                            setSelectedIds((prev) =>
                              prev.includes(project.id) ? prev.filter((id) => id !== project.id) : [...prev, project.id]
                            )
                          }
                          className="w-4 h-4 rounded border-white/30 bg-black/40"
                          aria-label={`Select ${project.title}`}
                        />
                      </label>
                    <ProjectCard
                      project={project}
                      editing={editingProject === project.id}
                      editFormData={editFormData}
                      processing={processing}
                      t={t}
                      onCoverChange={(e) => handleBackgroundUpload(e, project.id)}
                      onEdit={() => startEditingProject(project)}
                      onCancelEdit={cancelEditing}
                      onSaveEdit={() => handleUpdateProject(project.id)}
                      onDelete={() => setDeleteProjectId(project.id)}
                      onEditChange={setEditFormData}
                    />
                    </div>
                  ))}
                </div>
              )}
                </>
              )}

              {mainTab === 'wishlists' && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-white mb-1">{t('dashboard.wishlists')}</h2>
                  <p className="text-gray-400 text-sm mb-5">Lists under your projects — open one to fund or edit.</p>
                  {ownedWishlists.length === 0 ? (
                    <Card variant="glass">
                      <EmptyState
                        icon={<Gift size={28} />}
                        title="No wishlists yet"
                        description="Create a project, then add wishlists from Manage."
                        actionLabel={t('dashboard.newProject')}
                        onAction={() => setShowCreateModal(true)}
                      />
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {ownedWishlists.map((w) => (
                        <Link key={w.id} href={`/wishlist/${w.slug}`}>
                          <Card variant="glass" hover className="overflow-hidden h-full">
                            <FollowCover src={w.cover_image} fallback={<Gift size={28} className="text-gray-600" />} />
                            <div className="p-4">
                              <VisibilityBadge visibility={w.visibility} />
                              <h3 className="text-base font-bold text-white mt-2 line-clamp-1">{w.title}</h3>
                              <p className="text-xs text-gray-500 mt-1">/{w.projectSlug}</p>
                              {w.total_sats_goal > 0 && (
                                <p className="text-xs text-gray-400 mt-2">
                                  {Math.round((w.total_sats_raised / w.total_sats_goal) * 100)}% funded
                                </p>
                              )}
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {mainTab === 'earnings' && (
                <div id="dashboard-earnings">
                  <h2 className="font-display text-2xl font-bold text-white mb-2">{t('dashboard.raised')}</h2>
                  <EarningsPanel isDemo={isDemoUser} userId={user?.id} />
                </div>
              )}
            </section>

            <section>
              <div className="mb-5">
                <h2 className="font-display text-2xl font-bold text-white">{t('dashboard.following')}</h2>
                <p className="text-gray-400 text-sm">{t('dashboard.followingSub')}</p>
              </div>

              <div className="flex gap-2 mb-5 overflow-x-auto pb-1" role="tablist" aria-label={t('dashboard.following')}>
                {(
                  [
                    ['all', t('dashboard.filterAll'), followingCount],
                    ['projects', t('dashboard.projects'), following.projects.length],
                    ['wishlists', t('dashboard.wishlists'), following.wishlists.length],
                    ['creators', t('dashboard.creators'), following.creators.length],
                  ] as const
                ).map(([id, label, count]) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={followFilter === id}
                    onClick={() => setFollowFilter(id)}
                    className={`shrink-0 min-h-[40px] px-3.5 rounded-full text-sm font-semibold border transition-colors ${
                      followFilter === id
                        ? 'bg-bitcoin-orange-500/15 border-bitcoin-orange-500/40 text-bitcoin-orange-200'
                        : 'bg-white/[0.03] border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {label} · {count}
                  </button>
                ))}
              </div>

              {followingCount === 0 ? (
                <Card variant="glass">
                  <EmptyState
                    icon={<Heart size={28} />}
                    title={t('dashboard.followingEmpty.title')}
                    description={t('dashboard.followingEmpty.description')}
                    actionLabel={t('dashboard.followingEmpty.action')}
                    actionHref="/explore"
                  />
                </Card>
              ) : filteredFollowCount === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center">{t('dashboard.noFollowsFilter')}</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredFollows.projects.map((project) => (
                    <Link key={project.id} href={`/project/${project.slug}`}>
                      <Card variant="glass" hover className="overflow-hidden h-full">
                        <FollowCover src={project.background_url} fallback={<FolderOpen size={28} className="text-gray-600" />} />
                        <div className="p-4">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-bitcoin-orange-400 mb-1">
                            {t('dashboard.projects')}
                          </p>
                          <h3 className="text-base font-bold text-white line-clamp-1">{project.title}</h3>
                          <p className="text-gray-400 text-sm line-clamp-2 mt-1">
                            {project.description || t('dashboard.noDescription')}
                          </p>
                        </div>
                      </Card>
                    </Link>
                  ))}
                  {filteredFollows.wishlists.map((wishlist) => (
                    <Link key={wishlist.id} href={`/wishlist/${wishlist.slug}`}>
                      <Card variant="glass" hover className="overflow-hidden h-full">
                        <FollowCover src={wishlist.cover_image} fallback={<Gift size={28} className="text-gray-600" />} />
                        <div className="p-4">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-neon-cyan-400 mb-1">
                            {t('dashboard.wishlists')}
                          </p>
                          <h3 className="text-base font-bold text-white line-clamp-1">{wishlist.title}</h3>
                          {wishlist.total_sats_goal > 0 && (
                            <div className="mt-3">
                              <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                <span>{Math.round((wishlist.total_sats_raised / wishlist.total_sats_goal) * 100)}%</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-bitcoin-orange-500 to-amber-400"
                                  style={{
                                    width: `${Math.min((wishlist.total_sats_raised / wishlist.total_sats_goal) * 100, 100)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    </Link>
                  ))}
                  {filteredFollows.creators.map((creator) => (
                    <Link key={creator.id} href={`/u/${creator.username}`}>
                      <Card variant="glass" hover className="p-4 h-full">
                        <div className="flex items-center gap-3">
                          {creator.avatar_url ? (
                            <img
                              src={creator.avatar_url}
                              alt=""
                              className="w-12 h-12 rounded-xl object-cover border border-white/10"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-bitcoin-orange-500 to-amber-600 flex items-center justify-center text-white font-bold">
                              {creator.username[0]?.toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Creator</p>
                            <h3 className="text-base font-bold text-white truncate">@{creator.username}</h3>
                          </div>
                        </div>
                        {creator.bio && <p className="text-gray-400 text-sm line-clamp-2 mt-3">{creator.bio}</p>}
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-24 lg:self-start">
            <OnboardingChecklist variant="dark" />

            <Card variant="glass" className="p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-bitcoin-orange-400 mb-2">
                {t('dashboard.growTitle')}
              </p>
              <p className="text-sm text-gray-400 leading-relaxed mb-3">{t('dashboard.growBody')}</p>
              <div className="flex flex-wrap gap-2">
                <Link href="/templates" className="text-xs font-semibold text-bitcoin-orange-300 hover:underline min-h-[36px] inline-flex items-center">
                  {t('dashboard.quick.templates')} →
                </Link>
                <Link href="/creators" className="text-xs font-semibold text-gray-400 hover:underline min-h-[36px] inline-flex items-center">
                  Creator playbook →
                </Link>
                <Link href="/explore?videos=1" className="text-xs font-semibold text-gray-400 hover:underline min-h-[36px] inline-flex items-center">
                  {t('dashboard.videoHintLink')} →
                </Link>
              </div>
            </Card>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3 px-1">
                {t('dashboard.sectionShare')}
              </p>
              <div className="space-y-3">
                <ReferralLinkGenerator campaign={displayName} />
                <EmbedSnippet path={embedPath} title={`Support ${displayName} on KATOA — 0% fees`} />
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title={t('dashboard.createTitle')}>
        <form onSubmit={handleCreateProject} className="space-y-5">
          <div>
            <Input
              label="Project Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t('dashboard.placeholder.titleExample')}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('dashboard.placeholder.descriptionLong')}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-cyan-500/50"
              rows={4}
            />
          </div>
          <div>
            <Input
              label="URL Slug (optional)"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
              placeholder={t('dashboard.placeholder.slug')}
            />
            <p className="text-xs text-gray-500 mt-2">
              {t('dashboard.slugHelp').replace('${slug}', formData.slug || 'your-slug')}
            </p>
          </div>
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1" disabled={processing}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="bitcoin" className="flex-1" loading={processing} disabled={!formData.title}>
              {t('dashboard.createProject')}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteProjectId !== null}
        title={t('confirm.deleteProject.title')}
        message={t('confirm.deleteProject.message')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        loading={processing}
        onConfirm={() => deleteProjectId && handleDeleteProject(deleteProjectId)}
        onCancel={() => setDeleteProjectId(null)}
      />
    </div>
  );
}

function QuickLink({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-full border border-white/10 bg-white/[0.03] text-sm text-gray-300 hover:text-white hover:border-white/20"
    >
      <Icon size={14} />
      {label}
    </Link>
  );
}

function FollowCover({ src, fallback }: { src: string | null; fallback: ReactNode }) {
  if (src) {
    return <div className="w-full h-28 bg-cover bg-center" style={{ backgroundImage: `url(${src})` }} />;
  }
  return <div className="w-full h-28 bg-charcoal-900 flex items-center justify-center">{fallback}</div>;
}

function ProjectCard({
  project,
  editing,
  editFormData,
  processing,
  t,
  onCoverChange,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onEditChange,
}: {
  project: Project;
  editing: boolean;
  editFormData: { title: string; description: string; visibility: 'public' | 'private' | 'draft' } | null;
  processing: boolean;
  t: (key: string) => string;
  onCoverChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: () => void;
  onEditChange: (next: { title: string; description: string; visibility: 'public' | 'private' | 'draft' }) => void;
}) {
  return (
    <Card variant="glass" className="overflow-hidden group">
      <input
        type="file"
        id={`project-bg-${project.id}`}
        accept="image/*"
        onChange={onCoverChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => document.getElementById(`project-bg-${project.id}`)?.click()}
        className="w-full relative"
        disabled={processing}
        aria-label={project.background_url ? t('dashboard.changeCover') : t('dashboard.addCover')}
      >
        {project.background_url ? (
          <div
            className="w-full h-40 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${project.background_url})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="text-center">
                <Camera size={28} className="mx-auto text-white mb-1" />
                <p className="text-white text-xs font-semibold">{t('dashboard.changeCover')}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-40 bg-charcoal-900 flex flex-col items-center justify-center gap-2">
            <Upload size={28} className="text-gray-600" />
            <p className="text-xs text-gray-500">{t('dashboard.addCover')}</p>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <VisibilityBadge visibility={project.visibility} />
        </div>
      </button>

      <div className="p-5">
        {editing && editFormData ? (
          <div className="space-y-3">
            <Input
              value={editFormData.title}
              onChange={(e) => onEditChange({ ...editFormData, title: e.target.value })}
              placeholder={t('dashboard.placeholder.title')}
            />
            <textarea
              value={editFormData.description}
              onChange={(e) => onEditChange({ ...editFormData, description: e.target.value })}
              placeholder={t('dashboard.placeholder.description')}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-cyan-500/50"
              rows={3}
            />
            <select
              value={editFormData.visibility}
              onChange={(e) =>
                onEditChange({ ...editFormData, visibility: e.target.value as Project['visibility'] })
              }
              className="w-full px-4 py-3 bg-charcoal-900 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-neon-cyan-500/50"
            >
              <option value="draft">Draft — only you</option>
              <option value="private">Private — link only</option>
              <option value="public">Public — listed on Explore</option>
            </select>
            <div className="flex gap-2 pt-1">
              <Button onClick={onSaveEdit} variant="bitcoin" className="flex-1" loading={processing}>
                Save
              </Button>
              <Button variant="outline" onClick={onCancelEdit} className="flex-1" disabled={processing}>
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{project.title}</h3>
            <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed min-h-[2.5rem]">
              {project.description || t('dashboard.noDescription')}
            </p>
            <p className="text-xs text-gray-500 mt-3 mb-4">
              {project.wishlist_count ?? 0} {t('dashboard.wishlistsCount')}
            </p>
            <div className="flex gap-2">
              <Link href={`/project/${project.slug}`} className="flex-1">
                <Button variant="bitcoin" className="w-full">
                  <Settings size={16} className="mr-1.5" />
                  {t('dashboard.manage')}
                </Button>
              </Link>
              <Button variant="outline" onClick={onEdit} aria-label={t('dashboard.editAria')} className="min-w-[44px] px-3">
                <Edit size={16} />
              </Button>
              <Button
                variant="outline"
                onClick={onDelete}
                aria-label={t('dashboard.deleteAria')}
                className="min-w-[44px] px-3 hover:text-red-400 hover:border-red-500/40"
              >
                <Trash2 size={16} />
              </Button>
            </div>
            {project.visibility === 'public' && (
              <Link
                href={`/project/${project.slug}`}
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-bitcoin-orange-300"
              >
                <ExternalLink size={12} />
                {t('dashboard.viewPublic')}
              </Link>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
