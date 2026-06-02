import React, { useState } from 'react';
import { X, Users, Search, UserPlus, Check, X as XIcon, Hash, Crown, Trash2, Shield, Zap, Star } from 'lucide-react';
import { useFriends } from '../hooks/useFriends';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { FriendProfile } from '../types/friend';
import { supabase } from '../lib/supabase';

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FriendsModal: React.FC<FriendsModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const {
    friends,
    incomingRequests,
    loading,
    error,
    searchUser,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    refreshFriends
  } = useFriends();

  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<FriendProfile | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [requestSent, setRequestSent] = useState(false);

  const handleSearch = async () => {
    const cleanId = searchId.trim();
    
    if (!cleanId || cleanId.length !== 8 || !/^\d{8}$/.test(cleanId)) {
      setSearchError('Please enter a valid 8-digit Hunter ID');
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    setSearchResult(null);
    setRequestSent(false);

    try {
      const result = await searchUser(cleanId);
      
      if (result) {
        if (result.userId === user?.id) {
          setSearchError('You cannot add yourself as a friend');
          return;
        }

        const isAlreadyFriend = friends.some(friend => friend.friendUserId === result.userId);
        if (isAlreadyFriend) {
          setSearchError('You are already friends with this hunter');
          return;
        }

        const hasPendingRequest = incomingRequests.some(req => req.fromUserId === result.userId);
        if (hasPendingRequest) {
          setSearchError('This hunter has already sent you a pending friend request');
          return;
        }

        try {
          const { data: outgoingRequest } = await supabase
            .from('friend_requests')
            .select('*')
            .eq('from_user_id', user?.id)
            .eq('to_user_id', result.userId)
            .in('status', ['pending', 'accepted'])
            .maybeSingle();

          if (outgoingRequest) {
            if (outgoingRequest.status === 'pending') {
              setSearchError('You have already sent a pending friend request to this hunter');
            } else if (outgoingRequest.status === 'accepted') {
              setSearchError('You are already friends with this hunter');
            }
            return;
          }
        } catch (err) {
        }

        setSearchResult(result);
      } else {
        setSearchError(`Hunter with ID ${cleanId} not found. Please verify:\n• The ID is exactly 8 digits\n• Your friend has created an account and logged in\n• The ID was copied correctly`);
      }
    } catch (err: any) {
      setSearchError(err.message || 'Search failed. Please check your connection and try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!searchResult) return;

    const success = await sendFriendRequest(searchResult.userId);
    if (success) {
      setRequestSent(true);
      setSearchResult(null);
      setSearchId('');
      await refreshFriends();
    } else {
      // Small timeout to allow the error state to update in the hook
      setTimeout(() => {
        setSearchError('Failed to send friend request. Please try again.');
      }, 100);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    await acceptFriendRequest(requestId);
  };

  const handleDeclineRequest = async (requestId: string) => {
    await declineFriendRequest(requestId);
  };

  const handleRemoveFriend = async (friendUserId: string) => {
    if (confirm('Are you sure you want to remove this friend?')) {
      await removeFriend(friendUserId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#050810]/95 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Outer Glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-[2.5rem] blur-xl opacity-75 animate-pulse pointer-events-none"></div>

        {/* Main Container */}
        <div className="relative flex flex-col flex-1 bg-[#0B0F19]/95 backdrop-blur-2xl border border-white/5 rounded-[2rem] shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="relative px-8 py-6 border-b border-white/5">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center gap-5">
                <div className="relative group cursor-default">
                  <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
                  <div className="relative p-3.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl border border-blue-400/30 shadow-inner">
                    <Users className="text-white drop-shadow-md" size={28} strokeWidth={1.5} />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-black bg-gradient-to-br from-white via-blue-100 to-blue-400 bg-clip-text text-transparent mb-1 tracking-widest drop-shadow-sm uppercase">
                    Hunter Network
                  </h2>
                  <p className="text-blue-500/80 text-xs font-bold tracking-[0.2em] uppercase">Connect & Conquer</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="relative group p-2"
              >
                <div className="absolute inset-0 bg-red-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative text-gray-500 group-hover:text-red-400 transition-colors">
                  <X size={28} strokeWidth={1.5} />
                </div>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="px-8 pt-6">
            <div className="flex gap-2 p-1.5 bg-[#151A2D]/50 border border-white/5 rounded-2xl">
              {[
                { key: 'friends', label: 'Guild Members', icon: Users, count: friends.length, activeColor: 'text-emerald-400', activeBg: 'bg-emerald-400/10' },
                { key: 'requests', label: 'Incoming', icon: Shield, count: incomingRequests.length, activeColor: 'text-purple-400', activeBg: 'bg-purple-400/10' },
                { key: 'search', label: 'Recruit', icon: UserPlus, count: null, activeColor: 'text-blue-400', activeBg: 'bg-blue-400/10' }
              ].map(({ key, label, icon: Icon, count, activeColor, activeBg }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex-1 relative group flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-300 ${
                    activeTab === key
                      ? `${activeBg} ${activeColor} shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]`
                      : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <Icon size={18} strokeWidth={2} />
                  <span className="hidden sm:inline tracking-wider text-sm uppercase">{label}</span>
                  {count !== null && count > 0 && (
                    <div className={`px-2 py-0.5 rounded-full text-xs font-black ${
                      activeTab === key ? 'bg-white/20 text-white' : 'bg-[#0B0F19] text-gray-400'
                    }`}>
                      {count}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
            {/* Friends Tab */}
            {activeTab === 'friends' && (
              <div className="space-y-4">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500/20 border-t-emerald-500 mb-4"></div>
                    <p className="text-emerald-500/80 font-bold tracking-widest uppercase text-sm">Syncing Network...</p>
                  </div>
                ) : friends.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                      <Users className="text-emerald-500" size={40} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2 tracking-wide">A Lone Wolf</h3>
                    <p className="text-gray-500 text-sm max-w-xs mb-8">You haven't recruited any hunters yet. Find allies to track their progress.</p>
                    <button
                      onClick={() => setActiveTab('search')}
                      className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-xl font-bold uppercase tracking-widest text-sm transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                    >
                      Recruit Now
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {friends.map((friend) => (
                      <div key={friend.id} className="group relative bg-[#151A2D]/40 border border-white/5 rounded-2xl p-5 hover:bg-[#151A2D] hover:border-emerald-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.05)]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="relative w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-green-600/20 border border-emerald-500/30 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                              <Crown size={24} className="text-emerald-400 drop-shadow-md" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-lg font-bold text-white tracking-wide group-hover:text-emerald-300 transition-colors">
                                  {friend.friendProfile.nickname || `Hunter`}
                                </h4>
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">
                                <Hash size={12} />
                                <span>{friend.friendProfile.uniqueId}</span>
                              </div>
                              <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                                Allied: {friend.createdAt.toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveFriend(friend.friendUserId)}
                            className="p-2.5 bg-white/5 hover:bg-red-500/20 border border-transparent hover:border-red-500/30 rounded-xl text-gray-600 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                            title="Remove Hunter"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
              <div className="space-y-4">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500/20 border-t-purple-500 mb-4"></div>
                    <p className="text-purple-500/80 font-bold tracking-widest uppercase text-sm">Scanning Requests...</p>
                  </div>
                ) : incomingRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-24 h-24 bg-purple-500/10 border border-purple-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                      <Shield className="text-purple-500" size={40} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2 tracking-wide">Sector Clear</h3>
                    <p className="text-gray-500 text-sm max-w-xs mb-8">No incoming alliance requests at the moment. Your guild is secure.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {incomingRequests.map((request) => (
                      <div key={request.id} className="group relative bg-[#151A2D]/40 border border-white/5 rounded-2xl p-5 hover:bg-[#151A2D] hover:border-purple-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.05)]">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="relative w-14 h-14 bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-500/30 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                              <Zap size={24} className="text-purple-400 drop-shadow-md" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-lg font-bold text-white tracking-wide group-hover:text-purple-300 transition-colors">
                                  {request.fromProfile.nickname || `Hunter`}
                                </h4>
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">
                                <Hash size={12} />
                                <span>{request.fromProfile.uniqueId}</span>
                              </div>
                              <div className="text-[10px] text-purple-400/80 font-bold uppercase tracking-widest animate-pulse">
                                Pending Verification
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => handleAcceptRequest(request.id)}
                              className="flex-1 sm:flex-none p-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 hover:text-emerald-300 transition-all flex justify-center"
                              title="Accept"
                            >
                              <Check size={18} strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={() => handleDeclineRequest(request.id)}
                              className="flex-1 sm:flex-none p-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 hover:text-red-300 transition-all flex justify-center"
                              title="Decline"
                            >
                              <XIcon size={18} strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Search Tab */}
            {activeTab === 'search' && (
              <div className="max-w-2xl mx-auto space-y-8">
                {/* Search Section */}
                <div className="bg-[#151A2D]/40 border border-white/5 rounded-3xl p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
                  
                  <div className="mb-8 text-center relative z-10">
                    <h3 className="text-2xl font-black text-white mb-2 tracking-wide uppercase">Recruit Ally</h3>
                    <p className="text-gray-500 text-sm">Enter a valid 8-digit Hunter ID to locate them in the system.</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                    <div className="flex-1 relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Hash className="text-gray-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                      </div>
                      <input
                        type="text"
                        value={searchId}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                          setSearchId(value);
                          setSearchError(null);
                          setSearchResult(null);
                          setRequestSent(false);
                        }}
                        className="w-full bg-[#0B0F19] border border-white/10 rounded-xl pl-12 pr-6 py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-mono text-xl tracking-[0.2em] text-center"
                        placeholder="00000000"
                        maxLength={8}
                      />
                    </div>
                    <button
                      onClick={handleSearch}
                      disabled={searchLoading || searchId.length !== 8}
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]"
                    >
                      {searchLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                      ) : (
                        <Search size={18} strokeWidth={2.5} />
                      )}
                      <span>Scan</span>
                    </button>
                  </div>
                </div>

                {/* Your Hunter ID */}
                <div className="bg-[#151A2D]/30 border border-dashed border-white/10 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Your Identity Beacon</h4>
                    <p className="text-gray-600 text-xs">Share this code with others to be recruited.</p>
                  </div>
                  <div className="flex items-center gap-3 bg-[#0B0F19] border border-white/5 px-6 py-3 rounded-xl">
                    <Hash className="text-blue-500/50" size={18} />
                    <span className="font-mono text-2xl font-black text-blue-400 tracking-widest">
                      {profile?.uniqueId || '------'}
                    </span>
                  </div>
                </div>

                {/* Search Error */}
                {searchError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex items-start gap-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="p-2 bg-red-500/20 rounded-lg shrink-0 mt-0.5">
                      <XIcon className="text-red-400" size={16} strokeWidth={3} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-1">Scan Failed</h4>
                      <p className="text-red-300/80 text-sm whitespace-pre-line leading-relaxed">{searchError}</p>
                    </div>
                  </div>
                )}

                {/* Request Sent Success */}
                {requestSent && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex items-start gap-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="p-2 bg-emerald-500/20 rounded-lg shrink-0 mt-0.5">
                      <Check className="text-emerald-400" size={16} strokeWidth={3} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-1">Signal Sent</h4>
                      <p className="text-emerald-300/80 text-sm leading-relaxed">Alliance request transmitted successfully. Awaiting their response.</p>
                    </div>
                  </div>
                )}

                {/* Search Result */}
                {searchResult && (
                  <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-2xl p-6 animate-in fade-in zoom-in-95">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <Crown size={28} className="text-white drop-shadow-md" />
                        </div>
                        <div className="text-center sm:text-left">
                          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                            <h4 className="text-xl font-black text-white tracking-wide">
                              {searchResult.nickname || `Hunter`}
                            </h4>
                            <div className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded">Target</div>
                          </div>
                          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-blue-300/60 font-mono tracking-widest text-sm mb-1">
                            <Hash size={14} />
                            <span>{searchResult.uniqueId}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleSendRequest}
                        className="w-full sm:w-auto px-6 py-3 bg-white text-blue-900 hover:bg-blue-50 rounded-xl font-bold uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <UserPlus size={18} strokeWidth={2.5} />
                        Recruit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendsModal;