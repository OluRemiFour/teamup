import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { LandingPage } from "@/components/LandingPage";
import { AuthPage } from "@/components/AuthPage";
import { Dashboard } from "@/components/Dashboard";
import { DiscoverPage } from "@/components/DiscoverPage";
import { MyProjectsPage } from "@/components/MyProjectsPage";
import { CreateProjectPage } from "@/components/CreateProjectPage";
import { EditProjectPage } from "@/components/EditProjectPage";
import { ApplicantsPage } from "@/components/ApplicantsPage";
import { ApplicationsPage } from "@/components/ApplicationsPage";
import { MessagesPage } from "@/components/MessagesPage";
import { SettingsPage } from "@/components/SettingsPage";
import { ProjectDetailPage } from "@/components/ProjectDetailPage";
import { OpenSourcePage } from "@/components/OpenSourcePage";
import { OpenSourceDetailPage } from "@/components/OpenSourceDetailPage";
import { ApplicationReviewPage } from "@/components/ApplicationReviewPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

// App

function App() {
  return (
    <AuthProvider>
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          </div>
        }
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/messages" element={<MessagesPage />} />
            <Route path="/dashboard/settings" element={<SettingsPage />} />
            <Route path="/dashboard/open-source" element={<OpenSourcePage />} />
            <Route
              path="/dashboard/open-source/:repoName"
              element={<OpenSourceDetailPage />}
            />

            {/* Project Owner Only */}
            <Route
              element={<ProtectedRoute allowedRoles={["project_owner"]} />}
            >
              <Route path="/dashboard/projects" element={<MyProjectsPage />} />
              <Route
                path="/dashboard/projects/new"
                element={<CreateProjectPage />}
              />
              <Route
                path="/dashboard/projects/edit/:projectId"
                element={<EditProjectPage />}
              />
              <Route
                path="/dashboard/applicants"
                element={<ApplicantsPage />}
              />
              <Route
                path="/dashboard/projects/:projectId/applicants"
                element={<ApplicantsPage />}
              />
              <Route
                path="/dashboard/applicants/:applicationId"
                element={<ApplicationReviewPage />}
              />
            </Route>

            {/* Collaborator Only */}
            <Route element={<ProtectedRoute allowedRoles={["collaborator"]} />}>
              <Route path="/dashboard/discover" element={<DiscoverPage />} />
              <Route
                path="/dashboard/applications"
                element={<ApplicationsPage />}
              />
            </Route>

            {/* Application Details - potentially accessible by both but context differs */}
            {/* For now keeping it protected generally, or specific access logic in component */}
            <Route
              path="/dashboard/project/:projectId"
              element={<ProjectDetailPage />}
            />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
