export const calculateGoalProgress = (goal: { milestones: { isCompleted: boolean }[]; isCompleted: boolean }): number => {
  if (goal.milestones.length === 0) return goal.isCompleted ? 100 : 0;
  
  const completedMilestones = goal.milestones.filter(m => m.isCompleted).length;
  return Math.round((completedMilestones / goal.milestones.length) * 100);
};

export const getDaysUntilDeadline = (targetDate: Date): number => {
  const today = new Date();
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const isOverdue = (targetDate: Date): boolean => {
  return getDaysUntilDeadline(targetDate) < 0;
};