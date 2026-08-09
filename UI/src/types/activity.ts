export interface Activity {
  id: number;
  ownerId: number;
  projectId?: number | null;
  projectName?: string | null;
  action: string;
  details: string;
  createdAt: string;
}

export interface ActivityState {
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
}
