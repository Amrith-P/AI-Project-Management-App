import React from 'react';
import { useDrop } from 'react-dnd';
import type { Task, TaskStatus } from '../../types/task';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';

interface ColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onDropTask: (taskId: number, newStatus: TaskStatus, newIndex: number) => void;
  onAddTask: (status: TaskStatus) => void;
}

export const Column: React.FC<ColumnProps> = ({ status, tasks, onDropTask, onAddTask }) => {
  const [{ isOver }, dropRef] = useDrop({
    accept: 'TASK',
    drop: (item: any, monitor) => {
      // Determine new index (simplistic approach: append to end)
      // A more robust approach calculates index based on drop position over specific cards.
      // For now, we append to the end of the list.
      const hoverIndex = tasks.length;
      if (item.status !== status || item.index !== hoverIndex) {
        onDropTask(item.id, status, hoverIndex);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const getStatusColor = (s: TaskStatus) => {
    switch (s) {
      case 'Todo': return 'bg-gray-100 text-gray-700';
      case 'Doing': return 'bg-blue-100 text-blue-700';
      case 'Testing': return 'bg-yellow-100 text-yellow-700';
      case 'Done': return 'bg-green-100 text-green-700';
    }
  };

  return (
    <div className="flex flex-col w-80 shrink-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
            {status}
          </span>
          <span className="text-xs font-medium text-gray-500">{tasks.length}</span>
        </div>
        <button
          onClick={() => onAddTask(status)}
          className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div
        ref={dropRef}
        className={`flex-1 min-h-[150px] p-2 rounded-xl transition-colors ${isOver ? 'bg-indigo-50/50 border-2 border-dashed border-indigo-200' : 'bg-gray-50/50'}`}
      >
        {tasks.map((task, index) => (
          <TaskCard key={task.id} task={task} index={index} />
        ))}
      </div>
    </div>
  );
};
