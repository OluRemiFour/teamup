import { useEffect, useState, useMemo } from 'react';
import { Clock, CheckCircle2, XCircle, MessageSquare, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { RoleBadge } from './RoleBadge';
import { Role, ApplicationStatus } from '@/types/project';
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

interface Application {
  id: string;
  project: {
    id: string;
    title: string;
    roles: Role[];
    company: string;
    owner: {
      name: string;
      avatar: string;
    };
  };
  status: ApplicationStatus;
  role: string;
  appliedAt: string;
  matchScore: number;
  message?: string;
}

export function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const { getCachedData, setCachedData } = useAuth();
  const API_BASE = import.meta.env.VITE_API_URL || 'https://teammate-n05o.onrender.com';

  useEffect(() => {
    const fetchApplications = async () => {
        try {
            const cacheKey = 'my_applications';
            const cachedData = getCachedData(cacheKey);
            if (cachedData) {
                setApplications(cachedData);
                setLoading(false);
            } else {
                setLoading(true);
            }

            const res = await axios.get(`${API_BASE}/api/collaborators/applications`);
            if (res.data.success) {
                const mappedApps = res.data.applications.map((app: any) => ({
                    id: app._id,
                    project: {
                        id: app.project._id,
                        title: app.project.title,
                        roles: app.project.roles || [],
                        company: app.project.company || "BuildGether",
                        owner: {
                            name: app.project.owner.name,
                            avatar: app.project.owner.avatar
                        }
                    },
                    status: app.status,
                    role: app.role || "collaborator",
                    appliedAt: new Date(app.appliedAt).toLocaleDateString(),
                    matchScore: app.matchScore || 0,
                    message: app.message
                }));
                setApplications(mappedApps);
                setCachedData(cacheKey, mappedApps);
            }
        } catch (error) {
            console.error("Failed to fetch applications", error);
        } finally {
            setLoading(false);
        }
    };
    fetchApplications();
  }, [API_BASE]);

  const filteredApplications = useMemo(() => {
    return applications.filter(a => 
      filter === 'all' ? true : a.status === filter
    );
  }, [applications, filter]);

  const statusCounts = useMemo(() => {
    return {
      all: applications.length,
      pending: applications.filter(a => a.status === 'pending').length,
      accepted: applications.filter(a => a.status === 'accepted').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
    };
  }, [applications]);

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-400" />;
      case 'accepted':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'accepted':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          My Applications
        </h1>
        <p className="text-gray-400 font-sans">
          Track the status of your project applications
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'accepted', 'rejected'] as const).map((status) => (
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

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length > 0 ? (
          filteredApplications.map((application) => (
            <div 
              key={application.id}
              className="glass-panel rounded-xl p-6 gradient-border"
            >
              <div className="flex items-start gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={application.project.owner.avatar} alt={application.project.owner.name} />
                  <AvatarFallback>{application.project.owner.name[0]}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-display font-bold text-white mb-1">
                        {application.project.title}
                      </h3>
                      <p className="text-sm text-gray-400 font-sans">
                        {application.project.company} • Posted by {application.project.owner.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xl font-mono font-bold ${
                        application.matchScore >= 85 ? 'text-emerald-400' :
                        application.matchScore >= 70 ? 'text-cyan-400' : 'text-amber-400'
                      }`}>
                        {application.matchScore}%
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        {application.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <RoleBadge role={application.role as any} />
                  </div>

                  {application.message && (
                    <div className={`p-3 rounded-lg mb-3 ${
                      application.status === 'accepted' 
                        ? 'bg-emerald-500/10 border border-emerald-500/20' 
                        : 'bg-white/5 border border-white/10'
                    }`}>
                      <p className="text-sm text-gray-300 font-sans">{application.message}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <span className="text-xs text-gray-500 font-sans">
                      Applied {application.appliedAt}
                    </span>
                    <div className="flex gap-2">
                      {application.status === 'accepted' ? (
                        <Link to={`/dashboard/messages?project=${application.project.id}`}>
                          <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 font-sans">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Message Team
                          </Button>
                        </Link>
                      ) : (
                        <Link to={`/dashboard/messages?recipient=${application.project.owner.name}`}>
                          <Button size="sm" variant="outline" className="border-white/20 text-gray-300 hover:text-white hover:border-white/40 font-sans">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Message Owner
                          </Button>
                        </Link>
                      )}
                      <Link to={`/dashboard/project/${application.project.id}`}>
                        <Button size="sm" variant="outline" className="border-white/20 text-gray-300 hover:text-white hover:border-white/40 font-sans">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Project
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-panel rounded-xl p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
               <span className="text-3xl">🚀</span>
            </div>
            <p className="text-gray-400 font-sans text-lg mb-2">
              No {filter !== 'all' ? filter : ''} applications yet.
            </p>
            <p className="text-gray-500 font-sans text-sm mb-6 max-w-md">
              {filter === 'all' 
                ? "You haven't applied to any projects yet. Start exploring to find teams looking for your skills!"
                : `You don't have any ${filter} applications.`}
            </p>
             {filter === 'all' && (
                <a href="/dashboard/discover">
                    <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 font-sans font-semibold">
                    Explore Projects
                    </Button>
                </a>
             )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
