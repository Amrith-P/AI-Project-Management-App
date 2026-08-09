export type TaskStatus = 'Todo' | 'Doing' | 'Testing' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface CheckItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskComment {
  id: number;
  taskId: number;
  userId: number;
  userName: string;
  userEmail: string;
  comment: string;
  createdAt: string;
}

export interface Task {
  id: number;
  projectId: number;
  title: string;
  description: string;
  status: TaskStatus;
  position: number;
  priority: TaskPriority;
  labels: string[];
  assigneeId?: number | null;
  assigneeName?: string;
  assigneeEmail?: string;
  dueDate?: string | null;
  checklist?: CheckItem[];
  estimatedHours?: number;
  spentHours?: number;
  projectName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskState {
  tasks: Task[];
  activeTaskComments: TaskComment[];
  isLoading: boolean;
  isCommentsLoading: boolean;
  error: string | null;
}
