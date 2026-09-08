import React, { useEffect, useState } from 'react';
import { ShieldCheck, Clock, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../../utils/config';

interface AuditLog {
  id: number;
  userId?: number;
  userName: string;
  action: string;
  entityType?: string;
  entityId?: number;
  details: string;
  createdAt: string;
}

export const AuditLogsTab: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchAuditLogs = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/audit-logs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } catch (err) {
        console.error('Failed to fetch audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAuditLogs();
  }, []);

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.userName.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            Security & Audit Trail
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Immutable system logs for user actions, permissions, and security events
          </p>
        </div>

        <input
          type="text"
          placeholder="Filter audit logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
        />
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-400">Loading audit trail...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-2">
          <AlertCircle className="w-8 h-8 mx-auto text-gray-400" />
          <p className="text-xs text-gray-500">No audit logs found matching criteria.</p>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 flex items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[10px]">
                    {log.action}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">{log.userName}</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{log.details || 'No additional details.'}</p>
              </div>

              <span className="text-[10px] text-gray-400 font-mono shrink-0 flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-400" />
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
