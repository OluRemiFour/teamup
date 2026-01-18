import { useNavigate } from "react-router-dom";
import { User } from "@/types/user";
import { getMissingFields } from "@/utils/userValidation";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight, Sparkles, X } from "lucide-react";

interface ProfileCompletionModalProps {
  user: User;
  onClose: () => void;
  missingFields?: string[];
}

export function ProfileCompletionModal({ user, onClose, missingFields: providedMissingFields }: ProfileCompletionModalProps) {
  const navigate = useNavigate();
  const missingFields = providedMissingFields || getMissingFields(user);

  const getFieldDescription = (field: string) => {
    switch (field) {
      case "Full Name": return "Help others recognize you";
      case "Location": return "Better matching for local opportunities";
      case "Bio": return "Tell your story and what you represent";
      case "At least one Role": return "Essential for showing up in project searches";
      case "Availability": return "Let teams know when you can start";
      case "At least one Skill": return "The core of our AI matching algorithm";
      case "Company Name": return "Build trust with potential collaborators";
      default: return "";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0f1419]/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="glass-panel w-full max-w-lg p-8 rounded-3xl border-gradient relative overflow-hidden shadow-2xl">
        {/* Background Accents */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full" />
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center ring-1 ring-white/10">
              <Sparkles className="w-7 h-7 text-cyan-400" />
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-display font-bold text-white leading-tight">
                Welcome to the BuildMate Community!
              </h2>
              <p className="text-gray-400 font-sans text-sm">Let's get your profile ready for matching</p>
            </div>
          </div>

          <div className="space-y-6 mb-8">
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-sm">
              <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Why complete your profile?
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                BuildMate uses <span className="text-cyan-400 font-medium">AI-powered matching</span> to connect you with the perfect projects and teammates. The more we know about you, the better our recommendations become.
              </p>
            </div>

            {missingFields.length > 0 && (
              <div className="px-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">
                  Action Required
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {missingFields.map((field) => (
                    <div key={field} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="mt-1">
                        <div className="w-2 h-2 rounded-full bg-orange-500/50 ring-4 ring-orange-500/10" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-200">{field}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{getFieldDescription(field)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => navigate("/dashboard/settings")}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-sans font-bold h-14 rounded-2xl group transition-all duration-300 shadow-lg shadow-cyan-500/20"
            >
              Complete Profile Now
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="ghost"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-400 hover:bg-white/5 h-14 rounded-2xl px-6"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
