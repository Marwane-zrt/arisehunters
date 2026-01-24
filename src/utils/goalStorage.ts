import { Goal } from '../types/goal';

export const loadGoals = (): Goal[] => {
  try {
    const stored = localStorage.getItem('arise-goals');
    if (!stored) return [];
    
    const goals = JSON.parse(stored);
    return goals.map((goal: any) => ({
      ...goal,
      targetDate: new Date(goal.targetDate),
      createdAt: new Date(goal.createdAt),
      completedDate: goal.completedDate ? new Date(goal.completedDate) : undefined,
      milestones: goal.milestones ? goal.milestones.map((milestone: any) => ({
        ...milestone,
        targetDate: new Date(milestone.targetDate),
        completedDate: milestone.completedDate ? new Date(milestone.completedDate) : undefined
      })) : []
    }));
  } catch (error) {
    console.error('Failed to load goals from localStorage:', error);
    return [];
  }
};