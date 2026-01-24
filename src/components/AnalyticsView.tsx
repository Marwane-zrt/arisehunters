import React from 'react';
import { BarChart3, TrendingUp, Award, History } from 'lucide-react';
import { Habit } from '../types/habit';
import { Goal } from '../types/goal';
import { Category } from '../types/category';
import { CategoryRadarChart } from './CategoryRadarChart';
import { PointsHistoryChart } from './PointsHistoryChart';
import { getRankFromPoints } from '../utils/rankingSystem';
import { calculatePointsHistory } from '../utils/pointsHistory';
import { PointsHistoryData } from '../types/pointsHistory';
import { QuestCalendar } from './QuestCalendar';

interface AnalyticsViewProps {
  habits: Habit[];
  goals: Goal[];
  categories: Category[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  habits,
  goals,
  categories
}) => {
  const [pointsHistory, setPointsHistory] = React.useState<PointsHistoryData | null>(null);
  const [historyLoading, setHistoryLoading] = React.useState(true);

  // Load points history when component mounts or data changes
  React.useEffect(() => {
    const loadPointsHistory = async () => {
      setHistoryLoading(true);
      try {
        const history = await calculatePointsHistory(habits, categories);
        setPointsHistory(history);
      } catch (error) {
        console.error('Error loading points history:', error);
      } finally {
        setHistoryLoading(false);
      }
    };

    loadPointsHistory();
  }, [habits, categories]);

  const totalCompletions = habits.reduce((sum, habit) => sum + habit.completedDates.length, 0);
  const averageStreak = habits.length > 0 ? Math.round(habits.reduce((sum, habit) => sum + habit.streak, 0) / habits.length) : 0;
  const completedGoals = goals.filter(goal => goal.isCompleted).length;
  const goalCompletionRate = goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-cyan-500 rounded-xl blur-lg opacity-50"></div>
          <div className="relative p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
            <BarChart3 className="text-white" size={28} />
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white tracking-wide">Analytics</h2>
          <p className="text-cyan-300 font-medium">Track your progress and insights</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-cyan-400 mb-2">{totalCompletions}</div>
          <div className="text-sm text-gray-400">Total Completions</div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-orange-400 mb-2">{averageStreak}</div>
          <div className="text-sm text-gray-400">Average Streak</div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">{goalCompletionRate}%</div>
          <div className="text-sm text-gray-400">Goal Success Rate</div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-purple-400 mb-2">{categories.length}</div>
          <div className="text-sm text-gray-400">Active Categories</div>
        </div>
      </div>

      {/* Points History Chart */}
      {historyLoading ? (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <History className="text-cyan-400" size={20} />
            <h3 className="text-lg font-semibold text-white">Points History</h3>
          </div>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-400 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-400">Loading points history...</p>
          </div>
        </div>
      ) : pointsHistory ? (
        <PointsHistoryChart historyData={pointsHistory} />
      ) : null}

      {/* Quest Calendar */}
      <QuestCalendar habits={habits} />

      {/* Category Progress Chart */}
      <CategoryRadarChart categories={categories} />
    </div>
  );
};