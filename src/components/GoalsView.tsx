import React, { useState } from 'react';
import { Plus, Target, AlertTriangle, Calendar } from 'lucide-react';
import { Goal, GoalFormData, Milestone } from '../types/goal';
import { Category } from '../types/category';
import { GoalCard } from './GoalCard';
import { AddGoalModal } from './AddGoalModal';
import { getDaysUntilDeadline, isOverdue } from '../utils/dateUtils';

interface GoalsViewProps {
  goals: Goal[];
  categories: Category[];
  onAddGoal: (goal: GoalFormData) => void;
  onToggleGoalComplete: (goalId: string) => void;
  onToggleMilestone: (goalId: string, milestoneId: string) => void;
  onDeleteGoal: (goalId: string) => void;
  onAddMilestone: (goalId: string, milestone: Omit<Milestone, 'id' | 'isCompleted' | 'completedDate'>) => void;
  onDeleteMilestone: (goalId: string, milestoneId: string) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  categories,
  onAddGoal,
  onToggleGoalComplete,
  onToggleMilestone,
  onDeleteGoal,
  onAddMilestone,
  onDeleteMilestone,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const activeGoals = goals.filter(goal => !goal.isCompleted);
  const completedGoals = goals.filter(goal => goal.isCompleted);
  const overdueGoals = activeGoals.filter(goal => isOverdue(goal.targetDate));
  const upcomingGoals = activeGoals.filter(goal => {
    const days = getDaysUntilDeadline(goal.targetDate);
    return days <= 7 && days >= 0;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500 rounded-xl blur-lg opacity-50"></div>
            <div className="relative p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
              <Target className="text-white" size={24} />
            </div>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">Goals & Milestones</h2>
            <p className="text-purple-300 font-medium text-sm sm:text-base">Set targets and track your progress</p>
          </div>
        </div>
        
        <div className="w-full sm:w-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="relative group w-full sm:w-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-all"></div>
            <div className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-4 sm:px-6 py-3 rounded-xl font-bold transition-all shadow-lg border border-purple-400/30 uppercase tracking-wider">
              <Plus size={18} />
              <span className="text-sm sm:text-base">Add Goal</span>
            </div>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-purple-400">{activeGoals.length}</div>
          <div className="text-xs sm:text-sm text-gray-400">Active Goals</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-green-400">{completedGoals.length}</div>
          <div className="text-xs sm:text-sm text-gray-400">Completed</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-yellow-400">{upcomingGoals.length}</div>
          <div className="text-xs sm:text-sm text-gray-400">Due Soon</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-red-400">{overdueGoals.length}</div>
          <div className="text-xs sm:text-sm text-gray-400">Overdue</div>
        </div>
      </div>

      {/* Alerts */}
      {(overdueGoals.length > 0 || upcomingGoals.length > 0) && (
        <div className="space-y-3">
          {overdueGoals.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 text-red-400 mb-2">
                <AlertTriangle size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="font-semibold text-sm sm:text-base">Overdue Goals ({overdueGoals.length})</span>
              </div>
              <div className="text-xs sm:text-sm text-gray-300">
                {overdueGoals.map(goal => goal.title).join(', ')}
              </div>
            </div>
          )}
          
          {upcomingGoals.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 text-yellow-400 mb-2">
                <Calendar size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="font-semibold text-sm sm:text-base">Due This Week ({upcomingGoals.length})</span>
              </div>
              <div className="text-xs sm:text-sm text-gray-300">
                {upcomingGoals.map(goal => goal.title).join(', ')}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-2xl"></div>
            <div className="relative bg-black/60 border-2 border-purple-500/30 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto">
              <Target className="text-purple-400" size={28} />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 tracking-wide">Set Your First Goal</h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed text-sm sm:text-base">
            Create meaningful goals with deadlines and milestones to track your progress and achieve success.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-all"></div>
            <div className="relative bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold transition-all uppercase tracking-wider text-sm sm:text-base">
              Create First Goal
            </div>
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 px-2 sm:px-0">
          {goals
            .sort((a, b) => {
              const aOverdue = isOverdue(a.targetDate);
              const bOverdue = isOverdue(b.targetDate);
              
              if (aOverdue && !bOverdue) return -1;
              if (!aOverdue && bOverdue) return 1;
              
              const priorityOrder = { high: 3, medium: 2, low: 1 };
              return priorityOrder[b.priority] - priorityOrder[a.priority];
            })
            .map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onToggleGoalComplete={onToggleGoalComplete}
                onToggleMilestone={onToggleMilestone}
                onDeleteGoal={onDeleteGoal}
                onAddMilestone={onAddMilestone}
                onDeleteMilestone={onDeleteMilestone}
              />
            ))}
        </div>
      )}

      {/* Add Goal Modal */}
      <AddGoalModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddGoal={onAddGoal}
        categories={categories}
      />
    </div>
  );
};