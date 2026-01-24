import React, { useState } from 'react';
import { X, Swords } from 'lucide-react';
import { HabitFormData } from '../types/habit';
import { Category } from '../types/category';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHabit: (habit: HabitFormData) => void;
  categories: Category[];
}

const HABIT_COLORS = [
  '#3B82F6', '#8B5CF6', '#06B6D4', '#10B981',
  '#F59E0B', '#EF4444', '#EC4899', '#84CC16',
  '#6366F1', '#14B8A6', '#F97316', '#8B5CF6'
];

export const AddHabitModal: React.FC<AddHabitModalProps> = ({
  isOpen,
  onClose,
  onAddHabit,
  categories
}) => {
  const [formData, setFormData] = useState<HabitFormData>({
    name: '',
    category: '',
    color: HABIT_COLORS[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onAddHabit(formData);
      setFormData({
        name: '',
        category: '',
        color: HABIT_COLORS[0]
      });
      onClose();
    }
  };

  const handleInputChange = (field: keyof HabitFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
        <div className="relative bg-black/90 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8 w-full max-w-md shadow-2xl">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Swords className="text-white" size={20} />
              </div>
              <h3 className="text-xl font-bold text-white tracking-wide">Create New Quest</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quest Name */}
            <div>
              <label className="block text-sm font-bold text-blue-300 mb-3 uppercase tracking-wider">
                Quest Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full bg-black/60 border border-blue-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="e.g., Morning Meditation Training"
                required
              />
              <p className="text-xs text-red-300 mt-2">
                ⚠️ You'll lose 1 point if this quest isn't completed daily
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-blue-300 mb-3 uppercase tracking-wider">
                Guild Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full bg-black/60 border border-blue-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="" className="bg-black">No Guild</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name} className="bg-black">
                    {category.name}
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  Create guilds in Settings to organize your quests
                </p>
              )}
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-bold text-blue-300 mb-3 uppercase tracking-wider">
                Quest Color
              </label>
              <div className="grid grid-cols-6 gap-3">
                {HABIT_COLORS.map(color => (
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
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg border border-blue-400/30 uppercase tracking-wider"
              >
                Create Quest
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};