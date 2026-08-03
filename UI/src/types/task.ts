export type TaskStatus = 'Todo' | 'Doing' | 'Testing' | 'Done';

export interface Task {
  id: number;
  projectId: number;
  title: string;
  description: string;
  status: TaskStatus;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
}
