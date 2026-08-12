import React, { useEffect, useState } from 'react';
import { X, Zap, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/config';

interface Rule {
  id: number;
  projectId: number;
  triggerEvent: string;
  actionType: string;
  config: any;
  isActive: number;
  createdAt: string;
}

interface AutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number | string;
}

export const AutomationModal: React.FC<AutomationModalProps> = ({ isOpen, onClose, projectId }) => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const [triggerEvent, setTriggerEvent] = useState<string>('task_moved_to_done');
  const [actionType, setActionType] = useState<string>('notify_owner');

  const fetchRules = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/automations/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRules(res.data);
    } catch (err) {
      console.error('Error fetching automations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRules();
    }
  }, [isOpen, projectId]);

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/automations/${projectId}`,
        { triggerEvent, actionType, config: {} },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsCreating(false);
      fetchRules();
    } catch (err) {
      console.error('Error creating rule:', err);
    }
  };

  const handleToggleRule = async (ruleId: number, currentActive: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/automations/${ruleId}`,
        { isActive: currentActive ? 0 : 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRules();
    } catch (err) {
      console.error('Error toggling rule:', err);
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/automations/${ruleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRules();
    } catch (err) {
      console.error('Error deleting rule:', err);
    }
  };

  if (!isOpen) return null;

  const triggerLabels: Record<string, string> = {
    task_moved_to_done: 'Task is moved to Done',
    high_priority_created: 'High Priority task is created',
    task_assigned: 'Task is assigned to team member',
  };

  const actionLabels: Record<string, string> = {
    notify_owner: 'Notify Project Owner via In-App Alert',
    auto_assign: 'Auto-Assign to Lead Engineer',
    auto_complete_checklist: 'Log Audit Entry & Calculate Velocity',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-scale-up">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl text-indigo-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">AI Workflow Automation Engine</h2>
              <p className="text-xs text-indigo-200 mt-0.5">Automate recurring project tasks & trigger smart actions.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isCreating ? (
            <form onSubmit={handleCreateRule} className="bg-indigo-50/50 dark:bg-indigo-950/20 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Build New Automation Trigger Rule
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    When this happens (Trigger):
                  </label>
                  <select
                    value={triggerEvent}
                    onChange={(e) => setTriggerEvent(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                  >
                    <option value="task_moved_to_done">Task moved to "Done"</option>
                    <option value="high_priority_created">High Priority task created</option>
                    <option value="task_assigned">Task assigned to member</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Then do this (Action):
                  </label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                  >
                    <option value="notify_owner">Notify Project Owner</option>
                    <option value="auto_assign">Auto-Assign Lead Member</option>
                    <option value="auto_complete_checklist">Log Audit Entry & Velocity</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
                >
                  Save Automation Rule
                </button>
              </div>
            </form>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Automation Rules ({rules.length})</span>
              <button
                onClick={() => setIsCreating(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Automation Rule
              </button>
            </div>
          )}

          {/* Rules List */}
          {loading ? (
            <div className="py-12 text-center text-gray-400 text-xs">Loading automation rules...</div>
          ) : rules.length === 0 ? (
            <div className="py-12 text-center text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
              <Zap className="w-8 h-8 mx-auto mb-2 opacity-30 text-indigo-500" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No Automation Rules Configured</p>
              <p className="text-xs text-gray-400 mt-1">Add trigger rules to automate task notifications & actions.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    rule.isActive
                      ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xs'
                      : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200/60 dark:border-gray-800 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl mt-0.5 ${rule.isActive ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400' : 'bg-gray-200 dark:bg-gray-800 text-gray-400'}`}>
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          IF: {triggerLabels[rule.triggerEvent] || rule.triggerEvent}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        THEN: {actionLabels[rule.actionType] || rule.actionType}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleRule(rule.id, rule.isActive)}
                      className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      title={rule.isActive ? 'Disable Rule' : 'Enable Rule'}
                    >
                      {rule.isActive ? <ToggleRight className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                    </button>

                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-lg"
                      title="Delete Rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
