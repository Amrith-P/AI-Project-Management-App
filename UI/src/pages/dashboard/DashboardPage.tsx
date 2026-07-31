import React from 'react';
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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const taskData = [
  { name: 'Mon', completed: 12, added: 15 },
  { name: 'Tue', completed: 19, added: 13 },
  { name: 'Wed', completed: 15, added: 18 },
  { name: 'Thu', completed: 22, added: 12 },
  { name: 'Fri', completed: 25, added: 20 },
  { name: 'Sat', completed: 10, added: 5 },
  { name: 'Sun', completed: 14, added: 8 },
];

const projectStatusData = [
  { name: 'On Track', value: 60 },
  { name: 'At Risk', value: 25 },
  { name: 'Delayed', value: 15 },
];

const COLORS = ['#4f46e5', '#f59e0b', '#ef4444'];

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
          Create Project
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Active Tasks', value: '42', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
          { title: 'Total Projects', value: '12', icon: FolderKanban, color: 'text-indigo-600', bg: 'bg-indigo-100' },
          { title: 'Team Members', value: '8', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
          { title: 'Pending Review', value: '15', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white overflow-hidden shadow-sm border border-gray-100 rounded-lg">
              <div className="p-5 flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-md ${card.bg}`}>
                  <Icon className={`h-6 w-6 ${card.color}`} aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">{card.title}</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{card.value}</dd>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 lg:col-span-2">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Task Completion (Last 7 Days)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={taskData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Line type="monotone" dataKey="completed" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="added" stroke="#9ca3af" strokeWidth={3} dot={{ r: 4, fill: '#9ca3af', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Project Health</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `${value}%`}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-center space-x-6">
            {projectStatusData.map((item, index) => (
              <div key={item.name} className="flex items-center text-sm">
                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className="text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
