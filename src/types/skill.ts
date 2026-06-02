export interface Skill {
  id: string;
  name: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Master';
  status: 'Learning' | 'Learned' | 'Mastered';
  description: string;
  startDate: Date;
  completedDate?: Date;
  resources: string[];
  progress: number; // 0-100
  color: string;
  createdAt: Date;
  linkedGoalId?: string; // Link to a goal from raids section
  totalLearningTime: number; // Total time spent learning in seconds
  isTimerActive: boolean;
  lastTimerStart?: Date;
}

export interface SkillFormData {
  name: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Master';
  status: 'Learning' | 'Learned' | 'Mastered';
  description: string;
  startDate: Date;
  resources: string[];
  color: string;
  linkedGoalId?: string;
}