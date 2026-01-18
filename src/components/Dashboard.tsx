import { useAuth } from "@/contexts/AuthContext";
import { ProjectOwnerDashboard } from "./ProjectOwnerDashboard";
import { CollaboratorDashboard } from "./CollaboratorDashboard";
import { Navigate } from "react-router-dom";

export function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  return user.role === "project_owner" ? (
    <ProjectOwnerDashboard />
  ) : (
    <CollaboratorDashboard />
  );
}
