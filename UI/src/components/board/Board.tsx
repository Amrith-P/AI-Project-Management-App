import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Column } from './Column';
import type { TaskStatus } from '../../types/task';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { fetchTasks, optimisticUpdatePositions, updateTaskPositions } from '../../store/slices/taskSlice';
import { CreateTaskModal } from './CreateTaskModal';
import { useParams } from 'react-router-dom';

const COLUMNS: TaskStatus[] = ['Todo', 'Doing', 'Testing', 'Done'];

export const Board: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, isLoading } = useSelector((state: RootState) => state.tasks);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialStatus, setInitialStatus] = useState<TaskStatus>('Todo');

  useEffect(() => {
    if (projectId) {
      dispatch(fetchTasks(projectId));
    }
  }, [dispatch, projectId]);

  const handleDropTask = (taskId: number, newStatus: TaskStatus, newIndex: number) => {
    if (!projectId) return;

    // Find task
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Reorder logic
    let updatedTasks = [...tasks];
    
    // Remove task from old position
    updatedTasks = updatedTasks.filter(t => t.id !== taskId);
    
    // Add task to new position
    const targetColumnTasks = updatedTasks.filter(t => t.status === newStatus).sort((a, b) => a.position - b.position);
    
    // Insert task at newIndex in the target column list
    targetColumnTasks.splice(newIndex, 0, { ...task, status: newStatus });
    
    // Re-assign positions for the affected column
    targetColumnTasks.forEach((t, i) => {
      t.position = i;
    });

    // We also need to update positions for the source column if it's different, but filtering out the task and re-sorting might be easier:
    const sourceStatus = task.status;
    if (sourceStatus !== newStatus) {
      const sourceColumnTasks = updatedTasks.filter(t => t.status === sourceStatus).sort((a, b) => a.position - b.position);
      sourceColumnTasks.forEach((t, i) => {
        t.position = i;
      });
      
      // Combine updates
      const allUpdates = [...targetColumnTasks, ...sourceColumnTasks].map(t => ({ id: t.id, status: t.status, position: t.position }));
      
      // Optimistic update
      dispatch(optimisticUpdatePositions(allUpdates));
      
      // API call
      dispatch(updateTaskPositions({ projectId, tasks: allUpdates }));
    } else {
       // Same column reorder
       const allUpdates = targetColumnTasks.map(t => ({ id: t.id, status: t.status, position: t.position }));
       dispatch(optimisticUpdatePositions(allUpdates));
       dispatch(updateTaskPositions({ projectId, tasks: allUpdates }));
    }
  };

  const handleAddTask = (status: TaskStatus) => {
    setInitialStatus(status);
    setIsModalOpen(true);
  };

  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex gap-6 overflow-x-auto pb-4 h-full min-h-[500px]">
        {COLUMNS.map((status) => (
          <Column
            key={status}
            status={status}
            tasks={tasks.filter((t) => t.status === status).sort((a, b) => a.position - b.position)}
            onDropTask={handleDropTask}
            onAddTask={handleAddTask}
          />
        ))}
      </div>
      
      {isModalOpen && projectId && (
        <CreateTaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          projectId={projectId}
          initialStatus={initialStatus}
        />
      )}
    </DndProvider>
  );
};
