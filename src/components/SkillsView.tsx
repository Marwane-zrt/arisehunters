import React, { useState } from 'react';
import { Plus, BookOpen, Brain, Trophy, Target } from 'lucide-react';
import { Skill, SkillFormData } from '../types/skill';
import { Category } from '../types/category';
import { SkillCard } from './SkillCard';
import { AddSkillModal } from './AddSkillModal';
import { LimitModal, LimitType } from './LimitModal';
import { getRankFromPoints } from '../utils/rankingSystem';

interface SkillsViewProps {
  skills: Skill[];
  categories: Category[];
  goals: Goal[];
  onAddSkill: (skill: SkillFormData) => void;
  onUpdateSkill: (skillId: string, updates: Partial<Skill>) => void;
  onDeleteSkill: (skillId: string) => void;
  totalPoints: number;
}

export const SkillsView: React.FC<SkillsViewProps> = ({
  skills,
  categories,
  goals,
  onAddSkill,
  onUpdateSkill,
  onDeleteSkill,
  totalPoints
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [limitModalConfig, setLimitModalConfig] = useState<{isOpen: boolean, type: LimitType, limitValue?: number}>({ isOpen: false, type: 'SKILLS' });
  const [filterStatus, setFilterStatus] = useState<'all' | 'Learning' | 'Learned' | 'Mastered'>('all');

  const maxSkills = getRankFromPoints(totalPoints).maxSkills;

  const handleAddSkillClick = () => {
    if (skills.length >= maxSkills) {
      setLimitModalConfig({ isOpen: true, type: 'SKILLS', limitValue: maxSkills });
    } else {
      setIsAddModalOpen(true);
    }
  };

  const learningSkills = skills.filter(skill => skill.status === 'Learning');
  const learnedSkills = skills.filter(skill => skill.status === 'Learned');
  const masteredSkills = skills.filter(skill => skill.status === 'Mastered');

  const filteredSkills = filterStatus === 'all' ? skills : skills.filter(skill => skill.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Learning': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'Learned': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'Mastered': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500 rounded-xl blur-lg opacity-50"></div>
            <div className="relative p-2 sm:p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
              <Brain className="text-white" size={24} />
            </div>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">Skill Tree</h2>
            <p className="text-green-300 font-medium text-sm sm:text-base">Master new abilities and knowledge</p>
          </div>
        </div>
        
        <div className="w-full sm:w-auto">
          <button
            onClick={handleAddSkillClick}
            className="relative group w-full sm:w-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-all"></div>
            <div className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-4 sm:px-6 py-3 rounded-xl font-bold transition-all shadow-lg border border-green-400/30 uppercase tracking-wider">
              <Plus size={18} />
              <span className="text-sm sm:text-base">New Skill</span>
            </div>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-blue-400">{learningSkills.length}</div>
          <div className="text-xs sm:text-sm text-gray-400">Currently Learning</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-green-400">{learnedSkills.length}</div>
          <div className="text-xs sm:text-sm text-gray-400">Skills Learned</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-purple-400">{masteredSkills.length}</div>
          <div className="text-xs sm:text-sm text-gray-400">Mastered</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-cyan-400">{skills.length}</div>
          <div className="text-xs sm:text-sm text-gray-400">Total Skills</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 sm:gap-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-2">
        {[
          { key: 'all', label: 'All Skills', icon: BookOpen },
          { key: 'Learning', label: 'Learning', icon: Target },
          { key: 'Learned', label: 'Learned', icon: BookOpen },
          { key: 'Mastered', label: 'Mastered', icon: Trophy }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key as any)}
            className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-all ${
              filterStatus === key
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <Icon size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      {skills.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl"></div>
            <div className="relative bg-black/60 border-2 border-green-500/30 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto">
              <Brain className="text-green-400" size={28} />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 tracking-wide">Start Your Learning Journey</h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed text-sm sm:text-base">
            Add your first skill to track your learning progress and build your knowledge arsenal. 
            Every master was once a beginner.
          </p>
          <button
            onClick={handleAddSkillClick}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-all"></div>
            <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold transition-all uppercase tracking-wider text-sm sm:text-base">
              Add First Skill
            </div>
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 px-2 sm:px-0">
          {filteredSkills
            .sort((a, b) => {
              // Sort by status priority, then by creation date
              const statusOrder = { 'Learning': 0, 'Learned': 1, 'Mastered': 2 };
              if (statusOrder[a.status] !== statusOrder[b.status]) {
                return statusOrder[a.status] - statusOrder[b.status];
              }
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            })
            .map(skill => (
              <SkillCard
                key={skill.id}
                skill={skill}
                goals={goals}
                onUpdateSkill={onUpdateSkill}
                onDeleteSkill={onDeleteSkill}
              />
            ))}
        </div>
      )}

      {/* Add Skill Modal */}
      <AddSkillModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSkill={onAddSkill}
        categories={categories}
        goals={goals}
      />

      <LimitModal 
        isOpen={limitModalConfig.isOpen}
        onClose={() => setLimitModalConfig({ ...limitModalConfig, isOpen: false })}
        type={limitModalConfig.type}
        limitValue={limitModalConfig.limitValue}
      />
    </div>
  );
};