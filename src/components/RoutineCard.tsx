import React, { useState } from 'react';
import { Folder, CreditCard as Edit, Trash2, ChevronDown, ChevronRight, Check, Plus, X } from 'lucide-react';
import { Routine } from '../types/routine';
import { Habit } from '../types/habit';
import { getLocalDateString } from '../utils/dateUtils';

interface RoutineCardProps {
  routine: Routine;
  habits: Habit[];
  onToggleComplete: (habitId: string) => void;
  onEditRoutine: (routine: Routine) => void;
  onDeleteRoutine: (routineId: string) => void;
  onAddQuestToRoutine: (routineId: string, habitId: string) => void;
  onRemoveQuestFromRoutine: (routineId: string, habitId: string) => void;
}

export const RoutineCard: React.FC<RoutineCardProps> = ({
  routine,
  habits,
  onToggleComplete,
  onEditRoutine,
  onDeleteRoutine,
  onAddQuestToRoutine,
  onRemoveQuestFromRoutine
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAddQuest, setShowAddQuest] = useState(false);

  const routineHabits = habits.filter(habit => routine.habitIds.includes(habit.id));
  const availableHabits = habits.filter(habit => !routine.habitIds.includes(habit.id));
  const today = getLocalDateString();
  const completedToday = routineHabits.filter(habit =>
    habit.completedDates.includes(today)
  ).length;

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl blur-sm group-hover:blur-md transition-all"></div>
      <div className="relative bg-black/70 backdrop-blur-sm border border-purple-500/30 rounded-xl shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group hover:border-purple-400/50">

        {/* Header */}
        <div className="p-4 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </button>
              <div className="relative">
                <div
                  className="w-4 h-4 rounded-full border-2 border-white/20"
                  style={{ backgroundColor: routine.color, boxShadow: `0 0 10px ${routine.color}60` }}
                />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg tracking-wide flex items-center gap-2">
                  <Folder size={18} className="text-purple-400" />
                  {routine.name}
                </h3>
                {routine.description && (
                  <p className="text-sm text-gray-400 mt-1">{routine.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-400">
                {completedToday}/{routineHabits.length} completed
              </div>
              <button
                onClick={() => setShowAddQuest(!showAddQuest)}
                className="text-gray-500 hover:text-green-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
                title="Add quest to routine"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={() => onEditRoutine(routine)}
                className="text-gray-500 hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => onDeleteRoutine(routine.id)}
                className="text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${routineHabits.length > 0 ? (completedToday / routineHabits.length) * 100 : 0}%`,
                  backgroundColor: routine.color
                }}
              />
            </div>
          </div>
        </div>

        {/* Add Quest Section */}
        {isExpanded && showAddQuest && availableHabits.length > 0 && (
          <div className="px-4 pb-4 border-b border-gray-700/50">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <h4 className="text-sm font-medium text-green-400 mb-2 flex items-center gap-2">
                <Plus size={14} />
                Add Quest to Routine
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {availableHabits.map(habit => (
                  <button
                    key={habit.id}
                    onClick={() => {
                      onAddQuestToRoutine(routine.id, habit.id);
                      setShowAddQuest(false);
                    }}
                    className="w-full flex items-center gap-3 p-2 bg-black/40 hover:bg-green-500/20 rounded-lg transition-all text-left"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: habit.color }}
                    />
                    <span className="text-white text-sm">{habit.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Habits List */}
        {isExpanded && (
          <div className="p-4 space-y-3">
            {routineHabits.length === 0 ? (
              <>
                <div className="text-center py-4 text-gray-400">
                  No quests in this routine
                </div>
                {availableHabits.length > 0 && (
                  <button onClick={() => setShowAddQuest(true)} className="text-green-400 hover:text-green-300 text-sm">
                    Click the + button above to add quests
                  </button>
                )}
              </>
            ) : (
              routineHabits.map(habit => {
                const isCompletedToday = habit.completedDates.includes(today);

                return (
                  <div key={habit.id} className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl blur-sm group-hover:blur-md transition-all"></div>
                    <div className={`relative flex items-center justify-between p-4 rounded-xl border transition-all duration-300 group hover:shadow-lg ${isCompletedToday
                        ? 'bg-green-500/10 border-green-500/30 hover:border-green-400/50 shadow-green-500/10'
                        : 'bg-black/40 backdrop-blur-sm border-gray-600/30 hover:border-gray-500/50'
                      }`}>
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Quest Color Indicator */}
                        <div className="relative">
                          <div
                            className="w-4 h-4 rounded-full border-2 border-white/20 shadow-lg"
                            style={{
                              backgroundColor: habit.color,
                              boxShadow: `0 0 10px ${habit.color}60`
                            }}
                          />
                          {isCompletedToday && (
                            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
                          )}
                        </div>

                        {/* Quest Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className={`font-semibold text-sm sm:text-base truncate transition-all ${isCompletedToday ? 'text-green-300 line-through' : 'text-white'
                              }`}>
                              {habit.name}
                            </span>
                            {isCompletedToday && (
                              <div className="flex items-center gap-1 bg-green-500/20 border border-green-500/30 rounded-full px-2 py-1">
                                <Check size={10} className="text-green-400" />
                                <span className="text-green-400 text-xs font-bold uppercase tracking-wider">Complete</span>
                              </div>
                            )}
                          </div>

                          {/* Quest Stats */}
                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1 text-orange-400">
                              <div className="w-3 h-3 flex items-center justify-center">🔥</div>
                              <span className="font-medium">{habit.streak} streak</span>
                            </div>
                            <div className="flex items-center gap-1 text-cyan-400">
                              <div className="w-3 h-3 flex items-center justify-center">📊</div>
                              <span className="font-medium">{habit.completedDates.length} total</span>
                            </div>
                            {habit.category && (
                              <div className="bg-gray-700/50 border border-gray-600/50 rounded px-2 py-1">
                                <span className="text-gray-300 font-medium">{habit.category}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => onRemoveQuestFromRoutine(routine.id, habit.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1 mr-2"
                        title="Remove from routine"
                      >
                        <X size={14} />
                      </button>

                      <button
                        onClick={() => onToggleComplete(habit.id)}
                        className={`relative group/btn flex-shrink-0 transition-all duration-300 ${isCompletedToday ? 'scale-110' : 'hover:scale-110'
                          }`}
                      >
                        {isCompletedToday ? (
                          <>
                            <div className="absolute inset-0 bg-green-500 rounded-xl blur-lg opacity-75 group-hover/btn:opacity-100 transition-all"></div>
                            <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg border border-green-400/30 font-bold">
                              <Check size={18} />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-lg opacity-0 group-hover/btn:opacity-75 transition-all"></div>
                            <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-blue-600 hover:to-purple-700 text-gray-400 hover:text-white rounded-xl border border-gray-600 hover:border-blue-500/50 transition-all shadow-lg">
                              <Check size={18} />
                            </div>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};