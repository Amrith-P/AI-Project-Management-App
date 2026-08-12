import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import type { Task } from '../../types/task';

interface GanttTimelineViewProps {
  tasks: Task[];
}

export const GanttTimelineView: React.FC<GanttTimelineViewProps> = ({ tasks }) => {
  if (tasks.length === 0) {
    return (
      <div className="py-16 text-center text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
        <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30 text-indigo-500" />
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">No Tasks for Timeline View</h3>
        <p className="text-xs text-gray-400 mt-1">Add tasks with due dates to visualize project schedules on the Gantt chart.</p>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500 text-white';
      case 'High': return 'bg-amber-500 text-white';
      case 'Medium': return 'bg-indigo-500 text-white';
      default: return 'bg-slate-400 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done': return 'bg-emerald-500';
      case 'Testing': return 'bg-purple-500';
      case 'Doing': return 'bg-indigo-600';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Project Schedule & Gantt Timeline
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Visual schedule mapping task deadlines and delivery milestones.</p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-gray-500"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> In Progress</span>
          <span className="flex items-center gap-1 text-gray-500"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Completed</span>
          <span className="flex items-center gap-1 text-gray-500"><span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Backlog</span>
        </div>
      </div>

      {/* Gantt Chart Table */}
      <div className="space-y-3">
        {tasks.map((t, idx) => {
          const checklistTotal = t.checklist ? t.checklist.length : 0;
          const checklistDone = t.checklist ? t.checklist.filter(c => c.completed).length : 0;
          const progressPct = checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : (t.status === 'Done' ? 100 : 30);

          return (
            <div key={t.id || idx} className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getPriorityColor(t.priority)}`}>
                    {t.priority}
                  </span>
                  <span className="font-semibold text-xs text-gray-900 dark:text-white truncate max-w-md">{t.title}</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  {t.dueDate && (
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      Due: {new Date(t.dueDate).toLocaleDateString()}
                    </span>
                  )}
                  <span className="font-bold text-gray-700 dark:text-gray-300">{t.status}</span>
                </div>
              </div>

              {/* Progress Bar Timeline Representation */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden relative">
                <div
                  className={`h-full ${getStatusColor(t.status)} rounded-full transition-all duration-500`}
                  style={{ width: `${progressPct}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
