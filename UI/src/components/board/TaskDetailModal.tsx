import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { updateTaskDetail, deleteTask, fetchTaskComments, addTaskComment, deleteTaskComment } from '../../store/slices/taskSlice';
import type { Task, CheckItem, TaskPriority, TaskStatus } from '../../types/task';
import { 
  X, 
  Trash2, 
  Calendar, 
  User, 
  CheckSquare, 
  Plus, 
  MessageSquare, 
  Send
} from 'lucide-react';

interface TaskDetailModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { members } = useSelector((state: RootState) => state.team);
  const { activeTaskComments, isCommentsLoading } = useSelector((state: RootState) => state.tasks);

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority || 'Medium');
  const [assigneeId, setAssigneeId] = useState<number | undefined | null>(task.assigneeId);
  const [dueDate, setDueDate] = useState<string>(task.dueDate ? task.dueDate.split('T')[0] : '');
  const [estimatedHours, setEstimatedHours] = useState<number>(task.estimatedHours || 0);
  const [spentHours, setSpentHours] = useState<number>(task.spentHours || 0);
  const [checklist, setChecklist] = useState<CheckItem[]>(task.checklist || []);
  const [newCheckItem, setNewCheckItem] = useState('');
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'comments'>('details');

  useEffect(() => {
    if (isOpen && task.id) {
      dispatch(fetchTaskComments(task.id));
    }
  }, [dispatch, isOpen, task.id]);

  if (!isOpen) return null;

  const handleSaveDetails = () => {
    dispatch(updateTaskDetail({
      taskId: task.id,
      updates: {
        title,
        description,
        status,
        priority,
        assigneeId: assigneeId || null,
        dueDate: dueDate || null,
        estimatedHours,
        spentHours,
        checklist
      }
    }));
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch(deleteTask(task.id));
      onClose();
    }
  };

  const handleAddCheckItem = () => {
    if (!newCheckItem.trim()) return;
    const item: CheckItem = {
      id: Date.now().toString(),
      text: newCheckItem.trim(),
      completed: false
    };
    const updated = [...checklist, item];
    setChecklist(updated);
    setNewCheckItem('');
    dispatch(updateTaskDetail({ taskId: task.id, updates: { checklist: updated } }));
  };

  const handleToggleCheckItem = (id: string) => {
    const updated = checklist.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setChecklist(updated);
    dispatch(updateTaskDetail({ taskId: task.id, updates: { checklist: updated } }));
  };

  const handleDeleteCheckItem = (id: string) => {
    const updated = checklist.filter(item => item.id !== id);
    setChecklist(updated);
    dispatch(updateTaskDetail({ taskId: task.id, updates: { checklist: updated } }));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    dispatch(addTaskComment({ taskId: task.id, comment: newComment.trim() }));
    setNewComment('');
  };

  const handleDeleteComment = (commentId: number) => {
    dispatch(deleteTaskComment(commentId));
  };

  const completedCheckItems = checklist.filter(c => c.completed).length;
  const checklistProgress = checklist.length > 0 ? Math.round((completedCheckItems / checklist.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-3xl overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-indigo-950 p-6 text-white flex justify-between items-start">
          <div className="space-y-2 flex-1 pr-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 px-2.5 py-0.5 rounded-full">
                Task #{task.id}
              </span>
              <span className="text-xs font-medium text-gray-300">
                {task.projectName || 'Project Task'}
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSaveDetails}
              className="bg-transparent text-xl font-bold text-white w-full border-b border-transparent hover:border-indigo-400 focus:border-indigo-400 focus:outline-none transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors"
              title="Delete Task"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 px-6 flex space-x-6 bg-gray-50/50">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3.5 px-1 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'details'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            Task Details
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`py-3.5 px-1 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'comments'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Discussion ({activeTaskComments.length})
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {activeTab === 'details' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left 2 Cols: Main Info */}
              <div className="md:col-span-2 space-y-6">
                
                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={handleSaveDetails}
                    placeholder="Add detailed task requirements..."
                    className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                {/* Subtasks / Checklist */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                      Subtasks Checklist ({completedCheckItems}/{checklist.length})
                    </h4>
                    {checklist.length > 0 && (
                      <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {checklistProgress}%
                      </span>
                    )}
                  </div>

                  {checklist.length > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-1.5 transition-all duration-300" 
                        style={{ width: `${checklistProgress}%` }}
                      />
                    </div>
                  )}

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {checklist.map((item) => (
                      <div key={item.id} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-gray-200/80 shadow-2xs">
                        <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-gray-700 flex-1">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => handleToggleCheckItem(item.id)}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          />
                          <span className={item.completed ? 'line-through text-gray-400' : ''}>
                            {item.text}
                          </span>
                        </label>
                        <button
                          onClick={() => handleDeleteCheckItem(item.id)}
                          className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add new subtask item..."
                      value={newCheckItem}
                      onChange={(e) => setNewCheckItem(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCheckItem())}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                    <button
                      onClick={handleAddCheckItem}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Col: Attributes & Controls */}
              <div className="space-y-5 bg-gray-50/60 p-4 rounded-xl border border-gray-100">
                
                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 tracking-wider mb-1.5">Status</label>
                  <select
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value as TaskStatus);
                      dispatch(updateTaskDetail({ taskId: task.id, updates: { status: e.target.value as TaskStatus } }));
                    }}
                    className="w-full rounded-lg border border-gray-300 p-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="Todo">Todo</option>
                    <option value="Doing">Doing</option>
                    <option value="Testing">Testing</option>
                    <option value="Done">Done</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 tracking-wider mb-1.5">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => {
                      setPriority(e.target.value as TaskPriority);
                      dispatch(updateTaskDetail({ taskId: task.id, updates: { priority: e.target.value as TaskPriority } }));
                    }}
                    className="w-full rounded-lg border border-gray-300 p-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                {/* Assignee */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 tracking-wider mb-1.5 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    Assignee
                  </label>
                  <select
                    value={assigneeId || ''}
                    onChange={(e) => {
                      const val = e.target.value ? Number(e.target.value) : null;
                      setAssigneeId(val);
                      dispatch(updateTaskDetail({ taskId: task.id, updates: { assigneeId: val } }));
                    }}
                    className="w-full rounded-lg border border-gray-300 p-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="">Unassigned</option>
                    {members.map((m: any) => (
                      <option key={m.id} value={m.id}>
                        {m.name || m.email} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 tracking-wider mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => {
                      setDueDate(e.target.value);
                      dispatch(updateTaskDetail({ taskId: task.id, updates: { dueDate: e.target.value || null } }));
                    }}
                    className="w-full rounded-lg border border-gray-300 p-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  />
                </div>

                {/* Estimation */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Est. Hours</label>
                    <input
                      type="number"
                      step="0.5"
                      value={estimatedHours}
                      onChange={(e) => setEstimatedHours(Number(e.target.value))}
                      onBlur={handleSaveDetails}
                      className="w-full rounded-lg border border-gray-300 p-2 text-xs bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Spent Hours</label>
                    <input
                      type="number"
                      step="0.5"
                      value={spentHours}
                      onChange={(e) => setSpentHours(Number(e.target.value))}
                      onBlur={handleSaveDetails}
                      className="w-full rounded-lg border border-gray-300 p-2 text-xs bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

              </div>

            </div>
          ) : (
            /* Discussion & Comments Tab */
            <div className="space-y-6">
              
              {/* Comment Input */}
              <form onSubmit={handleAddComment} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Write a comment or project update..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl text-sm hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Post
                </button>
              </form>

              {/* Comments Feed */}
              {isCommentsLoading ? (
                <div className="py-8 text-center text-gray-400">Loading comments...</div>
              ) : activeTaskComments.length === 0 ? (
                <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <MessageSquare className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm font-medium">No comments posted yet.</p>
                  <p className="text-xs text-gray-400 mt-0.5">Start the discussion above!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeTaskComments.map((c) => (
                    <div key={c.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                        {(c.userName || c.userEmail || 'U').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-semibold text-gray-900">{c.userName || c.userEmail}</span>
                          <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{c.comment}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        className="text-gray-400 hover:text-red-500 self-start p-1 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
