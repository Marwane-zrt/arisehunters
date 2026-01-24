import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { GoalFormData } from '../types/goal';
import { Category } from '../types/category';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGoal: (goal: GoalFormData) => void;
  categories: Category[];
}

const GOAL_COLORS = [
  '#00FFFF', '#FF00FF', '#FFFF00', '#00FF00',
  '#FF4500', '#9932CC', '#FF69B4', '#32CD32',
  '#FFD700', '#FF6347', '#40E0D0', '#DA70D6'
];

export const AddGoalModal: React.FC<AddGoalModalProps> = ({
  isOpen,
  onClose,
  onAddGoal,
  categories
}) => {
  const [formData, setFormData] = useState<GoalFormData>({
    title: '',
    category: '',
    color: GOAL_COLORS[0],
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    priority: 'medium',
    milestones: []
  });

  const [newMilestone, setNewMilestone] = useState({
    title: '',
    targetDate: new Date()
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onAddGoal(formData);
      setFormData({
        title: '',
        category: '',
        color: GOAL_COLORS[0],
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        priority: 'medium',
        milestones: []
      });
      onClose();
    }
  };

  const handleInputChange = (field: keyof GoalFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addMilestone = () => {
    if (newMilestone.title.trim()) {
      setFormData(prev => ({
        ...prev,
        milestones: [...prev.milestones, newMilestone]
      }));
      setNewMilestone({
        title: '',
        targetDate: new Date()
      });
    }
  };

  const removeMilestone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Create New Goal</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Goal Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Learn a new language"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">No category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value as 'low' | 'medium' | 'high')}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target Date
            </label>
            <input
              type="date"
              value={formData.targetDate.toISOString().split('T')[0]}
              onChange={(e) => handleInputChange('targetDate', new Date(e.target.value))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Color
            </label>
            <div className="grid grid-cols-6 gap-2">
              {GOAL_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleInputChange('color', color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${formData.color === color ? 'border-white scale-110' : 'border-gray-600'
                    }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Milestones Section */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Milestones (Optional)
            </label>

            {formData.milestones.length > 0 && (
              <div className="space-y-2 mb-3">
                {formData.milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3">
                    <div>
                      <div className="text-white text-sm font-medium">{milestone.title}</div>
                      <div className="text-gray-400 text-xs">
                        Due: {milestone.targetDate.toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMilestone(index)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Milestone title"
                value={newMilestone.title}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex gap-2">
                <input
                  type="date"
                  value={newMilestone.targetDate.toISOString().split('T')[0]}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, targetDate: new Date(e.target.value) }))}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={addMilestone}
                  className="bg-purple-500 hover:bg-purple-400 text-white px-4 py-2 rounded text-sm transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 py-3 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-medium py-3 rounded-lg transition-all"
            >
              Create Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};