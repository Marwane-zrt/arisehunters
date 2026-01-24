import React, { useState } from 'react';
import { X, Shield } from 'lucide-react';
import { RuleFormData } from '../types/rule';
import { Category } from '../types/category';

interface AddRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRule: (rule: RuleFormData) => void;
  categories: Category[];
}

const RULE_COLORS = [
  '#EF4444', '#DC2626', '#B91C1C', '#991B1B',
  '#F97316', '#EA580C', '#C2410C', '#9A3412',
  '#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6',
  '#EC4899', '#DB2777', '#BE185D', '#9D174D'
];

export const AddRuleModal: React.FC<AddRuleModalProps> = ({
  isOpen,
  onClose,
  onAddRule,
  categories
}) => {
  const [formData, setFormData] = useState<RuleFormData>({
    title: '',
    description: '',
    color: RULE_COLORS[0],
    category: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onAddRule(formData);
      setFormData({
        title: '',
        description: '',
        color: RULE_COLORS[0],
        category: ''
      });
      onClose();
    }
  };

  const handleInputChange = (field: keyof RuleFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-2xl blur-xl"></div>
        <div className="relative bg-black/90 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8 w-full max-w-md shadow-2xl">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg">
                <Shield className="text-white" size={20} />
              </div>
              <h3 className="text-xl font-bold text-white tracking-wide">Create New Rule</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rule Title */}
            <div>
              <label className="block text-sm font-bold text-red-300 mb-3 uppercase tracking-wider">
                Rule Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full bg-black/60 border border-red-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="e.g., No social media before 10 AM"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-red-300 mb-3 uppercase tracking-wider">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full bg-black/60 border border-red-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="Why is this rule important to you?"
                rows={3}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-red-300 mb-3 uppercase tracking-wider">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full bg-black/60 border border-red-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              >
                <option value="" className="bg-black">No Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name} className="bg-black">
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-bold text-red-300 mb-3 uppercase tracking-wider">
                Rule Color
              </label>
              <div className="grid grid-cols-8 gap-3">
                {RULE_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleInputChange('color', color)}
                    className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${
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
                className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg border border-red-400/30 uppercase tracking-wider"
              >
                Create Rule
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};