import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchProjects } from '../../store/slices/projectSlice';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/config';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Users,
  Filter,
  RefreshCw,
  PieChart
} from 'lucide-react';

import { TimeTrackingReportCard } from '../../components/analytics/TimeTrackingReportCard';

interface AnalyticsData {
  totalTasks: number;
  statusCounts: { Todo: number; Doing: number; Testing: number; Done: number };
  priorityCounts: { High: number; Medium: number; Low: number };
  completionRate: number;
  totalEstimated: number;
  totalSpent: number;
  assigneeWorkload: Array<{ name: string; total: number; completed: number; spentHours: number }>;
}

export const AnalyticsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const projects = useSelector((state: RootState) => state.projects.projects);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/projects/${selectedProjectId}/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [selectedProjectId]);

  const exportCSV = () => {
    if (!data) return;
    const rows = [
      ['Metric', 'Value'],
      ['Total Tasks', data.totalTasks],
      ['Completion Rate (%)', `${data.completionRate}%`],
      ['Todo Tasks', data.statusCounts.Todo],
      ['Doing Tasks', data.statusCounts.Doing],
      ['Testing Tasks', data.statusCounts.Testing],
      ['Done Tasks', data.statusCounts.Done],
      ['High Priority', data.priorityCounts.High],
      ['Medium Priority', data.priorityCounts.Medium],
      ['Low Priority', data.priorityCounts.Low],
      ['Total Estimated Hours', data.totalEstimated],
      ['Total Spent Hours', data.totalSpent],
      [],
      ['Assignee', 'Total Tasks', 'Completed', 'Spent Hours'],
      ...data.assigneeWorkload.map(w => [w.name, w.total, w.completed, w.spentHours])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Project_Analytics_${selectedProjectId}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-black tracking-tight">Enterprise Analytics Dashboard</h1>
          </div>
          <p className="text-xs text-indigo-200 mt-1">
            Real-time project velocity, workload distribution, and task completion metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Project Selector */}
          <div className="relative">
            <Filter className="w-4 h-4 text-indigo-300 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="pl-9 pr-8 py-2 text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl focus:outline-none focus:bg-white/20 appearance-none cursor-pointer"
            >
              <option value="all" className="text-gray-900">All Projects Overview</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="text-gray-900">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={loadAnalytics}
            className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-colors text-white"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={exportCSV}
            disabled={!data}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-3" />
          <p className="text-sm font-medium">Aggregating project telemetry & metrics...</p>
        </div>
      ) : !data ? (
        <div className="py-12 text-center text-gray-500">Failed to load analytics data.</div>
      ) : (
        <>
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-gray-400 block uppercase">Total Tasks</span>
                <span className="text-2xl font-black text-gray-900 mt-1 block">{data.totalTasks}</span>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <BarChart3 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-gray-400 block uppercase">Completion Velocity</span>
                <span className="text-2xl font-black text-emerald-600 mt-1 block">{data.completionRate}%</span>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-gray-400 block uppercase">Spent vs Estimated</span>
                <span className="text-2xl font-black text-gray-900 mt-1 block">
                  {data.totalSpent} <span className="text-xs text-gray-400 font-medium">/ {data.totalEstimated} hrs</span>
                </span>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-gray-400 block uppercase">Completed Tasks</span>
                <span className="text-2xl font-black text-indigo-600 mt-1 block">{data.statusCounts.Done}</span>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Time Tracking & Billing Report Card */}
          <TimeTrackingReportCard projectId={selectedProjectId === 'all' ? Number(projects[0]?.id || 1) : Number(selectedProjectId)} />

          {/* Visual Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Status Breakdown Chart */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-indigo-600" />
                  Task Status Breakdown
                </h3>
                <span className="text-xs text-gray-400">Current Distribution</span>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { label: 'Todo', count: data.statusCounts.Todo, color: 'bg-slate-400', barBg: 'bg-slate-100' },
                  { label: 'In Progress', count: data.statusCounts.Doing, color: 'bg-amber-500', barBg: 'bg-amber-100' },
                  { label: 'Testing', count: data.statusCounts.Testing, color: 'bg-indigo-500', barBg: 'bg-indigo-100' },
                  { label: 'Done', count: data.statusCounts.Done, color: 'bg-emerald-500', barBg: 'bg-emerald-100' },
                ].map((item) => {
                  const pct = data.totalTasks > 0 ? Math.round((item.count / data.totalTasks) * 100) : 0;
                  return (
                    <div key={item.label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-gray-700">{item.label}</span>
                        <span className="text-gray-500 font-bold">{item.count} ({pct}%)</span>
                      </div>
                      <div className={`w-full h-3 rounded-full ${item.barBg} overflow-hidden`}>
                        <div
                          className={`h-full ${item.color} rounded-full transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Priority Distribution */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  Priority Distribution
                </h3>
                <span className="text-xs text-gray-400">Risk Matrix</span>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { label: 'High Priority', count: data.priorityCounts.High, color: 'bg-red-500', barBg: 'bg-red-100' },
                  { label: 'Medium Priority', count: data.priorityCounts.Medium, color: 'bg-amber-500', barBg: 'bg-amber-100' },
                  { label: 'Low Priority', count: data.priorityCounts.Low, color: 'bg-blue-500', barBg: 'bg-blue-100' },
                ].map((item) => {
                  const pct = data.totalTasks > 0 ? Math.round((item.count / data.totalTasks) * 100) : 0;
                  return (
                    <div key={item.label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-gray-700">{item.label}</span>
                        <span className="text-gray-500 font-bold">{item.count} ({pct}%)</span>
                      </div>
                      <div className={`w-full h-3 rounded-full ${item.barBg} overflow-hidden`}>
                        <div
                          className={`h-full ${item.color} rounded-full transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Team Workload Table */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                Team Workload & Capacity Metrics
              </h3>
              <span className="text-xs text-gray-400">{data.assigneeWorkload.length} Assignees</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs uppercase font-bold text-gray-400 tracking-wider">
                    <th className="pb-3 pl-2">Assignee</th>
                    <th className="pb-3">Assigned Tasks</th>
                    <th className="pb-3">Completed</th>
                    <th className="pb-3">Spent Hours</th>
                    <th className="pb-3 pr-2">Completion Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {data.assigneeWorkload.map((w, idx) => {
                    const rate = w.total > 0 ? Math.round((w.completed / w.total) * 100) : 0;
                    return (
                      <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 pl-2 font-semibold text-gray-900">{w.name}</td>
                        <td className="py-3 text-gray-600">{w.total}</td>
                        <td className="py-3 text-emerald-600 font-semibold">{w.completed}</td>
                        <td className="py-3 text-gray-600">{w.spentHours} hrs</td>
                        <td className="py-3 pr-2">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-indigo-600 h-full rounded-full"
                                style={{ width: `${rate}%` }}
                              ></div>
                            </div>
                            <span className="font-bold text-gray-700">{rate}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
