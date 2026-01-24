import React from 'react';
import { useUserProfile } from '../hooks/useUserProfile';
import { getRankFromPoints, getNextRank, getPointsToNextRank } from '../utils/rankingSystem';
import { User, Trophy, Target, Zap, AlertTriangle, CheckCircle, Hash, Star, TrendingUp, Crown, Shield, X } from 'lucide-react';

interface HeaderProps {
  totalHabits: number;
  completedToday: number;
  totalStreak: number;
  totalPoints: number;
  penaltyMessage?: string;
  autoRespectMessage?: string;
  onDismissPenaltyMessage?: () => void;
  onDismissAutoRespectMessage?: () => void;
}

export default function Header({ 
  totalHabits, 
  completedToday, 
  totalStreak, 
  totalPoints, 
  penaltyMessage, 
  autoRespectMessage,
  onDismissPenaltyMessage,
  onDismissAutoRespectMessage
}: HeaderProps) {
  const { profile } = useUserProfile();
  
  const displayName = profile?.nickname || 'Unknown Hunter';
  const rankInfo = getRankFromPoints(totalPoints);
  const nextRank = getNextRank(totalPoints);
  const pointsToNext = getPointsToNextRank(totalPoints);
  const progressPercentage = nextRank ? ((totalPoints - rankInfo.minPoints) / (nextRank.minPoints - rankInfo.minPoints)) * 100 : 100;

  return (
    <header className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 rounded-2xl blur-xl"></div>
      <div className="relative bg-black/60 backdrop-blur-sm border border-blue-500/30 rounded-2xl shadow-2xl mb-6">
        
        {/* Mobile-Optimized ID Card Layout */}
        <div className="p-4 sm:p-6">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-600/30">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-500 rounded-lg blur-md opacity-50"></div>
                <div className="relative p-1.5 sm:p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
                  <Trophy className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent tracking-wider">
                  ARISE
                </h1>
                <p className="text-xs text-blue-300 font-medium tracking-widest uppercase">
                  Hunter System
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm border border-blue-500/30 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
              <span className="text-xs font-bold text-blue-300 tracking-wider">
                OFFICIAL ID
              </span>
            </div>
          </div>

          {/* Main Profile Section - Mobile Optimized */}
          <div className="bg-gradient-to-r from-black/40 to-gray-900/40 backdrop-blur-sm border border-gray-600/30 rounded-xl p-4 sm:p-6">
            
            {/* Hunter Name and ID */}
            <div className="text-center mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-wide">
                {displayName}
              </h2>
              
              <div className="flex items-center justify-center gap-2 mb-3">
                <Hash className="w-4 h-4 text-blue-400" />
                <span className="text-lg sm:text-xl font-mono font-bold text-blue-300 tracking-wider">
                  {profile?.uniqueId || 'Loading...'}
                </span>
              </div>
            </div>

            {/* Rank and Points - Stacked on Mobile */}
            <div className="space-y-3 mb-4">
              {/* Rank Badge */}
              <div className="flex justify-center">
                <div 
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-bold text-lg"
                  style={{ 
                    backgroundColor: rankInfo.color + '20',
                    borderColor: rankInfo.color + '60',
                    color: rankInfo.color,
                    boxShadow: `0 0 15px ${rankInfo.color}30`
                  }}
                >
                  <Star className="w-5 h-5" />
                  <span>RANK {rankInfo.rank}</span>
                </div>
              </div>
              
              {/* Rank Description */}
              <p className="text-center text-gray-300 text-sm">{rankInfo.description}</p>
              
              {/* Points Display */}
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">
                  {totalPoints.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Points</div>
              </div>
            </div>

            {/* Stats Row - Mobile Optimized */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-black/40 backdrop-blur-sm border border-blue-500/30 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                  <span className="text-xs text-blue-300 font-medium">Today</span>
                </div>
                <div className="text-lg sm:text-xl font-bold text-white">
                  {completedToday}/{totalHabits}
                </div>
              </div>
              
              <div className="bg-black/40 backdrop-blur-sm border border-orange-500/30 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />
                  <span className="text-xs text-orange-300 font-medium">Streak</span>
                </div>
                <div className="text-lg sm:text-xl font-bold text-white">
                  {totalStreak}
                </div>
              </div>
            </div>

            {/* Rank Progression Bar */}
            {nextRank && (
              <div className="pt-4 border-t border-gray-600/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-300">
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Progress to Rank {nextRank.rank}</span>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-white">
                    {pointsToNext} needed
                  </span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2 sm:h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-500 to-purple-600"
                    style={{ width: `${Math.min(100, progressPercentage)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Rank {rankInfo.rank}</span>
                  <span>Rank {nextRank.rank}</span>
                </div>
              </div>
            )}

            {/* Max Rank Achievement */}
            {!nextRank && rankInfo.rank === 'S' && (
              <div className="pt-4 border-t border-gray-600/30">
                <div className="flex items-center justify-center gap-2 text-purple-400">
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-bold text-sm sm:text-lg tracking-wider">MAXIMUM RANK</span>
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Messages Section */}
        {(penaltyMessage || autoRespectMessage) && (
          <div className="px-4 sm:px-6 pb-4">
            {penaltyMessage && (
              <div className={`relative flex items-start gap-3 rounded-lg p-3 sm:p-4 mb-3 ${
                penaltyMessage.includes('All quests completed') || penaltyMessage.includes('No quests') || penaltyMessage.includes('✅')
                  ? 'bg-green-500/10 border border-green-500/30'
                  : penaltyMessage.includes('⚠️') && penaltyMessage.includes('applied')
                  ? 'bg-orange-500/10 border border-orange-500/30'
                  : penaltyMessage.includes('Failed')
                  ? 'bg-red-500/10 border border-red-500/30'
                  : 'bg-blue-500/10 border border-blue-500/30'
              }`}>
                {onDismissPenaltyMessage && (
                  <button
                    onClick={onDismissPenaltyMessage}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-black/20"
                    title="Dismiss notification"
                  >
                    <X size={14} />
                  </button>
                )}
                <AlertTriangle className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 ${
                  penaltyMessage.includes('All quests completed') || penaltyMessage.includes('No quests') || penaltyMessage.includes('✅')
                    ? 'text-green-400'
                    : penaltyMessage.includes('⚠️') && penaltyMessage.includes('applied')
                    ? 'text-orange-400'
                    : penaltyMessage.includes('Failed')
                    ? 'text-red-400'
                    : 'text-blue-400'
                }`} />
                <span className={`text-xs sm:text-sm font-medium leading-relaxed ${
                  penaltyMessage.includes('All quests completed') || penaltyMessage.includes('No quests') || penaltyMessage.includes('✅')
                    ? 'text-green-300'
                    : penaltyMessage.includes('⚠️') && penaltyMessage.includes('applied')
                    ? 'text-orange-300'
                    : penaltyMessage.includes('Failed')
                    ? 'text-red-300'
                    : 'text-blue-300'
                }`}>{penaltyMessage}</span>
              </div>
            )}
            
            {autoRespectMessage && (
              <div className="relative flex items-start gap-3 bg-green-500/10 border border-green-500/30 rounded-lg p-3 sm:p-4">
                {onDismissAutoRespectMessage && (
                  <button
                    onClick={onDismissAutoRespectMessage}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-black/20"
                    title="Dismiss notification"
                  >
                    <X size={14} />
                  </button>
                )}
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-green-300 text-xs sm:text-sm font-medium leading-relaxed">{autoRespectMessage}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}