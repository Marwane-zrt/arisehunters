export interface Habit {
  id: string;
  name: string;
  category: string;
  color: string;
  createdAt: Date;
  completedDates: string[];
  streak: number;
  bestStreak: number;
}

export interface HabitFormData {
  name: string;
  category: string;
  color: string;
}