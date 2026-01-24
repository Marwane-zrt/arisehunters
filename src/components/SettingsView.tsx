import React, { useState } from 'react';
import { Settings, Plus, Tag, Trash2 } from 'lucide-react';
import { Category, CategoryFormData } from '../types/category';
import { AddCategoryModal } from './AddCategoryModal';
import { getRankFromPoints } from '../utils/rankingSystem';

interface SettingsViewProps {
  categories: Category[];
  onAddCategory: (category: CategoryFormData) => void;
  onDeleteCategory: (categoryId: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  categories,
  onAddCategory,
  onDeleteCategory
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gray-500 rounded-xl blur-lg opacity-50"></div>
          <div className="relative p-3 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl">
            <Settings className="text-white" size={28} />
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white tracking-wide">Settings</h2>
          <p className="text-gray-300 font-medium">Manage your categories and preferences</p>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Tag className="text-cyan-400" size={20} />
            <h3 className="text-lg font-semibold text-white">Categories</h3>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-gray-900 px-4 py-2 rounded-lg font-medium transition-all"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-8">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-2xl"></div>
              <div className="relative bg-black/60 border-2 border-cyan-500/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                <Tag className="text-cyan-400" size={28} />
              </div>
            </div>
            <h4 className="text-xl font-bold text-white mb-4 tracking-wide">No Categories Yet</h4>
            <p className="text-gray-400 mb-6 leading-relaxed">Create categories to organize your habits and goals</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-all"></div>
              <div className="relative bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all uppercase tracking-wider">
                Create First Category
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {[...categories]
              .sort((a, b) => b.points - a.points)
              .map((category, index) => {
                const rankInfo = getRankFromPoints(category.points);
                
                return (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      {index === 0 && category.points > 0 && (
                        <div className="text-yellow-400 text-lg">🏆</div>
                      )}
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{category.name}</span>
                          <div 
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{ 
                              backgroundColor: rankInfo.color + '20',
                              color: rankInfo.color
                            }}
                          >
                            Rank {rankInfo.rank}
                          </div>
                        </div>
                        <div className="text-sm text-gray-400">{rankInfo.description}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-bold text-white">{category.points} pts</div>
                        <div className="text-sm text-gray-400">
                          Created {category.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => onDeleteCategory(category.id)}
                        disabled={category.name === 'General'}
                        className={`transition-colors opacity-0 group-hover:opacity-100 ${
                          category.name === 'General' 
                            ? 'text-gray-600 cursor-not-allowed' 
                            : 'text-gray-500 hover:text-red-400'
                        }`}
                        title={category.name === 'General' ? 'General category cannot be deleted' : 'Delete category'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddCategory={onAddCategory}
      />
    </div>
  );
};