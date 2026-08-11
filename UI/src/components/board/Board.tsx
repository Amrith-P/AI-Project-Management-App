import React, { useState, useEffect, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Column } from './Column';
import type { TaskStatus } from '../../types/task';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { fetchTasks, optimisticUpdatePositions, updateTaskPositions } from '../../store/slices/taskSlice';
import { fetchTeamMembers } from '../../store/slices/teamSlice';
import { CreateTaskModal } from './CreateTaskModal';
import { BoardFilterBar } from './BoardFilterBar';
import { useParams } from 'react-router-dom';

const COLUMNS: TaskStatus[] = ['Todo', 'Doing', 'Testing', 'Done'];

export const Board: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, isLoading } = useSelector((state: RootState) => state.tasks);
  const teamMembers = useSelector((state: RootState) => state.team.members);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialStatus, setInitialStatus] = useState<TaskStatus>('Todo');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedAssignee, setSelectedAssignee] = useState('All');
  const [selectedLabel, setSelectedLabel] = useState('All');

  useEffect(() => {
    if (projectId) {
      dispatch(fetchTasks(projectId));
      dispatch(fetchTeamMembers());
    }
  }, [dispatch, projectId]);

  // Extract all unique labels/tags from tasks
  const availableLabels = useMemo(() => {
    const labelSet = new Set<string>(['Bug', 'Feature', 'UI/UX', 'Backend', 'DevOps', 'QA']);
    tasks.forEach(t => {
      if (Array.isArray(t.labels)) {
        t.labels.forEach(l => labelSet.add(l));
      }
    });
    return Array.from(labelSet);
  }, [tasks]);

  // Filter tasks locally in real time
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = (t.description || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }

      // Priority
      if (selectedPriority !== 'All' && t.priority !== selectedPriority) {
        return false;
      }

      // Assignee
      if (selectedAssignee !== 'All' && String(t.assigneeId) !== String(selectedAssignee)) {
        return false;
      }

      // Label/Tag
      if (selectedLabel !== 'All') {
        if (!t.labels || !Array.isArray(t.labels) || !t.labels.includes(selectedLabel)) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, searchQuery, selectedPriority, selectedAssignee, selectedLabel]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedPriority('All');
    setSelectedAssignee('All');
    setSelectedLabel('All');
  };

  const handleDropTask = (taskId: number, newStatus: TaskStatus, newIndex: number) => {
    if (!projectId) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    let updatedTasks = [...tasks];
    updatedTasks = updatedTasks.filter(t => t.id !== taskId);

    const targetColumnTasks = updatedTasks.filter(t => t.status === newStatus).sort((a, b) => a.position - b.position);
    targetColumnTasks.splice(newIndex, 0, { ...task, status: newStatus });

    targetColumnTasks.forEach((t, i) => {
      t.position = i;
    });

    const sourceStatus = task.status;
    if (sourceStatus !== newStatus) {
      const sourceColumnTasks = updatedTasks.filter(t => t.status === sourceStatus).sort((a, b) => a.position - b.position);
      sourceColumnTasks.forEach((t, i) => {
        t.position = i;
      });

      const allUpdates = [...targetColumnTasks, ...sourceColumnTasks].map(t => ({ id: t.id, status: t.status, position: t.position }));
      dispatch(optimisticUpdatePositions(allUpdates));
      dispatch(updateTaskPositions({ projectId, tasks: allUpdates }));
    } else {
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
      <div className="space-y-4">
        <BoardFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedPriority={selectedPriority}
          onPriorityChange={setSelectedPriority}
          selectedAssignee={selectedAssignee}
          onAssigneeChange={setSelectedAssignee}
          selectedLabel={selectedLabel}
          onLabelChange={setSelectedLabel}
          teamMembers={teamMembers}
          availableLabels={availableLabels}
          onClearFilters={handleClearFilters}
          filteredCount={filteredTasks.length}
          totalCount={tasks.length}
        />

        <div className="flex gap-6 overflow-x-auto pb-4 h-full min-h-[500px]">
          {COLUMNS.map((status) => (
            <Column
              key={status}
              status={status}
              tasks={filteredTasks.filter((t) => t.status === status).sort((a, b) => a.position - b.position)}
              onDropTask={handleDropTask}
              onAddTask={handleAddTask}
            />
          ))}
        </div>
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
