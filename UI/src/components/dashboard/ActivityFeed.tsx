import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchActivities } from '../../store/slices/activitySlice';
import { Activity, FolderKanban, CheckSquare, MessageSquare, RefreshCw } from 'lucide-react';

export const ActivityFeed: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { activities, isLoading } = useSelector((state: RootState) => state.activities);

  useEffect(() => {
    dispatch(fetchActivities());
  }, [dispatch]);

  const getActionIcon = (action: string) => {
    if (action.includes('Project')) return <FolderKanban className="w-4 h-4 text-indigo-600" />;
    if (action.includes('Task')) return <CheckSquare className="w-4 h-4 text-blue-600" />;
    if (action.includes('Comment')) return <MessageSquare className="w-4 h-4 text-purple-600" />;
    return <Activity className="w-4 h-4 text-emerald-600" />;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div className="flex justify-between items-center pb-3 border-b border-gray-100">
        <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-600" />
          Recent Activity Log
        </h3>
        <button
          onClick={() => dispatch(fetchActivities())}
          className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-50 transition-colors"
          title="Refresh Feed"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {isLoading && activities.length === 0 ? (
        <div className="py-8 text-center text-gray-400 text-sm">Loading activity timeline...</div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
          No activity recorded yet. Create projects or tasks to populate the feed!
        </div>
      ) : (
        <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
          {activities.map((act) => (
            <div key={act.id} className="flex items-start gap-3 text-sm group">
              <div className="p-2 rounded-xl bg-gray-50 border border-gray-100 group-hover:border-indigo-200 group-hover:bg-indigo-50/40 transition-all shrink-0 mt-0.5">
                {getActionIcon(act.action)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline gap-2">
                  <span className="font-semibold text-gray-900 text-xs truncate">{act.action}</span>
                  <span className="text-[11px] text-gray-400 shrink-0">
                    {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{act.details}</p>
                {act.projectName && (
                  <span className="inline-block mt-1 text-[10px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {act.projectName}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
