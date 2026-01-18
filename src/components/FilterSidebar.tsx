import { Role, ExperienceLevel, Timeline } from '@/types/project';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Separator } from './ui/separator';

export interface FilterState {
  roles: Role[];
  experienceLevels: ExperienceLevel[];
  timelines: Timeline[];
  techStack: string[];
}

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  projectCounts: {
    total: number;
    byRole: Record<Role, number>;
    byExperience: Record<ExperienceLevel, number>;
    byTimeline: Record<Timeline, number>;
  };
}

const roleOptions: { value: Role; label: string }[] = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'fullstack', label: 'Fullstack' },
  { value: 'designer', label: 'Designer' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'product', label: 'Product' },
  { value: 'other', label: 'Other' },
];

const experienceOptions: { value: ExperienceLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

const timelineOptions: { value: Timeline; label: string }[] = [
  { value: '1-3 months', label: '1-3 months' },
  { value: '3-6 months', label: '3-6 months' },
  { value: '6+ months', label: '6+ months' },
  { value: 'ongoing', label: 'Ongoing' },
];

export function FilterSidebar({ filters, onFilterChange, projectCounts }: FilterSidebarProps) {
  const toggleRole = (role: Role) => {
    const newRoles = filters.roles.includes(role)
      ? filters.roles.filter(r => r !== role)
      : [...filters.roles, role];
    onFilterChange({ ...filters, roles: newRoles });
  };

  const toggleExperience = (level: ExperienceLevel) => {
    const newLevels = filters.experienceLevels.includes(level)
      ? filters.experienceLevels.filter(l => l !== level)
      : [...filters.experienceLevels, level];
    onFilterChange({ ...filters, experienceLevels: newLevels });
  };

  const toggleTimeline = (timeline: Timeline) => {
    const newTimelines = filters.timelines.includes(timeline)
      ? filters.timelines.filter(t => t !== timeline)
      : [...filters.timelines, timeline];
    onFilterChange({ ...filters, timelines: newTimelines });
  };

  return (
    <div className="w-64 glass-panel rounded-xl p-6 h-fit sticky top-6">
      <div className="mb-6">
        <h2 className="text-lg font-display font-bold text-white mb-1">Filters</h2>
        <p className="text-xs text-gray-400 font-mono">{projectCounts.total} projects</p>
      </div>

      {/* Role Filters */}
      <div className="mb-6">
        <h3 className="text-sm font-sans font-semibold text-gray-300 mb-3">Role</h3>
        <div className="space-y-2.5">
          {roleOptions.map(option => (
            <div key={option.value} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`role-${option.value}`}
                  checked={filters.roles.includes(option.value)}
                  onCheckedChange={() => toggleRole(option.value)}
                  className="border-white/20 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                />
                <Label
                  htmlFor={`role-${option.value}`}
                  className="text-sm font-sans text-gray-300 cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
              <span className="text-xs font-mono text-gray-500">
                {projectCounts.byRole[option.value] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Separator className="my-6 bg-white/10" />

      {/* Experience Level Filters */}
      <div className="mb-6">
        <h3 className="text-sm font-sans font-semibold text-gray-300 mb-3">Experience Level</h3>
        <div className="space-y-2.5">
          {experienceOptions.map(option => (
            <div key={option.value} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`exp-${option.value}`}
                  checked={filters.experienceLevels.includes(option.value)}
                  onCheckedChange={() => toggleExperience(option.value)}
                  className="border-white/20 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                />
                <Label
                  htmlFor={`exp-${option.value}`}
                  className="text-sm font-sans text-gray-300 cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
              <span className="text-xs font-mono text-gray-500">
                {projectCounts.byExperience[option.value] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Separator className="my-6 bg-white/10" />

      {/* Timeline Filters */}
      <div>
        <h3 className="text-sm font-sans font-semibold text-gray-300 mb-3">Timeline</h3>
        <div className="space-y-2.5">
          {timelineOptions.map(option => (
            <div key={option.value} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`timeline-${option.value}`}
                  checked={filters.timelines.includes(option.value)}
                  onCheckedChange={() => toggleTimeline(option.value)}
                  className="border-white/20 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                />
                <Label
                  htmlFor={`timeline-${option.value}`}
                  className="text-sm font-sans text-gray-300 cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
              <span className="text-xs font-mono text-gray-500">
                {projectCounts.byTimeline[option.value] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
