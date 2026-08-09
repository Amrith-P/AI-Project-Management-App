import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchProjects } from '../../store/slices/projectSlice';
import { fetchUserAllTasks } from '../../store/slices/taskSlice';
import { fetchTeam } from '../../store/slices/teamSlice';
import { 
  CheckCircle, 
  FolderKanban, 
  Users, 
  Clock
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { Link } from 'react-router-dom';
import { ActivityFeed } from '../../components/dashboard/ActivityFeed';

const taskCompletionTrendData = [
  { name: 'Mon', completed: 4, added: 6 },
  { name: 'Tue', completed: 8, added: 5 },
  { name: 'Wed', completed: 12, added: 9 },
  { name: 'Thu', completed: 15, added: 7 },
  { name: 'Fri', completed: 19, added: 11 },
  { name: 'Sat', completed: 21, added: 4 },
  { name: 'Sun', completed: 25, added: 6 },
];

export const DashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { projects } = useSelector((state: RootState) => state.projects);
  const { tasks } = useSelector((state: RootState) => state.tasks);
  const { members } = useSelector((state: RootState) => state.team);

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchUserAllTasks());
    dispatch(fetchTeam());
  }, [dispatch]);

  const completedTasksCount = tasks.filter(t => t.status === 'Done').length;
  const inProgressTasksCount = tasks.filter(t => t.status === 'Doing' || t.status === 'Testing').length;
  const activeProjectsCount = projects.filter(p => p.status === 'Active').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Workspace Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time overview of AI project management and team velocity.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/projects"
            className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-sm transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            <FolderKanban className="w-4 h-4" />
            Explore Projects
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Total Projects', value: projects.length, label: `${activeProjectsCount} Active`, icon: FolderKanban, color: 'text-indigo-600', bg: 'bg-indigo-100' },
          { title: 'Completed Tasks', value: completedTasksCount, label: `${tasks.length} Total Tasks`, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { title: 'In Progress', value: inProgressTasksCount, label: 'Active Kanban Tasks', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
          { title: 'Team Members', value: members.length, label: 'Collaborators', icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 flex items-center justify-between transition-all hover:shadow-md">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400">{card.title}</dt>
                <dd className="text-2xl font-extrabold text-gray-900 mt-1">{card.value}</dd>
                <span className="text-[11px] font-medium text-gray-500">{card.label}</span>
              </div>
              <div className={`p-3 rounded-2xl ${card.bg} ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Charts & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Task Completion Trend */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-gray-900">Task Velocity & Completion Trend</h2>
              <p className="text-xs text-gray-500">Weekly breakdown of completed vs created task backlog.</p>
            </div>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              +18% Velocity
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={taskCompletionTrendData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Line type="monotone" dataKey="completed" name="Completed" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5' }} />
                <Line type="monotone" dataKey="added" name="Added Tasks" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Feed Sidebar */}
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>

      </div>
    </div>
  );
};
