import { useState, useEffect } from "react";
import axios from "axios";
import { Camera, Save, Github, Linkedin, Globe, X, Plus } from "lucide-react";
import { DashboardLayout } from "./DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Collaborator, ProjectOwner } from "@/types/user";
import { RoleBadge } from "./RoleBadge";
import { Role, TechStack } from "@/types/project";

const roleOptions: Role[] = [
  "frontend",
  "backend",
  "fullstack",
  "designer",
  "mobile",
  "product",
  "other",
];

const POPULAR_STACKS: TechStack[] = [
  { name: "React", icon: "⚛️", category: "frontend" },
  { name: "Next.js", icon: "▲", category: "frontend" },
  { name: "Vue", icon: "💚", category: "frontend" },
  { name: "Angular", icon: "🅰️", category: "frontend" },
  { name: "TypeScript", icon: "📘", category: "frontend" },
  { name: "Tailwind CSS", icon: "🎨", category: "frontend" },
  { name: "Node.js", icon: "🟢", category: "backend" },
  { name: "Express", icon: "🚂", category: "backend" },
  { name: "Python", icon: "🐍", category: "backend" },
  { name: "Django", icon: "🎸", category: "backend" },
  { name: "Go", icon: "🐹", category: "backend" },
  { name: "Rust", icon: "🦀", category: "backend" },
  { name: "PostgreSQL", icon: "🐘", category: "database" },
  { name: "MongoDB", icon: "🍃", category: "database" },
  { name: "Redis", icon: "🔴", category: "database" },
  { name: "AWS", icon: "☁️", category: "devops" },
  { name: "Docker", icon: "🐳", category: "devops" },
  { name: "Kubernetes", icon: "☸️", category: "devops" },
  { name: "Terraform", icon: "🏗️", category: "devops" },
  { name: "Figma", icon: "🎨", category: "design" },
  { name: "Adobe XD", icon: "💎", category: "design" },
];

