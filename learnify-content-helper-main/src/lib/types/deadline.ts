export interface DeadlineItem {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  isUrgent: boolean;
  imageUrl?: string;
  completed: boolean;
}