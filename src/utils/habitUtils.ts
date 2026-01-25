import { getLocalDateString, parseLocalDate } from './dateUtils';

export const calculateStreak = (completedDates: string[]): number => {
  if (completedDates.length === 0) return 0;

  const sortedDates = [...completedDates].sort().reverse();
  const today = getLocalDateString();

  let streak = 0;
  let currentDate = parseLocalDate(today);

  for (let i = 0; i < sortedDates.length; i++) {
    const dateString = getLocalDateString(currentDate);

    if (sortedDates[i] === dateString) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};