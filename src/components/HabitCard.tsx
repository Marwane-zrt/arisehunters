import React from 'react';
import { Check, Flame, Target, Trash2, Zap } from 'lucide-react';
import { Habit } from '../types/habit';
import { getLocalDateString } from '../utils/dateUtils';

interface HabitCardProps {
  habit: Habit;
  onToggleComplete: (habitId: string) => void;
  onDeleteHabit: (habitId: string) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onToggleComplete,
  onDeleteHabit
}) => {
  const today = getLocalDateString();
  const isCompletedToday = habit.completedDates.includes(today);
  const completionRate = Math.round((habit.completedDates.length / Math.max(1,
    Math.ceil((Date.now() - habit.createdAt.getTime()) / (1000 * 60 * 60 * 24)))) * 100);

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur-sm group-hover:blur-md transition-all"></div>
      <div className="relative bg-black/70 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 group hover:border-blue-400/50">

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="w-4 h-4 rounded-full border-2 border-white/20"
                style={{ backgroundColor: habit.color, boxShadow: `0 0 10px ${habit.color}60` }}
              />
              {isCompletedToday && (
                <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-white text-lg tracking-wide">{habit.name}</h3>
              {habit.category && (
                <p className="text-sm text-blue-300 uppercase tracking-wider font-medium">{habit.category}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => onDeleteHabit(habit.id)}
            className="text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-black/40 rounded-lg p-3 border border-orange-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="text-orange-400" size={16} />
              <span className="text-xs text-gray-400 uppercase tracking-wider">Streak</span>
            </div>
            <div className="text-xl font-bold text-orange-400">{habit.streak}</div>
          </div>

          <div className="bg-black/40 rounded-lg p-3 border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Target className="text-cyan-400" size={16} />
              <span className="text-xs text-gray-400 uppercase tracking-wider">Rate</span>
            </div>
            <div className="text-xl font-bold text-cyan-400">{completionRate}%</div>
          </div>
        </div>

        {/* Best Streak */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Zap size={12} />
            <span>Best: {habit.bestStreak} days</span>
          </div>
          <div className="text-xs text-gray-500">
            Total: {habit.completedDates.length} clears
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onToggleComplete(habit.id)}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold transition-all duration-300 uppercase tracking-wider ${isCompletedToday
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25 border border-green-400/30'
              : 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-blue-600 hover:to-purple-700 text-gray-200 hover:text-white border border-gray-600 hover:border-blue-500/50'
            }`}
        >
          <Check size={16} />
          {isCompletedToday ? 'Quest Complete!' : 'Complete Quest'}
        </button>
      </div>
    </div>
  );
};