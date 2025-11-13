import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Link } from '../components/Link';
import { StatsCard } from '../components/StatsCard';
import { supabase } from '../lib/supabase';
import { Plus, Edit, Trash2, Settings, Gift, DollarSign, Users, FolderOpen, Globe, Lock, FileText } from 'lucide-react';

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
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    slug: '',
  });
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalWishlists: 0,
    totalRaised: 0,
  });

  useEffect(() => {
    if (user) {
      loadProjects();
      loadStats();
    }
  }, [user]);

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
    setProcessing(true);

    try {
      const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const { error } = await supabase.from('projects').insert({
        creator_id: user!.id,
        title: formData.title,
        description: formData.description,
        slug,
        visibility: 'draft',
      });

      if (error) throw error;

      setShowCreateModal(false);
      setFormData({ title: '', description: '', slug: '' });
      loadProjects();
      loadStats();
    } catch (error: any) {
      console.error('Error creating project:', error);
      alert(error.message || 'Failed to create project');
    } finally {
      setProcessing(false);
    }
  }

  async function handleDeleteProject(id: string) {
    if (!confirm('Are you sure? This will delete the project and all its wishlists.')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadProjects();
      loadStats();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  }

  const formatSats = (sats: number) => {
    return new Intl.NumberFormat().format(sats);
  };

  const getVisibilityBadge = (visibility: string) => {
    if (visibility === 'public') {
      return (
        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
          <Globe size={12} />
          Public
        </span>
      );
    } else if (visibility === 'private') {
      return (
        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
          <Lock size={12} />
          Private
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-slate-500/20 text-slate-400 border border-slate-500/30 flex items-center gap-1">
          <FileText size={12} />
          Draft
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-700 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-700 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Projects"
            value={stats.totalProjects}
            icon={<FolderOpen size={24} />}
            trend="+12%"
          />
          <StatsCard
            title="Wishlists"
            value={stats.totalWishlists}
            icon={<Gift size={24} />}
            trend="+8%"
          />
          <StatsCard
            title="Total Raised"
            value={`${formatSats(stats.totalRaised)} sats`}
            icon={<DollarSign size={24} />}
            trend="+23%"
          />
          <StatsCard
            title="Supporters"
            value="0"
            icon={<Users size={24} />}
            trend="+5%"
          />
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">My Projects</h1>
            <p className="text-slate-400">Organize your wishlists into projects</p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700"
          >
            <Plus size={20} className="mr-2" />
            New Project
          </Button>
        </div>

        {projects.length === 0 ? (
          <Card className="text-center py-16">
            <FolderOpen size={64} className="mx-auto text-slate-600 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No projects yet</h3>
            <p className="text-slate-400 mb-6">Create your first project to get started</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700"
            >
              <Plus size={20} className="mr-2" />
              Create Project
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 hover:border-emerald-500/50 transition-all group"
              >
                {project.background_url && (
                  <div
                    className="w-full h-32 bg-cover bg-center rounded-t-lg mb-4 -mt-6 -mx-6"
                    style={{ backgroundImage: `url(${project.background_url})` }}
                  />
                )}

                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {project.title}
                  </h3>
                  {getVisibilityBadge(project.visibility)}
                </div>

                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                  {project.description || 'No description'}
                </p>

                <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Gift size={16} />
                    <span>{project.wishlist_count} wishlists</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/project/${project.slug}`} className="flex-1">
                    <Button variant="outline" className="w-full border-emerald-500/30 hover:border-emerald-500">
                      <Settings size={16} className="mr-2" />
                      Manage
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => handleDeleteProject(project.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Project"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <Input
            label="Project Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="My Awesome Project"
            required
          />

          <Input
            label="Slug (URL)"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="my-awesome-project"
            helpText="Leave blank to auto-generate from title"
          />

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What is this project about?"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
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
              {processing ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
