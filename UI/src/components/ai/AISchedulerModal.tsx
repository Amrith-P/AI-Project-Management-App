import React, { useState } from 'react';
import { X, Sparkles, UserCheck, Calendar, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../../utils/config';

interface Reassignment {
  taskId: number;
  taskTitle: string;
  priority: string;
  suggestedAssigneeId: number;
  suggestedAssigneeName: string;
  suggestedDueDate: string;
  reason: string;
}

interface AISchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  onApplySchedule: () => void;
}

export const AISchedulerModal: React.FC<AISchedulerModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onApplySchedule,
}) => {
  const [loading, setLoading] = useState(false);
  const [scheduleData, setScheduleData] = useState<{
    summary: string;
    reassignments: Reassignment[];
    dependencyWarnings: string[];
  } | null>(null);
  const [applied, setApplied] = useState(false);

  const fetchAISchedule = async () => {
    setLoading(true);
    setApplied(false);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/ai/auto-schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      if (res.ok) {
        setScheduleData(data);
      }
    } catch (err) {
      console.error('Failed to fetch AI Schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      fetchAISchedule();
    }
  }, [isOpen, projectId]);

  const handleApply = async () => {
    if (!scheduleData || scheduleData.reassignments.length === 0) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      for (const item of scheduleData.reassignments) {
        await fetch(`${API_BASE_URL}/tasks/${item.taskId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            assigneeId: item.suggestedAssigneeId,
            dueDate: item.suggestedDueDate,
          }),
        });
      }
      setApplied(true);
      setTimeout(() => {
        onApplySchedule();
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to apply AI schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">AI Autonomous Task Scheduler</h3>
              <p className="text-xs text-slate-400">Workload balancer & deadline optimizer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-slate-400">Analyzing team capacity & task backlog...</p>
            </div>
          ) : scheduleData ? (
            <>
              {/* Summary Card */}
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-sm">
                <p className="font-medium text-white mb-1">⚡ AI Allocation Overview</p>
                <p className="text-xs text-indigo-300/90 leading-relaxed">{scheduleData.summary}</p>
              </div>

              {/* Dependency Warnings */}
              {scheduleData.dependencyWarnings.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
                    <AlertTriangle className="w-4 h-4" /> Potential Risks & Warnings
                  </div>
                  <ul className="text-xs space-y-1 pl-5 list-disc text-amber-200/90">
                    {scheduleData.dependencyWarnings.map((warn, i) => (
                      <li key={i}>{warn}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Reassignments List */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Recommended Assignments ({scheduleData.reassignments.length})
                </h4>

                {scheduleData.reassignments.length === 0 ? (
                  <div className="p-6 text-center rounded-xl bg-slate-800/40 border border-slate-800 text-slate-400 text-sm">
                    All tasks are currently assigned! No reallocations needed.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {scheduleData.reassignments.map((item) => (
                      <div
                        key={item.taskId}
                        className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between gap-4"
                      >
                        <div className="space-y-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{item.taskTitle}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1 text-emerald-400">
                              <UserCheck className="w-3.5 h-3.5" /> {item.suggestedAssigneeName}
                            </span>
                            <span className="flex items-center gap-1 text-purple-400">
                              <Calendar className="w-3.5 h-3.5" /> Due {item.suggestedDueDate}
                            </span>
                          </div>
                        </div>

                        <span className="shrink-0 px-2.5 py-1 rounded-full bg-slate-700 text-[10px] font-medium text-slate-300">
                          {item.reason}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          {applied ? (
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium animate-bounce">
              <CheckCircle2 className="w-4 h-4" /> AI Schedule Applied!
            </div>
          ) : (
            <button
              onClick={handleApply}
              disabled={loading || !scheduleData || scheduleData.reassignments.length === 0}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-medium text-sm shadow-lg shadow-purple-500/25 disabled:opacity-50 flex items-center gap-2 transition-all"
            >
              Apply AI Schedule <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
