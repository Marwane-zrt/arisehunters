import { Habit } from '../types/habit';
import { PointsHistoryEntry, PointsHistoryData } from '../types/pointsHistory';
import { supabase } from '../lib/supabase';
import { getLocalDateString } from './dateUtils';

export const calculatePointsHistory = async (
  habits: Habit[]
): Promise<PointsHistoryData> => {
  try {
    const { data: penaltyLogs, error } = await supabase
      .from('daily_penalty_logs')
      .select('*')
      .order('check_date', { ascending: false })
      .limit(30);

    if (error) {
      console.error('Error fetching penalty logs for history:', error);
    }

    const dateMap = new Map<string, PointsHistoryEntry>();

    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = getLocalDateString(date);

      dateMap.set(dateString, {
        date: dateString,
        questsCompleted: 0,
        questsTotal: habits.length,
        pointsGained: 0,
        pointsLost: 0,
        netChange: 0,
        dailyTotal: 0,
        categories: {}
      });
    }

    habits.forEach(habit => {
      const categoryName = habit.category || 'General';

      habit.completedDates.forEach(completedDate => {
        const entry = dateMap.get(completedDate);
        if (entry) {
          entry.questsCompleted++;
          entry.pointsGained++;

          if (!entry.categories[categoryName]) {
            entry.categories[categoryName] = {
              pointsGained: 0,
              pointsLost: 0,
              questsCompleted: 0,
              questsTotal: 0
            };
          }

          entry.categories[categoryName].pointsGained++;
          entry.categories[categoryName].questsCompleted++;
        }
      });
    });

    if (penaltyLogs) {
      penaltyLogs.forEach(log => {
        const entry = dateMap.get(log.check_date);
        if (entry) {
          entry.pointsLost += log.penalties_applied || 0;
        }
      });
    }

    const entries = Array.from(dateMap.values())
      .sort((a, b) => a.date.localeCompare(b.date));

    let runningTotal = 0;
    entries.forEach(entry => {
      entry.netChange = entry.pointsGained - entry.pointsLost;
      runningTotal += entry.netChange;
      entry.dailyTotal = runningTotal;

      Object.keys(entry.categories).forEach(categoryName => {
        const categoryHabits = habits.filter(h => (h.category || 'General') === categoryName);
        entry.categories[categoryName].questsTotal = categoryHabits.length;
      });
    });

    const totalGained = entries.reduce((sum, entry) => sum + entry.pointsGained, 0);
    const totalLost = entries.reduce((sum, entry) => sum + entry.pointsLost, 0);
    const netTotal = totalGained - totalLost;

    const bestDay = entries.reduce((best, entry) =>
      !best || entry.netChange > best.netChange ? entry : best, null as PointsHistoryEntry | null);

    const worstDay = entries.reduce((worst, entry) =>
      !worst || entry.netChange < worst.netChange ? entry : worst, null as PointsHistoryEntry | null);

    return {
      entries: entries.reverse(), // Most recent first
      totalGained,
      totalLost,
      netTotal,
      bestDay,
      worstDay
    };
  } catch (error) {
    return {
      entries: [],
      totalGained: 0,
      totalLost: 0,
      netTotal: 0,
      bestDay: null,
      worstDay: null
    };
  }
};