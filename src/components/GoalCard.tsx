import React, { useState } from 'react';
import { Calendar, CheckCircle, Clock, Flag, Target, Trash2, Plus, X } from 'lucide-react';
import { Goal, Milestone } from '../types/goal';
import { getDaysUntilDeadline, isOverdue } from '../utils/dateUtils';

interface GoalCardProps {
  goal: Goal;
  onToggleGoalComplete: (goalId: string) => void;
  onToggleMilestone: (goalId: string, milestoneId: string) => void;
  onDeleteGoal: (goalId: string) => void;
  onAddMilestone: (goalId: string, milestone: Omit<Milestone, 'id' | 'isCompleted' | 'completedDate'>) => void;
  onDeleteMilestone: (goalId: string, milestoneId: string) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onToggleGoalComplete,
  onToggleMilestone,
  onDeleteGoal,
  onAddMilestone,
  onDeleteMilestone
}) => {
  const [showMilestones, setShowMilestones] = useState(false);
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    targetDate: new Date()
  });

  const daysUntil = getDaysUntilDeadline(goal.targetDate);
  const overdue = isOverdue(goal.targetDate);
  const completedMilestones = goal.milestones.filter(m => m.isCompleted).length;
  const progress = goal.milestones.length > 0 ? (completedMilestones / goal.milestones.length) * 100 : 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMilestone.title.trim()) {
      onAddMilestone(goal.id, newMilestone);
      setNewMilestone({ title: '', targetDate: new Date() });
      setIsAddingMilestone(false);
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-200 group hover:border-gray-600">
      {/* Header */}
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: goal.color }}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-sm sm:text-base truncate">{goal.title}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {goal.category && (
                <span className="text-xs sm:text-sm text-gray-400">{goal.category}</span>
              )}
              <div className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(goal.priority)}`}>
                {goal.priority.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => onDeleteGoal(goal.id)}
          className="text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 p-1"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-3 sm:mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs sm:text-sm text-gray-400">Progress</span>
          <span className="text-xs sm:text-sm font-medium text-white">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              backgroundColor: goal.color
            }}
          />
        </div>
      </div>

      {/* Deadline Info */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 text-xs sm:text-sm">
        <div className="flex items-center gap-1 sm:gap-2">
          <Calendar className="text-cyan-400" size={14} />
          <span className="text-gray-300">
            {goal.targetDate.toLocaleDateString()}
          </span>
        </div>
        <div className={`flex items-center gap-1 sm:gap-2 ${
          overdue ? 'text-red-400' : daysUntil <= 7 ? 'text-yellow-400' : 'text-gray-300'
        }`}>
          <Clock size={14} />
          <span>
            {overdue ? `${Math.abs(daysUntil)} days overdue` : `${daysUntil} days left`}
          </span>
        </div>
      </div>

      {/* Milestones Section */}
      <div className="mb-3 sm:mb-4">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setShowMilestones(!showMilestones)}
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-300 hover:text-white transition-colors font-medium"
          >
            <Target size={14} />
            <span>Milestones ({completedMilestones}/{goal.milestones.length})</span>
            <div className={`transform transition-transform text-xs ${showMilestones ? 'rotate-90' : ''}`}>
              ▶
            </div>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingMilestone(true)}
              className="flex items-center gap-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded-lg text-xs font-medium transition-all border border-cyan-500/30"
            >
              <Plus size={10} />
              Add Milestone
            </button>
          </div>
        </div>

        {(showMilestones || goal.milestones.length === 0) && (
          <div className="space-y-2 mt-3">
            {goal.milestones.length === 0 && !isAddingMilestone && (
              <div className="text-center py-3 sm:py-4 bg-gray-700/20 rounded-lg border border-gray-600/30">
                <p className="text-gray-400 text-xs sm:text-sm mb-2">No milestones yet</p>
                <button
                  onClick={() => setIsAddingMilestone(true)}
                  className="text-cyan-400 hover:text-cyan-300 text-xs sm:text-sm font-medium transition-colors"
                >
                  Add your first milestone
                </button>
              </div>
            )}
            
            {goal.milestones.map(milestone => (
              <div
                key={milestone.id}
                className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border transition-all group ${
                  milestone.isCompleted
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-gray-700/30 border-gray-600'
                }`}
              >
                <button
                  onClick={() => onToggleMilestone(goal.id, milestone.id)}
                  className={`flex-shrink-0 ${
                    milestone.isCompleted ? 'text-green-400' : 'text-gray-500 hover:text-green-400'
                  } transition-colors`}
                >
                  <CheckCircle size={16} />
                </button>
                <div className="flex-1">
                  <div className={`text-xs sm:text-sm font-medium ${
                    milestone.isCompleted ? 'text-green-300 line-through' : 'text-white'
                  }`}>
                    {milestone.title}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5 sm:mt-1">
                    Due: {milestone.targetDate.toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => onDeleteMilestone(goal.id, milestone.id)}
                  className="flex-shrink-0 text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
                  title="Delete milestone"
                >
                  <X size={12} />
                </button>
              </div>
            ))}

            {/* Add Milestone Form */}
            {isAddingMilestone && (
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <Target className="text-cyan-400" size={14} />
                  <span className="text-cyan-400 font-medium text-xs sm:text-sm">Add New Milestone</span>
                </div>
                <form onSubmit={handleAddMilestone} className="space-y-2 sm:space-y-3">
                  <input
                    type="text"
                    placeholder="What milestone do you want to achieve?"
                    value={newMilestone.title}
                    onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-black/60 border border-cyan-500/30 rounded-lg px-3 py-2 text-white text-xs sm:text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                    autoFocus
                  />
                  <input
                    type="date"
                    value={newMilestone.targetDate.toISOString().split('T')[0]}
                    onChange={(e) => setNewMilestone(prev => ({ ...prev, targetDate: new Date(e.target.value) }))}
                    className="w-full bg-black/60 border border-cyan-500/30 rounded-lg px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  />
                  <div className="flex gap-2 text-xs sm:text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingMilestone(false);
                        setNewMilestone({ title: '', targetDate: new Date() });
                      }}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 py-2 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium py-2 rounded-lg transition-all shadow-lg"
                    >
                      Add Milestone
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Complete Goal Button */}
      <button
        onClick={() => onToggleGoalComplete(goal.id)}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base ${
          goal.isCompleted
            ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
            : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
        }`}
      >
        <Flag size={14} className="sm:w-4 sm:h-4" />
        {goal.isCompleted ? 'Goal Completed!' : 'Mark as Complete'}
      </button>
    </div>
  );
};