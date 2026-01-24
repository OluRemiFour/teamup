import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  User as UserIcon,
  MessageSquare,
  Paperclip,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import axios from "axios";
import { useToast } from "./ui/use-toast";

interface Task {
  _id: string;
  title: string;
  description: string;
  status: "todo" | "ongoing" | "in-review" | "completed";
  priority: "low" | "medium" | "high" | "urgent";
  assignee?: {
    _id: string;
    fullName: string;
    avatar: string;
  };
  deadline?: string;
  notes: any[];
}

interface ProjectManagementProps {
  projectId: string;
  isOwner: boolean;
  team: any[];
  initialTasks: Task[];
  onTasksUpdate: () => void;
  currentUserId?: string;
}

export function ProjectManagement({
  projectId,
  isOwner,
  team,
  initialTasks,
  onTasksUpdate,
  currentUserId,
}: ProjectManagementProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [noteText, setNoteText] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const { toast } = useToast();
  const API_BASE =
    import.meta.env.VITE_API_URL || "https://build-gether-backend.onrender.com";

  const handleAddNote = async (taskId: string) => {
    if (!noteText.trim()) return;
    try {
      setIsUpdating(true);
      const res = await axios.put(`${API_BASE}/api/tasks/${taskId}/status`, {
        note: noteText,
      });
      if (res.data.success) {
        setNoteText("");
        onTasksUpdate();
        // Update local selected task if open
        if (selectedTask?._id === taskId) {
          setSelectedTask(res.data.task);
        }
        toast({ title: "Note Added" });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await axios.delete(`${API_BASE}/api/tasks/${taskId}`);
      if (res.data.success) {
        setSelectedTask(null);
        onTasksUpdate();
        toast({ title: "Task Deleted" });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    assignee: "",
    deadline: "",
  });

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const handleCreateTask = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/tasks/create`, {
        projectId,
        ...newTask,
      });
      if (res.data.success) {
        toast({
          title: "Task Created",
          description: "Task has been successfully assigned.",
        });
        setShowTaskDialog(false);
        setNewTask({
          title: "",
          description: "",
          priority: "medium",
          assignee: "",
          deadline: "",
        });
        onTasksUpdate();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    }
  };

  const updateStatus = async (taskId: string, status: string) => {
    try {
      const res = await axios.put(`${API_BASE}/api/tasks/${taskId}/status`, {
        status,
      });
      if (res.data.success) {
        onTasksUpdate();
        toast({ title: "Status Updated" });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const columns = [
    { id: "todo", title: "To Do", icon: <Clock className="w-4 h-4" /> },
    {
      id: "ongoing",
      title: "Ongoing",
      icon: <LayoutDashboard className="w-4 h-4 ml-1" />,
    },
    {
      id: "in-review",
      title: "In Review",
      icon: <AlertCircle className="w-4 h-4 ml-1" />,
    },
    {
      id: "completed",
      title: "Completed",
      icon: <CheckCircle2 className="w-4 h-4 ml-1" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Search & Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search tasks..."
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px] bg-white/5 border-white/10 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/10 text-white">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="in-review">In Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[120px] bg-white/5 border-white/10 text-xs">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/10 text-white">
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>

          {isOwner && (
            <Button
              onClick={() => setShowTaskDialog(true)}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 ml-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => (
          <div key={col.id} className="space-y-4">
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    col.id === "todo"
                      ? "bg-gray-400"
                      : col.id === "ongoing"
                        ? "bg-cyan-400"
                        : col.id === "in-review"
                          ? "bg-amber-400"
                          : "bg-emerald-400"
                  }`}
                />
                <h3 className="font-display font-bold text-white uppercase tracking-wider text-xs">
                  {col.title}
                </h3>
                <Badge
                  variant="outline"
                  className="border-white/10 text-gray-400 bg-white/5"
                >
                  {filteredTasks.filter((t) => t.status === col.id).length}
                </Badge>
              </div>
            </div>

            <div className="space-y-3 min-h-[400px]">
              {filteredTasks
                .filter((t) => t.status === col.id)
                .map((task) => (
                  <div
                    key={task._id}
                    className="glass-panel p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
                    onClick={() => setSelectedTask(task)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <Badge
                        className={`text-[10px] uppercase font-mono border-none ${
                          task.priority === "urgent"
                            ? "bg-red-500/20 text-red-400"
                            : task.priority === "high"
                              ? "bg-amber-500/20 text-amber-400"
                              : task.priority === "medium"
                                ? "bg-cyan-500/20 text-cyan-400"
                                : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {task.priority}
                      </Badge>
                      <button className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    <h4 className="text-white font-sans font-medium mb-2 text-sm">
                      {task.title}
                    </h4>
                    <p className="text-gray-400 text-xs line-clamp-2 mb-4">
                      {task.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {task.assignee && (
                          <Avatar className="w-6 h-6 border-2 border-[#0B0E14]">
                            <AvatarImage src={task.assignee.avatar} />
                            <AvatarFallback>
                              {task.assignee.fullName[0]}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                      {task.deadline && (
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(task.deadline).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="glass-panel border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription className="text-gray-400">
              Assign a new task to your team and set a deadline.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Task Title
              </label>
              <Input
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                placeholder="e.g., Implement Login API"
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Description
              </label>
              <Textarea
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                placeholder="Provide details about the task..."
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Priority
                </label>
                <Select
                  value={newTask.priority}
                  onValueChange={(v) => setNewTask({ ...newTask, priority: v })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10 text-white">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Assignee
                </label>
                <Select
                  value={newTask.assignee}
                  onValueChange={(v) => setNewTask({ ...newTask, assignee: v })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue placeholder="Select Member" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10 text-white">
                    {team.map((m: any) => (
                      <SelectItem key={m.user._id} value={m.user._id}>
                        {m.user.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Deadline
              </label>
              <Input
                type="date"
                value={newTask.deadline}
                onChange={(e) =>
                  setNewTask({ ...newTask, deadline: e.target.value })
                }
                className="bg-white/5 border-white/10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowTaskDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTask}
              className="bg-gradient-to-r from-cyan-500 to-purple-500"
            >
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Detail Modal */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="glass-panel border-white/10 text-white sm:max-w-[600px]">
          {selectedTask && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Badge
                    className={`uppercase font-mono border-none ${
                      selectedTask.priority === "urgent"
                        ? "bg-red-500/20 text-red-400"
                        : selectedTask.priority === "high"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-cyan-500/20 text-cyan-400"
                    }`}
                  >
                    {selectedTask.priority}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-white/10 text-gray-400 capitalize"
                  >
                    {selectedTask.status.replace("-", " ")}
                  </Badge>
                </div>
                <DialogTitle className="text-2xl font-display">
                  {selectedTask.title}
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-y border-white/10">
                <div className="md:col-span-2 space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-300">
                      Description
                    </h4>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {selectedTask.description || "No description provided."}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Activity & Notes
                    </h4>
                    <div className="space-y-3">
                      {selectedTask.notes?.map((note, idx) => (
                        <div
                          key={idx}
                          className="bg-white/5 p-3 rounded-lg border border-white/10"
                        >
                          <p className="text-xs text-gray-300 mb-1">
                            {note.text}
                          </p>
                          <span className="text-[10px] text-gray-500">
                            {new Date(note.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))}
                      <Textarea
                        placeholder="Add a note or update..."
                        className="bg-white/5 border-white/10 text-sm"
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-white/10"
                        onClick={() => handleAddNote(selectedTask._id)}
                        disabled={isUpdating || !noteText.trim()}
                      >
                        {isUpdating ? "Posting..." : "Post Update"}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 bg-white/5 p-4 rounded-xl">
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      Assignee
                    </h4>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={selectedTask.assignee?.avatar} />
                        <AvatarFallback>
                          {selectedTask.assignee?.fullName?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-300">
                        {selectedTask.assignee?.fullName || "Unassigned"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      Due Date
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      {selectedTask.deadline
                        ? new Date(selectedTask.deadline).toLocaleDateString()
                        : "No deadline"}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      Update Status
                    </h4>
                    <Select
                      value={selectedTask.status}
                      onValueChange={(v) => updateStatus(selectedTask._id, v)}
                      disabled={
                        !isOwner && selectedTask.assignee?._id !== currentUserId
                      }
                    >
                      <SelectTrigger className="bg-gray-900 border-white/10 text-sm h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-white/10 text-white">
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="in-review">In Review</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex justify-between items-center sm:justify-between">
                {isOwner && (
                  <Button
                    variant="ghost"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs"
                    onClick={() => handleDeleteTask(selectedTask._id)}
                  >
                    Delete Task
                  </Button>
                )}
                <Button
                  onClick={() => setSelectedTask(null)}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 text-xs"
                >
                  Close Details
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
