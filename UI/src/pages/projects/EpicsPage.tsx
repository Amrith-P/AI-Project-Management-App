import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layers, Plus, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../../utils/config';

interface Epic {
  id: number;
  key: string;
  name: string;
  summary: string;
  color: string;
  status: string;
  totalTasks: number;
  completedTasks: number;
  progress: number;
}

export const EpicsPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const [epics, setEpics] = useState<Epic[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [summary, setSummary] = useState('');
  const [color, setColor] = useState('#6366f1');

  const fetchEpics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/epics/project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEpics(data);
      }
    } catch (err) {
      console.error('Failed to fetch epics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchEpics();
  }, [projectId]);

  const handleCreateEpic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/epics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId: Number(projectId),
          name,
          summary,
          color,
        }),
      });

      if (res.ok) {
        setName('');
        setSummary('');
        setIsModalOpen(false);
        fetchEpics();
      }
    } catch (err) {
      console.error('Failed to create epic:', err);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <Link
            to={`/projects/${projectId}`}
            className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Project
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-md shadow-purple-500/20">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Project Epics</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">High-level strategic initiatives and feature milestones</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Epic
        </button>
      </div>

      {/* Epics List / Grid */}
      {loading ? (
        <div className="py-16 text-center text-gray-400">Loading project epics...</div>
      ) : epics.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-3">
          <Layers className="w-10 h-10 mx-auto text-purple-400" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">No Epics Created Yet</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Group related stories and tasks under an Epic to track strategic project milestones.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {epics.map((epic) => (
            <div
              key={epic.id}
              className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold text-white font-mono uppercase"
                      style={{ backgroundColor: epic.color || '#6366f1' }}
                    >
                      {epic.key}
                    </span>
                    <h3 className="font-bold text-base text-gray-900 dark:text-white">{epic.name}</h3>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{epic.summary || 'No summary provided.'}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-gray-500 dark:text-gray-400">Completion Progress</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {epic.completedTasks}/{epic.totalTasks} Tasks ({epic.progress}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${epic.progress}%`, backgroundColor: epic.color || '#6366f1' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Epic Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateEpic} className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Create Strategic Epic</h3>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Epic Name</label>
              <input
                type="text"
                required
                placeholder="e.g. User Authentication & Security"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Summary / Description</label>
              <textarea
                rows={3}
                placeholder="Overview of this epic feature goal..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Theme Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-10 rounded-lg bg-transparent cursor-pointer"
                />
                <span className="text-xs font-mono text-slate-400">{color}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs"
              >
                Create Epic
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
