import React, { useState, useEffect } from 'react';
import { Brain, Calendar, BookOpen, ExternalLink, Trash2, Edit, Target, Trophy, Star, Flag, Play, Pause, Clock } from 'lucide-react';
import { Skill } from '../types/skill';
import { Goal } from '../types/goal';

interface SkillCardProps {
  skill: Skill;
  goals: Goal[];
  onUpdateSkill: (skillId: string, updates: Partial<Skill>) => void;
  onDeleteSkill: (skillId: string) => void;
}

export const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  goals,
  onUpdateSkill,
  onDeleteSkill
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editProgress, setEditProgress] = useState(skill.progress);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState(skill.linkedGoalId || '');
  const [liveTimer, setLiveTimer] = useState(skill.totalLearningTime);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (skill.isTimerActive && skill.lastTimerStart) {
      const calculateElapsed = () => {
        const start = new Date(skill.lastTimerStart!).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - start) / 1000);
        setLiveTimer(skill.totalLearningTime + elapsed);
      };
      
      calculateElapsed();
      interval = setInterval(calculateElapsed, 1000);
    } else {
      setLiveTimer(skill.totalLearningTime);
    }
    
    return () => clearInterval(interval);
  }, [skill.isTimerActive, skill.lastTimerStart, skill.totalLearningTime]);

  const toggleTimer = () => {
    if (skill.isTimerActive) {
      onUpdateSkill(skill.id, {
        isTimerActive: false,
        totalLearningTime: liveTimer
      });
    } else {
      onUpdateSkill(skill.id, {
        isTimerActive: true,
        lastTimerStart: new Date()
      });
    }
  };

  const formatLiveTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Learning': return <Target className="text-blue-400" size={16} />;
      case 'Learned': return <BookOpen className="text-green-400" size={16} />;
      case 'Mastered': return <Trophy className="text-purple-400" size={16} />;
      default: return <Brain className="text-gray-400" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Learning': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'Learned': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'Mastered': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getLevelStars = (level: string) => {
    const levels = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3, 'Expert': 4, 'Master': 5 };
    const stars = levels[level as keyof typeof levels] || 1;
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={12}
        className={i < stars ? 'text-yellow-400 fill-current' : 'text-gray-600'}
      />
    ));
  };

  const handleStatusChange = (newStatus: 'Learning' | 'Learned' | 'Mastered') => {
    const updates: Partial<Skill> = { status: newStatus };

    if (newStatus === 'Learned' || newStatus === 'Mastered') {
      updates.completedDate = new Date();
      updates.progress = 100;
    } else {
      updates.completedDate = undefined;
    }

    onUpdateSkill(skill.id, updates);
  };

  const handleProgressUpdate = () => {
    onUpdateSkill(skill.id, { progress: editProgress });
    setIsEditing(false);
  };

  const handleGoalUpdate = () => {
    onUpdateSkill(skill.id, { linkedGoalId: selectedGoalId });
    setIsEditingGoal(false);
  };


  const linkedGoal = goals.find(goal => goal.id === skill.linkedGoalId);

  const daysSinceStart = Math.floor((Date.now() - skill.startDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl blur-sm group-hover:blur-md transition-all"></div>
      <div className="relative bg-black/70 backdrop-blur-sm border border-green-500/30 rounded-xl p-4 sm:p-6 shadow-2xl hover:shadow-green-500/10 transition-all duration-300 group hover:border-green-400/50">

        {/* Header */}
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="relative">
              <div
                className="w-4 h-4 rounded-full border-2 border-white/20"
                style={{ backgroundColor: skill.color, boxShadow: `0 0 10px ${skill.color}60` }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-sm sm:text-lg tracking-wide truncate">{skill.name}</h3>
              {skill.category && (
                <p className="text-xs sm:text-sm text-green-300 uppercase tracking-wider font-medium">{skill.category}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => onDeleteSkill(skill.id)}
            className="text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1 flex-shrink-0"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Status and Level */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-lg border text-xs sm:text-sm font-medium ${getStatusColor(skill.status)}`}>
            <div className="w-3 h-3 sm:w-4 sm:h-4">
              {getStatusIcon(skill.status)}
            </div>
            {skill.status}
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1">
            {getLevelStars(skill.level)}
            <span className="text-xs text-gray-400 ml-1 hidden sm:inline">{skill.level}</span>
          </div>
        </div>



        {/* Description */}
        {skill.description && (
          <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{skill.description}</p>
        )}

        {/* Live Training Timer */}
        {skill.status === 'Learning' && (
          <div className={`mb-4 flex items-center justify-between p-3 rounded-lg border transition-all ${
            skill.isTimerActive 
              ? 'bg-blue-500/10 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
              : 'bg-gray-800/50 border-gray-700'
          }`}>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTimer}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  skill.isTimerActive
                    ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                {skill.isTimerActive ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
              </button>
              <div>
                <div className="text-xs text-gray-400 font-medium tracking-wider uppercase mb-0.5">
                  Training Time
                </div>
                <div className={`text-lg sm:text-xl font-mono font-bold tracking-wider ${
                  skill.isTimerActive ? 'text-blue-400' : 'text-gray-300'
                }`}>
                  {formatLiveTime(liveTimer)}
                </div>
              </div>
            </div>
            
            {skill.isTimerActive && (
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-3 sm:mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs sm:text-sm text-gray-400">Progress</span>
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-xs sm:text-sm font-medium text-white">{skill.progress}%</span>
              {skill.status === 'Learning' && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Edit size={10} className="sm:w-3 sm:h-3" />
                </button>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <input
                type="range"
                min="0"
                max="100"
                value={editProgress}
                onChange={(e) => setEditProgress(Number(e.target.value))}
                className="flex-1 h-2"
              />
              <button
                onClick={handleProgressUpdate}
                className="bg-green-500 hover:bg-green-400 text-white px-2 py-1 rounded"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${skill.progress}%`,
                  backgroundColor: skill.color
                }}
              />
            </div>
          )}
        </div>

        {/* Resources */}
        {skill.resources.length > 0 && (
          <div className="mb-3 sm:mb-4">
            <div className="text-xs sm:text-sm text-gray-400 mb-2">Resources:</div>
            <div className="space-y-1">
              {skill.resources.slice(0, 2).map((resource, index) => (
                <div key={index} className="flex items-center gap-1 sm:gap-2 text-xs text-gray-300">
                  <ExternalLink size={8} className="sm:w-[10px] sm:h-[10px] flex-shrink-0" />
                  <span className="truncate">{resource}</span>
                </div>
              ))}
              {skill.resources.length > 2 && (
                <div className="text-xs text-gray-500">+{skill.resources.length - 2} more</div>
              )}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3 sm:mb-4">
          <div className="flex items-center gap-1">
            <Calendar size={10} className="sm:w-3 sm:h-3" />
            <span>Started {daysSinceStart} days ago</span>
          </div>
          {skill.completedDate && (
            <div className="hidden sm:block">Completed {skill.completedDate.toLocaleDateString()}</div>
          )}
        </div>

        {/* Linked Goal */}
        <div className="mb-3 sm:mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1 sm:gap-2 text-purple-300">
              <Flag size={14} />
              <span className="text-xs sm:text-sm font-medium">Linked Raid</span>
            </div>
            <button
              onClick={() => setIsEditingGoal(!isEditingGoal)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Edit size={10} className="sm:w-3 sm:h-3" />
            </button>
          </div>

          {isEditingGoal ? (
            <div className="space-y-2 text-xs sm:text-sm">
              <select
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">No linked raid</option>
                {goals.map(goal => (
                  <option key={goal.id} value={goal.id}>
                    {goal.title}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditingGoal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 py-1 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGoalUpdate}
                  className="flex-1 bg-green-500 hover:bg-green-400 text-white py-1 rounded transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-black/40 rounded-lg p-2 sm:p-3 border border-purple-500/20">
              {linkedGoal ? (
                <div className="flex items-center gap-1 sm:gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: linkedGoal.color }}
                  />
                  <span className="text-purple-300 text-xs sm:text-sm font-medium truncate flex-1">{linkedGoal.title}</span>
                  <span className={`text-xs px-1 sm:px-2 py-1 rounded flex-shrink-0 ${linkedGoal.isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                    {linkedGoal.isCompleted ? 'Completed' : 'In Progress'}
                  </span>
                </div>
              ) : (
                <span className="text-gray-400 text-xs sm:text-sm">No raid linked</span>
              )}
            </div>
          )}
        </div>

        {/* Status Actions */}
        <div className="flex gap-2 text-xs sm:text-sm">
          {skill.status === 'Learning' && (
            <>
              <button
                onClick={() => handleStatusChange('Learned')}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg font-medium transition-colors"
              >
                Mark as Learned
              </button>
              <button
                onClick={() => handleStatusChange('Mastered')}
                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-lg font-medium transition-colors"
              >
                Mark as Mastered
              </button>
            </>
          )}

          {skill.status === 'Learned' && (
            <button
              onClick={() => handleStatusChange('Mastered')}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-lg font-medium transition-colors"
            >
              Mark as Mastered
            </button>
          )}

          {skill.status === 'Mastered' && (
            <div className="w-full bg-purple-500/20 border border-purple-500/30 text-purple-400 py-2 rounded-lg font-medium text-center">
              Skill Mastered! 🏆
            </div>
          )}
        </div>
      </div>
    </div>
  );
};