import { useState, useEffect } from "react";
import { getTechIcon, getTechCategory } from "@/utils/techStackIcons";
import { formatDate } from "@/utils/dateFormatter";
import {
  useParams,
  useNavigate,
  Link,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Share2,
  Bookmark,
  Calendar,
  MapPin,
  Briefcase,
} from "lucide-react";
import { DashboardLayout } from "./DashboardLayout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MatchScoreRing } from "./MatchScoreRing";
import { RoleBadge } from "./RoleBadge";
import { Badge } from "@/components/ui/badge";
import { TechStackConstellation } from "./TechStackConstellation";
import { useToast } from "@/components/ui/use-toast";
// import { mockProjects } from '@/data/mockProjects';
import axios from "axios";
import { Project } from "@/types/project";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectManagement } from "./ProjectManagement";
import { ProjectAnalytics } from "./ProjectAnalytics";
import { useAuth } from "@/contexts/AuthContext";

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, getCachedData, setCachedData } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  // Helper to safely extract string ID
  const safeId = (val: any): string => {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (typeof val === "object" && "_id" in val)
      return val._id?.toString() || "";
    if (typeof val === "object" && "id" in val) return val.id?.toString() || "";
    return String(val);
  };

  const mapProject = (p: any): Project => ({
    id: safeId(p._id),
    title: p.projectTitle,
    description: p.projectDescription,
    longDescription: p.projectDescription,
    matchScore: p.matchScore || 0,
    roles: p.rolesNeeded || [],
    techStack:
      p.techStack?.map((t: string) => ({
        name: t,
        icon: getTechIcon(t),
        category: getTechCategory(t),
      })) || [],
    timeline: p.projectDetails?.timeline || "flexible",
    experienceLevel: p.projectDetails?.experienceLevel || "intermediate",
    teamSize: p.projectDetails?.teamSize || 1,
    currentMembers: p.team?.length || 1,
    matchReasons: p.matchReasons || [],
    postedBy: {
      id: safeId(p.ownerId) || safeId(p.owner),
      name: p.owner?.fullName || "Project Owner",
      avatar: p.owner?.avatar || "",
      role: "Project Owner",
    },
    status: p.projectStatus,
    lifecycleStage: p.lifecycleStage || "team-search",
    team: p.team || [],
    createdAt: p.createdAt,
    applicants: p.applicants?.length || 0,
    isInterested: p.hasApplied || false,
    permissions: p.permissions || { isOwner: false, isMember: false },
    applicantStatus: p.applicantStatus,
  });

  // PRIMARY ACCESS CONTROL: Fully managed by backend
  const isOwner = !!project?.permissions?.isOwner;

  // Membership check: Backend Authority with Frontend Fallback for robustness
  const isMember =
    !!project?.permissions?.isMember || project?.applicantStatus === "accepted"; // Fallback only

  const canManage = isOwner || isMember;
  /* 
     Relaxed Visibility: If they are a Manager (Owner/Member), they should see the tabs 
     regardless of lifecycle stage (except maybe 'initiation' if strictly hidden, 
     but 'team-search' should allow setup). 
  */
  const showManagementTabs =
    canManage &&
    project?.lifecycleStage &&
    project.lifecycleStage !== "initiation";

  const fetchTasks = async () => {
    if (!canManage || !projectId) return;
    try {
      const cacheKey = `tasks_${projectId}`;
      const cachedTasks = getCachedData(cacheKey);
      if (cachedTasks) {
        setTasks(cachedTasks);
      }

      const res = await axios.get(`${API_BASE}/api/tasks/project/${projectId}`);
      if (res.data.success) {
        setTasks(res.data.tasks);
        setCachedData(cacheKey, res.data.tasks);
      }
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    }
  };

  useEffect(() => {
    if (activeTab === "management" || activeTab === "analytics") {
      fetchTasks();
    }
  }, [activeTab, projectId]);
  // Sync activeTab with URL
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && tabFromUrl !== activeTab) {
      // Check permissions before switching to management/analytics
      if (
        (tabFromUrl === "management" || tabFromUrl === "analytics") &&
        !canManage
      ) {
        // Redirect back to overview if trying to access restricted tabs
        navigate(`?tab=overview`, { replace: true });
        return;
      }
      setActiveTab(tabFromUrl);
    } else if (!tabFromUrl) {
      // Ensure URL always reflects active tab
      navigate(`?tab=${activeTab}`, { replace: true });
    }
  }, [searchParams, activeTab, canManage, navigate]);

  const API_BASE =
    import.meta.env.VITE_API_URL || "https://build-gether-backend.onrender.com";

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const cacheKey = `project_${projectId}`;
        const cachedProject = getCachedData(cacheKey);

        if (cachedProject && cachedProject.permissions) {
          setProject(cachedProject);
          setIsLoading(false);
        } else {
          setIsLoading(true);
        }

        const res = await axios.get(
          `${API_BASE}/api/project/details/${projectId}`,
        );
        if (res.data.success) {
          const p = res.data.project;
          // Map backend to Project interface
          const mappedProject = mapProject(p);
          setProject(mappedProject);
          setCachedData(cacheKey, mappedProject);
        }
      } catch (error) {
        console.error("Failed to fetch project", error);
        // toast({ title: "Error", description: "Failed to load project", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    if (projectId) fetchProject();
  }, [projectId, API_BASE]);

  const handleApply = async () => {
    if (!applicationMessage.trim()) {
      toast({
        title: "Message Required",
        description: "Please write a message to the project owner.",
        variant: "destructive",
      });
      return;
    }

    setIsApplying(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/project/projects/${projectId}/apply`,
        {
          roleAppliedFor: project?.roles[0] || "collaborator",
          message: applicationMessage,
        },
      );

      if (res.data.success) {
        setShowApplyDialog(false);
        setProject((prev) => (prev ? { ...prev, isInterested: true } : null));
        toast({
          title: "Application Submitted! ✨",
          description:
            "The project owner will review your application and get back to you soon.",
          duration: 5000,
        });
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Failed to submit application";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 font-sans">
              Loading project details...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-display font-bold text-white mb-2">
              Project Not Found
            </h2>
            <p className="text-gray-400 font-sans mb-6">
              The project you're looking for doesn't exist or has been removed.
            </p>
            <Button
              onClick={() => navigate("/dashboard/discover")}
              className="bg-gradient-to-r from-cyan-500 to-purple-500"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Discover
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Back Button */}
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 font-sans"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to projects
      </button>

      {/* Sync Team Button (Owner Only) - Kept for utility */}
      {isOwner && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            size="sm"
            variant="default"
            className="bg-black/80 border border-white/20 text-white hover:bg-black/90 shadow-xl backdrop-blur-sm"
            onClick={async () => {
              try {
                const res = await axios.patch(
                  `${API_BASE}/api/project/${projectId}/complete-selection`,
                );
                if (res.data.success) {
                  toast({
                    title: "Team Synced",
                    description: "Permissions refreshed.",
                  });
                  const updatedProject = mapProject(res.data.project);
                  setProject(updatedProject);
                  setCachedData(`project_${projectId}`, updatedProject);
                }
              } catch (e) {
                toast({ title: "Sync Failed", variant: "destructive" });
              }
            }}
          >
            🔄 Sync Permissions
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <TabsList className="bg-white/5 border-b border-white/10 w-full justify-start rounded-none h-12 p-0">
              <TabsTrigger
                value="overview"
                onClick={() => navigate(`?tab=overview`, { replace: true })}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-cyan-500 data-[state=active]:bg-transparent px-8 h-full"
              >
                Overview
              </TabsTrigger>
              {showManagementTabs && (
                <>
                  <TabsTrigger
                    value="management"
                    onClick={() =>
                      navigate(`?tab=management`, { replace: true })
                    }
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-cyan-500 data-[state=active]:bg-transparent px-8 h-full"
                  >
                    Management
                  </TabsTrigger>
                  <TabsTrigger
                    value="analytics"
                    onClick={() =>
                      navigate(`?tab=analytics`, { replace: true })
                    }
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-cyan-500 data-[state=active]:bg-transparent px-8 h-full"
                  >
                    Analytics
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            {isOwner && project.lifecycleStage === "team-search" && (
              <Button
                disabled={isActionLoading}
                onClick={async () => {
                  try {
                    setIsActionLoading(true);
                    const res = await axios.patch(
                      `${API_BASE}/api/project/${projectId}/complete-selection`,
                    );
                    if (res.data.success) {
                      toast({
                        title: "Team Selection Completed! 🎯",
                        description: "Your project is now ongoing.",
                      });
                      const updatedProject = mapProject(res.data.project);

                      // Robustness Fix: Refresh project fully

                      setProject(updatedProject);
                      setCachedData(`project_${projectId}`, updatedProject);
                      // Also update my_projects cache
                      setCachedData("my_projects", null);
                      setActiveTab("management");
                    }
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to complete selection",
                      variant: "destructive",
                    });
                  } finally {
                    setIsActionLoading(false);
                  }
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-white font-sans font-semibold animate-pulse"
              >
                {isActionLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                Complete Team Selection
              </Button>
            )}

            {isOwner && project.lifecycleStage === "ongoing" && (
              <Button
                disabled={isActionLoading}
                onClick={() => setShowCompleteDialog(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-white font-sans font-semibold"
              >
                {isActionLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                Complete Project
              </Button>
            )}

            {isMember && !isOwner && project.lifecycleStage === "ongoing" && (
              <Button
                variant="destructive"
                disabled={isActionLoading}
                onClick={() => setShowLeaveDialog(true)}
                className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
              >
                <ExternalLink className="w-4 h-4 mr-2 rotate-180" />
                Leave Project
              </Button>
            )}
          </div>

          <TabsContent value="overview" className="mt-0 outline-none">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Header Card */}
                <div className="glass-panel rounded-xl p-8 gradient-border">
                  <div className="flex items-start gap-6">
                    <MatchScoreRing score={project.matchScore} size={100} />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-display font-bold text-white">
                              {project.title}
                            </h1>
                            <Badge
                              variant="outline"
                              className={`border-cyan-500/30 text-cyan-400 bg-cyan-500/5 capitalize`}
                            >
                              {project.lifecycleStage?.replace("-", " ")}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {project.roles.map((role) => (
                              <RoleBadge key={role} role={role} />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsBookmarked(!isBookmarked)}
                            className={
                              isBookmarked
                                ? "text-amber-400"
                                : "text-gray-400 hover:text-white"
                            }
                          >
                            <Bookmark
                              className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-white"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                window.location.href,
                              );
                              toast({
                                title: "Link Copied",
                                description:
                                  "Project link copied to clipboard.",
                              });
                            }}
                          >
                            <Share2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-gray-300 font-sans leading-relaxed mb-6">
                        {project.description}
                      </p>

                      {/* Meta Info */}
                      <div className="flex items-center gap-6 text-sm text-gray-400 font-mono">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{project.timeline}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>
                            {project.team?.length || 0}/{project.teamSize}{" "}
                            members joined
                          </span>
                        </div>
                        <div className="px-2 py-1 rounded bg-white/5 border border-white/10">
                          {project.experienceLevel}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="glass-panel rounded-xl p-6">
                  <h2 className="text-xl font-display font-bold text-white mb-4">
                    Tech Stack
                  </h2>
                  <TechStackConstellation techStack={project.techStack} />
                </div>

                {/* Match Reasoning */}
                <div className="glass-panel rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-xl font-display font-bold text-white">
                      Why You're a Match
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {project.matchReasons.map((reason, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-lg bg-white/5"
                        style={{
                          animation: `scale-in 0.3s ease-out ${index * 0.1}s both`,
                        }}
                      >
                        {reason.type === "strength" ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        )}
                        <span
                          className={`font-sans ${reason.type === "strength" ? "text-gray-200" : "text-gray-400"}`}
                        >
                          {reason.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Requirements & Benefits */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="glass-panel rounded-xl p-6">
                    <h2 className="text-lg font-display font-bold text-white mb-4">
                      Requirements
                    </h2>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-gray-300 font-sans text-sm">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                        {project.experienceLevel} level experience required
                      </li>
                      <li className="flex items-start gap-2 text-gray-300 font-sans text-sm">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                        Available for {project.timeline} commitment
                      </li>
                      <li className="flex items-start gap-2 text-gray-300 font-sans text-sm">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                        Proficiency in listed tech stack
                      </li>
                    </ul>
                  </div>
                  <div className="glass-panel rounded-xl p-6">
                    <h2 className="text-lg font-display font-bold text-white mb-4">
                      What You'll Get
                    </h2>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-gray-300 font-sans text-sm">
                        <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                        Real-world project experience
                      </li>
                      <li className="flex items-start gap-2 text-gray-300 font-sans text-sm">
                        <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                        Portfolio-worthy work
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Apply Card */}
                {!canManage && (
                  <div className="glass-panel rounded-xl p-6 gradient-border sticky top-6">
                    {project.isInterested ? (
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-display font-bold text-white mb-2">
                          Application Sent!
                        </h3>
                        <p className="text-gray-400 font-sans text-sm mb-4">
                          Your application is being reviewed.
                        </p>
                        <Link to="/dashboard/messages">
                          <Button
                            variant="outline"
                            className="w-full border-white/20 text-white hover:bg-white/5"
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            View Messages
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-display font-bold text-white mb-2">
                          Interested in this project?
                        </h3>
                        <p className="text-gray-400 font-sans text-sm mb-4">
                          Express your interest and the project owner will
                          review your profile.
                        </p>
                        <Button
                          onClick={() => setShowApplyDialog(true)}
                          className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 font-sans font-semibold"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Express Interest
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {/* Team Members Breakdown */}
                <div className="glass-panel rounded-xl p-6">
                  <h3 className="text-lg font-display font-bold text-white mb-4">
                    Project Team
                  </h3>
                  <div className="space-y-4">
                    {/* Owner */}
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={project.postedBy.avatar} />
                        <AvatarFallback>
                          {project.postedBy.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {project.postedBy.name}
                        </p>
                        <p className="text-[10px] text-cyan-400 uppercase font-mono">
                          Owner
                        </p>
                      </div>
                    </div>
                    {/* Team members */}
                    {project.team?.map((member: any) => (
                      <div
                        key={member.user._id}
                        className="flex items-center gap-3"
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={member.user.avatar} />
                          <AvatarFallback>
                            {member.user.fullName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {member.user.fullName}
                          </p>
                          <p className="text-[10px] text-gray-400 uppercase font-mono">
                            {member.role}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Posted By Details */}
                <div className="glass-panel rounded-xl p-6">
                  <h3 className="text-lg font-display font-bold text-white mb-4">
                    About Owner
                  </h3>
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="w-14 h-14">
                      <AvatarImage
                        src={project.postedBy.avatar}
                        alt={project.postedBy.name}
                      />
                      <AvatarFallback>
                        {project.postedBy.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-display font-bold text-white">
                        {project.postedBy.name}
                      </p>
                      <p className="text-sm text-gray-400 font-sans">
                        {project.postedBy.role}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/5"
                    onClick={() => setShowMessageDialog(true)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {showManagementTabs && (
            <>
              <TabsContent value="management" className="mt-0 outline-none">
                <div className="glass-panel rounded-xl p-8">
                  <ProjectManagement
                    projectId={projectId!}
                    isOwner={isOwner}
                    team={project.team || []}
                    initialTasks={tasks}
                    onTasksUpdate={fetchTasks}
                    currentUserId={user?._id}
                  />
                </div>
              </TabsContent>
              <TabsContent value="analytics" className="mt-0 outline-none">
                <div className="glass-panel rounded-xl p-8">
                  <ProjectAnalytics tasks={tasks} />
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>

      {/* Apply Dialog */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent className="glass-panel border-white/10 sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold text-white">
              Express Interest
            </DialogTitle>
            <DialogDescription className="text-gray-400 font-sans">
              Send a message to the project owner explaining why you'd be a
              great fit.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Tell them about your relevant experience, what excites you about this project, and your availability..."
              value={applicationMessage}
              onChange={(e) => setApplicationMessage(e.target.value)}
              className="min-h-[150px] bg-white/5 border-white/10 text-white placeholder:text-gray-500 font-sans"
            />
            <p className="text-xs text-gray-500 mt-2 font-mono">
              Your profile and match score will be shared automatically.
            </p>
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
              {isApplying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Send Application
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="glass-panel border-white/10 sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold text-white">
              Send Message to {project?.postedBy.name}
            </DialogTitle>
            <DialogDescription className="text-gray-400 font-sans">
              Introduce yourself and ask any questions about the project.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Hi! I'm interested in your project. I have experience with..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              className="min-h-[150px] bg-white/5 border-white/10 text-white placeholder:text-gray-500 font-sans"
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowMessageDialog(false)}
              className="text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                try {
                  await axios.post(`${API_BASE}/api/messages/send`, {
                    recipientId: project?.postedBy.id,
                    projectId: project?.id,
                    text: messageContent,
                  });
                  toast({
                    title: "Message Sent! 📨",
                    description:
                      "Your message has been sent to the project owner.",
                  });
                  setShowMessageDialog(false);
                  setMessageContent("");
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to send message. Please try again.",
                    variant: "destructive",
                  });
                }
              }}
              disabled={!messageContent.trim()}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="glass-panel border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Complete Project?</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to mark this project as completed? This will
              archive the project and notify all team members.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowCompleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                try {
                  setIsActionLoading(true);
                  const res = await axios.patch(
                    `${API_BASE}/api/project/${projectId}/complete`,
                  );
                  if (res.data.success) {
                    toast({
                      title: "Project Completed! 🏆",
                      description: "Congratulations on finishing the project!",
                    });
                    const updatedProject = mapProject(res.data.project);

                    setShowCompleteDialog(false);
                    setProject(updatedProject);
                    setCachedData(`project_${projectId}`, updatedProject);
                    setCachedData("my_projects", null);
                  }
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to complete project",
                    variant: "destructive",
                  });
                } finally {
                  setIsActionLoading(false);
                }
              }}
              className="bg-emerald-500 hover:bg-emerald-400 text-white"
              disabled={isActionLoading}
            >
              {isActionLoading ? "Completing..." : "Yes, Complete Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave Project Confirmation Dialog */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent className="glass-panel border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Leave Project?</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to leave this project? You will lose access
              to the management dashboard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowLeaveDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                try {
                  setIsActionLoading(true);
                  const res = await axios.patch(
                    `${API_BASE}/api/project/${projectId}/leave`,
                  );
                  if (res.data.success) {
                    toast({
                      title: "Left Project",
                      description: "You have successfully left the project.",
                    });
                    navigate("/dashboard");
                  }
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to leave project",
                    variant: "destructive",
                  });
                } finally {
                  setIsActionLoading(false);
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={isActionLoading}
            >
              {isActionLoading ? "Leaving..." : "Yes, Leave Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
