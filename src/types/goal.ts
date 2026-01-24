export interface Milestone {
  id: string;
  title: string;
  targetDate: Date;
  isCompleted: boolean;
  completedDate?: Date;
}

export interface Goal {
  id: string;
  title: string;
  category: string;
  color: string;
  targetDate: Date;
  createdAt: Date;
  isCompleted: boolean;
  completedDate?: Date;
  milestones: Milestone[];
  priority: 'low' | 'medium' | 'high';
  progress: number; // 0-100
}

export interface GoalFormData {
  title: string;
  category: string;
  color: string;
  targetDate: Date;
  priority: 'low' | 'medium' | 'high';
  milestones: Omit<Milestone, 'id' | 'isCompleted' | 'completedDate'>[];
}