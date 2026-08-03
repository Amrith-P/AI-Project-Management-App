import React from 'react';
import { useDrag } from 'react-dnd';
import type { Task } from '../../types/task';
import { Clock } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  index: number;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, index }) => {
  const [{ isDragging }, dragRef] = useDrag({
    type: 'TASK',
    item: { id: task.id, index, status: task.status, originalTask: task },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={dragRef}
      className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing mb-3 transition-opacity hover:shadow-md ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <h4 className="text-sm font-semibold text-gray-900 mb-1">{task.title}</h4>
      {task.description && (
        <p className="text-xs text-gray-600 line-clamp-2 mb-3">{task.description}</p>
      )}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(task.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};
