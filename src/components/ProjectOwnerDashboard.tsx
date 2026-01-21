import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ProjectOwner } from "@/types/user";
import axios from "axios";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Eye,
  FolderKanban,
  Plus,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "./DashboardLayout";
import { useToast } from "./ui/use-toast";

interface Applicant {
  _id: string;
  user: {
    fullName: string;
    avatar: string;
    email: string;
  };
  roleAppliedFor?: string;
  matchScore?: number;
}

interface Project {
  _id: string;
  projectTitle: string;
  projectStatus: string;
  createdAt: string;
  applicants: Applicant[];
  views?: number;
}


export function ProjectOwnerDashboard() {
  const { user } = useAuth();
  const owner = user as ProjectOwner;
  const [totalProject, setTotalProject] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsData, setStatsData] = useState<any>(null);
  const { toast } = useToast();
  const API_BASE = import.meta.env.VITE_API_URL || 'https://teammate-n05o.onrender.com';

  const stats = [
    {
      label: "Active Projects",
      value: statsData?.activeProjects || 0,
      icon: FolderKanban,
      color: "cyan",
      change: "Current active",
    },
    {
      label: "Total Applicants",
      value: statsData?.totalApplicants || 0,
      icon: Users,
      color: "purple",
      change: "All time",
    },
    {
      label: "Successful Matches",
      value: statsData?.successfulMatches || 0,
      icon: CheckCircle2,
      color: "emerald",
      change: "Accepted applicants",
    },
    {
      label: "Total Views",
      value: statsData?.totalViews || 0,
      icon: Eye,
      color: "amber",
      change: "All projects",
    },
  ];

  const hasFetched = useRef(false);

  const getTotalProject = async () => {
    if (hasFetched.current) return;

    if (totalProject.length > 0) return;

    setError(null);
    setIsLoading(true);

    try {
      const response = await axios.get(
        `${API_BASE}/api/project/total-projects`
      );

      if (response.status !== 200) {
        const msg = response.data?.message || "Failed to fetch projects";
        toast({ title: "Error!", description: msg });
        setError(msg);
        return;
      }

      const projects = response.data?.data?.projects || [];
      // console.log(response.data?.data?.projects.);
      setTotalProject(projects);

      // Fetch Stats
      const statsRes = await axios.get(`${API_BASE}/api/project/owner-stats`);
      if(statsRes.data.success) {
          setStatsData(statsRes.data.stats);
      }
      
      hasFetched.current = true;
    } catch (err: any) {
      console.error("❌ Fetch failed:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to load projects";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getTotalProject();
  }, []);

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          Welcome back, {owner?.fullName?.split(" ")[0]}! 👋
        </h1>
        <p className="text-gray-400 font-sans">
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Stats Grid */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="glass-panel rounded-xl p-6 gradient-border">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-10 h-10 rounded-lg bg-${stat.color}-500/20 flex items-center justify-center`}
                >
                  <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                </div>
                <span className="text-xs text-emerald-400 font-mono">
                  {stat.change}
                </span>
              </div>
              <p className="text-3xl font-display font-bold text-white mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-gray-400 font-sans">{stat.label}</p>
            </div>
          ))}
        </div>
        {totalProject && totalProject.length > 0 ? (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Projects Column */}
            <div className="lg:col-span-2 glass-panel rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-bold text-white">
                  Your Projects
                </h2>
                <Link to="/dashboard/projects">
                  <Button
                    variant="ghost"
                    className="text-cyan-400 hover:text-cyan-300 font-sans"
                  >
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                {totalProject.map((project) => (
                  <div
                    key={project._id}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                  >
                    <div className="flex-1">
                  <h3 className="font-sans font-medium text-white mb-1 group-hover:text-cyan-400 transition-colors">
                    <Link to={`/dashboard/project/${project._id}`}>
                        {project.projectTitle}
                    </Link>
                  </h3>
                      <div className="flex items-center gap-4 text-xs text-gray-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {project.applicants?.length || 0} applicants{" "}
                          {/* ← fix: probably array */}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {/* {project.views || 0} views */}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(project.createdAt).toLocaleDateString() ||
                            "N/A"}{" "}
                          {/* ← better display */}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-mono ${
                        project.projectStatus === "active"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                      }`}
                    >
                      {project.projectStatus || "pending"}
                    </span>
                  </div>
                ))}
              </div>

              <Link to="/dashboard/projects/new" className="block mt-4">
                <Button
                  variant="outline"
                  className="w-full border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/40 font-sans"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Project
                </Button>
              </Link>
            </div>

            {/* Recent Applicants */}
            <div className="glass-panel rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-bold text-white">
                  Recent Applicants
                </h2>
                <Link to="/dashboard/applicants">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-cyan-400 hover:text-cyan-300 font-sans"
                  >
                    View All
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                {totalProject.length > 0 ? (
                  totalProject
                    .filter((project) => (project.applicants || []).length > 0)
                    .map((project) => (
                      <div key={project._id} className="mb-6">
                        <h4 className="text-sm font-semibold text-cyan-300 mb-2">
                          {project.projectTitle} ({project.applicants.length}{" "}
                          applicants)
                        </h4>
                        <div className="space-y-3 pl-2 border-l-2 border-cyan-500/30">
                          {project.applicants.map((applicant, idx) => (
                            <div
                              key={applicant._id || idx}
                              className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                            >
                              <Avatar className="w-10 h-10">
                                <AvatarImage
                                  src={applicant.user?.avatar}
                                  alt={applicant.user?.fullName}
                                />
                                <AvatarFallback>
                                  {applicant.user?.fullName?.[0] || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-white font-sans truncate">
                                    {applicant.user?.fullName || "Unknown User"}
                                  </p>
                                  <span className="text-xs font-mono text-emerald-400">
                                    {applicant.matchScore || "—"}%
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400 font-sans">
                                  {applicant.roleAppliedFor || "Developer / Designer"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-gray-400 text-sm">
                    No projects with applicants yet
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            No projects yet. Create your first one!
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
