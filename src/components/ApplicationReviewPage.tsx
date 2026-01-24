import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MessageSquare,
  Clock,
  User,
  Briefcase,
  Github,
  Linkedin,
  Globe,
  Star,
} from "lucide-react";
import { DashboardLayout } from "./DashboardLayout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MatchScoreRing } from "./MatchScoreRing";
import { RoleBadge } from "./RoleBadge";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
// import { mockApplications } from '@/data/mockApplications';
import axios from "axios";
import { useEffect } from "react";
import { Application } from "@/types/project";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ApplicationReviewPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setCachedData } = useAuth();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const API_BASE =
    import.meta.env.VITE_API_URL || "https://build-gether-backend.onrender.com";

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${API_BASE}/api/project/application/${applicationId}`,
        );
        if (res.data.success) {
          const appData = res.data.applicant;
          // Map to Application interface from types/project
          const mappedApp: Application = {
            id: appData.id,
            projectId: appData.projectId,
            projectTitle: appData.project,
            applicantId: appData.id, // Using sameID for now
            applicantName: appData.name,
            applicantAvatar: appData.avatar,
            message: appData.message || "No message provided.",
            appliedAt: appData.appliedAt,
            matchReasons: appData.matchReasons || [],
            bio: appData.bio,
            skills: appData.skills,
            experience: appData.experience,
          };
          setApplication(mappedApp);
        }
      } catch (error) {
        console.error("Failed to fetch application", error);
        toast({
          title: "Error",
          description: "Could not load application",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    if (applicationId) fetchApplication();
  }, [applicationId, API_BASE, toast]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAccept = async () => {
    if (!application) return;
    setIsProcessing(true);
    try {
      const res = await axios.patch(
        `${API_BASE}/api/applicant/projects/${application.projectId}/applicants/${application.id}/accept`,
      );
      if (res.data) {
        setApplication((prev) =>
          prev
            ? {
                ...prev,
                status: "accepted",
                reviewedAt: new Date().toISOString(),
              }
            : null,
        );
        toast({
          title: "Application Accepted! 🎉",
          description:
            "The applicant has been notified and added to your project team.",
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error("Failed to accept application", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to accept application",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!application) return;
    setIsProcessing(true);
    try {
      // Route is PUT /reject-applicants/:applicantId based on previous file view
      const res = await axios.put(
        `${API_BASE}/api/applicant/reject-applicants/${application.id}`,
      );
      if (res.data) {
        setApplication((prev) =>
          prev
            ? {
                ...prev,
                status: "rejected",
                reviewedAt: new Date().toISOString(),
              }
            : null,
        );
        setShowRejectDialog(false);
        toast({
          title: "Application Declined",
          description: "The applicant has been notified of your decision.",
          duration: 5000,
        });
        // Invalidate caches
        setCachedData(`project_${application.projectId}`, null);
        setCachedData("my_projects", null);
      }
    } catch (error: any) {
      console.error("Failed to reject application", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to reject application",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-400">Loading application...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!application) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-display font-bold text-white mb-2">
              Application Not Found
            </h2>
            <p className="text-gray-400 font-sans mb-6">
              This application doesn't exist or has been removed.
            </p>
            <Button
              onClick={() => navigate("/dashboard/applicants")}
              className="bg-gradient-to-r from-cyan-500 to-purple-500"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Applicants
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-sm font-mono">
            Pending Review
          </span>
        );
      case "accepted":
        return (
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-sm font-mono">
            Accepted
          </span>
        );
      case "rejected":
        return (
          <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-sm font-mono">
            Declined
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 font-sans"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to applicants
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="glass-panel rounded-xl p-8 gradient-border">
            <div className="flex items-start gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage
                  src={application.applicantAvatar}
                  alt={application.applicantName}
                />
                <AvatarFallback className="text-2xl">
                  {application.applicantName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h1 className="text-3xl font-display font-bold text-white mb-2">
                      {application.applicantName}
                    </h1>
                    <div className="flex items-center gap-3">
                      <RoleBadge role={application.applicantRole} />
                      {getStatusBadge(application.status)}
                    </div>
                  </div>
                  <MatchScoreRing score={application.matchScore} size={80} />
                </div>

                <div className="flex items-center gap-4 mt-4 text-sm text-gray-400 font-mono">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Applied {formatDate(application.appliedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    <span>For: {application.projectTitle}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Application Message */}
          <div className="glass-panel rounded-xl p-6">
            <h2 className="text-xl font-display font-bold text-white mb-4">
              Application Message
            </h2>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-gray-300 font-sans leading-relaxed whitespace-pre-wrap">
                {application.message || "No message provided."}
              </p>
            </div>
          </div>

          {/* Match Reasoning */}
          {application.matchReasons && (
            <div className="glass-panel rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl font-display font-bold text-white">
                  AI Match Analysis
                </h2>
              </div>
              <div className="space-y-3">
                {application.matchReasons.map((reason, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-white/5"
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
          )}

          {/* Applicant Profile */}
          <div className="glass-panel rounded-xl p-6">
            <h2 className="text-xl font-display font-bold text-white mb-4">
              Profile Overview
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm text-gray-400 font-sans mb-2">
                  Experience
                </h3>
                <p className="text-white font-sans">
                  {(application as any).experience || "Not specified"}
                </p>
              </div>
              <div>
                <h3 className="text-sm text-gray-400 font-sans mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {(application as any).skills?.map((skill: string) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-xs border border-cyan-500/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-sm text-gray-400 font-sans mb-2">Bio</h3>
                <p className="text-white font-sans">
                  {(application as any).bio || "No bio provided"}
                </p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/10">
              <h3 className="text-sm text-gray-400 font-sans mb-3">Links</h3>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/5"
                >
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/5"
                >
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/5"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Portfolio
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Action Card */}
          <div className="glass-panel rounded-xl p-6 gradient-border sticky top-6">
            {application.status === "pending" ? (
              <>
                <h3 className="text-lg font-display font-bold text-white mb-4">
                  Review Application
                </h3>
                <div className="space-y-3">
                  <Button
                    onClick={handleAccept}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 font-sans font-semibold"
                  >
                    {isProcessing ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    Accept Application
                  </Button>
                  <Button
                    onClick={() => setShowRejectDialog(true)}
                    disabled={isProcessing}
                    variant="outline"
                    className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Decline Application
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/5"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div
                  className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                    application.status === "accepted"
                      ? "bg-emerald-500/20"
                      : "bg-red-500/20"
                  }`}
                >
                  {application.status === "accepted" ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-400" />
                  )}
                </div>
                <h3 className="text-lg font-display font-bold text-white mb-2">
                  Application{" "}
                  {application.status === "accepted" ? "Accepted" : "Declined"}
                </h3>
                <p className="text-gray-400 font-sans text-sm mb-4">
                  {application.status === "accepted"
                    ? "This applicant has been added to your project team."
                    : "This applicant has been notified of your decision."}
                </p>
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/5"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            )}
          </div>

          {/* Other Applicants */}
          {/* Other Applicants - Hidden or API call needed */}
          {/* <div className="glass-panel rounded-xl p-6">
            <h3 className="text-lg font-display font-bold text-white mb-4">Other Applicants</h3>
             ...
          </div> */}
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="glass-panel border-white/10 sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold text-white">
              Decline Application
            </DialogTitle>
            <DialogDescription className="text-gray-400 font-sans">
              Optionally provide feedback to help the applicant improve.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Share constructive feedback (optional)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-gray-500 font-sans"
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowRejectDialog(false)}
              className="text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={isProcessing}
              className="bg-red-500 hover:bg-red-600"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Decline Application
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
