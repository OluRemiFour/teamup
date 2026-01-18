import { Code, Database, Palette, Smartphone, Layers, Package, HelpCircle } from 'lucide-react';
import { Role } from '@/types/project';

interface RoleBadgeProps {
  role: Role;
  onClick?: () => void;
}

const roleConfig = {
  frontend: {
    icon: Code,
    label: 'Frontend',
    color: 'from-cyan-500 to-blue-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
  },
  backend: {
    icon: Database,
    label: 'Backend',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
  fullstack: {
    icon: Layers,
    label: 'Fullstack',
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
  designer: {
    icon: Palette,
    label: 'Designer',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
  },
  mobile: {
    icon: Smartphone,
    label: 'Mobile',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  product: {
    icon: Package,
    label: 'Product',
    color: 'from-indigo-500 to-violet-500',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
  },
  other: {
    icon: HelpCircle,
    label: 'Other',
    color: 'from-gray-400 to-gray-500',
    bgColor: 'bg-gray-400/10',
    borderColor: 'border-gray-400/30',
  },
};

export function RoleBadge({ role, onClick }: RoleBadgeProps) {
  const config = (roleConfig as any)[role] || roleConfig.other;
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
        border ${config.borderColor} ${config.bgColor}
        transition-all duration-200 hover:scale-105
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
      `}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className={`text-xs font-medium font-sans bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}>
        {config.label}
      </span>
    </button>
  );
}
