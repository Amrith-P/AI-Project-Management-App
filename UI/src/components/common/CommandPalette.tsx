import React, { useState, useEffect } from 'react';
import { Search, FolderKanban, Plus, BarChart3, Settings, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../utils/config';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateTask?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenCreateTask,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    projects: any[];
    tasks: any[];
  }>({ projects: [], tasks: [] });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled externally or toggled
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults({ projects: [], tasks: [] });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/tasks?search=${encodeURIComponent(query)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const tasks = await res.json();
          setSearchResults((prev) => ({ ...prev, tasks: tasks.slice(0, 5) }));
        }
      } catch (err) {
        console.error('Command palette search error:', err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800">
          <Search className="w-5 h-5 text-indigo-400 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search issues (e.g. OB-101, Dashboard, Settings)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-white text-sm focus:outline-none placeholder-slate-500 font-medium"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Navigation Commands */}
        <div className="p-4 space-y-4 max-h-[65vh] overflow-y-auto">
          {!query && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">
                Quick Navigation & Actions
              </h4>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenCreateTask) onOpenCreateTask();
                  }}
                  className="w-full px-3 py-2.5 rounded-xl hover:bg-slate-800/80 flex items-center justify-between text-xs text-slate-200 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <Plus className="w-4 h-4 text-emerald-400" /> Create New Issue
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Press C</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    navigate('/projects');
                  }}
                  className="w-full px-3 py-2.5 rounded-xl hover:bg-slate-800/80 flex items-center justify-between text-xs text-slate-200 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <FolderKanban className="w-4 h-4 text-indigo-400" /> Go to Projects List
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </button>

                <button
                  onClick={() => {
                    onClose();
                    navigate('/analytics');
                  }}
                  className="w-full px-3 py-2.5 rounded-xl hover:bg-slate-800/80 flex items-center justify-between text-xs text-slate-200 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <BarChart3 className="w-4 h-4 text-purple-400" /> Open Analytics & Reports
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </button>

                <button
                  onClick={() => {
                    onClose();
                    navigate('/settings');
                  }}
                  className="w-full px-3 py-2.5 rounded-xl hover:bg-slate-800/80 flex items-center justify-between text-xs text-slate-200 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <Settings className="w-4 h-4 text-amber-400" /> System Settings & Webhooks
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>
            </div>
          )}

          {/* Search Results */}
          {query && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">
                Matching Issues
              </h4>
              {searchResults.tasks.length === 0 ? (
                <p className="text-xs text-slate-500 italic px-2 py-3">No matching issues found.</p>
              ) : (
                <div className="space-y-1">
                  {searchResults.tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => {
                        onClose();
                        navigate(`/projects/${task.projectId}`);
                      }}
                      className="cursor-pointer p-3 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 font-mono font-bold text-[10px]">
                            {task.issueKey || `TASK-${task.id}`}
                          </span>
                          <span className="font-semibold text-white truncate">{task.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{task.projectName || 'Project'}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] shrink-0 font-medium">
                        {task.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>Use &uarr; &darr; to navigate, Esc to close</span>
          <span className="font-mono text-slate-400">Cmd + K</span>
        </div>
      </div>
    </div>
  );
};
