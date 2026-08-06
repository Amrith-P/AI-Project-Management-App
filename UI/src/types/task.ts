export type TaskStatus = 'Todo' | 'Doing' | 'Testing' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: number;
  projectId: number;
  title: string;
  description: string;
  status: TaskStatus;
  position: number;
  priority: TaskPriority;
  labels: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
}
