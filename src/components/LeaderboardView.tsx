import React, { useState, useEffect } from 'react';
import { Trophy, Users, Globe, Crown, Medal, Award, Hash, TrendingUp } from 'lucide-react';
import { getRankFromPoints } from '../utils/rankingSystem';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useFriends } from '../hooks/useFriends';

interface LeaderboardUser {
  userId: string;
  uniqueId: string;
  nickname?: string;
  totalPoints: number;
  rank: string;
  rankColor: string;
  rankDescription: string;
  globalRank: number;
  isCurrentUser?: boolean;
  isFriend?: boolean;
}

export const LeaderboardView: React.FC = () => {
  const { user } = useAuth();
  const { friends } = useFriends();
  const [activeTab, setActiveTab] = useState<'global' | 'friends'>('global');
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardUser[]>([]);
  const [friendsLeaderboard, setFriendsLeaderboard] = useState<LeaderboardUser[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLeaderboards();
  }, [user, friends]);

  const loadLeaderboards = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Get global leaderboard using the server-side function
      const { data: globalData, error: globalError } = await supabase
        .rpc('get_global_leaderboard');

      if (globalError) {
        throw globalError;
      }

      // Transform global data
      const globalLeaderboard: LeaderboardUser[] = globalData.map((item: any) => {
        const rankInfo = getRankFromPoints(item.total_points);
        
        return {
          userId: item.user_id,
          uniqueId: item.unique_id,
          nickname: item.nickname,
          totalPoints: item.total_points,
          rank: rankInfo.rank,
          rankColor: rankInfo.color,
          rankDescription: rankInfo.description,
          globalRank: item.global_rank,
          isCurrentUser: item.user_id === user.id,
          isFriend: friends.some(friend => friend.friendUserId === item.user_id)
        };
      }).slice(0, 10); // Limit to top 10

      setGlobalLeaderboard(globalLeaderboard);

      // Get current user's rank
      const currentUser = globalLeaderboard.find(u => u.isCurrentUser);
      setCurrentUserRank(currentUser || null);

      // Get friends leaderboard using the server-side function
      const { data: friendsData, error: friendsError } = await supabase
        .rpc('get_friends_leaderboard', { target_user_id: user.id });

      if (friendsError) {
        throw friendsError;
      }

      // Transform friends data
      const friendsLeaderboard: LeaderboardUser[] = friendsData.map((item: any) => {
        const rankInfo = getRankFromPoints(item.total_points);
        
        return {
          userId: item.user_id,
          uniqueId: item.unique_id,
          nickname: item.nickname,
          totalPoints: item.total_points,
          rank: rankInfo.rank,
          rankColor: rankInfo.color,
          rankDescription: rankInfo.description,
          globalRank: item.friends_rank, // Use friends_rank for position in friends leaderboard
          isCurrentUser: item.is_current_user,
          isFriend: !item.is_current_user // All non-current users in this list are friends
        };
      }).slice(0, 10); // Limit to top 10

      setFriendsLeaderboard(friendsLeaderboard);

    } catch (err) {
      console.error('Error loading leaderboards:', err);
      setError('Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="text-yellow-400" size={20} />;
      case 2: return <Medal className="text-gray-300" size={20} />;
      case 3: return <Award className="text-amber-600" size={20} />;
      default: return <span className="text-gray-400 font-bold">#{position}</span>;
    }
  };

  const renderLeaderboard = (data: LeaderboardUser[], title: string) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span className="text-sm text-gray-400">Top {Math.min(data.length, 10)}</span>
      </div>
      
      {data.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-500/10 border border-gray-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Users className="text-gray-400" size={24} />
          </div>
          <h4 className="text-lg font-medium text-white mb-2">No Data Available</h4>
          <p className="text-gray-400">
            {title.includes('Friends') ? 'Add friends to see their rankings!' : 'No users found.'}
          </p>
        </div>
      ) : (
        data.map((leaderboardUser, index) => {
          const position = leaderboardUser.globalRank;
          
          return (
            <div
              key={leaderboardUser.userId}
              className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                leaderboardUser.isCurrentUser
                  ? 'bg-blue-500/20 border-blue-500/50 shadow-lg shadow-blue-500/10'
                  : leaderboardUser.isFriend
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                {/* Position */}
                <div className="w-8 sm:w-12 flex justify-center flex-shrink-0">
                  {getRankIcon(position)}
                </div>

                {/* User Info */}
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Trophy size={16} className="text-white sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium text-sm sm:text-base truncate ${leaderboardUser.isCurrentUser ? 'text-blue-300' : 'text-white'}`}>
                        {leaderboardUser.nickname || `Hunter #${leaderboardUser.uniqueId}`}
                        {leaderboardUser.isCurrentUser && (
                          <span className="text-blue-400 text-xs sm:text-sm ml-1 sm:ml-2">(You)</span>
                        )}
                        {leaderboardUser.isFriend && !leaderboardUser.isCurrentUser && (
                          <span className="text-green-400 text-xs sm:text-sm ml-1 sm:ml-2">(Friend)</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Hash size={10} className="sm:w-3 sm:h-3" />
                        <span className="font-mono text-xs sm:text-sm">{leaderboardUser.uniqueId}</span>
                      </div>
                      <span className="text-gray-500 hidden sm:inline">•</span>
                      <span className="text-gray-400 hidden sm:inline">{leaderboardUser.totalPoints} pts</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rank and Points */}
              <div className="flex items-center ml-2 flex-shrink-0">
                <div 
                  className="px-2 py-2 sm:px-4 sm:py-3 rounded-lg border-2 font-bold text-lg sm:text-xl min-w-[60px] sm:min-w-[80px] text-center"
                  style={{ 
                    backgroundColor: leaderboardUser.rankColor + '20',
                    borderColor: leaderboardUser.rankColor + '60',
                    color: leaderboardUser.rankColor,
                    boxShadow: `0 0 15px ${leaderboardUser.rankColor}30`
                  }}
                >
                  {leaderboardUser.rank}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Trophy className="text-yellow-400" size={28} />
          <div>
            <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
            <p className="text-gray-400">Hunter rankings and achievements</p>
          </div>
        </div>
        
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-yellow-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Trophy className="text-yellow-400" size={28} />
          <div>
            <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
            <p className="text-gray-400">Hunter rankings and achievements</p>
          </div>
        </div>
        
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={loadLeaderboards}
            className="mt-4 bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-yellow-500 rounded-xl blur-lg opacity-50"></div>
          <div className="relative p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl">
            <Trophy className="text-white" size={28} />
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white tracking-wide">Leaderboard</h2>
          <p className="text-yellow-300 font-medium">Hunter rankings and achievements</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{globalLeaderboard.length}</div>
          <div className="text-sm text-gray-400">Total Hunters</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{friendsLeaderboard.length - 1}</div>
          <div className="text-sm text-gray-400">Friends</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {currentUserRank?.globalRank || '-'}
          </div>
          <div className="text-sm text-gray-400">Your Global Rank</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {friendsLeaderboard.findIndex(u => u.isCurrentUser) + 1 || '-'}
          </div>
          <div className="text-sm text-gray-400">Your Friends Rank</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-2">
        {[
          { key: 'global', label: 'Global Leaderboard', icon: Globe, count: globalLeaderboard.length },
          { key: 'friends', label: 'Friends Leaderboard', icon: Users, count: friendsLeaderboard.length }
        ].map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === key
                ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <Icon size={16} />
            <span className="hidden sm:inline">{label}</span>
            <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Leaderboard Content */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        {activeTab === 'global' && renderLeaderboard(globalLeaderboard, 'Global Hunter Rankings')}
        {activeTab === 'friends' && renderLeaderboard(friendsLeaderboard, 'Friends Rankings')}
      </div>
    </div>
  );
};