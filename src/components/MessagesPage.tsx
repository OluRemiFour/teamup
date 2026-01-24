import { Send, Search, MoreVertical } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "./DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash2, CheckCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Conversation {
  id: string;
  participant: {
    id: string; // Added ID
    name: string;
    avatar: string;
    role: string;
  };
  lastMessage: string;
  timestamp: string;
  unread: number;
  project?: string;
}

interface Message {
  id: string;
  text: string;
  sender: "me" | "them";
  timestamp: string;
}

export function MessagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const API_BASE =
    import.meta.env.VITE_API_URL || "https://build-gether-backend.onrender.com";

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch Conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/messages/conversations`);
        if (res.data.success) {
          setConversations(res.data.conversations);
        }
      } catch (error) {
        console.error("Failed to fetch conversations", error);
      }
    };
    fetchConversations();
    // Poll for new conversations every 10s
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [API_BASE]);

  // Handle Search Params for initialization
  useEffect(() => {
    if (conversations.length === 0) return;

    const projectId = searchParams.get("project");
    const recipientName = searchParams.get("recipient");

    if (projectId) {
      const conv = conversations.find(
        (c) => c.project && c.project.includes(projectId),
      ); // Simplification, backend might return title
      // Actually the backend returns title in c.project, not ID.
      // Let's check if we can find by project name or if we should update backend to include ID.
      if (conv) {
        setSelectedConversation(conv);
      }
    } else if (recipientName) {
      const conv = conversations.find(
        (c) => c.participant.name.toLowerCase() === recipientName.toLowerCase(),
      );
      if (conv) {
        setSelectedConversation(conv);
      }
    }
  }, [searchParams, conversations]);

  // Fetch Messages when conversation selected
  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/messages/${selectedConversation.id}`,
        );
        if (res.data.success) {
          // Map timestamp if needed or use as is
          const mapped = res.data.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }));
          setMessages(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch messages", error);
      }
    };

    fetchMessages();
    // Poll for messages in active conv
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedConversation, API_BASE]);

  const filteredConversations = conversations.filter(
    (c) =>
      c.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.project?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const text = newMessage;
      setNewMessage(""); // Optimistic clear

      // Optimistic update
      setMessages((prev) => [
        ...prev,
        {
          id: "temp-" + Date.now(),
          text: text,
          sender: "me",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);

      // Send to backend
      // We have participant.id now from the conversation object
      await axios.post(`${API_BASE}/api/messages/send`, {
        recipientId: selectedConversation.participant.id,
        text: text,
        // projectId: selectedConversation.project // Optional: if we stored project ID in conversation, we could pass it.
        // For now, simple conversation update.
      });
    } catch (error) {
      console.error("Failed to send", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex gap-6 h-[calc(100vh-180px)]">
        {/* Conversations List */}
        <div className="w-80 glass-panel rounded-xl flex flex-col">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-lg font-display font-bold text-white mb-4">
              Messages
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 font-sans"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-white/5 transition-colors text-left ${
                  selectedConversation?.id === conversation.id
                    ? "bg-white/5"
                    : ""
                }`}
              >
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={conversation.participant.avatar}
                      alt={conversation.participant.name}
                    />
                    <AvatarFallback>
                      {conversation.participant.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 rounded-full text-xs text-white flex items-center justify-center font-mono">
                      {conversation.unread}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-sans font-medium text-white truncate">
                      {conversation.participant.name}
                    </p>
                    <span className="text-xs text-gray-500 font-mono">
                      {new Date(conversation.timestamp).toLocaleDateString() ===
                      new Date().toLocaleDateString()
                        ? new Date(conversation.timestamp).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" },
                          )
                        : new Date(conversation.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  {conversation.project && (
                    <p className="text-xs text-cyan-400 font-sans truncate mb-1">
                      {conversation.project}
                    </p>
                  )}
                  <p className="text-sm text-gray-400 font-sans truncate">
                    {conversation.lastMessage}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        {selectedConversation ? (
          <div className="flex-1 glass-panel rounded-xl flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={selectedConversation.participant.avatar}
                    alt={selectedConversation.participant.name}
                  />
                  <AvatarFallback>
                    {selectedConversation.participant.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-sans font-medium text-white">
                    {selectedConversation.participant.name}
                  </p>
                  <p className="text-xs text-gray-400 font-sans">
                    {selectedConversation.participant.role}
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-[#1a1f2e] border-white/10"
                >
                  <DropdownMenuItem
                    className="text-gray-300 hover:text-white focus:text-white focus:bg-white/10 cursor-pointer"
                    onClick={async () => {
                      if (!selectedConversation) return;
                      try {
                        await axios.patch(
                          `${API_BASE}/api/messages/${selectedConversation.id}/read`,
                        );
                        setConversations((prev) =>
                          prev.map((c) =>
                            c.id === selectedConversation.id
                              ? { ...c, unread: 0 }
                              : c,
                          ),
                        );
                        toast({
                          title: "Marked as Read",
                          description: "Conversation marked as read.",
                        });
                      } catch (error) {
                        console.error("Failed to mark as read", error);
                      }
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Read
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
                    onClick={async () => {
                      if (!selectedConversation) return;
                      try {
                        await axios.delete(
                          `${API_BASE}/api/messages/${selectedConversation.id}`,
                        );
                        setConversations((prev) =>
                          prev.filter((c) => c.id !== selectedConversation.id),
                        );
                        setSelectedConversation(null);
                        toast({
                          title: "Conversation Deleted",
                          description: "This conversation has been removed.",
                        });
                      } catch (error) {
                        console.error("Failed to delete conversation", error);
                        toast({
                          title: "Error",
                          description: "Failed to delete conversation",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Conversation
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Project Context */}
            {selectedConversation.project && (
              <div className="px-4 py-2 bg-cyan-500/10 border-b border-cyan-500/20">
                <p className="text-xs text-cyan-400 font-sans">
                  Discussing:{" "}
                  <span className="font-medium">
                    {selectedConversation.project}
                  </span>
                </p>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.sender === "me"
                        ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                        : "bg-white/5 text-gray-300 border border-white/10"
                    }`}
                  >
                    <p className="text-sm font-sans">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === "me"
                          ? "text-white/60"
                          : "text-gray-500"
                      } font-mono`}
                    >
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500 font-sans"
                />
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 glass-panel rounded-xl flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-400 font-sans text-lg mb-2">
                Select a conversation
              </p>
              <p className="text-gray-500 font-sans text-sm">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
