import React, { useState, useEffect } from 'react';
import { X, Clock, Plus } from 'lucide-react';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/apiHeaders';

interface SLARule {
  id?: number;
  issueType: string;
  priority: string;
  responseHours: number;
  resolutionHours: number;
}

interface SLAManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
}

export const SLAManagerModal: React.FC<SLAManagerModalProps> = ({
  isOpen,
  onClose,
  projectId
}) => {
  const [slas, setSlas] = useState<SLARule[]>([]);
  const [issueType, setIssueType] = useState('Bug');
  const [priority, setPriority] = useState('High');
  const [responseHours, setResponseHours] = useState(4);
  const [resolutionHours, setResolutionHours] = useState(24);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (isOpen && projectId) {
      fetchSlas();
    }
  }, [isOpen, projectId]);

  const fetchSlas = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`http://localhost:5001/api/slas/project/${projectId}`, getAuthHeaders());
      setSlas(res.data || []);
    } catch (err) {
      console.error('Failed to fetch SLAs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSla = async () => {
    try {
      setIsSaving(true);
      const res = await axios.post(
        'http://localhost:5001/api/slas',
        {
          projectId,
          issueType,
          priority,
          responseHours: Number(responseHours),
          resolutionHours: Number(resolutionHours)
        },
        getAuthHeaders()
      );
      setSlas(res.data || []);
      setMsg('SLA rule updated!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.error('Failed to save SLA rule:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                SLA & Service Desk Manager
              </h2>
              <p className="text-xs text-slate-500">Configure response & resolution time limits for Incident & Bug tickets</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Add / Edit Form */}
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Issue Type</label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm"
                >
                  <option value="Bug">Bug / Defect</option>
                  <option value="Incident">Incident</option>
                  <option value="Task">Task</option>
                  <option value="Story">Story</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm"
                >
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Response SLA (Hours)</label>
                <input
                  type="number"
                  min="1"
                  value={responseHours}
                  onChange={(e) => setResponseHours(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Resolution SLA (Hours)</label>
                <input
                  type="number"
                  min="1"
                  value={resolutionHours}
                  onChange={(e) => setResolutionHours(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              {msg && <span className="text-xs text-emerald-600 font-semibold">{msg}</span>}
              <button
                onClick={handleSaveSla}
                disabled={isSaving}
                className="ml-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm rounded-lg transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Set SLA Rule'}
              </button>
            </div>
          </div>

          {/* Active Rules List */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Active SLA Rules ({slas.length})
            </h4>
            {isLoading ? (
              <div className="text-center py-6 text-slate-400 text-xs">Loading SLA rules...</div>
            ) : (
              <div className="space-y-2">
                {slas.map((s, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{s.issueType}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-400">
                        {s.priority}
                      </span>
                    </div>
                    <div className="flex gap-4 font-medium text-slate-600 dark:text-slate-400">
                      <span>Response: <strong className="text-amber-600 dark:text-amber-400">{s.responseHours}h</strong></span>
                      <span>Resolution: <strong className="text-indigo-600 dark:text-indigo-400">{s.resolutionHours}h</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
