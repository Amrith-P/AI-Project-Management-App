import React, { useState, useEffect } from 'react';
import { X, Plus, Save, GitCommit, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/apiHeaders';

interface WorkflowNode {
  id: string;
  label: string;
  category: 'Open' | 'In Progress' | 'Closed';
  color: string;
  position: { x: number; y: number };
}

interface WorkflowTransition {
  id: string;
  from: string;
  to: string;
  name: string;
  requiredFields: string[];
}

interface WorkflowCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
}

export const WorkflowCanvasModal: React.FC<WorkflowCanvasModalProps> = ({
  isOpen,
  onClose,
  projectId
}) => {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [transitions, setTransitions] = useState<WorkflowTransition[]>([]);
  const [workflowName, setWorkflowName] = useState('Software Engineering Workflow');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeCategory, setNewNodeCategory] = useState<'Open' | 'In Progress' | 'Closed'>('In Progress');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen && projectId) {
      fetchWorkflow();
    }
  }, [isOpen, projectId]);

  const fetchWorkflow = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`http://localhost:5001/api/workflows/project/${projectId}`, getAuthHeaders());
      if (res.data) {
        setNodes(res.data.nodes || []);
        setTransitions(res.data.transitions || []);
        setWorkflowName(res.data.name || 'Custom Project Workflow');
      }
    } catch (err) {
      console.error('Failed to fetch workflow:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWorkflow = async () => {
    try {
      setIsSaving(true);
      await axios.post(
        'http://localhost:5001/api/workflows',
        {
          projectId,
          name: workflowName,
          nodes,
          transitions
        },
        getAuthHeaders()
      );
      setSuccessMsg('Workflow saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to save workflow:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNode = () => {
    if (!newNodeLabel.trim()) return;
    const newId = `node-${Date.now().toString().slice(-4)}`;
    const categoryColors = {
      Open: '#64748b',
      'In Progress': '#3b82f6',
      Closed: '#10b981'
    };

    const newNode: WorkflowNode = {
      id: newId,
      label: newNodeLabel.trim(),
      category: newNodeCategory,
      color: categoryColors[newNodeCategory],
      position: { x: 100 + nodes.length * 150, y: 150 }
    };

    setNodes([...nodes, newNode]);
    setNewNodeLabel('');
  };

  const handleRemoveNode = (nodeId: string) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    setTransitions(transitions.filter(t => t.from !== nodeId && t.to !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-600 rounded-xl">
              <GitCommit className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Visual Workflow Designer
              </h2>
              <p className="text-xs text-slate-500">Configure status transition nodes, guards, and lifecycle rules</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {successMsg && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 animate-pulse">
                <Check className="w-4 h-4" /> {successMsg}
              </span>
            )}
            <button
              onClick={handleSaveWorkflow}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm text-sm transition"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Workflow'}
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Canvas */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          
          {/* Add Node Controls */}
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl p-4 flex flex-wrap items-center gap-4">
            <input
              type="text"
              placeholder="New Status Node Name (e.g. Code Review)"
              value={newNodeLabel}
              onChange={(e) => setNewNodeLabel(e.target.value)}
              className="flex-1 min-w-[200px] px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={newNodeCategory}
              onChange={(e) => setNewNodeCategory(e.target.value as any)}
              className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm"
            >
              <option value="Open">Category: Open / To Do</option>
              <option value="In Progress">Category: In Progress</option>
              <option value="Closed">Category: Closed / Done</option>
            </select>
            <button
              onClick={handleAddNode}
              className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white font-medium text-sm rounded-lg hover:bg-slate-800 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Status Node
            </button>
          </div>

          {/* Interactive Canvas Graph */}
          {isLoading ? (
            <div className="text-center py-16 text-slate-400">Loading Workflow Graph...</div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Workflow Nodes ({nodes.length})
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {nodes.map((node) => (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`p-4 rounded-xl border transition cursor-pointer relative ${
                      selectedNodeId === node.id
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: node.color }} />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveNode(node.id);
                        }}
                        className="text-slate-400 hover:text-red-500 p-0.5 rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">{node.label}</h4>
                    <span className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {node.category}
                    </span>
                  </div>
                ))}
              </div>

              {/* Transitions Flow Timeline */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Configured Transitions & Rules
                </h3>
                <div className="space-y-3">
                  {transitions.map((t) => {
                    const fromNode = nodes.find(n => n.id === t.from);
                    const toNode = nodes.find(n => n.id === t.to);
                    return (
                      <div
                        key={t.id}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{fromNode?.label || t.from}</span>
                          <ArrowRight className="w-4 h-4 text-indigo-500" />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{toNode?.label || t.to}</span>
                          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                            {t.name}
                          </span>
                        </div>
                        {t.requiredFields && t.requiredFields.length > 0 && (
                          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> Requires: {t.requiredFields.join(', ')}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
