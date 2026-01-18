import { useToast } from "@/components/ui/use-toast";
import { Collaborator, ProjectOwner, User, UserType } from "@/types/user";
import axios from "axios";
import Cookies from "js-cookie";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    confirmPassword: string,
    name: string,
    userType: UserType
  ) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
  requestOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  completeSignupAfterVerification: (
    email: string,
    password: string,
    confirmPassword: string,
    name: string,
    userType: UserType
  ) => Promise<void>;
  cache: Record<string, any>;
  setCachedData: (key: string, data: any) => void;
  getCachedData: (key: string) => any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_BASE = import.meta.env.VITE_API_URL;

// Mock users for demo
const mockProjectOwner: ProjectOwner = {
  id: "owner-1",
  email: "owner@buildmate.com",
  fullName: "Sarah Chen",
  avatar:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
  userType: "project_owner",
  bio: "Tech Lead passionate about building innovative products. Looking for talented collaborators to bring ideas to life.",
  location: "San Francisco, CA",
  github: "sarahchen",
  linkedin: "sarahchen",
  company: "Stripe",
  projectsPosted: 5,
  successfulMatches: 12,
  createdAt: new Date("2024-01-15"),
  role: "project_owner",
};

const mockCollaborator: Collaborator = {
  id: "collab-1",
  email: "dev@buildmate.com",
  fullName: "Alex Thompson",
  avatar:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
  userType: "collaborator",
  bio: "Full-stack developer with 5+ years of experience. Love working on challenging projects with great teams.",
  location: "New York, NY",
  github: "alexthompson",
  linkedin: "alexthompson",
  portfolio: "https://alexthompson.dev",
  roles: ["fullstack", "backend"],
  skills: [
    { name: "TypeScript", icon: "📘", category: "frontend" },
    { name: "React", icon: "⚛️", category: "frontend" },
    { name: "Node.js", icon: "🟢", category: "backend" },
    { name: "PostgreSQL", icon: "🐘", category: "database" },
  ],
  experienceLevel: "advanced",
  availability: "part-time",
  preferredTimeline: ["3-6 months", "6+ months"],
  projectsJoined: 8,
  completedProjects: 6,
  matchesReceived: 24,
  createdAt: new Date("2024-02-01"),
  role: "collaborator",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cache, setCache] = useState<Record<string, any>>({});
  const { toast } = useToast();

  // Helper function to save user to cookies
  const saveUserToCookie = (userData: User) => {
    try {
      // Store the entire user object as JSON
      Cookies.set("user_data", JSON.stringify(userData), {
        expires: 7,
        sameSite: "Strict",
        path: "/",
      });
    } catch (err) {
      console.error("Failed to save user to cookie:", err);
    }
  };

  // Helper function to load user from cookies
  const loadUserFromCookie = (): User | null => {
    try {
      const userData = Cookies.get("user_data");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        console.log("📂 Loaded user from cookie:", parsedUser);
        return parsedUser;
      }
    } catch (err) {
      console.error("Failed to load user from cookie:", err);
      // Clean up corrupted cookie
      Cookies.remove("user_data");
    }
    return null;
  };

  const verifyAndSetUser = async () => {
    const token = Cookies.get("auth_token");

    if (!token) {
      // Try to load user from cookie as fallback
      const cachedUser = loadUserFromCookie();
      if (cachedUser) {
        // console.log("📂 Using cached user data (no token)");
        setUser(cachedUser);
      } else {
        setUser(null);
      }

      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Set the token in axios before making the request
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await axios.get(`${API_BASE}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = res.data.user || res.data;
      if (userData && !userData.userType && userData.role) {
        userData.userType = userData.role;
      }
      // console.log("✅ Verified user from API:", userData);
      setUser(userData);

      // ✅ Save user data to cookie for future use
      saveUserToCookie(userData);
    } catch (err: any) {
      console.error("❌ Auth verification failed:", err);

      // Only remove token and logout on authentication errors (401, 403)
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.log("🔒 Invalid token, logging out");
        Cookies.remove("auth_token");
        Cookies.remove("user_data");
        delete axios.defaults.headers.common["Authorization"];
        setUser(null);

        toast({
          variant: "destructive",
          title: "Session expired",
          description: err.response?.data?.message || "Please log in again.",
        });
      } else {
        // For network errors, try to use cached user data
        console.warn("⚠️ Network/server error, trying cached data");
        const cachedUser = loadUserFromCookie();
        if (cachedUser) {
          console.log("📂 Using cached user data during network issue");
          setUser(cachedUser);
        } else {
          // If no cached data, keep the token but set user to null
          console.log("⚠️ No cached user data available");
          setUser(null);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    verifyAndSetUser();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const request = await axios.post(`${API_BASE}/api/auth/login`, {
        email,
        password,
      });

      const { token, user: loggedUser } = request.data;
      if (loggedUser && !loggedUser.userType && loggedUser.role) {
        loggedUser.userType = loggedUser.role;
      }
      // Set token cookie
      Cookies.set("auth_token", token, {
        expires: 7,
        sameSite: "Strict",
        path: "/",
      });

      // Save user data to cookie
      saveUserToCookie(loggedUser);

      setUser(loggedUser);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      toast({
        title: "Welcome back!",
        description: `Logged in as ${
          loggedUser?.fullName?.split(" ")[0] || "user"
        }`,
      });
    } catch (err: any) {
      console.error("❌ Login failed:", err);
      const errorMessage = err.response?.data?.message || "Login failed";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/api/auth/verify-otp`, {
        email,
        otp,
      });

      const { token, user: verifiedUser } = res.data;
      if (verifiedUser && !verifiedUser.userType && verifiedUser.role) {
        verifiedUser.userType = verifiedUser.role;
      }

      Cookies.set("auth_token", token, {
        expires: 7,
        sameSite: "Strict",
        path: "/",
      });

      // Save user data to cookie
      saveUserToCookie(verifiedUser);

      setUser(verifiedUser);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      toast({
        title: "Account Verified!",
        description: "Welcome to BuildMate!",
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || "Invalid or expired OTP";
      setError(msg);
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: msg,
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    email: string,
    password: string,
    confirmPassword: string,
    name: string,
    userType: UserType
  ) => {
    setError(null);
    setIsLoading(true);

    try {
      const request = await axios.post(`${API_BASE}/api/auth/register`, {
        email,
        password,
        confirmPassword,
        fullName: name,
        role: userType,
      });
      if (request.status !== 200) {
        toast({
          title: "Registration failed!",
          description: request.data.message || "Please try again.",
        });
        throw new Error("Registration failed");
      }
      toast({
        title: "Check your inbox!",
        description: request.data.message || "verification code.",
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
      const errorMessage =
        err.response?.data?.message || err.message || "Signup failed";
      toast({
        title: "Signup Failed",
        description: errorMessage,
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log("👋 Logging out");
    Cookies.remove("auth_token", { path: "/" });
    Cookies.remove("user_data", { path: "/" });
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (user) {
      try {
        setIsLoading(true);
        // Call API to update profile
        const res = await axios.put(`${API_BASE}/api/auth/profile`, updates);
        
        // Merge updates with current user state (or use response data if it returns full user)
        const updatedUser = { ...user, ...updates }; 
        if (res.data.user) {
            // If backend returns updated user, use it
            Object.assign(updatedUser, res.data.user);
            if (updatedUser.role && !updatedUser.userType) {
                updatedUser.userType = updatedUser.role as any;
            }
        }
        
        setUser(updatedUser);

        // Update user in cookie as well
        saveUserToCookie(updatedUser);

        // Keep localStorage for backward compatibility
        localStorage.setItem("buildmate_user", JSON.stringify(updatedUser));
        
        toast({
          title: "Profile Updated",
          description: "Your changes have been saved successfully.",
        });
      } catch (err: any) {
        console.error("Failed to update profile:", err);
        const msg = err.response?.data?.message || "Failed to update profile";
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: msg,
        });
        throw err;
      } finally {
        setIsLoading(false);
      }
    }
  };

  const [pendingSignupData, setPendingSignupData] = useState<{
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    userType: UserType;
  } | null>(null);

  const requestOtp = async (email: string) => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/auth/request-otp`, {
        email,
      });
      if (res.status == 200) {
        toast({
          title: "OTP Sent!",
          description: res.data.message || "OTP has been sent to your email.",
        });
      }
      console.log(`OTP sent to ${email}`);
    } catch (error) {
      toast({
        title: "Failed to send OTP",
        description:
          (error as any).response?.data?.message ||
          (error as Error).message ||
          "Please try again.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const completeSignupAfterVerification = async (
    email: string,
    password: string,
    name: string,
    userType: UserType
  ) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newUser: User =
      userType === "project_owner"
        ? ({
            ...mockProjectOwner,
            id: `owner-${Date.now()}`,
            email,
            fullName: name,
            projectsPosted: 0,
            successfulMatches: 0,
          } as ProjectOwner)
        : ({
            ...mockCollaborator,
            id: `collab-${Date.now()}`,
            email,
            fullName: name,
            projectsJoined: 0,
            completedProjects: 0,
            matchesReceived: 0,
          } as Collaborator);

    setUser(newUser);

    // saveUserToCookie(newUser);
    localStorage.setItem("buildmate_user", JSON.stringify(newUser));
    setPendingSignupData(null);
    setIsLoading(false);
  };

  const setCachedData = (key: string, data: any) => {
    setCache(prev => ({ ...prev, [key]: data }));
  };

  const getCachedData = (key: string) => {
    return cache[key];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateUser,
        requestOtp,
        verifyOtp,
        completeSignupAfterVerification,
        cache,
        setCachedData,
        getCachedData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
