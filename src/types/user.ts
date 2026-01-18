import { Role, ExperienceLevel, TechStack } from "./project";

export type UserType = "project_owner" | "collaborator";

export interface User {
  id: string;
  _id?: string; // MongoDB ID
  email: string;
  fullName: string;
  avatar: string;
  userType: UserType;
  bio: string;
  role: string;
  location: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
  createdAt: Date;
}

export interface ProjectOwner extends User {
  userType: "project_owner";
  role: "project_owner";
  company?: string;
  projectsPosted: number;
  successfulMatches: number;
}

export interface Collaborator extends User {
  userType: "collaborator";
  role: "collaborator";
  roles: Role[];
  skills: TechStack[];
  experienceLevel: ExperienceLevel;
  availability: "full-time" | "part-time" | "weekends" | "flexible";
  preferredTimeline: string[];
  projectsJoined: number;
  completedProjects: number;
  matchesReceived: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
