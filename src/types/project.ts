export type Role = 'frontend' | 'backend' | 'fullstack' | 'designer' | 'product' | 'mobile' | 'other';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type Timeline = '1-3 months' | '3-6 months' | '6+ months' | 'ongoing';
export type ProjectStatus = 'draft' | 'active' | 'paused' | 'completed';
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

export interface TechStack {
  name: string;
  icon: string;
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'design';
}

export interface MatchReason {
  type: 'strength' | 'concern';
  text: string;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: Role;
  joinedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  matchScore: number;
  roles: Role[];
  techStack: TechStack[];
  timeline: Timeline;
  experienceLevel: ExperienceLevel;
  teamSize: number;
  currentMembers: number;
  matchReasons: MatchReason[];
  postedBy: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    createdAt?: string;
    projectsCount?: number;
  };
  isInterested?: boolean;
  status?: ProjectStatus;
  lifecycleStage?: 'initiation' | 'team-search' | 'ongoing' | 'review' | 'completed';
  team?: Array<{
    user: {
        _id: string;
        fullName: string;
        avatar: string;
    };
    role: string;
    joinedAt: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
  views?: number;
  applicants?: number;
  requirements?: string[];
  benefits?: string[];
  permissions?: {
      isOwner: boolean;
      isMember: boolean;
  };
  applicantStatus?: ApplicationStatus;
}

export interface Application {
  id: string;
  projectId: string;
  projectTitle: string;
  applicantId: string;
  applicantName: string;
  applicantAvatar: string;
  applicantRole?: Role;
  matchScore?: number;
  status?: ApplicationStatus;
  message?: string;
  appliedAt: string;
  reviewedAt?: string;
  matchReasons?: MatchReason[];
  bio?: string;
  skills?: string[];
  experience?: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string;
  topics: string[];
  owner: {
    login: string;
    avatar_url: string;
  };
  updated_at: string;
  matchScore?: number;
  matchReasons?: MatchReason[];
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  html_url: string;
  state: string;
  labels: Array<{
    name: string;
    color: string;
  }>;
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  comments: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
  source: {
    name: string;
  };
  publishedAt: string;
}
