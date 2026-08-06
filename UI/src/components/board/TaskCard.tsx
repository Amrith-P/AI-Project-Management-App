import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import type { Task, TaskPriority } from '../../types/task';
import { Clock, Flag } from 'lucide-react';
import { TaskModal } from './TaskModal';

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
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <>
      <div
        ref={dragRef}
        onClick={() => setIsModalOpen(true)}
        className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing mb-3 transition-all hover:shadow-md hover:border-indigo-300 ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      >
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-sm font-semibold text-gray-900">{task.title}</h4>
          {task.priority && (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          )}
        </div>
        
        {task.description && (
          <p className="text-xs text-gray-600 line-clamp-2 mb-3">{task.description}</p>
        )}
        
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.labels.map(label => (
              <span key={label} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] rounded font-medium">
                {label}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(task.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {isModalOpen && (
        <TaskModal task={task} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};
