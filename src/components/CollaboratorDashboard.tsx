import { Link } from "react-router-dom";
import {
  Search,
  FolderKanban,
  TrendingUp,
  Star,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "./DashboardLayout";
import { Button } from "@/components/ui/button";
import { MatchScoreRing } from "./MatchScoreRing";
import { RoleBadge } from "./RoleBadge";
import { Collaborator } from "@/types/user";
import { useState, useEffect } from "react";
import axios from "axios";

// Interfaces for API response
interface Application {
  _id: string;
  project: {
    _id: string;
    title: string;
    roles: string[];
    owner: {
      name: string;
      avatar: string;
    };
  };
  status: "pending" | "accepted" | "rejected";
  role: string;
  appliedAt: string;
  matchScore: number;
}

interface Match {
  _id: string;
  projectTitle: string;
  projectStatus: string;
  rolesNeeded: string[];
  techStack: string[];
  owner: {
    fullName: string;
    avatar?: string;
  };
  projectDetails: {
    timeline: string;
    experienceLevel: string;
    teamSize: number;
  };
  matchScore?: number;
}

export function CollaboratorDashboard() {
  const { user } = useAuth();
  const collaborator = user as Collaborator;

  const [matches, setMatches] = useState<Match[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [statsData, setStatsData] = useState<any>(null); // State for stats
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [matchesRes, appsRes] = await Promise.all([
            axios.get(`${API_BASE}/api/collaborators/matches`),
            axios.get(`${API_BASE}/api/collaborators/applications`)
        ]);

        if (matchesRes.data.success) {
            setMatches(matchesRes.data.matches);
        }
        if (appsRes.data.success) {
            setApplications(appsRes.data.applications);
        }
        let stats: any = {};
        try {
            const statsRes = await axios.get(`${API_BASE}/api/collaborators/stats`);
            if (statsRes.data.success) {
                stats = statsRes.data.stats;
            }
        } catch (e) {
            console.log("Stats endpoint optional or failed");
        }

        // Dynamic score fallback from applications
        if (!stats.matchScore && appsRes.data.success && appsRes.data.applications.length > 0) {
             const apps = appsRes.data.applications;
             const totalScore = apps.reduce((acc: number, app: any) => acc + (app.matchScore || 0), 0);
             // @ts-ignore
             stats.matchScore = Math.round(totalScore / apps.length);
        }
        setStatsData(stats);

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
        fetchData();
    }
  }, [user, API_BASE]);

  const stats = [
    {
      label: "Match Score",
      value: `${statsData?.matchScore || 0}%`,
      icon: Star,
      color: "cyan",
      subtext: "Based on your profile",
    },
    {
      label: "Projects Joined",
      value: statsData?.projectsJoined || 0,
      icon: FolderKanban,
      color: "purple",
      subtext: "Total joined",
    },
    {
      label: "Completed",
      value: statsData?.completedProjects || 0,
      icon: CheckCircle2,
      color: "emerald",
      subtext: "Projects finished",
    },
    {
      label: "Matches Received",
      value: statsData?.matchesReceived || matches.length,
      icon: TrendingUp,
      color: "amber",
      subtext: "New opportunities",
    },
  ];

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          Welcome back, {(collaborator as any)?.name?.split(" ")[0] || (collaborator as any)?.fullName?.split(" ")[0]}! 👋
        </h1>
        <p className="text-gray-400 font-sans">
          You have{" "}
          <span className="text-cyan-400 font-semibold">{matches.length} new match{matches.length !== 1 ? 'es' : ''}</span>{" "}
          waiting for you.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="glass-panel rounded-xl p-6 gradient-border"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-10 h-10 rounded-lg bg-${stat.color}-500/20 flex items-center justify-center`}
              >
                <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-white mb-1">
              {stat.value}
            </p>
            <p className="text-sm text-gray-400 font-sans">{stat.label}</p>
            <p className="text-xs text-gray-500 font-mono mt-1">
              {stat.subtext}
            </p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Matches */}
        {/* Top Matches */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold text-white">
              Top Matches For You
            </h2>
            <Link to="/dashboard/discover">
              <Button
                variant="ghost"
                className="text-cyan-400 hover:text-cyan-300 font-sans"
              >
                Discover More
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="space-y-4 flex-1">
            {matches.map((match) => (
              <div
                key={match._id}
                className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all duration-200 cursor-pointer group"
              >
                <MatchScoreRing
                  score={match.matchScore || 0}
                  size={60}
                  strokeWidth={4}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-sans font-medium text-white mb-1 group-hover:text-cyan-400 transition-colors">
                    {match.projectTitle}
                  </h3>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {match.rolesNeeded.slice(0,3).map((role) => (
                      <RoleBadge key={role} role={role as any} />
                    ))}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 font-sans flex-wrap">
                    <span>{match.owner?.fullName || "Unknown"}</span>
                    <span>•</span>
                    <span>{match.projectDetails?.timeline || "Flexible"}</span>
                  </div>
                </div>
                <Link to={`/dashboard/project/${match._id}`}>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 font-sans opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  View
                </Button>
                </Link>
              </div>
            ))}
          </div>

          <Link to="/dashboard/discover" className="block mt-6">
            <Button
              variant="outline"
              className="w-full border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/40 font-sans"
            >
              <Search className="w-4 h-4 mr-2" />
              Browse All Projects
            </Button>
          </Link>
        </div>

        {/* Applications */}
        <div className="glass-panel rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold text-white">
              Your Applications
            </h2>
            <Link to="/dashboard/applications">
              <Button
                variant="ghost"
                size="sm"
                className="text-cyan-400 hover:text-cyan-300 font-sans"
              >
                View All
              </Button>
            </Link>
          </div>

          <div className="space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
            {applications.map((app) => (
              <div
                key={app._id}
                className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white font-sans truncate mb-1">
                      {app.project?.title || "Project Title"}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                       <RoleBadge role={app.role as any} />
                       <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          app.status === "accepted" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          app.status === "rejected" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                          "bg-amber-500/10 text-amber-400 border-amber-500/20"
                       }`}>
                          {app.status}
                       </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 font-mono">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs font-bold text-cyan-400 font-mono mt-1">
                      {app.matchScore}% match
                    </p>
                  </div>
                </div>

                <div className="lg:flex gap-2 mt-4 pt-3 border-t border-white/5">
                  <Link to={`/dashboard/project/${app.project?._id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full h-8 text-[10px] border-white/10 text-gray-400 hover:text-white hover:border-cyan-500/30">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      {/* View Project */}
                    </Button>
                  </Link>
                  {app.status === 'accepted' ? (
                     <Link to={`/dashboard/messages?project=${app.project?._id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full h-8 text-[10px] border-white/10 text-cyan-400 hover:bg-cyan-500/5">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Message Team
                        </Button>
                     </Link>
                  ) : (
                    <Link to={`/dashboard/messages?recipient=${app.project?.owner?.name}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full h-8 text-[10px] border-white/10 text-gray-400">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Message Owner
                        </Button>
                     </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Skills Section */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <h3 className="text-sm font-sans font-semibold text-gray-300 mb-3">
              Your Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {collaborator?.skills?.slice(0, 4).map((skill) => (
                <span
                  key={skill.name}
                  className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 font-mono"
                >
                  {skill.icon} {skill.name}
                </span>
              ))}
              {(collaborator?.skills?.length || 0) > 4 && (
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 font-mono">
                  +{(collaborator?.skills?.length || 0) - 4} more
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