export function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const API_BASE = import.meta.env.VITE_API_URL;

  // New state for avatar
  const [avatar, setAvatar] = useState(user?.avatar || "");

  const [name, setName] = useState(user?.fullName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [location, setLocation] = useState(user?.location || "");
  const [github, setGithub] = useState(user?.github || "");
  const [linkedin, setLinkedin] = useState(user?.linkedin || "");
  const [portfolio, setPortfolio] = useState(user?.portfolio || "");

  // Collaborator-specific
  const collaborator =
    user?.userType === "collaborator" ? (user as Collaborator) : null;
  const [selectedRoles, setSelectedRoles] = useState<Role[]>(
    collaborator?.roles || []
  );
  const [availability, setAvailability] = useState(
    collaborator?.availability || "flexible"
  );
  
  const [selectedSkills, setSelectedSkills] = useState<TechStack[]>(
    collaborator?.skills || []
  );
  const [customSkill, setCustomSkill] = useState("");

  // Project Owner-specific
  const projectOwner =
    user?.userType === "project_owner" ? (user as ProjectOwner) : null;
  const [company, setCompany] = useState(projectOwner?.company || "");

  // Sync state when user changes
  useEffect(() => {
    if (user) {
      setName(user.fullName || "");
      setBio(user.bio || "");
      setLocation(user.location || "");
      setAvatar(user.avatar || "");
      
      // Use any for keys that might be mapped differently or missing
      const u = user as any;
      setGithub(u.github || u.githubUrl || "");
      setLinkedin(u.linkedin || u.linkedinUrl || "");
      setPortfolio(u.portfolio || u.portfolioUrl || u.websiteUrl || "");
      
      if (user.userType === "collaborator") {
        const collab = user as Collaborator;
        // Normalize roles if they come as objects from legacy data
        const normalizedRoles = (collab.roles || []).map((r: any) => 
          typeof r === 'object' && r !== null && r.type ? r.type : r
        );
        setSelectedRoles(normalizedRoles);
        setAvailability(collab.availability || "flexible");
        setSelectedSkills(collab.skills || []);
      } else if (user.userType === "project_owner") {
        const owner = user as ProjectOwner;
        setCompany(owner.company || "");
      }
    }
  }, [user]);

  const toggleRole = (role: Role) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const toggleSkill = (skill: TechStack) => {
    setSelectedSkills((prev) => {
      const exists = prev.find((s) => s.name.toLowerCase() === skill.name.toLowerCase());
      if (exists) {
        return prev.filter((s) => s.name.toLowerCase() !== skill.name.toLowerCase());
      }
      return [...prev, skill];
    });
  };

  const addCustomSkill = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (customSkill.trim()) {
      const newSkill: TechStack = {
        name: customSkill.trim(),
        icon: "🛠️",
        category: "backend",
      };
      toggleSkill(newSkill);
      setCustomSkill("");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("image", file);

      setIsUploading(true);
      try {
        // Optimistic update for preview (using FileReader if we wanted instant, but let's wait for server)
        const res = await axios.post(`${API_BASE}/api/upload`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        
        if (res.status === 200) {
            setAvatar(res.data.imageUrl);
            toast({ title: "Image uploaded", description: "Don't forget to save changes!" });
        }
      } catch (error) {
        console.error("Upload failed", error);
        toast({ title: "Upload failed", description: "Could not upload image", variant: "destructive" });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      await updateUser({
        fullName: name,
        avatar, // Include avatar in update
        bio,
        location,
        github,
        linkedin,
        portfolio,
        ...(collaborator && { roles: selectedRoles, availability, skills: selectedSkills }),
        ...(projectOwner && { company }),
      });

        toast({
        title: "Settings Saved! ✨",
        description: "Your profile has been updated successfully.",
        });
    } catch (e) {
        // Toast handled in auth context, but good to have safeguard
    }
    setIsSaving(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl md:ml-14">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            Settings
          </h1>
          <p className="text-gray-400 font-sans">
            Manage your profile and preferences
          </p>
        </div>

        {/* Profile Section */}
        <div className="glass-panel rounded-xl p-6 gradient-border mb-6">
          <h2 className="text-lg font-display font-bold text-white mb-6">
            Profile
          </h2>

          {/* Avatar */}
          <div className="flex items-center gap-6 mb-6">
            <div className="relative group">
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatar || user?.avatar} alt={user?.fullName} />
                <AvatarFallback className="text-2xl">
                  {user?.fullName?.[0]}
                </AvatarFallback>
              </Avatar>
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-2 rounded-full bg-cyan-500 text-white hover:bg-cyan-400 transition-colors cursor-pointer">
                {isUploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Camera className="w-4 h-4" />}
                <input 
                    id="avatar-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageUpload}
                    disabled={isUploading}
                />
              </label>
            </div>
            <div>
              <p className="text-sm text-gray-400 font-sans mb-1">
                Profile Photo
              </p>
              <p className="text-xs text-gray-500 font-sans">
                JPG, PNG or GIF. Max 2MB.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-gray-300 font-sans">
                Full Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 bg-white/5 border-white/10 text-white font-sans"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-gray-300 font-sans">
                Email
              </Label>
              <Input
                id="email"
                value={user?.email}
                disabled
                className="mt-1.5 bg-white/5 border-white/10 text-gray-400 font-sans"
              />
            </div>
            <div>
              <Label htmlFor="location" className="text-gray-300 font-sans">
                Location
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="San Francisco, CA"
                className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-gray-500 font-sans"
              />
            </div>
            {projectOwner && (
              <div>
                <Label htmlFor="company" className="text-gray-300 font-sans">
                  Company
                </Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Your company name"
                  className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-gray-500 font-sans"
                />
              </div>
            )}
          </div>

          <div className="mt-4">
            <Label htmlFor="bio" className="text-gray-300 font-sans">
              Bio
            </Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
              className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-gray-500 font-sans resize-none"
            />
          </div>
        </div>

        {/* Collaborator-specific: Roles & Availability */}
        {collaborator && (
          <div className="glass-panel rounded-xl p-6 gradient-border mb-6">
            <h2 className="text-lg font-display font-bold text-white mb-6">
              Skills & Availability
            </h2>

            <div className="mb-6">
              <Label className="text-gray-300 font-sans mb-3 block">
                Your Roles
              </Label>
              <div className="flex flex-wrap gap-2">
                {roleOptions.map((role) => (
                  <button
                    key={role}
                    onClick={() => toggleRole(role)}
                    className={`transition-all duration-200 ${
                      selectedRoles.includes(role)
                        ? "opacity-100"
                        : "opacity-50 hover:opacity-75"
                    }`}
                  >
                    <RoleBadge role={role} />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <Label className="text-gray-300 font-sans mb-3 block">
                Tech Stack & Skills
              </Label>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedSkills.map((skill) => (
                  <div
                    key={skill.name}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-sans"
                  >
                    <span>{skill.icon}</span>
                    <span>{skill.name}</span>
                    <button
                      onClick={() => toggleSkill(skill)}
                      className="hover:text-cyan-300 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-6">
                {POPULAR_STACKS.filter(s => !selectedSkills.find(sel => sel.name.toLowerCase() === s.name.toLowerCase())).map((skill) => (
                  <button
                    key={skill.name}
                    onClick={() => toggleSkill(skill)}
                    className="flex items-center gap-2 p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-left group"
                  >
                    <span className="text-lg">{skill.icon}</span>
                    <span className="text-sm text-gray-400 group-hover:text-white font-sans">{skill.name}</span>
                    <Plus className="w-3 h-3 ml-auto text-gray-500 group-hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>

              <form onSubmit={addCustomSkill} className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    placeholder="Add custom skill (e.g. Web3, Solidity...)"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 font-sans pr-10"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomSkill();
                      }
                    }}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-[10px] font-mono pointer-events-none">
                    ENTER
                  </div>
                </div>
                <Button 
                  type="button" 
                  onClick={() => addCustomSkill()}
                  variant="outline"
                  className="border-white/10 hover:bg-white/5 text-gray-400"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </form>
            </div>

            <div>
              <Label className="text-gray-300 font-sans mb-3 block">
                Availability
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(
                  ["full-time", "part-time", "weekends", "flexible"] as const
                ).map((option) => (
                  <button
                    key={option}
                    onClick={() => setAvailability(option)}
                    className={`p-3 rounded-lg border transition-all duration-200 text-sm font-sans ${
                      availability === option
                        ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                        : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
                    }`}
                  >
                    {option.charAt(0).toUpperCase() +
                      option.slice(1).replace("-", " ")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Social Links */}
        <div className="glass-panel rounded-xl p-6 gradient-border mb-6">
          <h2 className="text-lg font-display font-bold text-white mb-6">
            Social Links
          </h2>

          <div className="space-y-4">
            <div>
              <Label
                htmlFor="github"
                className="text-gray-300 font-sans flex items-center gap-2"
              >
                <Github className="w-4 h-4" />
                GitHub
              </Label>
              <Input
                id="github"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="username"
                className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-gray-500 font-sans"
              />
            </div>
            <div>
              <Label
                htmlFor="linkedin"
                className="text-gray-300 font-sans flex items-center gap-2"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </Label>
              <Input
                id="linkedin"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="username"
                className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-gray-500 font-sans"
              />
            </div>
            <div>
              <Label
                htmlFor="portfolio"
                className="text-gray-300 font-sans flex items-center gap-2"
              >
                <Globe className="w-4 h-4" />
                Portfolio
              </Label>
              <Input
                id="portfolio"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
                placeholder="https://yoursite.com"
                className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-gray-500 font-sans"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 font-sans font-semibold px-8"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </span>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
