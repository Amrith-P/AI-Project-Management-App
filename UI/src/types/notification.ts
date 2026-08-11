export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  isRead: number;
  link?: string | null;
  createdAt: string;
}
