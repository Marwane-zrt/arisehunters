import React, { useState } from 'react';
import { X, Folder, Plus } from 'lucide-react';
import { RoutineFormData } from '../types/routine';
import { Habit } from '../types/habit';

interface AddRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRoutine: (routine: RoutineFormData) => void;
  habits: Habit[];
  routines: any[];
  editingRoutine?: any;
  onUpdateRoutine?: (routineId: string, updates: Partial<RoutineFormData>) => void;
}

const ROUTINE_COLORS = [
  '#8B5CF6', '#A855F7', '#9333EA', '#7C3AED',
  '#6366F1', '#4F46E5', '#4338CA', '#3730A3',
  '#EC4899', '#DB2777', '#BE185D', '#9D174D'
];

export const AddRoutineModal: React.FC<AddRoutineModalProps> = ({
  isOpen,
  onClose,
  onAddRoutine,
  habits,
  routines,
  editingRoutine,
  onUpdateRoutine
}) => {
  const [formData, setFormData] = useState<RoutineFormData>({
    name: editingRoutine?.name || '',
    description: editingRoutine?.description || '',
    color: editingRoutine?.color || ROUTINE_COLORS[0],
    habitIds: editingRoutine?.habitIds || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      if (editingRoutine && onUpdateRoutine) {
        onUpdateRoutine(editingRoutine.id, formData);
      } else {
        onAddRoutine(formData);
      }
      setFormData({
        name: '',
        description: '',
        color: ROUTINE_COLORS[0],
        habitIds: []
      });
      onClose();
    }
  };

  const handleInputChange = (field: keyof RoutineFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleHabit = (habitId: string) => {
    setFormData(prev => ({
      ...prev,
      habitIds: prev.habitIds.includes(habitId)
        ? prev.habitIds.filter(id => id !== habitId)
        : [...prev.habitIds, habitId]
    }));
  };

  const availableHabits = habits.filter(habit => 
    editingRoutine ? true : !routines.some(routine => routine.habitIds.includes(habit.id))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-2xl blur-xl"></div>
        <div className="relative bg-black/90 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                <Folder className="text-white" size={20} />
              </div>
              <h3 className="text-xl font-bold text-white tracking-wide">
                {editingRoutine ? 'Edit Routine' : 'Create New Routine'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Routine Name */}
            <div>
              <label className="block text-sm font-bold text-purple-300 mb-3 uppercase tracking-wider">
                Routine Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full bg-black/60 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="e.g., Morning Routine"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-purple-300 mb-3 uppercase tracking-wider">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full bg-black/60 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Describe this routine..."
                rows={3}
              />
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-bold text-purple-300 mb-3 uppercase tracking-wider">
                Routine Color
              </label>
              <div className="grid grid-cols-6 gap-3">
                {ROUTINE_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleInputChange('color', color)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${
                      formData.color === color ? 'border-white scale-110 shadow-lg' : 'border-gray-600'
                    }`}
                    style={{ 
                      backgroundColor: color,
                      boxShadow: formData.color === color ? `0 0 20px ${color}60` : 'none'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Quest Selection */}
            <div>
              <label className="block text-sm font-bold text-purple-300 mb-3 uppercase tracking-wider">
                Select Quests
              </label>
              
              {availableHabits.length === 0 ? (
                <div className="text-center py-4 text-gray-400">
                  No available quests to add
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableHabits.map(habit => (
                    <div
                      key={habit.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                        formData.habitIds.includes(habit.id)
                          ? 'bg-purple-500/20 border-purple-500/50'
                          : 'bg-gray-800/50 border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => toggleHabit(habit.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: habit.color }}
                        />
                        <span className="text-white font-medium">{habit.name}</span>
                        {habit.category && (
                          <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                            {habit.category}
                          </span>
                        )}
                      </div>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        formData.habitIds.includes(habit.id)
                          ? 'bg-purple-500 border-purple-500'
                          : 'border-gray-500'
                      }`}>
                        {formData.habitIds.includes(habit.id) && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 py-3 rounded-lg transition-all font-medium border border-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg border border-purple-400/30 uppercase tracking-wider"
              >
                {editingRoutine ? 'Update Routine' : 'Create Routine'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};