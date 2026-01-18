import { TechStack } from '@/types/project';

interface TechStackConstellationProps {
  techStack: TechStack[];
  maxDisplay?: number;
}

export function TechStackConstellation({ techStack, maxDisplay = 5 }: TechStackConstellationProps) {
  const displayStack = techStack.slice(0, maxDisplay);
  const remaining = techStack.length - maxDisplay;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center -space-x-2">
        {displayStack.map((tech, index) => (
          <div
            key={tech.name}
            className="relative group"
            style={{
              animation: `scale-in 0.3s ease-out ${index * 0.05}s both`,
            }}
          >
            <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-sm hover:scale-110 transition-transform duration-200 hover:z-10 relative">
              {tech.icon}
              <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-20">
              {tech.name}
            </div>
          </div>
        ))}
      </div>
      {remaining > 0 && (
        <span className="text-xs text-gray-400 font-mono">+{remaining}</span>
      )}
    </div>
  );
}
