import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ExperienceLevel, Timeline } from "@/types/project";
import { ArrowLeft, Plus, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "./DashboardLayout";
import axios from "axios";

type Role =
  | "frontend"
  | "backend"
  | "fullstack"
  | "designer"
  | "mobile"
  | "product"
  | string;

const experienceOptions: { value: ExperienceLevel; label: string }[] = [
  { value: "beginner", label: "Beginner (0-1 years)" },
  { value: "intermediate", label: "Intermediate (1-3 years)" },
  { value: "advanced", label: "Advanced (3-5 years)" },
  { value: "expert", label: "Expert (5+ years)" },
];

const timelineOptions: { value: Timeline; label: string }[] = [
  { value: "1-3 months", label: "1-3 months" },
  { value: "3-6 months", label: "3-6 months" },
  { value: "6+ months", label: "6+ months" },
  { value: "ongoing", label: "Ongoing" },
];

const techSuggestions = [
  "React",
  "TypeScript",
  "Node.js",
  "Python",
  "PostgreSQL",
  "MongoDB",
  "AWS",
  "Docker",
  "GraphQL",
  "Next.js",
  "Tailwind CSS",
  "Firebase",
];

export function EditProjectPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { toast } = useToast();
  const API_BASE =
    import.meta.env.VITE_API_URL || "https://build-gether-backend.onrender.com";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [experienceLevel, setExperienceLevel] =
    useState<ExperienceLevel>("intermediate");
  const [timeline, setTimeline] = useState<Timeline>("3-6 months");
  const [teamSize, setTeamSize] = useState(3);
  const [techStack, setTechStack] = useState<string[]>([]);
  const [techInput, setTechInput] = useState("");
  const [roleInput, setRoleInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [roleOptions, setRoleOptions] = useState<
    { value: Role; label: string }[]
  >([
    { value: "frontend", label: "Frontend Developer" },
    { value: "backend", label: "Backend Developer" },
    { value: "fullstack", label: "Fullstack Developer" },
    { value: "designer", label: "UI/UX Designer" },
    { value: "mobile", label: "Mobile Developer" },
    { value: "product", label: "Product Manager" },
  ]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/project/details/${projectId}`,
        );
        if (res.data.success) {
          const p = res.data.project;
          setTitle(p.projectTitle);
          setDescription(p.projectDescription);
          setSelectedRoles(p.rolesNeeded || []);
          setTechStack(p.techStack || []);
          if (p.projectDetails) {
            setExperienceLevel(
              p.projectDetails.experienceLevel || "intermediate",
            );
            setTimeline(p.projectDetails.timeline || "3-6 months");
            setTeamSize(p.projectDetails.teamSize || 3);
          }
        }
      } catch (error) {
        console.error("Failed to fetch project", error);
        toast({
          title: "Error",
          description: "Failed to load project details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    if (projectId) fetchProject();
  }, [projectId, API_BASE, toast]);

  const toggleRole = (role: Role) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const addTech = (tech: string) => {
    if (tech && !techStack.includes(tech)) {
      setTechStack((prev) => [...prev, tech]);
      setTechInput("");
    }
  };

  const removeTech = (tech: string) => {
    setTechStack((prev) => prev.filter((t) => t !== tech));
  };

  const normalizeRole = (role: string) => role.trim().toLowerCase();
  const formatLabel = (role: string) =>
    role
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const addRole = (role: string) => {
    const normalized = normalizeRole(role);
    if (!normalized) return;
    if (roleOptions.some((r) => r.value === normalized)) return;
    const newRole = { value: normalized, label: formatLabel(normalized) };
    setRoleOptions((prev) => [...prev, newRole]);
    setSelectedRoles((prev) => [...prev, normalized]);
    setRoleInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || selectedRoles.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const request = await axios.put(`${API_BASE}/api/project/${projectId}`, {
        projectTitle: title,
        projectDescription: description,
        rolesNeeded: selectedRoles,
        techStack,
        projectDetails: {
          experienceLevel,
          timeline,
          teamSize,
        },
      });

      if (request.status === 200) {
        toast({
          title: "Project Updated! ✨",
          description: "Your changes have been saved successfully.",
        });
        navigate("/dashboard/projects");
      }
    } catch (err: any) {
      console.error("Update failed:", err);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err.response?.data?.message || "Failed to update project",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <DashboardLayout>
        <div className="text-center text-white p-10">Loading...</div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-sans mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            Edit Project
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="glass-panel rounded-xl p-6 gradient-border">
            <h2 className="text-lg font-display font-bold text-white mb-6">
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-gray-300 font-sans">
                  Project Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1.5 bg-white/5 border-white/10 text-white font-sans"
                />
              </div>
              <div>
                <Label
                  htmlFor="description"
                  className="text-gray-300 font-sans"
                >
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="mt-1.5 bg-white/5 border-white/10 text-white font-sans resize-none"
                />
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-6 gradient-border">
            <h2 className="text-lg font-display font-bold text-white mb-6">
              Roles Needed
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {roleOptions.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => toggleRole(role.value)}
                  className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                    selectedRoles.includes(role.value)
                      ? "border-cyan-500 bg-cyan-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <span
                    className={`text-sm font-sans font-medium ${
                      selectedRoles.includes(role.value)
                        ? "text-cyan-400"
                        : "text-gray-300"
                    }`}
                  >
                    {role.label || role.value}
                  </span>
                </button>
              ))}
              <div className="flex gap-2 mb-4">
                <Input
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addRole(roleInput);
                    }
                  }}
                  placeholder="Add a roles..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 font-sans"
                />
                <Button
                  type="button"
                  onClick={() => addRole(roleInput)}
                  className="bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-6 gradient-border">
            <h2 className="text-lg font-display font-bold text-white mb-6">
              Tech Stack
            </h2>
            <div className="flex gap-2 mb-4">
              <Input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTech(techInput);
                  }
                }}
                placeholder="Add technology..."
                className="bg-white/5 border-white/10 text-white font-sans"
              />
              <Button
                type="button"
                onClick={() => addTech(techInput)}
                className="bg-cyan-500/20 border border-cyan-500/30 text-cyan-400"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {techStack.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {techStack.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-sm text-cyan-400 font-mono"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTech(tech)}
                      className="hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500 font-sans mb-2">
                Suggestions:
              </p>
              <div className="flex flex-wrap gap-2">
                {techSuggestions
                  .filter((t) => !techStack.includes(t))
                  .slice(0, 8)
                  .map((tech) => (
                    <button
                      key={tech}
                      type="button"
                      onClick={() => addTech(tech)}
                      className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 font-mono hover:text-white"
                    >
                      + {tech}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-6 gradient-border">
            <h2 className="text-lg font-display font-bold text-white mb-6">
              Project Details
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <Label className="text-gray-300 font-sans mb-3 block">
                  Experience Level
                </Label>
                <div className="space-y-2">
                  {experienceOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        checked={experienceLevel === option.value}
                        onChange={() => setExperienceLevel(option.value)}
                        className="w-4 h-4 text-cyan-500 bg-white/5 border-white/20"
                      />
                      <span className="text-sm text-gray-300 font-sans">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-gray-300 font-sans mb-3 block">
                  Timeline
                </Label>
                <div className="space-y-2">
                  {timelineOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        checked={timeline === option.value}
                        onChange={() => setTimeline(option.value)}
                        className="w-4 h-4 text-cyan-500 bg-white/5 border-white/20"
                      />
                      <span className="text-sm text-gray-300 font-sans">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label
                  htmlFor="teamSize"
                  className="text-gray-300 font-sans mb-3 block"
                >
                  Team Size
                </Label>
                <Input
                  id="teamSize"
                  type="number"
                  min={2}
                  max={20}
                  value={teamSize}
                  onChange={(e) => setTeamSize(parseInt(e.target.value) || 2)}
                  className="bg-white/5 border-white/10 text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 font-semibold px-8"
            >
              {isSubmitting ? (
                "Saving..."
              ) : (
                <span className="flex gap-2">
                  <Save className="w-4 h-4" /> Save Changes
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
