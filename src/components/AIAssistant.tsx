import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial',
      text: "Hi! I'm your Build Gather AI. I can help you find projects, explain features, or tell you about our community. How can I help today?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'https://teammate-n05o.onrender.com';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(`${API_BASE}/api/chat/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data && response.data.length > 0) {
          setMessages(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      }
    };

    fetchHistory();
  }, [API_BASE]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE}/api/chat/send`, {
        message: inputValue,
        previousMessages: messages.slice(-10), 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.reply,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error("Chat API Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed bottom-6 right-6 w-14 h-14 rounded-full
          bg-gradient-to-r from-cyan-500 to-purple-500
          flex items-center justify-center
          shadow-lg shadow-cyan-500/50
          transition-all duration-300
          hover:scale-110 active:scale-95
          z-50
          ${isOpen ? 'rotate-0' : 'animate-pulse-glow'}
        `}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Sparkles className="w-6 h-6 text-white" />
        )}
      </button>

      {isOpen && (
        <div
          className="fixed bottom-24 right-6 w-96 h-[550px] glass-panel rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-white/20 bg-black/60 backdrop-blur-xl"
          style={{
            animation: 'scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div className="p-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-inner">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-sm tracking-tight">Build Gather AI</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest uppercase">System Online</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`
                    max-w-[85%] rounded-2xl px-4 py-2.5 text-sm font-sans leading-relaxed
                    ${message.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-lg shadow-purple-500/10 rounded-tr-none'
                      : 'bg-white/10 text-gray-200 border border-white/10 backdrop-blur-sm rounded-tl-none'
                    }
                  `}
                >
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                      a: ({node, ...props}) => <a className="text-cyan-400 hover:underline" {...props} />,
                      code: ({node, ...props}) => <code className="bg-black/40 rounded px-1.5 py-0.5 font-mono text-xs" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                    }}
                  >
                    {message.text}
                  </ReactMarkdown>
                </div>
                <span className="text-[10px] text-gray-500 mt-1 px-1 font-mono uppercase tracking-tighter">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none px-5 py-3 shadow-inner">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white/5 border-t border-white/10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask Build Gather AI..."
                className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-gray-500 font-sans focus:ring-purple-500/50 rounded-xl"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!inputValue.trim()}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:scale-105 active:scale-95 transition-transform rounded-xl h-10 w-10 shrink-0"
              >
                <Send className="w-4 h-4 text-white" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
