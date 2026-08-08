import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { generateAITasks, clearGeneratedTasks } from '../../store/slices/aiSlice';
import type { GeneratedTask } from '../../store/slices/aiSlice';
import { fetchTasks } from '../../store/slices/taskSlice';
import { Sparkles, X, Loader2, CheckCircle, PlusCircle, AlertCircle, Wand2, Tag } from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: number;
  projectName?: string;
  projectDescription?: string;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName = '',
  projectDescription = '',
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { generatedTasks, isGeneratingTasks, taskSource, error } = useSelector((state: RootState) => state.ai);

  const [prompt, setPrompt] = useState('');
  const [taskCount, setTaskCount] = useState(5);
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [isInserting, setIsInserting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    const result = await dispatch(
      generateAITasks({
        projectId,
        projectName,
        projectDescription,
        customPrompt: prompt,
        count: taskCount,
        autoInsert: false,
      })
    );

    if (generateAITasks.fulfilled.match(result)) {
      // Select all tasks by default
      setSelectedTasks(result.payload.tasks.map((_: any, idx: number) => idx));
    }
  };

  const handleToggleTask = (index: number) => {
    setSelectedTasks((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleAddSelectedTasks = async () => {
    if (!projectId || selectedTasks.length === 0) return;

    setIsInserting(true);
    try {
      const tasksToAdd = selectedTasks.map((idx) => generatedTasks[idx]);
      for (const t of tasksToAdd) {
        await dispatch(
          generateAITasks({
            projectId,
            projectName,
            projectDescription: t.description,
            customPrompt: `Create single task: ${t.title}`,
            count: 1,
            autoInsert: true,
          })
        );
      }

      await dispatch(fetchTasks(String(projectId)));
      setSuccessMessage(`Successfully added ${selectedTasks.length} AI tasks to your project!`);
      setTimeout(() => {
        dispatch(clearGeneratedTasks());
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsInserting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-gray-100 overflow-hidden transform transition-all animate-fade-in-up">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-md">
              <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                AI Task Breakdown Engine
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-400 text-gray-900">
                  Gemini Powered
                </span>
              </h2>
              <p className="text-xs text-indigo-100 mt-0.5">
                Automatically convert project goals into actionable tasks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form Controls */}
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Project Target Context
              </label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800">
                <span className="font-semibold text-indigo-600">{projectName || 'General Project'}</span>
                {projectDescription && <p className="text-gray-500 text-xs mt-1">{projectDescription}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Custom Guidance (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Focus on API design, include unit test tasks..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Task Count
                </label>
                <select
                  value={taskCount}
                  onChange={(e) => setTaskCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  <option value={3}>3 Tasks</option>
                  <option value={5}>5 Tasks</option>
                  <option value={7}>7 Tasks</option>
                  <option value={10}>10 Tasks</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isGeneratingTasks}
                className="inline-flex items-center px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
              >
                {isGeneratingTasks ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    AI Analyzing & Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Task Breakdown
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Generated Tasks Preview */}
          {generatedTasks.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-gray-900">
                    Generated Tasks Preview ({selectedTasks.length}/{generatedTasks.length} selected)
                  </h3>
                  {taskSource === 'smart-rules' && (
                    <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md">
                      Smart Template Mode
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedTasks(
                      selectedTasks.length === generatedTasks.length
                        ? []
                        : generatedTasks.map((_, i) => i)
                    )
                  }
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {selectedTasks.length === generatedTasks.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                {generatedTasks.map((task: GeneratedTask, idx: number) => {
                  const isSelected = selectedTasks.includes(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleToggleTask(idx)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="pt-0.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleTask(idx)}
                          className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-semibold text-gray-900">{task.title}</h4>
                          <span
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                              task.priority === 'High'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : task.priority === 'Medium'
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                : 'bg-green-50 text-green-700 border-green-200'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                        {task.labels && task.labels.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {task.labels.map((lbl, lIdx) => (
                              <span
                                key={lIdx}
                                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md"
                              >
                                <Tag className="w-3 h-3" />
                                {lbl}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddSelectedTasks}
                  disabled={selectedTasks.length === 0 || isInserting}
                  className="inline-flex items-center px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md disabled:opacity-50 transition-all"
                >
                  {isInserting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding Tasks...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Add Selected ({selectedTasks.length}) to Project
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
