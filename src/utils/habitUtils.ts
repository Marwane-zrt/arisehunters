export const calculateStreak = (completedDates: string[]): number => {
  if (completedDates.length === 0) return 0;
  
  const sortedDates = [...completedDates].sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  
  let streak = 0;
  let currentDate = new Date(today);
  
  for (let i = 0; i < sortedDates.length; i++) {
    const dateString = currentDate.toISOString().split('T')[0];
    
    if (sortedDates[i] === dateString) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
};