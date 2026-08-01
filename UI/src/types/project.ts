export type ProjectStatus = "Planning" | "Active" | "On Hold" | "Completed" | "Archived" | "Cancelled";
export type ProjectPriority = "Low" | "Medium" | "High" | "Critical";
export type ProjectVisibility = "Private" | "Team" | "Public";

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  category: string;
  visibility: ProjectVisibility;
  progress: number;
  ownerId: string;
  members: string[];
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  color: string;
  
  // Dashboard / calculated stats
  completedTasks?: number;
  totalTasks?: number;
}

export interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
}
