import React, { useState } from 'react';
import { Plus, CheckSquare, Swords, Folder } from 'lucide-react';
import { Habit, HabitFormData } from '../types/habit';
import { Category } from '../types/category';
import { Routine, RoutineFormData } from '../types/routine';
import { HabitCard } from './HabitCard';
import { AddHabitModal } from './AddHabitModal';
import { RoutineCard } from './RoutineCard';
import { AddRoutineModal } from './AddRoutineModal';
import { LimitModal, LimitType } from './LimitModal';
import { getLocalDateString } from '../utils/dateUtils';
import { getRankFromPoints } from '../utils/rankingSystem';
import { Battery } from 'lucide-react';

interface HabitsViewProps {
  habits: Habit[];
  categories: Category[];
  routines: Routine[];
  onAddHabit: (habit: HabitFormData) => void;
  onToggleComplete: (habitId: string) => void;
  onDeleteHabit: (habitId: string) => void;
  onAddRoutine: (routine: RoutineFormData) => void;
  onUpdateRoutine: (routineId: string, updates: Partial<RoutineFormData>) => void;
  onDeleteRoutine: (routineId: string) => void;
  onAddQuestToRoutine: (routineId: string, habitId: string) => void;
  onRemoveQuestFromRoutine: (routineId: string, habitId: string) => void;
  totalPoints: number;
  staminaSpent: number;
  consumeStamina: () => void;
}

export const HabitsView: React.FC<HabitsViewProps> = ({
  habits,
  categories,
  routines,
  onAddHabit,
  onToggleComplete,
  onDeleteHabit,
  onAddRoutine,
  onUpdateRoutine,
  onDeleteRoutine,
  onAddQuestToRoutine,
  onRemoveQuestFromRoutine,
  totalPoints,
  staminaSpent,
  consumeStamina
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddRoutineModalOpen, setIsAddRoutineModalOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [limitModalConfig, setLimitModalConfig] = useState<{isOpen: boolean, type: LimitType, limitValue?: number}>({ isOpen: false, type: 'HABITS' });

  const today = getLocalDateString();
  const maxStamina = getRankFromPoints(totalPoints).stamina;

  const handleAddQuestClick = () => {
    if (habits.length >= maxStamina) {
      setLimitModalConfig({ isOpen: true, type: 'HABITS', limitValue: maxStamina });
    } else {
      setIsAddModalOpen(true);
    }
  };

  // Get habits that are not in any routine
  const habitsInRoutines = new Set(routines.flatMap(routine => routine.habitIds));
  const unorganizedHabits = habits.filter(habit => !habitsInRoutines.has(habit.id));

  const handleEditRoutine = (routine: Routine) => {
    setEditingRoutine(routine);
    setIsAddRoutineModalOpen(true);
  };

  const handleCloseRoutineModal = () => {
    setIsAddRoutineModalOpen(false);
    setEditingRoutine(null);
  };

  const handleToggleCompleteWrapper = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    
    const isAlreadyCompleted = habit.completedDates.includes(today);
    
    if (!isAlreadyCompleted) {
      if (staminaSpent >= maxStamina) {
        setLimitModalConfig({ isOpen: true, type: 'STAMINA' });
        return;
      }
      
      // Permanently consume stamina in database
      consumeStamina();
    }
    
    onToggleComplete(habitId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 rounded-xl blur-lg opacity-50"></div>
            <div className="relative p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
              <CheckSquare className="text-white" size={28} />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-wide">Daily Quests</h2>
            <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 mt-1">
              <p className="text-blue-300 font-medium">Complete your missions to gain EXP</p>
              <div className="flex items-center gap-2 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30">
                <Battery size={14} className="text-blue-400" />
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  Stamina: {Math.max(0, maxStamina - staminaSpent)} / {maxStamina}
                </span>
              </div>
            </div>
            <p className="text-red-300 text-sm font-medium mt-1">⚠️ Lose 1 point per uncompleted quest daily</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsAddRoutineModalOpen(true)}
            className="relative group w-full sm:w-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-all"></div>
            <div className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white px-4 sm:px-6 py-3 rounded-xl font-bold transition-all shadow-lg border border-purple-400/30 uppercase tracking-wider">
              <Folder size={20} />
              <span className="text-sm sm:text-base">New Routine</span>
            </div>
          </button>
          
          <button
            onClick={handleAddQuestClick}
            className="relative group w-full sm:w-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-all"></div>
            <div className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white px-4 sm:px-6 py-3 rounded-xl font-bold transition-all shadow-lg border border-blue-400/30 uppercase tracking-wider">
              <Plus size={20} />
              <span className="text-sm sm:text-base">New Quest</span>
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      {habits.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl"></div>
            <div className="relative bg-black/60 border-2 border-blue-500/30 rounded-full w-24 h-24 flex items-center justify-center mx-auto">
              <Swords className="text-blue-400" size={36} />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 tracking-wide">Begin Your Journey</h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
            Create your first daily quest and start building the habits that will make you stronger. 
            Every hunter starts with a single step.
          </p>
          <button
            onClick={handleAddQuestClick}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-all"></div>
            <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold transition-all uppercase tracking-wider text-sm sm:text-base">
              Create First Quest
            </div>
          </button>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {/* Routines */}
          {routines.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 px-2 sm:px-0">
                <Folder className="text-purple-400" size={20} />
                Routines
              </h3>
              <div className="space-y-4">
                {routines.map(routine => (
                  <RoutineCard
                    key={routine.id}
                    routine={routine}
                    habits={habits}
                    onToggleComplete={handleToggleCompleteWrapper}
                    onEditRoutine={handleEditRoutine}
                    onDeleteRoutine={onDeleteRoutine}
                    onAddQuestToRoutine={onAddQuestToRoutine}
                    onRemoveQuestFromRoutine={onRemoveQuestFromRoutine}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Individual Quests */}
          {unorganizedHabits.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 px-2 sm:px-0">
                <CheckSquare className="text-blue-400" size={20} />
                Individual Quests
              </h3>
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-2 sm:px-0">
                {unorganizedHabits.map(habit => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    onToggleComplete={handleToggleCompleteWrapper}
                    onDeleteHabit={onDeleteHabit}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Habit Modal */}
      <AddHabitModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddHabit={onAddHabit}
        categories={categories}
      />

      {/* Add/Edit Routine Modal */}
      <AddRoutineModal
        isOpen={isAddRoutineModalOpen}
        onClose={handleCloseRoutineModal}
        onAddRoutine={onAddRoutine}
        habits={habits}
        routines={routines}
        editingRoutine={editingRoutine}
        onUpdateRoutine={onUpdateRoutine}
      />

      {/* Limit Modal */}
      <LimitModal 
        isOpen={limitModalConfig.isOpen}
        onClose={() => setLimitModalConfig({ ...limitModalConfig, isOpen: false })}
        type={limitModalConfig.type}
        limitValue={limitModalConfig.limitValue}
      />
    </div>
  );
};