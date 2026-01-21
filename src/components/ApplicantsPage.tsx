import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from "axios";
import { format } from 'date-fns';
import { Check, X, MessageSquare, ExternalLink, Github, Linkedin } from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MatchScoreRing } from './MatchScoreRing';
import { RoleBadge } from './RoleBadge';
import { useToast } from '@/components/ui/use-toast';
import { Role } from '@/types/project';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface Applicant {
  id: string;
  name: string;
  avatar: string;
  email: string;
  role: Role;
  matchScore: number;
  bio: string;
  skills: string[];
  experience: string;
  project: string;
  projectId: string;
  appliedAt: string;
  status: 'pending' | 'accepted' | 'rejected';
  github?: string;
  linkedin?: string;
  portfolio?: string;
}



export function ApplicantsPage() {
  const { projectId } = useParams();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL || 'https://teammate-n05o.onrender.com';
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const { toast } = useToast();
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messageContent, setMessageContent] = useState('');

  useEffect(() => {
    const fetchApplicants = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/api/project/applicants`);
            if (res.data.success) {
                setApplicants(res.data.applicants);
            }
        } catch (error) {
            console.error("Failed to fetch applicants", error);
            toast({
                title: "Error",
                description: "Failed to load applicants",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };
    fetchApplicants();
  }, [API_BASE, toast]);

  const filteredApplicants = applicants.filter(a => {
    const matchesStatus = filter === 'all' ? true : a.status === filter;
    const matchesProject = projectId ? a.projectId === projectId : true;
    return matchesStatus && matchesProject;
  });

  const statusCounts = {
    all: applicants.length,
    pending: applicants.filter(a => a.status === 'pending').length,
    accepted: applicants.filter(a => a.status === 'accepted').length,
    rejected: applicants.filter(a => a.status === 'rejected').length,
  };

  const handleAccept = async (applicantId: string, projectId: string) => {
    try {
      await axios.patch(`${API_BASE}/api/applicant/projects/${projectId}/applicants/${applicantId}/accept`);
      setApplicants(prev => prev.map(a => 
        a.id === applicantId ? { ...a, status: 'accepted' as const } : a
      ));
      toast({
        title: 'Applicant Accepted! 🎉',
        description: 'They will be notified and added to your project team.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to accept applicant. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleReject = async (applicantId: string, projectId: string) => {
    try {
      await axios.put(`${API_BASE}/api/applicant/reject-applicants/${applicantId}`);
      setApplicants(prev => prev.map(a => 
        a.id === applicantId ? { ...a, status: 'rejected' as const } : a
      ));
      toast({
        title: 'Applicant Declined',
        description: 'They will be notified of your decision.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject applicant. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex gap-6">
        {/* Main List */}
        <div className="flex-1">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-white mb-2">
              Applicants
            </h1>
            <p className="text-gray-400 font-sans">
              Review and manage applications for your projects
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

          {/* Applicants List */}
          <div className="space-y-4">
            {filteredApplicants.length > 0 ? (
              filteredApplicants.map((applicant) => (
                <div 
                  key={applicant.id}
                  onClick={() => setSelectedApplicant(applicant)}
                  className={`glass-panel rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                    selectedApplicant?.id === applicant.id 
                      ? 'border-cyan-500/50 ring-1 ring-cyan-500/20' 
                      : 'hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={applicant.avatar} alt={applicant.name} />
                      <AvatarFallback>{applicant.name[0]}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-sans font-medium text-white">{applicant.name}</h3>
                        <RoleBadge role={applicant.role} />
                      </div>
                      <p className="text-sm text-gray-400 font-sans truncate">{applicant.project}</p>
                      <p className="text-xs text-gray-500 font-sans">
                        {format(new Date(applicant.appliedAt), "dd MMM yyyy HH:mm")}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className={`text-2xl font-mono font-bold ${
                          applicant.matchScore >= 85 ? 'text-emerald-400' :
                          applicant.matchScore >= 70 ? 'text-cyan-400' : 'text-amber-400'
                        }`}>
                          {applicant.matchScore}%
                        </span>
                        <p className="text-xs text-gray-500 font-mono">match</p>
                      </div>

                      {applicant.status === 'pending' ? (
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); handleAccept(applicant.id, applicant.projectId); }}
                            className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); handleReject(applicant.id, applicant.projectId); }}
                            className="bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-mono ${
                          applicant.status === 'accepted'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {applicant.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-panel rounded-xl p-12 text-center">
                <p className="text-gray-400 font-sans text-lg mb-2">
                  No {filter !== 'all' ? filter : ''} applicants
                </p>
                <p className="text-gray-500 font-sans text-sm">
                  Applicants will appear here when they express interest in your projects
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        {selectedApplicant && (
          <div className="w-96 glass-panel rounded-xl p-6 h-fit sticky top-6">
            <div className="text-center mb-6">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarImage src={selectedApplicant.avatar} alt={selectedApplicant.name} />
                <AvatarFallback>{selectedApplicant.name[0]}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-display font-bold text-white mb-1">
                {selectedApplicant.name}
              </h2>
              <RoleBadge role={selectedApplicant.role} />
            </div>

            <div className="flex justify-center mb-6">
              <MatchScoreRing score={selectedApplicant.matchScore} size={100} />
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <h3 className="text-xs text-gray-500 font-sans uppercase mb-2">About</h3>
                <p className="text-sm text-gray-300 font-sans">{selectedApplicant.bio}</p>
              </div>

              <div>
                <h3 className="text-xs text-gray-500 font-sans uppercase mb-2">Experience</h3>
                <p className="text-sm text-gray-300 font-sans">{selectedApplicant.experience}</p>
              </div>

              <div>
                <h3 className="text-xs text-gray-500 font-sans uppercase mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedApplicant.skills.map((skill) => (
                    <span 
                      key={skill}
                      className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs text-gray-300 font-mono"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs text-gray-500 font-sans uppercase mb-2">Links</h3>
                <div className="flex gap-2">
                  {selectedApplicant.github && (
                    <a 
                      href={`https://github.com/${selectedApplicant.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {selectedApplicant.linkedin && (
                    <a 
                      href={`https://linkedin.com/in/${selectedApplicant.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {selectedApplicant.portfolio && (
                    <a 
                      href={selectedApplicant.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Button 
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 font-sans font-semibold"
                onClick={() => setShowMessageDialog(true)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Message
              </Button>
              {selectedApplicant.status === 'pending' && (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => handleAccept(selectedApplicant.id, selectedApplicant.projectId)}
                    className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 font-sans"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Accept
                  </Button>
                  <Button
                    onClick={() => handleReject(selectedApplicant.id, selectedApplicant.projectId)}
                    className="bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 font-sans"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Decline
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Send Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="glass-panel border-white/10 sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold text-white">
              Send Message to {selectedApplicant?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-400 font-sans">
              Send a message to discuss the project or ask questions.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Hi! I'd like to discuss your application..."
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
                    recipientId: selectedApplicant?.id,
                    projectId: selectedApplicant?.projectId,
                    text: messageContent
                  });
                  toast({
                    title: "Message Sent! 📨",
                    description: "Your message has been sent successfully.",
                  });
                  setShowMessageDialog(false);
                  setMessageContent('');
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to send message.",
                    variant: "destructive"
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
    </DashboardLayout>
  );
}
