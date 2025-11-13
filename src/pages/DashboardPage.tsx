import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Link } from '../components/Link';
import { StatsCard } from '../components/StatsCard';
import { supabase } from '../lib/supabase';
import { Plus, Edit, Trash2, Settings, Gift, DollarSign, Users, FolderOpen, Globe, Lock, FileText, ExternalLink, TrendingUp, Eye, Heart, Filter } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  slug: string;
  background_url: string | null;
  wallet_address: string | null;
  lightning_address: string | null;
  visibility: 'public' | 'private' | 'draft';
  created_at: string;
  wishlist_count?: number;
}

export function DashboardPage() {
  const { user } = useAuth();
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

  const [followFilter, setFollowFilter] = useState<'all' | 'projects' | 'wishlists' | 'creators'>('all');
  const [following, setFollowing] = useState<{
    projects: any[];
    wishlists: any[];
    creators: any[];
  }>({
    projects: [],
    wishlists: [],
    creators: [],
  });

  useEffect(() => {
    if (user) {
      loadProjects();
      loadStats();
      loadFollowing();
    }
  }, [user]);

  async function loadFollowing() {
    if (!user) return;

    try {
      const { data: projectFollows } = await supabase
        .from('project_follows')
        .select(`
          project_id,
          projects (
            id,
            title,
            description,
            slug,
            background_url,
            visibility
          )
        `)
        .eq('user_id', user.id);

      const { data: wishlistFollows } = await supabase
        .from('wishlist_follows')
        .select(`
          wishlist_id,
          wishlists (
            id,
            title,
            description,
            slug,
            cover_image,
            total_sats_goal,
            total_sats_raised,
            visibility
          )
        `)
        .eq('user_id', user.id);

      const { data: creatorFollows } = await supabase
        .from('follows')
        .select(`
          following_id,
          profiles!follows_following_id_fkey (
            id,
            username,
            avatar_url,
            bio
          )
        `)
        .eq('follower_id', user.id);

      setFollowing({
        projects: (projectFollows || []).map(f => f.projects).filter(Boolean),
        wishlists: (wishlistFollows || []).map(f => f.wishlists).filter(Boolean),
        creators: (creatorFollows || []).map(f => f.profiles).filter(Boolean),
      });
    } catch (error) {
      console.error('Error loading following:', error);
    }
  }

  async function loadProjects() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          wishlists (count)
        `)
        .eq('creator_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const projectsWithCount = (data || []).map(p => ({
        ...p,
        wishlist_count: p.wishlists?.[0]?.count || 0
      }));

      setProjects(projectsWithCount);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const { data: projectData, count: projectCount } = await supabase
        .from('projects')
        .select('id', { count: 'exact' })
        .eq('creator_id', user!.id);

      const projectIds = projectData?.map(p => p.id) || [];

      const { data: wishlistData, count: wishlistCount } = await supabase
        .from('wishlists')
        .select('total_sats_raised', { count: 'exact' })
        .in('project_id', projectIds);

      const totalRaised = wishlistData?.reduce((sum, w) => sum + (w.total_sats_raised || 0), 0) || 0;

      setStats({
        totalProjects: projectCount || 0,
        totalWishlists: wishlistCount || 0,
        totalRaised,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!user || processing) return;

    setProcessing(true);
    try {
      const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const { error } = await supabase
        .from('projects')
        .insert({
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
    } catch (error: any) {
      console.error('Error creating project:', error);
      alert(error.message || 'Failed to create project');
    } finally {
      setProcessing(false);
    }
  }

  async function handleDeleteProject(projectId: string) {
    if (!confirm('Are you sure you want to delete this project? This will also delete all associated wishlists.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      await loadProjects();
      await loadStats();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
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
      alert('Failed to update project');
    } finally {
      setProcessing(false);
    }
  }

  function formatSats(sats: number): string {
    if (sats >= 100000000) {
      return `${(sats / 100000000).toFixed(2)} BTC`;
    }
    if (sats >= 1000) {
      return `${(sats / 1000).toFixed(0)}k`;
    }
    return `${sats}`;
  }

  const getVisibilityBadge = (visibility: string) => {
    if (visibility === 'public') {
      return (
        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
          <Globe size={14} />
          Public
        </span>
      );
    } else if (visibility === 'private') {
      return (
        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/50 flex items-center gap-1.5 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
          <Lock size={14} />
          Private
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-gray-500/20 text-gray-400 border border-gray-500/50 flex items-center gap-1.5">
          <FileText size={14} />
          Draft
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">

        <div className="mb-12">
          <h1 className="text-5xl font-black text-white mb-3 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            Creator Dashboard
          </h1>
          <p className="text-gray-300 text-lg">Manage your projects and track your success</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-orange-500/50 transition-all duration-300 p-6 hover:shadow-[0_0_30px_rgba(255,135,0,0.2)]">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <FolderOpen size={28} className="text-orange-500" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-white">{stats.totalProjects}</p>
              </div>
            </div>
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Projects</h3>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp size={14} className="text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">Active</span>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-purple-500/50 transition-all duration-300 p-6 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Gift size={28} className="text-purple-500" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-white">{stats.totalWishlists}</p>
              </div>
            </div>
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Wishlists</h3>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp size={14} className="text-purple-400" />
              <span className="text-xs text-purple-400 font-medium">Growing</span>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-emerald-500/50 transition-all duration-300 p-6 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <DollarSign size={28} className="text-emerald-500" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-white">{formatSats(stats.totalRaised)}</p>
              </div>
            </div>
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Total Raised</h3>
            <p className="text-xs text-gray-500 mt-2 font-medium">sats</p>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-blue-500/50 transition-all duration-300 p-6 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Users size={28} className="text-blue-500" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-white">0</p>
              </div>
            </div>
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Supporters</h3>
            <p className="text-xs text-gray-500 mt-2 font-medium">Coming soon</p>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-black text-white mb-2">Your Projects</h2>
            <p className="text-gray-400">Organize wishlists and manage your creator presence</p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-[0_0_20px_rgba(255,135,0,0.3)] font-bold"
          >
            <Plus size={20} className="mr-2" />
            New Project
          </Button>
        </div>

        {projects.length === 0 ? (
          <Card className="text-center py-20 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <div className="max-w-md mx-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl mb-6 shadow-[0_0_30px_rgba(255,135,0,0.4)]">
                <FolderOpen size={40} className="text-white" />
              </div>
              <h3 className="text-3xl font-black text-white mb-3">Start Your First Project</h3>
              <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                Projects help you organize multiple wishlists under one umbrella. Perfect for campaigns, causes, or creator portfolios.
              </p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-[0_0_20px_rgba(255,135,0,0.3)] font-bold text-lg px-8 py-3"
              >
                <Plus size={24} className="mr-2" />
                Create Your First Project
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-orange-500/50 transition-all duration-300 overflow-hidden group hover:shadow-[0_0_40px_rgba(255,135,0,0.25)] hover:scale-[1.02]"
              >
                {project.background_url ? (
                  <div
                    className="w-full h-48 bg-cover bg-center relative overflow-hidden"
                    style={{ backgroundImage: `url(${project.background_url})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                    <div className="absolute top-4 right-4">
                      {getVisibilityBadge(project.visibility)}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-gray-800 to-gray-900 relative flex items-center justify-center overflow-hidden">
                    <FolderOpen size={80} className="text-gray-700 opacity-50" />
                    <div className="absolute top-4 right-4">
                      {getVisibilityBadge(project.visibility)}
                    </div>
                  </div>
                )}

                <div className="p-6">
                  {editingProject === project.id && editFormData ? (
                    <div className="space-y-4">
                      <Input
                        value={editFormData.title}
                        onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                        placeholder="Project title"
                        className="bg-black border-gray-700 text-white font-bold"
                      />
                      <textarea
                        value={editFormData.description}
                        onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                        placeholder="Description"
                        className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                        rows={3}
                      />
                      <select
                        value={editFormData.visibility}
                        onChange={(e) => setEditFormData({ ...editFormData, visibility: e.target.value as any })}
                        className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                      >
                        <option value="draft">Draft - Only you can see</option>
                        <option value="private">Private - Anyone with link</option>
                        <option value="public">Public - Listed on Explore</option>
                      </select>
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => handleUpdateProject(project.id)}
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 font-bold"
                          disabled={processing}
                        >
                          {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={cancelEditing}
                          className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
                          disabled={processing}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <h3 className="text-2xl font-black text-white mb-2 group-hover:text-orange-400 transition-colors line-clamp-1">
                          {project.title}
                        </h3>
                        <p className="text-gray-300 text-sm line-clamp-2 leading-relaxed font-medium">
                          {project.description || 'No description provided'}
                        </p>
                      </div>

                      <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-700">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Gift size={18} className="text-purple-400" />
                          </div>
                          <div>
                            <p className="text-xl font-bold text-white">{project.wishlist_count}</p>
                            <p className="text-xs text-gray-500 font-medium">Wishlists</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Eye size={18} className="text-blue-400" />
                          </div>
                          <div>
                            <p className="text-xl font-bold text-white">0</p>
                            <p className="text-xs text-gray-500 font-medium">Views</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/project/${project.slug}`} className="flex-1">
                          <Button
                            variant="primary"
                            className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 font-bold"
                          >
                            <Settings size={18} className="mr-2" />
                            Manage
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          onClick={() => startEditingProject(project)}
                          className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-orange-400 hover:border-orange-500/50"
                        >
                          <Edit size={18} />
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleDeleteProject(project.id)}
                          className="border-gray-700 text-gray-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>

                      {project.visibility === 'public' && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                          <a
                            href={`#/project/${project.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-400 hover:text-orange-400 transition-colors flex items-center gap-2 group/link"
                          >
                            <ExternalLink size={14} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                            View Public Page
                          </a>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Following Section */}
        <div className="mt-16">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                <Heart size={32} className="text-rose-500" />
                Following
              </h2>
              <p className="text-gray-400">Projects, wishlists, and creators you support</p>
            </div>
          </div>

          <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
            <Button
              onClick={() => setFollowFilter('all')}
              variant={followFilter === 'all' ? 'primary' : 'outline'}
              className={followFilter === 'all'
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 font-bold whitespace-nowrap'
                : 'border-gray-700 text-gray-300 hover:bg-gray-800 whitespace-nowrap'
              }
            >
              <Filter size={18} className="mr-2" />
              All ({following.projects.length + following.wishlists.length + following.creators.length})
            </Button>
            <Button
              onClick={() => setFollowFilter('projects')}
              variant={followFilter === 'projects' ? 'primary' : 'outline'}
              className={followFilter === 'projects'
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 font-bold whitespace-nowrap'
                : 'border-gray-700 text-gray-300 hover:bg-gray-800 whitespace-nowrap'
              }
            >
              <FolderOpen size={18} className="mr-2" />
              Projects ({following.projects.length})
            </Button>
            <Button
              onClick={() => setFollowFilter('wishlists')}
              variant={followFilter === 'wishlists' ? 'primary' : 'outline'}
              className={followFilter === 'wishlists'
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 font-bold whitespace-nowrap'
                : 'border-gray-700 text-gray-300 hover:bg-gray-800 whitespace-nowrap'
              }
            >
              <Gift size={18} className="mr-2" />
              Wishlists ({following.wishlists.length})
            </Button>
            <Button
              onClick={() => setFollowFilter('creators')}
              variant={followFilter === 'creators' ? 'primary' : 'outline'}
              className={followFilter === 'creators'
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 font-bold whitespace-nowrap'
                : 'border-gray-700 text-gray-300 hover:bg-gray-800 whitespace-nowrap'
              }
            >
              <Users size={18} className="mr-2" />
              Creators ({following.creators.length})
            </Button>
          </div>

          {(following.projects.length === 0 && following.wishlists.length === 0 && following.creators.length === 0) ? (
            <Card className="text-center py-16 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
              <Heart size={64} className="mx-auto text-rose-500/50 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Not Following Anyone Yet</h3>
              <p className="text-gray-400 mb-6">Explore projects and creators to start building your feed</p>
              <Link href="/explore">
                <Button className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 font-bold">
                  Explore Now
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(followFilter === 'all' || followFilter === 'projects') && following.projects.map((project: any) => (
                <Link key={project.id} href={`/project/${project.slug}`}>
                  <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-rose-500/50 transition-all duration-300 overflow-hidden group hover:shadow-[0_0_30px_rgba(244,63,94,0.2)]">
                    {project.background_url ? (
                      <div
                        className="w-full h-32 bg-cover bg-center"
                        style={{ backgroundImage: `url(${project.background_url})` }}
                      />
                    ) : (
                      <div className="w-full h-32 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <FolderOpen size={48} className="text-gray-700" />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <FolderOpen size={16} className="text-orange-500" />
                        <span className="text-xs font-bold text-orange-500 uppercase">Project</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-rose-400 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {project.description || 'No description'}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}

              {(followFilter === 'all' || followFilter === 'wishlists') && following.wishlists.map((wishlist: any) => (
                <Link key={wishlist.id} href={`/wishlist/${wishlist.slug}`}>
                  <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-purple-500/50 transition-all duration-300 overflow-hidden group hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                    {wishlist.cover_image ? (
                      <div
                        className="w-full h-32 bg-cover bg-center"
                        style={{ backgroundImage: `url(${wishlist.cover_image})` }}
                      />
                    ) : (
                      <div className="w-full h-32 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <Gift size={48} className="text-gray-700" />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Gift size={16} className="text-purple-500" />
                        <span className="text-xs font-bold text-purple-500 uppercase">Wishlist</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-purple-400 transition-colors">
                        {wishlist.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                        {wishlist.description || 'No description'}
                      </p>
                      {wishlist.total_sats_goal > 0 && (
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                            style={{
                              width: `${Math.min((wishlist.total_sats_raised / wishlist.total_sats_goal) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}

              {(followFilter === 'all' || followFilter === 'creators') && following.creators.map((creator: any) => (
                <Link key={creator.id} href={`/profile/${creator.username}`}>
                  <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-blue-500/50 transition-all duration-300 p-6 group hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                    <div className="flex items-center gap-4 mb-4">
                      {creator.avatar_url ? (
                        <img
                          src={creator.avatar_url}
                          alt={creator.username}
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-700 group-hover:border-blue-500 transition-colors"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center text-white text-2xl font-bold">
                          {creator.username[0].toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Users size={14} className="text-blue-500 flex-shrink-0" />
                          <span className="text-xs font-bold text-blue-500 uppercase">Creator</span>
                        </div>
                        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                          {creator.username}
                        </h3>
                      </div>
                    </div>
                    {creator.bio && (
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {creator.bio}
                      </p>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Project"
      >
        <form onSubmit={handleCreateProject} className="space-y-5">
          <div>
            <Input
              label="Project Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Community Garden Fund"
              required
              className="bg-black border-gray-700 text-white"
            />
            <p className="text-xs text-gray-500 mt-2">Choose a clear, descriptive name for your project</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell people about your project and what you're trying to achieve..."
              className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-2">A compelling description helps supporters understand your mission</p>
          </div>

          <div>
            <Input
              label="URL Slug (optional)"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
              placeholder="community-garden-fund"
              className="bg-black border-gray-700 text-white font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-2">
              Your project URL: katoa.org/project/{formData.slug || 'your-slug'}
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              className="flex-1 border-gray-700 text-gray-300"
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 font-bold"
              disabled={processing || !formData.title}
            >
              {processing ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
