import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Badge } from "./ui/badge";

interface ProjectAnalyticsProps {
  tasks: any[];
}

export function ProjectAnalytics({ tasks }: ProjectAnalyticsProps) {
  const statusData = [
    { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length },
    { name: 'Ongoing', value: tasks.filter(t => t.status === 'ongoing').length },
    { name: 'In Review', value: tasks.filter(t => t.status === 'in-review').length },
    { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length },
  ];

  const priorityData = [
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length, color: '#94a3b8' },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, color: '#22d3ee' },
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length, color: '#fbbf24' },
    { name: 'Urgent', value: tasks.filter(t => t.priority === 'urgent').length, color: '#f87171' },
  ];

  const completionRate = tasks.length > 0 
    ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) 
    : 0;

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-6 rounded-xl border border-white/10">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1 font-mono">Completion Rate</p>
          <div className="flex items-end gap-3">
            <h3 className="text-3xl font-display font-bold text-white">{completionRate}%</h3>
            <div className="w-full bg-white/5 h-2 rounded-full mb-2 overflow-hidden">
                <div className="bg-cyan-500 h-full transition-all duration-500" style={{ width: `${completionRate}%` }} />
            </div>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-xl border border-white/10">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1 font-mono">Total Tasks</p>
          <h3 className="text-3xl font-display font-bold text-white">{tasks.length}</h3>
        </div>
        <div className="glass-panel p-6 rounded-xl border border-white/10">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1 font-mono">Pending Reviews</p>
          <h3 className="text-3xl font-display font-bold text-amber-400">
            {tasks.filter(t => t.status === 'in-review').length}
          </h3>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Status Breakdown */}
        <div className="glass-panel p-6 rounded-xl border border-white/10">
          <h4 className="text-white font-display font-semibold mb-6">Task Status distribution</h4>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B0E14', border: '1px solid #ffffff20', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="glass-panel p-6 rounded-xl border border-white/10">
          <h4 className="text-white font-display font-semibold mb-6">Priority breakdown</h4>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B0E14', border: '1px solid #ffffff20', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 flex-wrap mt-4">
              {priorityData.map(p => (
                  <div key={p.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="text-xs text-gray-400">{p.name}</span>
                  </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
