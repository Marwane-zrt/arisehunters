import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { Friend, FriendRequest, FriendProfile, FriendWithProfile } from '../types/friend';
import * as friendsApi from '../lib/friends';

export const useFriends = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<FriendWithProfile[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<(FriendRequest & { fromProfile: FriendProfile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadFriendsData();
    } else {
      setFriends([]);
      setIncomingRequests([]);
      setLoading(false);
    }
  }, [user]);

  const loadFriendsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [friendsData, requestsData] = await Promise.all([
        friendsApi.getFriends(),
        friendsApi.getIncomingFriendRequests()
      ]);
      
      setFriends(friendsData);
      setIncomingRequests(requestsData);
    } catch (err) {
      console.error('Error loading friends data:', err);
      setError('Failed to load friends data');
    } finally {
      setLoading(false);
    }
  };

  const searchUser = async (uniqueId: string): Promise<FriendProfile | null> => {
    setError(null);
    const result = await friendsApi.searchUserByUniqueId(uniqueId);
    
    if (!result) {
      setError('Hunter not found. Please check the ID and try again.');
    }
    
    return result;
  };

  const sendFriendRequest = async (toUserId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null);
      await friendsApi.sendFriendRequest(toUserId);
      return { success: true };
    } catch (err: any) {
      setError(err.message || 'Failed to send friend request');
      return { success: false, error: err.message || 'Failed to send friend request' };
    }
  };

  const acceptFriendRequest = async (requestId: string): Promise<void> => {
    try {
      setError(null);
      await friendsApi.acceptFriendRequest(requestId);
      await loadFriendsData();
    } catch (err) {
      setError('Failed to accept friend request');
    }
  };

  const declineFriendRequest = async (requestId: string): Promise<void> => {
    try {
      setError(null);
      await friendsApi.declineFriendRequest(requestId);
      await loadFriendsData();
    } catch (err) {
      setError('Failed to decline friend request');
    }
  };

  const removeFriend = async (friendUserId: string): Promise<void> => {
    try {
      setError(null);
      await friendsApi.removeFriend(friendUserId);
      await loadFriendsData();
    } catch (err) {
      setError('Failed to remove friend');
    }
  };

  return {
    friends,
    incomingRequests,
    loading,
    error,
    searchUser,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    refreshFriends: loadFriendsData
  };
};