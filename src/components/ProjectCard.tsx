import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Users,
  Clock,
} from "lucide-react";
import { Project } from "@/types/project";
import { MatchScoreRing } from "./MatchScoreRing";
import { RoleBadge } from "./RoleBadge";
import { TechStackConstellation } from "./TechStackConstellation";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

interface ProjectCardProps {
  project: Project;
  onExpressInterest: (projectId: string) => void;
  style?: React.CSSProperties;
}

export function ProjectCard({
  project,
  onExpressInterest,
  style,
}: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isInterested, setIsInterested] = useState(
    project.isInterested || false
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsInterested(project.isInterested || false);
  }, [project.isInterested]);

  const handleExpressInterest = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsInterested(true);
    setIsLoading(false);
    onExpressInterest(project.id);
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <Link to={`/dashboard/project/${project.id}`}>
      <div
        className={`
          glass-panel rounded-xl p-6 transition-all duration-300 cursor-pointer
          ${
            isHovered
              ? "translate-y-[-8px] shadow-2xl shadow-cyan-500/20"
              : "shadow-lg"
          }
          ${isInterested ? "ring-2 ring-emerald-500/50" : ""}
          gradient-border
        `}
        style={style}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex gap-6">
          {/* Match Score */}
          <div
            className={`flex-shrink-0 ${isHovered ? "animate-pulse-glow" : ""}`}
          >
            <MatchScoreRing score={project.matchScore} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <h3 className="text-xl font-display font-bold text-white mb-2 leading-tight">
                  {project.title}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {project.roles.map((role) => (
                    <RoleBadge key={role} role={role} />
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-sm leading-relaxed mb-4 font-sans">
              {project.description}
            </p>

            {/* Tech Stack */}
            <div className="mb-4">
              <TechStackConstellation techStack={project.techStack} />
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-xs text-gray-400 font-mono mb-4">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{project.timeline}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>
                  {project.currentMembers}/{project.teamSize} members
                </span>
              </div>
              <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                {project.experienceLevel}
              </div>
            </div>

            {/* Posted By */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={project.postedBy.avatar}
                  alt={project.postedBy.name}
                />
                <AvatarFallback>{project.postedBy.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-white font-sans">
                  {project.postedBy.name}
                </p>
                <p className="text-xs text-gray-400 font-sans">
                  {project.postedBy.role}
                </p>
              </div>
            </div>

            {/* Match Reasoning Toggle */}
            <button
              onClick={handleExpandClick}
              className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors mb-4 font-sans font-medium"
            >
              <span>Why this match?</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Expanded Match Reasons */}
            <div
              className={`
              overflow-hidden transition-all duration-300
              ${isExpanded ? "max-h-96 opacity-100 mb-4" : "max-h-0 opacity-0"}
            `}
            >
              <div className="space-y-2 pt-2">
                {project.matchReasons.map((reason, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-sm"
                    style={{
                      animation: isExpanded
                        ? `scale-in 0.2s ease-out ${index * 0.05}s both`
                        : "none",
                    }}
                  >
                    {reason.type === "strength" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    )}
                    <span
                      className={`font-sans ${
                        reason.type === "strength"
                          ? "text-gray-300"
                          : "text-gray-400"
                      }`}
                    >
                      {reason.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <Button
              onClick={handleExpressInterest}
              disabled={isInterested || isLoading}
              className={`
              w-full relative overflow-hidden
              ${
                isInterested
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                  : "bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400"
              }
              border transition-all duration-200
              ${!isInterested && "hover:scale-[1.02] active:scale-[0.98]"}
              font-sans font-semibold
            `}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : isInterested ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Interest Expressed
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Express Interest
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
