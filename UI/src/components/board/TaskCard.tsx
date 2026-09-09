import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import type { Task, TaskPriority } from '../../types/task';
import { Calendar, CheckSquare, User, AlertCircle } from 'lucide-react';
import { TaskDetailModal } from './TaskDetailModal';

interface TaskCardProps {
  task: Task;
  index: number;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, index }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [{ isDragging }, dragRef] = useDrag({
    type: 'TASK',
    item: { id: task.id, index, status: task.status, originalTask: task },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case 'Critical': return 'text-red-700 bg-red-100 border-red-200';
      case 'High': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'Medium': return 'text-amber-700 bg-amber-100 border-amber-200';
      case 'Low': return 'text-emerald-700 bg-emerald-100 border-emerald-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const checklistCount = task.checklist?.length || 0;
  const completedChecklistCount = task.checklist?.filter(c => c.completed).length || 0;

  const isOverdue = task.dueDate && new Date(task.dueDate).getTime() < new Date().setHours(0, 0, 0, 0) && task.status !== 'Done';

  return (
    <>
      <div
        ref={(node) => { dragRef(node); }}
        onClick={() => setIsModalOpen(true)}
        className={`bg-white p-4 rounded-xl shadow-xs border border-gray-200/90 cursor-grab active:cursor-grabbing mb-3 transition-all duration-200 hover:shadow-md hover:border-indigo-400 transform hover:-translate-y-0.5 ${isDragging ? 'opacity-40 scale-95' : 'opacity-100'}`}
      >
        <div className="flex justify-between items-start mb-2 gap-2">
          <div className="space-y-0.5">
            <span className="inline-block px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-[10px]">
              {(task as any).issueKey || `TASK-${task.id}`}
            </span>
            <h4 className="text-sm font-semibold text-gray-900 leading-snug">{task.title}</h4>
          </div>
          {task.priority && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center shrink-0 ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          )}
        </div>
        
        {task.description && (
          <p className="text-xs text-gray-600 line-clamp-2 mb-3 leading-relaxed">{task.description}</p>
        )}

        {/* Labels */}
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.labels.map(label => (
              <span key={label} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] rounded-md font-medium">
                {label}
              </span>
            ))}
          </div>
        )}

        {/* Footer Badges & Assignee */}
        <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Checklist progress */}
            {checklistCount > 0 && (
              <span className={`flex items-center gap-1 font-medium px-1.5 py-0.5 rounded text-[10px] ${completedChecklistCount === checklistCount ? 'text-emerald-700 bg-emerald-50' : 'text-gray-600 bg-gray-100'}`}>
                <CheckSquare className="w-3 h-3" />
                {completedChecklistCount}/{checklistCount}
              </span>
            )}

            {/* Due date badge */}
            {task.dueDate && (
              <span className={`flex items-center gap-1 font-medium px-1.5 py-0.5 rounded text-[10px] ${isOverdue ? 'text-red-700 bg-red-50 border border-red-200' : 'text-gray-600 bg-gray-50'}`}>
                {isOverdue ? <AlertCircle className="w-3 h-3 text-red-600" /> : <Calendar className="w-3 h-3 text-gray-500" />}
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}

            {/* SLA Timer Pill for High/Critical tasks */}
            {(task.priority === 'High' || task.priority === 'Critical') && task.status !== 'Done' && (
              <span className="flex items-center gap-1 font-bold px-1.5 py-0.5 rounded text-[10px] text-amber-700 bg-amber-50 border border-amber-200">
                ⏱️ SLA: 4h
              </span>
            )}
          </div>

          {/* Assignee Avatar */}
          {task.assigneeName ? (
            <div 
              className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white text-[10px] font-bold flex items-center justify-center shadow-2xs shrink-0" 
              title={`Assigned to ${task.assigneeName}`}
            >
              {task.assigneeName.slice(0, 2).toUpperCase()}
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-[10px]" title="Unassigned">
              <User className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <TaskDetailModal
          task={task}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};
