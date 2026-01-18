import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

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
      id: '1',
      text: "Hi! I'm your AI assistant. I can help you find the perfect project match, answer questions about teams, or provide insights on tech stacks. What would you like to know?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1500));

    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      text: getAIResponse(inputValue),
      sender: 'ai',
      timestamp: new Date(),
    };

    setIsTyping(false);
    setMessages(prev => [...prev, aiResponse]);
  };

  const getAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('match') || lowerInput.includes('score')) {
      return "Match scores are calculated based on your skills, experience level, availability, and preferences. Scores above 85% indicate excellent alignment, 70-85% are good matches, and below 70% suggest some gaps but still worth exploring!";
    }
    
    if (lowerInput.includes('tech') || lowerInput.includes('stack')) {
      return "I can help you find projects using specific technologies! The tech stack constellation shows the main technologies used. Hover over each icon to see details. Would you like me to filter projects by a specific technology?";
    }
    
    if (lowerInput.includes('timeline') || lowerInput.includes('time')) {
      return "Project timelines vary from short-term (1-3 months) to ongoing commitments. I recommend starting with projects that match your availability. You can filter by timeline in the sidebar to find the perfect fit!";
    }
    
    return "That's a great question! I'm here to help you navigate BuildMate and find your ideal project match. Feel free to ask about match scores, tech stacks, team sizes, or anything else about the projects!";
  };

  return (
    <>
      {/* Floating Button */}
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

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 w-96 h-[500px] glass-panel rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden"
          style={{
            animation: 'scale-in 0.3s ease-out',
          }}
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-sm">AI Assistant</h3>
                <p className="text-xs text-gray-400 font-mono">Always here to help</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-[80%] rounded-lg p-3 text-sm font-sans
                    ${message.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                      : 'bg-white/5 text-gray-300 border border-white/10'
                    }
                  `}
                >
                  {message.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce-dot" />
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce-dot" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce-dot" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            
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
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500 font-sans"
              />
              <Button
                type="submit"
                size="icon"
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
