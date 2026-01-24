import { Habit } from '../types/habit';

export const loadHabits = (): Habit[] => {
  try {
    const stored = localStorage.getItem('arise-habits');
    if (!stored) return [];
    
    const habits = JSON.parse(stored);
    return habits.map((habit: any) => ({
      ...habit,
      createdAt: new Date(habit.createdAt)
    }));
  } catch (error) {
    console.error('Failed to load habits from localStorage:', error);
    return [];
  }
};

export const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};