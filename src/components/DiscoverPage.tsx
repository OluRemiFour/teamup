import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "./DashboardLayout";
import { ProjectCard } from "./ProjectCard";
import { FilterSidebar, FilterState } from "./FilterSidebar";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { Project, Role, ExperienceLevel, Timeline } from "@/types/project";
import { getTechIcon, getTechCategory } from "@/utils/techStackIcons";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export function DiscoverPage() {
  const [filters, setFilters] = useState<FilterState>({
    roles: [],
    experienceLevels: [],
    timelines: [],
    techStack: [],
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { getCachedData, setCachedData } = useAuth();
  const API_BASE = import.meta.env.VITE_API_URL || 'https://teammate-n05o.onrender.com';
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("query") || "";

  useEffect(() => {
    const fetchProjects = async () => {
        try {
            const cacheKey = 'explore_projects';
            const cachedData = getCachedData(cacheKey);
            if (cachedData) {
                setProjects(cachedData);
                setLoading(false);
            } else {
                setLoading(true);
            }

            const res = await axios.get(`${API_BASE}/api/project/explore`);
            if (res.data.success) {
                const mappedProjects: Project[] = res.data.data.map((p: any) => ({
                    id: p._id,
                    title: p.projectTitle,
                    description: p.projectDescription,
                    matchScore: p.matchScore || 0,
                    roles: p.rolesNeeded || [],
                    techStack: p.techStack?.map((t: string) => ({ 
                      name: t, 
                      icon: getTechIcon(t), 
                      category: getTechCategory(t) 
                    })) || [],
                    timeline: p.projectDetails?.timeline || "flexible",
                    experienceLevel: p.projectDetails?.experienceLevel || "intermediate",
                    teamSize: p.projectDetails?.teamSize || 1,
                    currentMembers: 1, // Mock
                    matchReasons: p.matchReasons || [],
                    postedBy: {
                        id: p.owner?._id,
                        name: p.owner?.fullName || "Unknown",
                        avatar: p.owner?.avatar || "",
                        role: "Project Owner"
                    },
                    createdAt: p.createdAt,
                    status: p.projectStatus,
                    applicants: p.applicants?.length || 0,
                    isInterested: p.hasApplied || false
                }));
                setProjects(mappedProjects);
                setCachedData(cacheKey, mappedProjects);
            }
        } catch (error) {
            console.error("Failed to fetch projects", error);
            toast({
                title: "Error",
                description: "Failed to load projects. Please try again.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };
    fetchProjects();
  }, [API_BASE, toast]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (filters.roles.length > 0) {
        const hasMatchingRole = project.roles.some((role) =>
          filters.roles.includes(role)
        );
        if (!hasMatchingRole) return false;
      }

      if (filters.experienceLevels.length > 0) {
        if (!filters.experienceLevels.includes(project.experienceLevel))
          return false;
      }

      if (filters.timelines.length > 0) {
        if (!filters.timelines.includes(project.timeline)) return false;
      }

      if (searchQuery) {
          const lowerQuery = searchQuery.toLowerCase();
          return project.title.toLowerCase().includes(lowerQuery) || 
                 project.description.toLowerCase().includes(lowerQuery) ||
                 project.roles.some(r => r.toLowerCase().includes(lowerQuery)) ||
                 project.techStack.some(t => t.name.toLowerCase().includes(lowerQuery));
      }

      
      // Feature Request: Only show projects in 'team-search' stage
      if (project.status === 'completed' || project.lifecycleStage === 'ongoing' || project.lifecycleStage === 'completed') {
          return false;
      }
      
      return true;
    });
  }, [projects, filters, searchQuery]);

  const projectCounts = useMemo(() => {
    const byRole: Record<Role, number> = {
      frontend: 0,
      backend: 0,
      fullstack: 0,
      designer: 0,
      mobile: 0,
      product: 0,
      other: 0,
    };

    const byExperience: Record<ExperienceLevel, number> = {
      beginner: 0,
      intermediate: 0,
      advanced: 0,
      expert: 0,
    };

    const byTimeline: Record<Timeline, number> = {
      "1-3 months": 0,
      "3-6 months": 0,
      "6+ months": 0,
      ongoing: 0,
    };

    projects.forEach((project) => {
      project.roles.forEach((role) => {
        if (byRole[role] !== undefined) byRole[role]++;
      });
      if (byExperience[project.experienceLevel] !== undefined) byExperience[project.experienceLevel]++;
      if (byTimeline[project.timeline] !== undefined) byTimeline[project.timeline]++;
    });

    return {
      total: filteredProjects.length,
      byRole,
      byExperience,
      byTimeline,
    };
  }, [projects, filteredProjects]);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleExpressInterest = (projectId: string) => {
     const project = projects.find(p => p.id === projectId);
     if (project) {
         setSelectedProject(project);
         setShowApplyDialog(true);
     }
  };

  const handleApply = async () => {
    if (!selectedProject || !applicationMessage.trim()) return;

    setIsApplying(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/project/projects/${selectedProject.id}/apply`,
        {
          roleAppliedFor: selectedProject.roles[0] || "collaborator",
          message: applicationMessage,
        }
      );

      if (res.data.success) {
        setShowApplyDialog(false);
        setApplicationMessage('');
        const updatedProjects = projects.map(p => p.id === selectedProject?.id ? { ...p, isInterested: true } : p);
        setProjects(updatedProjects);
        setCachedData('explore_projects', updatedProjects);
        // Also invalidate applications cache
        setCachedData('my_applications', null); 
        toast({
          title: "Application Submitted! ✨",
          description: "The project owner will review your application and get back to you soon.",
          duration: 5000,
        });
      }
    } catch (error: any) {
       const errorMsg = error.response?.data?.message || "Failed to submit application";
       toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex gap-8">
        <aside className="flex-shrink-0">
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            projectCounts={projectCounts}
          />
        </aside>

        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-3xl font-display font-bold text-white mb-2">
              Discover Projects
            </h1>
            <p className="text-gray-400 font-sans">
              {filteredProjects.length} project
              {filteredProjects.length !== 1 ? "s" : ""} match your profile
            </p>
          </div>

          <div className="space-y-6">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onExpressInterest={handleExpressInterest}
                  style={{
                    animation: `stagger-fade-in 0.5s ease-out ${
                      index * 0.1
                    }s both`,
                  }}
                />
              ))
            ) : (
              <div className="glass-panel rounded-xl p-12 text-center">
                <p className="text-gray-400 font-sans text-lg mb-2">
                  No projects match your current filters
                </p>
                <p className="text-gray-500 font-sans text-sm">
                  Try adjusting your filters to see more opportunities
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent className="glass-panel border-white/10 sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold text-white">
              Express Interest in {selectedProject?.title}
            </DialogTitle>
            <DialogDescription className="text-gray-400 font-sans">
              Send a message to the project owner explaining why you'd be a great fit.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Tell them about your relevant experience..."
              value={applicationMessage}
              onChange={(e) => setApplicationMessage(e.target.value)}
              className="min-h-[150px] bg-white/5 border-white/10 text-white placeholder:text-gray-500 font-sans"
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowApplyDialog(false)}
              className="text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              disabled={isApplying || !applicationMessage.trim()}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400"
            >
              {isApplying ? "Sending..." : (
                 <>
                   <Sparkles className="w-4 h-4 mr-2" />
                   Send Application
                 </>
               )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
