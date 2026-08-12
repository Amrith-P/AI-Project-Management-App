export type TeamRole = 'Project Manager' | 'Tech Lead' | 'Developer' | 'Designer' | 'QA Engineer' | 'Admin' | 'Member';
export type TeamStatus = 'Pending' | 'Active';

export interface TeamMember {
  id: number;
  ownerId: number;
  email: string;
  userId: number | null;
  name?: string; // from join
  role: TeamRole;
  status: TeamStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TeamState {
  members: TeamMember[];
  isLoading: boolean;
  error: string | null;
}
