import React, { useState } from 'react';
import { Search, Bookmark } from 'lucide-react';
import { API_BASE_URL } from '../../utils/config';

export const AdvancedSearchPage: React.FC = () => {
  const [jqlQuery, setJqlQuery] = useState('project = OB AND status = "In Progress"');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const presets = [
    { title: 'My High Priority Issues', query: 'priority = High AND status != Done' },
    { title: 'Unassigned Bugs Backlog', query: 'assignee = null AND type = Bug' },
    { title: 'Active Sprint Blockers', query: 'status = Testing OR status = Blocked' },
  ];

  const handleSearch = async (queryToUse?: string) => {
    const q = queryToUse || jqlQuery;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/tasks?search=${encodeURIComponent(q)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (err) {
      console.error('Failed JQL search:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Advanced Search & Saved Filters</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Structured issue query engine (JQL-style search)</p>
      </div>

      {/* Query Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Search Query (JQL)</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={jqlQuery}
            onChange={(e) => setJqlQuery(e.target.value)}
            placeholder="e.g. project = OB AND priority = High..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <Search className="w-4 h-4" /> Search
          </button>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-semibold text-gray-400 mr-1 flex items-center gap-1">
            <Bookmark className="w-3.5 h-3.5" /> Saved Filters:
          </span>
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setJqlQuery(preset.query);
                handleSearch(preset.query);
              }}
              className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-medium transition-colors"
            >
              {preset.title}
            </button>
          ))}
        </div>
      </div>

      {/* Results Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Query Results ({results.length})</h3>

        {loading ? (
          <div className="py-12 text-center text-gray-400">Running query search...</div>
        ) : results.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">No matching issues found for query.</p>
        ) : (
          <div className="space-y-2">
            {results.map((task) => (
              <div
                key={task.id}
                className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 flex items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-[10px]">
                      {task.issueKey || `TASK-${task.id}`}
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white truncate">{task.title}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{task.description || 'No description'}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-2.5 py-1 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-[10px]">
                    {task.priority}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-600 text-white font-semibold text-[10px]">
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
