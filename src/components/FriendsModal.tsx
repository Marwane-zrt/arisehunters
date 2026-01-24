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
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        {/* Main Container */}
        <div className="relative bg-black/80 backdrop-blur-xl border-2 border-blue-500/30 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 p-8 border-b border-blue-500/20">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
            <div className="relative flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                  <div className="relative p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                    <Users className="text-white" size={32} />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2 tracking-wider">
                    Hunter Network
                  </h2>
                  <p className="text-blue-300 font-medium tracking-wide">Connect with fellow hunters</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="relative group"
              >
                <div className="absolute inset-0 bg-red-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-all"></div>
                <div className="relative p-3 bg-black/40 backdrop-blur-sm border border-gray-600 rounded-xl text-gray-400 hover:text-white hover:border-red-500/50 transition-all">
                  <X size={24} />
                </div>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="relative p-6 pb-0">
            <div className="flex gap-2 bg-black/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-2">
              {[
                { key: 'friends', label: 'Friends', icon: Users, count: friends.length, color: 'from-green-500 to-emerald-600' },
                { key: 'requests', label: 'Requests', icon: Shield, count: incomingRequests.length, color: 'from-purple-500 to-pink-600' },
                { key: 'search', label: 'Add Hunter', icon: UserPlus, count: null, color: 'from-blue-500 to-cyan-600' }
              ].map(({ key, label, icon: Icon, count, color }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex-1 relative group transition-all duration-300 ${
                    activeTab === key ? 'scale-105' : 'hover:scale-102'
                  }`}
                >
                  {activeTab === key && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${color} rounded-xl blur-lg opacity-75`}></div>
                  )}
                  <div className={`relative flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold transition-all ${
                    activeTab === key
                      ? `bg-gradient-to-r ${color} text-white shadow-lg border border-white/20`
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/50 border border-transparent'
                  }`}>
                    <Icon size={20} className={activeTab === key ? 'animate-pulse' : ''} />
                    <span className="hidden sm:inline tracking-wide">{label}</span>
                    {count !== null && count > 0 && (
                      <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                        activeTab === key ? 'bg-white/20' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {count}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {/* Friends Tab */}
            {activeTab === 'friends' && (
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                      <div className="relative animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-blue-400 border-r-purple-400 mx-auto"></div>
                    </div>
                    <p className="text-blue-300 font-medium">Loading hunter network...</p>
                  </div>
                ) : friends.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="relative mb-8">
                      <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl"></div>
                      <div className="relative bg-black/60 border-2 border-green-500/30 rounded-full w-24 h-24 flex items-center justify-center mx-auto">
                        <Users className="text-green-400" size={36} />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 tracking-wide">No Friends Yet</h3>
                    <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                      Start building your hunter network! Connect with other hunters to share your journey.
                    </p>
                    <button
                      onClick={() => setActiveTab('search')}
                      className="relative group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-all"></div>
                      <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-8 py-4 rounded-xl font-bold transition-all uppercase tracking-wider">
                        Add Your First Friend
                      </div>
                    </button>
                  </div>
                ) : (
                  friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="group relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl blur-sm group-hover:blur-md transition-all"></div>
                      <div className="relative bg-black/60 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6 hover:border-green-400/50 transition-all duration-300 group hover:shadow-green-500/10 shadow-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl blur-lg opacity-50"></div>
                              <div className="relative w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <Crown size={24} className="text-white" />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-xl font-bold text-white tracking-wide">
                                  {friend.friendProfile.nickname || `Hunter #${friend.friendProfile.uniqueId}`}
                                </h4>
                                <div className="flex items-center gap-1 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                                  <Star size={12} className="text-green-400" />
                                  <span className="text-green-400 text-xs font-bold uppercase tracking-wider">Friend</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-green-300">
                                <Hash size={14} />
                                <span className="font-mono text-lg tracking-wider">{friend.friendProfile.uniqueId}</span>
                              </div>
                              <div className="text-sm text-gray-400 mt-1">
                                Connected {friend.createdAt.toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveFriend(friend.friendUserId)}
                            className="relative group/btn opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <div className="absolute inset-0 bg-red-500/20 rounded-xl blur-lg opacity-0 group-hover/btn:opacity-100 transition-all"></div>
                            <div className="relative p-3 bg-black/40 backdrop-blur-sm border border-gray-600 rounded-xl text-gray-500 hover:text-red-400 hover:border-red-500/50 transition-all">
                              <Trash2 size={18} />
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
                      <div className="relative animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-purple-400 border-r-pink-400 mx-auto"></div>
                    </div>
                    <p className="text-purple-300 font-medium">Loading friend requests...</p>
                  </div>
                ) : incomingRequests.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="relative mb-8">
                      <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-2xl"></div>
                      <div className="relative bg-black/60 border-2 border-purple-500/30 rounded-full w-24 h-24 flex items-center justify-center mx-auto">
                        <Shield className="text-purple-400" size={36} />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 tracking-wide">No Pending Requests</h3>
                    <p className="text-gray-400 leading-relaxed">You're all caught up! No friend requests waiting for your response.</p>
                  </div>
                ) : (
                  incomingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="group relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-sm group-hover:blur-md transition-all"></div>
                      <div className="relative bg-black/60 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 hover:border-purple-400/50 transition-all duration-300 group hover:shadow-purple-500/10 shadow-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl blur-lg opacity-50"></div>
                              <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <Crown size={24} className="text-white" />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-xl font-bold text-white tracking-wide">
                                  {request.fromProfile.nickname || `Hunter #${request.fromProfile.uniqueId}`}
                                </h4>
                                <div className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full">
                                  <Zap size={12} className="text-purple-400" />
                                  <span className="text-purple-400 text-xs font-bold uppercase tracking-wider">Request</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-purple-300">
                                <Hash size={14} />
                                <span className="font-mono text-lg tracking-wider">{request.fromProfile.uniqueId}</span>
                              </div>
                              <div className="text-sm text-gray-400 mt-1">
                                Sent {request.createdAt.toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleAcceptRequest(request.id)}
                              className="relative group/btn"
                            >
                              <div className="absolute inset-0 bg-green-500/20 rounded-xl blur-lg opacity-75 group-hover/btn:opacity-100 transition-all"></div>
                              <div className="relative p-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-xl transition-all shadow-lg border border-green-400/30">
                                <Check size={18} />
                              </div>
                            </button>
                            <button
                              onClick={() => handleDeclineRequest(request.id)}
                              className="relative group/btn"
                            >
                              <div className="absolute inset-0 bg-red-500/20 rounded-xl blur-lg opacity-75 group-hover/btn:opacity-100 transition-all"></div>
                              <div className="relative p-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 text-white rounded-xl transition-all shadow-lg border border-red-400/30">
                                <XIcon size={18} />
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Search Tab */}
            {activeTab === 'search' && (
              <div className="space-y-8">
                {/* Search Section */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl blur-sm"></div>
                  <div className="relative bg-black/60 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8">
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-white mb-2 tracking-wide">Find Hunter</h3>
                      <p className="text-blue-300">Enter a Hunter ID to connect with other hunters</p>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Hash className="text-blue-400" size={24} />
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
                          className="w-full bg-black/60 border-2 border-blue-500/30 rounded-xl pl-12 pr-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all font-mono text-2xl tracking-widest text-center"
                          placeholder="12345678"
                          maxLength={8}
                        />
                      </div>
                      <button
                        onClick={handleSearch}
                        disabled={searchLoading || searchId.length !== 8}
                        className="relative group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-all"></div>
                        <div className="relative bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg border border-blue-400/30 uppercase tracking-wider flex items-center gap-3">
                          {searchLoading ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                          ) : (
                            <Search size={20} />
                          )}
                          <span className="hidden sm:inline">Search</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Your Hunter ID */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl blur-sm"></div>
                  <div className="relative bg-black/60 backdrop-blur-sm border border-indigo-500/30 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                        <Hash className="text-white" size={20} />
                      </div>
                      <h4 className="text-lg font-bold text-indigo-300 uppercase tracking-wider">Your Hunter ID</h4>
                    </div>
                    <div className="text-center">
                      <div className="font-mono text-4xl font-bold text-white tracking-widest mb-2">
                        {profile?.uniqueId || 'Loading...'}
                      </div>
                      <p className="text-gray-400 text-sm">
                        Share this ID with friends so they can add you to their network
                      </p>
                    </div>
                  </div>
                </div>

                {/* Search Error */}
                {searchError && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-500/10 rounded-2xl blur-sm"></div>
                    <div className="relative bg-black/60 backdrop-blur-sm border border-red-500/30 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                          <XIcon className="text-red-400" size={20} />
                        </div>
                        <h4 className="text-lg font-bold text-red-400">Search Failed</h4>
                      </div>
                      <p className="text-red-300 whitespace-pre-line">{searchError}</p>
                    </div>
                  </div>
                )}

                {/* Request Sent Success */}
                {requestSent && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-500/10 rounded-2xl blur-sm"></div>
                    <div className="relative bg-black/60 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                          <Check className="text-green-400" size={20} />
                        </div>
                        <h4 className="text-lg font-bold text-green-400">Request Sent!</h4>
                      </div>
                      <p className="text-green-300">
                        Your friend request has been sent successfully. The hunter will receive your request and can accept or decline it.
                      </p>
                    </div>
                  </div>
                )}

                {/* Search Result */}
                {searchResult && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-2xl blur-sm"></div>
                    <div className="relative bg-black/60 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl blur-lg opacity-50"></div>
                            <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                              <Crown size={24} className="text-white" />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-xl font-bold text-white tracking-wide">
                                {searchResult.nickname || `Hunter #${searchResult.uniqueId}`}
                              </h4>
                              <div className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                                <Search size={12} className="text-emerald-400" />
                                <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Found</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-emerald-300">
                              <Hash size={14} />
                              <span className="font-mono text-lg tracking-wider">{searchResult.uniqueId}</span>
                            </div>
                            <div className="text-sm text-gray-400 mt-1">
                              Joined {searchResult.createdAt.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={handleSendRequest}
                          className="relative group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-all"></div>
                          <div className="relative bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg border border-emerald-400/30 uppercase tracking-wider flex items-center gap-2">
                            <UserPlus size={18} />
                            Send Request
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* General Error Display */}
                {error && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-500/10 rounded-2xl blur-sm"></div>
                    <div className="relative bg-black/60 backdrop-blur-sm border border-red-500/30 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                          <XIcon className="text-red-400" size={20} />
                        </div>
                        <h4 className="text-lg font-bold text-red-400">Network Error</h4>
                      </div>
                      <p className="text-red-300">{error}</p>
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