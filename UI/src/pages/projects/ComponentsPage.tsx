import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Cpu, Plus, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../../utils/config';

interface ComponentItem {
  id: number;
  name: string;
  description: string;
  leadName?: string;
  taskCount: number;
}

export const ComponentsPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchComponents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/components/project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setComponents(data);
      }
    } catch (err) {
      console.error('Failed to fetch components:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchComponents();
  }, [projectId]);

  const handleCreateComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/components`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId: Number(projectId),
          name,
          description,
        }),
      });

      if (res.ok) {
        setName('');
        setDescription('');
        setIsModalOpen(false);
        fetchComponents();
      }
    } catch (err) {
      console.error('Failed to create component:', err);
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
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Project Components</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Logical subsystems (e.g. Authentication, Payments, UI)</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Component
        </button>
      </div>

      {/* Components Grid */}
      {loading ? (
        <div className="py-16 text-center text-gray-400">Loading project components...</div>
      ) : components.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-3">
          <Cpu className="w-10 h-10 mx-auto text-purple-400" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">No Components Created</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Organize architecture tasks into logical system modules for better team component leads.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {components.map((comp) => (
            <div
              key={comp.id}
              className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-500" />
                  {comp.name}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-xs">
                  {comp.taskCount} Tasks
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{comp.description || 'No component details.'}</p>
            </div>
          ))}
        </div>
      )}

      {/* Create Component Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateComponent} className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Create Component Module</h3>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Component Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Authentication, Backend API, Payments"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Description</label>
              <textarea
                rows={3}
                placeholder="Subsystem architecture details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs"
              >
                Create Component
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
