import { ReactNode, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Bell,
  Search,
  Plus,
  Menu,
  X,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileCompletionModal } from "./ProfileCompletionModal";
import { isProfileComplete } from "@/utils/userValidation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { NotificationsPopover } from "@/components/NotificationsPopover";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { AIAssistant } from "./AIAssistant";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("query") || "",
  );
  const [showCompletionModal, setShowCompletionModal] = useState(true);
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const API_BASE =
    import.meta.env.VITE_API_URL || "https://build-gether-backend.onrender.com";

  useEffect(() => {
    const checkStatus = async () => {
      if (!user) return;
      try {
        const res = await axios.get(`${API_BASE}/api/auth/profile/status`);
        setIsProfileIncomplete(!res.data.isComplete);
        setMissingFields(res.data.missingFields);
      } catch (err) {
        console.error("Failed to check profile status", err);
        setIsProfileIncomplete(!isProfileComplete(user));
      }
    };
    checkStatus();
  }, [user]);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user) return;
      try {
        const res = await axios.get(`${API_BASE}/api/messages/conversations`);
        if (res.data.success) {
          const count = res.data.conversations.reduce(
            (acc: number, conv: any) => acc + (conv.unread || 0),
            0,
          );
          setUnreadMessages(count);
        }
      } catch (error) {
        console.error("Failed to fetch unread messages", error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const fetchNotificationCount = async () => {
      if (!user) return;
      try {
        const res = await axios.get(`${API_BASE}/api/notifications`);
        if (res.data.success) {
          const count = res.data.notifications.filter(
            (n: any) => !n.isRead,
          ).length;
          setUnreadNotifications(count);
        }
      } catch (error) {
        console.error("Failed to fetch notification count", error);
      }
    };

    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/dashboard/discover?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const isProjectOwner = useMemo(() => {
    return user?.role === "project_owner";
  }, [user]);

  const navItems = isProjectOwner
    ? [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        {
          icon: FolderKanban,
          label: "My Projects",
          path: "/dashboard/projects",
        },
        { icon: Users, label: "Applicants", path: "/dashboard/applicants" },
        { icon: MessageSquare, label: "Messages", path: "/dashboard/messages" },
        { icon: Settings, label: "Settings", path: "/dashboard/settings" },
      ]
    : [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        { icon: Search, label: "Find Projects", path: "/dashboard/discover" },
        {
          icon: FolderKanban,
          label: "My Applications",
          path: "/dashboard/applications",
        },
        { icon: MessageSquare, label: "Messages", path: "/dashboard/messages" },
        { icon: Settings, label: "Settings", path: "/dashboard/settings" },
      ];

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0f1419] flex flex-col">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />

      {/* Mobile Header (always visible on small screens) */}
      <header className="lg:hidden sticky top-0 z-50 glass-panel border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Menu className="w-6 h-6 text-white" />
          )}
        </button>
        <Link
          to="/"
          className="text-xl font-display font-extrabold text-gradient"
        >
          BuildMate
        </Link>
        <div className="w-10" /> {/* Spacer for centering logo */}
      </header>

      <div className="flex flex-1 relative">
        {/* Sidebar - Desktop fixed, Mobile overlay drawer */}
        <aside
          className={`fixed inset-y-0 left-0 z-[99] w-64 glass-panel border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out
            lg:translate-x-0 h-full lg:inset-auto
            ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          {/* Logo - Hidden on mobile when menu closed, but visible when open */}
          <div className="p-6 border-b border-white/10 hidden lg:block">
            <Link
              to="/"
              className="text-2xl font-display font-extrabold text-gradient"
            >
              BuildMate
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-sans ${
                    isActive
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                  {item.label === "Messages" && unreadMessages > 0 && (
                    <span className="ml-auto bg-cyan-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                      {unreadMessages}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarImage src={user?.avatar} alt={user?.fullName} />
                <AvatarFallback>{user?.fullName?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white font-sans truncate">
                  {user?.fullName}
                </p>
                <p className="text-xs text-gray-400 font-sans capitalize">
                  {user?.role?.replace("_", " ")}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/5 font-sans"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Overlay for mobile when menu open */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 md:ml-64 flex flex-col">
          {/* Top Bar - Hidden on mobile (replaced by mobile header), visible on lg+ */}
          <header className="hidden lg:flex sticky top-0 z-50 glass-panel border-b border-white/10 px-6 py-[22px] items-center justify-between">
            <div className="flex-1 max-w-md">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects..."
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 font-sans"
                />
              </form>
            </div>
            <div className="flex items-center gap-4">
              {isProjectOwner && (
                <Link to="/dashboard/projects/new">
                  <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 font-sans font-semibold">
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                  </Button>
                </Link>
              )}
              <NotificationsPopover />
            </div>
          </header>

          {/* Mobile Top Bar (search + actions) */}
          <header className="lg:hidden z-40 px-4 py-3 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search..."
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 font-sans"
              />
            </div>
            <div className="flex items-center justify-between">
              {isProjectOwner && (
                <Link to="/dashboard/projects/new" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 font-sans font-semibold">
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                  </Button>
                </Link>
              )}
              <div className="ml-4">
                <NotificationsPopover />
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6 relative z-10 overflow-y-auto">
            {isProfileIncomplete &&
              location.pathname !== "/dashboard/settings" && (
                <div className="mb-6 bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex items-center justify-between animate-in slide-in-from-top duration-500">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-orange-200">
                        Profile Incomplete
                      </p>
                      <p className="text-xs text-orange-400/70">
                        Missing: {missingFields.join(", ") || "Loading..."}
                      </p>
                    </div>
                  </div>
                  <Link to="/dashboard/settings">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                    >
                      Complete Now
                    </Button>
                  </Link>
                </div>
              )}
            {children}
          </main>
        </div>
      </div>

      {user &&
        isProfileIncomplete &&
        showCompletionModal &&
        location.pathname !== "/dashboard/settings" && (
          <ProfileCompletionModal
            user={user}
            onClose={() => setShowCompletionModal(false)}
            missingFields={missingFields}
          />
        )}
      <AIAssistant />
    </div>
  );
}
