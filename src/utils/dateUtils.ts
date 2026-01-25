/**
 * Returns a date string in YYYY-MM-DD format based on local time.
 * This avoids the day-shifting bugs caused by .toISOString().split('T')[0]
 * which uses UTC time.
 */
export const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Calculates the progress percentage of a goal based on its milestones.
 */
export const calculateGoalProgress = (goal: { milestones: { isCompleted: boolean }[] }): number => {
  if (!goal.milestones || goal.milestones.length === 0) return 0;
  const completedCount = goal.milestones.filter(m => m.isCompleted).length;
  return Math.round((completedCount / goal.milestones.length) * 100);
};