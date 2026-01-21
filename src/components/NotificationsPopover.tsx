import { Bell, Check, Info, AlertTriangle, MessageSquare, ClipboardList, RefreshCw } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface Notification {
  _id: string;
  sender: {
    fullName: string;
    avatar?: string;
  };
  type: "message" | "acceptance" | "invite" | "task_assigned" | "task_updated";
  text: string;
  isRead: boolean;
  createdAt: string;
  project?: {
    _id: string;
    projectTitle: string;
  };
}

import { useState, useEffect } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

export function NotificationsPopover() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL || 'https://teammate-n05o.onrender.com';
  const navigate = useNavigate();

  const handleNotificationClick = async (notification: Notification) => {
      // Mark as read immediately
      if (!notification.isRead) {
          markAsRead(notification._id);
      }

      // Navigate based on type
      if (notification.type === 'message') {
           navigate('/dashboard/messages');
      } else if (notification.project?._id || (notification as any).project) {
           // Handle populated project object or ID string
           const projectId = notification.project?._id || (notification as any).project;
           if (projectId) {
               navigate(`/dashboard/project/${projectId}?tab=overview`);
           }
      }
      
      // Close popover logic would go here if we had access to the open state, 
      // but strictly speaking navigation usually closes it or we can rely on default behavior.
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/notifications`);
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const res = await axios.patch(`${API_BASE}/api/notifications/${id}/read`);
      if (res.data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n._id);
    try {
      await Promise.all(
        unreadIds.map((id) => axios.patch(`${API_BASE}/api/notifications/${id}/read`))
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 bg-[#1a1f2e] border-white/10 p-0 shadow-2xl">
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <h4 className="font-display font-bold text-white">Notifications</h4>
          {unreadCount > 0 && (
            <span className="bg-cyan-500/10 text-cyan-400 text-[10px] px-2 py-0.5 rounded-full border border-cyan-500/20">
              {unreadCount} New
            </span>
          )}
        </div>
        <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${
                  !notification.isRead ? "bg-cyan-500/[0.03]" : ""
                }`}
              >
                <div className="flex gap-3">
                  <div className={`mt-1 p-1.5 rounded-full flex-shrink-0 h-fit ${
                      notification.type === 'acceptance' ? 'bg-emerald-500/20 text-emerald-400' :
                      notification.type === 'invite' ? 'bg-amber-500/20 text-amber-400' :
                      notification.type === 'task_assigned' ? 'bg-purple-500/20 text-purple-400' :
                      notification.type === 'task_updated' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-cyan-500/20 text-cyan-400'
                  }`}>
                      {notification.type === 'acceptance' && <Check className="w-3 h-3" />}
                      {notification.type === 'invite' && <AlertTriangle className="w-3 h-3" />}
                      {notification.type === 'message' && <MessageSquare className="w-3 h-3" />}
                      {notification.type === 'task_assigned' && <ClipboardList className="w-3 h-3" />}
                      {notification.type === 'task_updated' && <RefreshCw className="w-3 h-3" />}
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-white mb-0.5">
                      {notification.type === 'acceptance' ? 'Application Accepted' : 
                       notification.type === 'invite' ? 'Project Invite' : 
                       notification.type === 'task_assigned' ? 'Task Assigned' :
                       notification.type === 'task_updated' ? 'Task Updated' : 'New Message'}
                    </h5>
                    <p className="text-xs text-gray-400 mb-1.5 leading-relaxed">
                      {notification.text}
                    </p>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-500">No notifications yet</p>
            </div>
          )}
        </div>
        {unreadCount > 0 && (
          <div className="p-3 border-t border-white/10 text-center">
            <button 
              onClick={markAllAsRead}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-sans transition-colors"
            >
              Mark all as read
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
