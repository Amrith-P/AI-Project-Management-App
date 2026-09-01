import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Rocket, Plus, ArrowLeft, Calendar } from 'lucide-react';
import { API_BASE_URL } from '../../utils/config';

interface Version {
  id: number;
  name: string;
  description: string;
  startDate: string;
  releaseDate: string;
  status: 'Unreleased' | 'Released' | 'Archived';
  totalTasks: number;
  completedTasks: number;
  progress: number;
}

export const ReleasesPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [releaseDate, setReleaseDate] = useState('');

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/versions/project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setVersions(data);
      }
    } catch (err) {
      console.error('Failed to fetch releases/versions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchVersions();
  }, [projectId]);

  const handleCreateVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/versions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId: Number(projectId),
          name,
          description,
          releaseDate,
          status: 'Unreleased',
        }),
      });

      if (res.ok) {
        setName('');
        setDescription('');
        setReleaseDate('');
        setIsModalOpen(false);
        fetchVersions();
      }
    } catch (err) {
      console.error('Failed to create release version:', err);
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
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <Rocket className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Releases & Versions</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Track production release versions and deployment readiness</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Version
        </button>
      </div>

      {/* Versions List */}
      {loading ? (
        <div className="py-16 text-center text-gray-400">Loading release versions...</div>
      ) : versions.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-3">
          <Rocket className="w-10 h-10 mx-auto text-indigo-400" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">No Releases Configured</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Group completed tasks into release versions (e.g., v1.0.0, v2.1.0) for production deployments.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {versions.map((ver) => (
            <div
              key={ver.id}
              className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold text-xs font-mono">
                    {ver.name}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      ver.status === 'Released'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {ver.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{ver.description || 'No release notes.'}</p>
              </div>

              {/* Progress & Target Date */}
              <div className="flex items-center gap-6 shrink-0">
                {ver.releaseDate && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    Target: {new Date(ver.releaseDate).toLocaleDateString()}
                  </div>
                )}

                <div className="w-36 space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                    <span>{ver.progress}% Done</span>
                    <span>{ver.completedTasks}/{ver.totalTasks}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${ver.progress}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Version Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateVersion} className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Create Release Version</h3>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Version Name</label>
              <input
                type="text"
                required
                placeholder="e.g. v1.0.0-rc1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Description / Release Goal</label>
              <textarea
                rows={3}
                placeholder="Release notes overview..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Target Release Date</label>
              <input
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
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
                Create Release
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
