import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  MoreVertical, 
  Users, 
  Eye, 
  Clock, 
  Edit, 
  Trash2,
  Archive,
  ArchiveRestore,
  CheckCircle2,
  Settings
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from './DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RoleBadge } from './RoleBadge';
import { Role } from '@/types/project';
import { formatDate } from '@/utils/dateFormatter';

interface ProjectItem {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'draft' | 'archived' | 'completed';
  roles: Role[];
  applicants: number;
  views: number;
  createdAt: string;
  techStack: string[];
  lifecycleStage: 'team-search' | 'ongoing' | 'in-review' | 'completed';
}



// import { mockProjects } from '@/data/mockProjects'; No longer used
import axios from "axios";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

// ... imports ...

export function MyProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'draft' | 'archived' | 'completed'>('all');
  const { toast } = useToast();
  const { getCachedData, setCachedData } = useAuth();
  const API_BASE = import.meta.env.VITE_API_URL;
  const cacheKey = 'my_projects';
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyProjects = async () => {
        try {
            const cachedData = getCachedData(cacheKey);
            if (cachedData) {
                setProjects(cachedData);
                setLoading(false);
            } else {
                setLoading(true);
            }

            const res = await axios.get(`${API_BASE}/api/project/my-projects`);
            if(res.data.success) {
                setProjects(res.data.projects);
                setCachedData(cacheKey, res.data.projects);
            }
        } catch (error) {
            console.error("Failed to fetch my projects", error);
            toast({ title: "Error", description: "Failed to load your projects", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };
    fetchMyProjects();
  }, [API_BASE, toast]);
  
  const handleArchive = async (projectId: string) => {
    try {
        setActionLoadingId(projectId);
        const res = await axios.put(`${API_BASE}/api/project/archive-projects/${projectId}`);
        if(res.status === 200) {
            toast({ title: "Archived", description: "Project archived successfully." });
            const updated = projects.map(p => p.id === projectId ? { ...p, status: 'archived' as const } : p);
            setProjects(updated);
            setCachedData(cacheKey, updated);
        }
    } catch (error) {
        toast({ title: "Error", description: "Failed to archive project", variant: "destructive" });
    } finally {
        setActionLoadingId(null);
    }
  };

  const handleDelete = async (projectId: string) => {
    try {
        const res = await axios.delete(`${API_BASE}/api/project/${projectId}`);
        if(res.status === 200) {
            toast({ title: "Deleted", description: "Project deleted successfully." });
            const updated = projects.filter(p => p.id !== projectId);
            setProjects(updated);
            setCachedData(cacheKey, updated);
        }
    } catch (error) {
        toast({ title: "Error", description: "Failed to delete project", variant: "destructive" });
    } finally {
        setDeleteDialogOpen(false);
        setProjectToDelete(null);
        setActionLoadingId(null);
    }
  };

  const handleUnarchive = async (projectId: string) => {
    try {
        setActionLoadingId(projectId);
        const res = await axios.put(`${API_BASE}/api/project/unarchive-projects/${projectId}`);
        if(res.status === 200) {
            toast({ title: "Unarchived", description: "Project restored to active." });
            const updated = projects.map(p => p.id === projectId ? { ...p, status: 'active' as const } : p);
            setProjects(updated);
            setCachedData(cacheKey, updated);
        }
    } catch (error) {
        toast({ title: "Error", description: "Failed to unarchive project", variant: "destructive" });
    } finally {
        setActionLoadingId(null);
    }
  };

  const handleCompleteSelection = async (projectId: string) => {
    try {
        setActionLoadingId(projectId);
        const res = await axios.patch(`${API_BASE}/api/project/${projectId}/complete-selection`);
        if(res.data.success) {
            toast({ title: "Team Selection Finished! 🎯", description: "Your project is now ongoing." });
            const updated = projects.map(p => p.id === projectId ? { ...p, lifecycleStage: 'ongoing' as const } : p);
            setProjects(updated);
            setCachedData(cacheKey, updated);
            // Also invalidate project detail cache if any
            setCachedData(`project_${projectId}`, null);
        }
    } catch (error) {
        toast({ title: "Error", description: "Failed to complete selection", variant: "destructive" });
    } finally {
        setActionLoadingId(null);
    }
  };

  const handleComplete = async (projectId: string) => {
    try {
        setActionLoadingId(projectId);
        const res = await axios.patch(`${API_BASE}/api/project/${projectId}/complete`);
        if(res.data.success) {
            toast({ title: "Project Completed! 🏆", description: "Congratulations on finishing the project!" });
            const updated = projects.map(p => p.id === projectId ? { ...p, status: 'completed' as const, lifecycleStage: 'completed' as const } : p);
            setProjects(updated);
            setCachedData(cacheKey, updated);
            // Also invalidate project detail cache if any
            setCachedData(`project_${projectId}`, null);
        }
    } catch (error) {
        toast({ title: "Error", description: "Failed to mark project as completed", variant: "destructive" });
    } finally {
        setActionLoadingId(null);
    }
  };

  const filteredProjects = projects.filter(p => 
    filter === 'all' ? true : p.status === filter
  );

  const statusCounts = {
    all: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    draft: projects.filter(p => p.status === 'draft').length,
    archived: projects.filter(p => p.status === 'archived').length,
    completed: projects.filter(p => p.status === 'completed').length,
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            My Projects
          </h1>
          <p className="text-gray-400 font-sans">
            Manage your projects and track applicants
          </p>
        </div>
        <Link to="/dashboard/projects/new">
          <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 font-sans font-semibold">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['all', 'active', 'completed', 'draft', 'archived'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-sans text-sm font-medium transition-all duration-200 ${
              filter === status
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="ml-2 text-xs font-mono opacity-60">
              {statusCounts[status]}
            </span>
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid gap-4">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <div 
              key={project.id}
              className="glass-panel rounded-xl p-6 gradient-border hover:translate-y-[-2px] transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link to={`/dashboard/project/${project.id}`} className="hover:underline decoration-cyan-400 underline-offset-4">
                      <h3 className="text-xl font-display font-bold text-white">
                        {project.title}
                      </h3>
                    </Link>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-mono capitalize ${
                      project.lifecycleStage === 'ongoing' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                      project.lifecycleStage === 'team-search' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {project.lifecycleStage?.replace('-', ' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-mono ${
                      project.status === 'active' 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : project.status === 'completed'
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : project.status === 'draft'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-gray-400 font-sans text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#1a1f2e] border-white/10">
                    <Link to={`/dashboard/projects/edit/${project.id}`}>
                        <DropdownMenuItem className="text-gray-300 hover:text-white focus:text-white focus:bg-white/10 cursor-pointer">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                        </DropdownMenuItem>
                    </Link>
                    {project.status === 'archived' ? (
                      <DropdownMenuItem 
                        onClick={() => handleUnarchive(project.id)} 
                        className="text-gray-300 hover:text-white focus:text-white focus:bg-white/10 cursor-pointer"
                        disabled={actionLoadingId === project.id}
                      >
                        {actionLoadingId === project.id ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        ) : (
                          <ArchiveRestore className="w-4 h-4 mr-2" />
                        )}
                        Un-Archive
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem 
                        onClick={() => handleArchive(project.id)} 
                        className="text-gray-300 hover:text-white focus:text-white focus:bg-white/10 cursor-pointer"
                        disabled={actionLoadingId === project.id}
                      >
                        {actionLoadingId === project.id ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        ) : (
                          <Archive className="w-4 h-4 mr-2" />
                        )}
                        Archive
                      </DropdownMenuItem>
                    )}
                    {project.status === 'active' && project.lifecycleStage === 'ongoing' && (
                      <DropdownMenuItem 
                        onClick={() => handleComplete(project.id)} 
                        className="text-cyan-400 hover:text-cyan-300 focus:text-cyan-300 focus:bg-cyan-500/10 cursor-pointer"
                        disabled={actionLoadingId === project.id}
                      >
                        {actionLoadingId === project.id ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                        )}
                        Complete Project
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => {
                        setProjectToDelete(project.id);
                        setDeleteDialogOpen(true);
                      }} 
                      className="text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
                      disabled={actionLoadingId === project.id}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Roles */}
              <div className="flex items-center gap-2 mb-4">
                {project.roles.map((role) => (
                  <RoleBadge key={role} role={role} />
                ))}
              </div>

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-2 mb-4">
                {project.techStack.map((tech) => (
                  <span 
                    key={tech}
                    className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs text-gray-400 font-mono"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-sm text-gray-400 font-mono">
                  <Users className="w-4 h-4" />
                  <span>{project.applicants} applicants</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400 font-mono">
                  <Eye className="w-4 h-4" />
                  <span>{project.views} views</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400 font-mono">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(project.createdAt)}</span>
                </div>
                
                <div className="ml-auto flex items-center gap-2">
                  {project.lifecycleStage === 'team-search' && project.status === 'active' && (
                    <Button 
                      size="sm" 
                      disabled={actionLoadingId === project.id}
                      onClick={() => handleCompleteSelection(project.id)}
                      className="bg-emerald-500 hover:bg-emerald-400 text-white font-sans font-semibold"
                    >
                      {actionLoadingId === project.id ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      Finish Team Selection
                    </Button>
                  )}
                  {project.lifecycleStage !== 'team-search' && project.status === 'active' && (
                     <Link to={`/dashboard/project/${project.id}?tab=management`}>
                        <Button size="sm" className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 font-sans">
                          <Settings className="w-3.5 h-3.5 mr-1.5" />
                          Manage
                        </Button>
                     </Link>
                  )}
                  <Link to={`/dashboard/projects/${project.id}/applicants`}>
                    <Button size="sm" variant="outline" className="border-white/20 text-gray-300 hover:text-white hover:border-white/40 font-sans">
                      View Applicants
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-panel rounded-xl p-12 text-center">
            <p className="text-gray-400 font-sans text-lg mb-2">
              No {filter !== 'all' ? filter : ''} projects found
            </p>
            <p className="text-gray-500 font-sans text-sm mb-6">
              Create your first project to start finding collaborators
            </p>
            <Link to="/dashboard/projects/new">
              <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 font-sans font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="glass-panel border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-display font-bold text-white">
              Delete Project
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400 font-sans">
              Are you sure you want to delete this project? This action cannot be undone.
              All applicants and project data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 text-gray-300 hover:text-white hover:bg-white/5">
              Cancel
            </AlertDialogCancel>
            <Button 
                variant="destructive" 
                onClick={() => projectToDelete && handleDelete(projectToDelete)}
                disabled={actionLoadingId === projectToDelete}
            >
              {actionLoadingId === projectToDelete ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : null}
              Delete Project
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
