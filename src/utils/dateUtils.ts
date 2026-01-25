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

/**
 * Returns the number of days until a given deadline.
 */
export const getDaysUntilDeadline = (targetDate: Date): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(targetDate);
  deadline.setHours(0, 0, 0, 0);

  const diffTime = deadline.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Checks if a date has passed.
 */
export const isOverdue = (targetDate: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(targetDate);
  deadline.setHours(0, 0, 0, 0);
  return deadline < today;
};

/**
 * Creates a Date object from a YYYY-MM-DD string in local time.
 * Standard `new Date("YYYY-MM-DD")` is often UTC, which causes bugs.
 */
export const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  // months are 0-indexed in JS
  return new Date(year, month - 1, day);
};