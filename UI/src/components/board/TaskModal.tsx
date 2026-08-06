import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { X, Trash2, Tag, Flag, Save } from 'lucide-react';
import { updateTaskDetail, deleteTask } from '../../store/slices/taskSlice';
import type { AppDispatch } from '../../store';
import type { Task, TaskPriority } from '../../types/task';
import { Button } from '../ui/Button';

interface TaskModalProps {
  task: Task;
  onClose: () => void;
}

const AVAILABLE_LABELS = ['Bug', 'Feature', 'Frontend', 'Backend', 'Design', 'Urgent'];

export const TaskModal: React.FC<TaskModalProps> = ({ task, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState<TaskPriority>(task.priority || 'Medium');
  const [labels, setLabels] = useState<string[]>(task.labels || []);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
    setPriority(task.priority || 'Medium');
    setLabels(task.labels || []);
  }, [task]);

  const handleSave = async () => {
    setIsSaving(true);
    await dispatch(updateTaskDetail({
      taskId: task.id,
      updates: { title, description, priority, labels }
    }));
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsDeleting(true);
      await dispatch(deleteTask(task.id));
      setIsDeleting(false);
      onClose();
    }
  };

  const toggleLabel = (label: string) => {
    if (labels.includes(label)) {
      setLabels(labels.filter(l => l !== label));
    } else {
      setLabels([...labels, label]);
    }
    setIsEditing(true);
  };

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl mx-auto my-6 z-50">
        <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-solid rounded-t border-gray-200">
            {isEditing ? (
              <input
                className="text-2xl font-semibold w-full border-b border-gray-300 focus:border-indigo-500 focus:outline-none bg-transparent"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task Title"
              />
            ) : (
              <h3 className="text-2xl font-semibold">{title}</h3>
            )}
            <button
              className="p-1 ml-auto bg-transparent border-0 text-gray-500 float-right text-3xl leading-none font-semibold outline-none focus:outline-none hover:text-gray-800"
              onClick={onClose}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="relative p-6 flex-auto flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                {isEditing ? (
                  <textarea
                    className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a more detailed description..."
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md min-h-[8rem] whitespace-pre-wrap text-sm text-gray-700 cursor-pointer" onClick={() => setIsEditing(true)}>
                    {description || <span className="text-gray-400 italic">No description provided. Click to add one.</span>}
                  </div>
                )}
              </div>
            </div>

            <div className="w-full md:w-64 space-y-6">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Flag className="w-4 h-4 mr-2" /> Priority
                </label>
                {isEditing ? (
                  <select
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex cursor-pointer ${getPriorityColor(priority)}`} onClick={() => setIsEditing(true)}>
                    {priority}
                  </span>
                )}
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Tag className="w-4 h-4 mr-2" /> Labels
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {labels.map(l => (
                    <span key={l} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-md font-medium">
                      {l}
                    </span>
                  ))}
                  {!isEditing && labels.length === 0 && <span className="text-gray-400 text-sm italic cursor-pointer" onClick={() => setIsEditing(true)}>None</span>}
                </div>
                {isEditing && (
                  <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded border border-gray-200">
                    {AVAILABLE_LABELS.map(label => (
                      <button
                        key={label}
                        onClick={() => toggleLabel(label)}
                        className={`text-xs px-2 py-1 rounded ${labels.includes(label) ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Details</label>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Created: {new Date(task.createdAt).toLocaleString()}</p>
                  <p>Updated: {new Date(task.updatedAt).toLocaleString()}</p>
                  <p>Status: <span className="font-semibold text-gray-700">{task.status}</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-solid border-gray-200 rounded-b">
            <Button
              variant="outline"
              onClick={handleDelete}
              isLoading={isDeleting}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => {
                if(isEditing) {
                  setTitle(task.title);
                  setDescription(task.description || '');
                  setPriority(task.priority || 'Medium');
                  setLabels(task.labels || []);
                  setIsEditing(false);
                } else {
                  onClose();
                }
              }}>
                {isEditing ? 'Cancel' : 'Close'}
              </Button>
              {isEditing ? (
                <Button onClick={handleSave} isLoading={isSaving}>
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </Button>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  Edit Task
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
