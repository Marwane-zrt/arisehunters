import React, { useState } from 'react';
import { X, Brain, Plus, Trash2 } from 'lucide-react';
import { SkillFormData } from '../types/skill';
import { Category } from '../types/category';
import { Goal } from '../types/goal';
import { getLocalDateString } from '../utils/dateUtils';

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSkill: (skill: SkillFormData) => void;
  categories: Category[];
  goals: Goal[];
}

const SKILL_COLORS = [
  '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B',
  '#EF4444', '#EC4899', '#84CC16', '#6366F1',
  '#14B8A6', '#F97316', '#06B6D4', '#8B5CF6'
];

export const AddSkillModal: React.FC<AddSkillModalProps> = ({
  isOpen,
  onClose,
  onAddSkill,
  categories,
  goals
}) => {
  const [formData, setFormData] = useState<SkillFormData>({
    name: '',
    category: '',
    level: 'Beginner',
    status: 'Learning',
    description: '',
    startDate: new Date(),
    resources: [],
    color: SKILL_COLORS[0],
    linkedGoalId: ''
  });

  const [newResource, setNewResource] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onAddSkill(formData);
      setFormData({
        name: '',
        category: '',
        level: 'Beginner',
        status: 'Learning',
        description: '',
        startDate: new Date(),
        resources: [],
        color: SKILL_COLORS[0],
        linkedGoalId: ''
      });
      setNewResource('');
      onClose();
    }
  };

  const handleInputChange = (field: keyof SkillFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addResource = () => {
    if (newResource.trim()) {
      setFormData(prev => ({
        ...prev,
        resources: [...prev.resources, newResource.trim()]
      }));
      setNewResource('');
    }
  };

  const removeResource = (index: number) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl"></div>
        <div className="relative bg-black/90 backdrop-blur-sm border border-green-500/30 rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">

          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                <Brain className="text-white" size={20} />
              </div>
              <h3 className="text-xl font-bold text-white tracking-wide">Add New Skill</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Skill Name */}
            <div>
              <label className="block text-sm font-bold text-green-300 mb-3 uppercase tracking-wider">
                Skill Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full bg-black/60 border border-green-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="e.g., React Development"
                required
              />
            </div>

            {/* Category and Level */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-green-300 mb-3 uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full bg-black/60 border border-green-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                >
                  <option value="" className="bg-black">No Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name} className="bg-black">
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-green-300 mb-3 uppercase tracking-wider">
                  Level
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => handleInputChange('level', e.target.value)}
                  className="w-full bg-black/60 border border-green-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                >
                  <option value="Beginner" className="bg-black">Beginner</option>
                  <option value="Intermediate" className="bg-black">Intermediate</option>
                  <option value="Advanced" className="bg-black">Advanced</option>
                  <option value="Expert" className="bg-black">Expert</option>
                  <option value="Master" className="bg-black">Master</option>
                </select>
              </div>
            </div>

            {/* Status and Start Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-green-300 mb-3 uppercase tracking-wider">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full bg-black/60 border border-green-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                >
                  <option value="Learning" className="bg-black">Learning</option>
                  <option value="Learned" className="bg-black">Learned</option>
                  <option value="Mastered" className="bg-black">Mastered</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-green-300 mb-3 uppercase tracking-wider">
                  Start Date
                </label>
                <input
                  type="date"
                  value={getLocalDateString(formData.startDate)}
                  onChange={(e) => handleInputChange('startDate', new Date(e.target.value))}
                  className="w-full bg-black/60 border border-green-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Linked Goal */}
            <div>
              <label className="block text-sm font-bold text-green-300 mb-3 uppercase tracking-wider">
                Link to Raid (Optional)
              </label>
              <select
                value={formData.linkedGoalId}
                onChange={(e) => handleInputChange('linkedGoalId', e.target.value)}
                className="w-full bg-black/60 border border-green-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              >
                <option value="" className="bg-black">No linked raid</option>
                {goals.map(goal => (
                  <option key={goal.id} value={goal.id} className="bg-black">
                    {goal.title} {goal.isCompleted ? '(Completed)' : ''}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Link this skill to a raid to show how it helps achieve your goals
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-green-300 mb-3 uppercase tracking-wider">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full bg-black/60 border border-green-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="What are you learning and why?"
                rows={3}
              />
            </div>

            {/* Resources */}
            <div>
              <label className="block text-sm font-bold text-green-300 mb-3 uppercase tracking-wider">
                Learning Resources
              </label>

              {formData.resources.length > 0 && (
                <div className="space-y-2 mb-3">
                  {formData.resources.map((resource, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                      <span className="text-white text-sm">{resource}</span>
                      <button
                        type="button"
                        onClick={() => removeResource(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a resource (book, course, website, etc.)"
                  value={newResource}
                  onChange={(e) => setNewResource(e.target.value)}
                  className="flex-1 bg-black/60 border border-green-500/30 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="button"
                  onClick={addResource}
                  className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded text-sm transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-bold text-green-300 mb-3 uppercase tracking-wider">
                Skill Color
              </label>
              <div className="grid grid-cols-6 gap-3">
                {SKILL_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleInputChange('color', color)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${formData.color === color ? 'border-white scale-110 shadow-lg' : 'border-gray-600'
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
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg border border-green-400/30 uppercase tracking-wider"
              >
                Add Skill
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};