import React, { useEffect, useState } from 'react';
import { X, Trophy, ArrowUpCircle, Zap, Target, Brain, Shield, Unlock, Lock } from 'lucide-react';
import { RankInfo } from '../utils/rankingSystem';

interface RankUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  oldRank: RankInfo | null;
  newRank: RankInfo | null;
}

export const RankUpModal: React.FC<RankUpModalProps> = ({ isOpen, onClose, oldRank, newRank }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || !oldRank || !newRank) return null;

  const isCRankOrAbove = ['C', 'B', 'A', 'S'].includes(newRank.rank);
  const wasCRankOrAbove = ['C', 'B', 'A', 'S'].includes(oldRank.rank);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-900 border-2 border-indigo-500/50 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl shadow-indigo-500/20 animate-in zoom-in-95 duration-300">
        
        {/* Header Background */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 opacity-20"></div>
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500 rounded-full blur-3xl opacity-30"></div>

        {/* Content */}
        <div className="relative p-5 sm:p-6 pt-10 sm:pt-12">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-all"
          >
            <X size={20} />
          </button>

          {/* Icon Header */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-b from-indigo-500 to-purple-600 p-3 rounded-2xl border border-indigo-400/50 shadow-xl transform -rotate-3 hover:rotate-0 transition-all duration-300">
                <ArrowUpCircle className="text-white w-10 h-10" />
              </div>
            </div>
          </div>

          <div className="text-center space-y-1 mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 uppercase tracking-widest">
              Rank Up
            </h2>
            <p className="text-gray-300 text-sm sm:text-base">
              You have ascended from <span className="font-bold" style={{ color: oldRank.color }}>{oldRank.rank}-Rank</span> to <span className="font-bold" style={{ color: newRank.color }}>{newRank.rank}-Rank</span>!
            </p>
          </div>

          {/* Unlocks Section */}
          <div className="bg-black/40 border border-gray-700/50 rounded-xl p-4 mb-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Unlock size={14} />
              New Limits Unlocked
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <Zap className="text-blue-400 w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-white font-medium">Daily Stamina</div>
                    <div className="text-xs text-gray-400">Max Active Quests</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 font-bold">
                  <span className="text-gray-500">{oldRank.stamina}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-blue-400 text-lg">{newRank.stamina}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-500/10 rounded-lg border border-pink-500/20">
                    <Target className="text-pink-400 w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-white font-medium">Long-Term Goals</div>
                    <div className="text-xs text-gray-400">Total Goal Capacity</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 font-bold">
                  <span className="text-gray-500">{oldRank.maxGoals}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-pink-400 text-lg">{newRank.maxGoals === 99 ? '∞' : newRank.maxGoals}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                    <Brain className="text-green-400 w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-white font-medium">Skill Slots</div>
                    <div className="text-xs text-gray-400">Simultaneous Learning</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 font-bold">
                  <span className="text-gray-500">{oldRank.maxSkills}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-green-400 text-lg">{newRank.maxSkills === 99 ? '∞' : newRank.maxSkills}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                    <Shield className="text-red-400 w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-white font-medium">Strict Rules</div>
                    <div className="text-xs text-gray-400">Active Penalties</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 font-bold">
                  <span className="text-gray-500">{oldRank.maxRules}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-red-400 text-lg">{newRank.maxRules === 99 ? '∞' : newRank.maxRules}</span>
                </div>
              </div>

              {isCRankOrAbove && !wasCRankOrAbove && (
                <div className="mt-6 pt-4 border-t border-indigo-500/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                      <Trophy className="text-indigo-400 w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-white font-bold">Hunter Guild & Leaderboard</div>
                      <div className="text-xs text-indigo-300">Full Access Unlocked!</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur-lg opacity-50 group-hover:opacity-100 transition-all duration-300"></div>
            <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-xl border border-indigo-400/30 uppercase tracking-widest text-sm">
              Continue Journey
            </div>
          </button>
        </div>
      </div>

      {/* Confetti (Simple CSS implementation) */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex justify-center">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="absolute w-3 h-3 rounded-full animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                backgroundColor: ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981'][Math.floor(Math.random() * 5)],
                animationDuration: `${Math.random() * 2 + 1}s`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        .animate-fall {
          animation: fall linear forwards;
        }
      `}</style>
    </div>
  );
};
