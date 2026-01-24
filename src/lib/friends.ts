import { supabase } from './supabase';
import { Friend, FriendRequest, FriendProfile, FriendWithProfile } from '../types/friend';

export const searchUserByUniqueId = async (uniqueId: string): Promise<FriendProfile | null> => {
  const cleanId = uniqueId.trim().replace(/\D/g, ''); // Remove all non-digits
  
  if (!cleanId || cleanId.length !== 8) {
    throw new Error('Invalid ID format. Please enter exactly 8 digits.');
  }


  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('unique_id', cleanId)
      .maybeSingle();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    if (data) {
      return {
        id: data.id,
        userId: data.user_id,
        uniqueId: data.unique_id,
        nickname: data.nickname,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    }

    return null;
  } catch (err) {
    throw err;
  }
};

export const sendFriendRequest = async (toUserId: string): Promise<FriendRequest> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('No authenticated user');
  }


  const { data: targetProfile, error: targetError } = await supabase
    .from('user_profiles')
    .select('user_id')
    .eq('user_id', toUserId)
    .maybeSingle();

  if (targetError) {
    throw new Error('Failed to validate target user');
  }

  if (!targetProfile) {
    throw new Error('Target user not found');
  }

  const { data: existingRequest, error: existingRequestError } = await supabase
    .from('friend_requests')
    .select('*')
    .or(`and(from_user_id.eq.${user.id},to_user_id.eq.${toUserId}),and(from_user_id.eq.${toUserId},to_user_id.eq.${user.id})`)
    .limit(1);

  if (existingRequestError) {
    throw new Error('Failed to check existing friend requests');
  }

  const existingRequestRecord = existingRequest && existingRequest.length > 0 ? existingRequest[0] : null;

  if (existingRequestRecord) {
    if (existingRequestRecord.status === 'pending') {
      throw new Error('A pending friend request already exists between these users');
    } else if (existingRequestRecord.status === 'accepted') {
      throw new Error('You are already friends with this user');
    } else if (existingRequestRecord.status === 'declined') {
      const { error: deleteError } = await supabase
        .from('friend_requests')
        .delete()
        .eq('id', existingRequestRecord.id);

      if (deleteError) {
        throw new Error('Failed to remove declined friend request');
      }
    }
  }

  const { data: existingFriend } = await supabase
    .from('friends')
    .select('*')
    .or(`and(user_id.eq.${user.id},friend_user_id.eq.${toUserId}),and(user_id.eq.${toUserId},friend_user_id.eq.${user.id})`)
    .maybeSingle();

  if (existingFriend) {
    throw new Error('Already friends with this user');
  }

  const { data, error } = await supabase
    .from('friend_requests')
    .insert({
      from_user_id: user.id,
      to_user_id: toUserId,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to send friend request');
  }


  return {
    id: data.id,
    fromUserId: data.from_user_id,
    toUserId: data.to_user_id,
    status: data.status as 'pending' | 'accepted' | 'declined',
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
};

export const getIncomingFriendRequests = async (): Promise<(FriendRequest & { fromProfile: FriendProfile })[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('No authenticated user');
  }

  const { data, error } = await supabase
    .from('friend_requests')
    .select(`
      *,
      from_profile:user_profiles!friend_requests_from_user_id_fkey(*)
    `)
    .eq('to_user_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data.map(item => ({
    id: item.id,
    fromUserId: item.from_user_id,
    toUserId: item.to_user_id,
    status: item.status as 'pending' | 'accepted' | 'declined',
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at),
    fromProfile: {
      id: item.from_profile.id,
      userId: item.from_profile.user_id,
      uniqueId: item.from_profile.unique_id,
      nickname: item.from_profile.nickname,
      createdAt: new Date(item.from_profile.created_at),
      updatedAt: new Date(item.from_profile.updated_at)
    }
  }));
};

export const acceptFriendRequest = async (requestId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('No authenticated user');
  }

  const { data: request, error: requestError } = await supabase
    .from('friend_requests')
    .select('*')
    .eq('id', requestId)
    .eq('to_user_id', user.id)
    .single();

  if (requestError || !request) {
    throw new Error('Friend request not found');
  }

  const { data: existingFriendship } = await supabase
    .from('friends')
    .select('*')
    .or(`and(user_id.eq.${user.id},friend_user_id.eq.${request.from_user_id}),and(user_id.eq.${request.from_user_id},friend_user_id.eq.${user.id})`)
    .maybeSingle();

  const { error: updateError } = await supabase
    .from('friend_requests')
    .update({ status: 'accepted' })
    .eq('id', requestId);

  if (updateError) {
    throw updateError;
  }

  if (!existingFriendship) {
    const { error: friendError } = await supabase
      .from('friends')
      .insert({
        user_id: user.id,
        friend_user_id: request.from_user_id,
        status: 'accepted'
      });

    if (friendError) {
      throw friendError;
    }
  }
};

export const declineFriendRequest = async (requestId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('No authenticated user');
  }

  const { error } = await supabase
    .from('friend_requests')
    .update({ status: 'declined' })
    .eq('id', requestId)
    .eq('to_user_id', user.id);

  if (error) {
    throw error;
  }
};

export const getFriends = async (): Promise<FriendWithProfile[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('No authenticated user');
  }

  const { data, error } = await supabase
    .from('friends')
    .select(`
      *,
      friend_profile:user_profiles!friends_friend_user_id_fkey(*)
    `)
    .eq('user_id', user.id)
    .eq('status', 'accepted')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data.map(item => ({
    id: item.id,
    userId: item.user_id,
    friendUserId: item.friend_user_id,
    status: item.status as 'pending' | 'accepted' | 'blocked',
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at),
    friendProfile: {
      id: item.friend_profile.id,
      userId: item.friend_profile.user_id,
      uniqueId: item.friend_profile.unique_id,
      nickname: item.friend_profile.nickname,
      createdAt: new Date(item.friend_profile.created_at),
      updatedAt: new Date(item.friend_profile.updated_at)
    }
  }));
};

export const removeFriend = async (friendUserId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('No authenticated user');
  }

  const { error: friendshipError } = await supabase
    .from('friends')
    .delete()
    .or(`and(user_id.eq.${user.id},friend_user_id.eq.${friendUserId}),and(user_id.eq.${friendUserId},friend_user_id.eq.${user.id})`);

  if (friendshipError) {
    throw friendshipError;
  }

  const { error: requestError } = await supabase
    .from('friend_requests')
    .delete()
    .or(`and(from_user_id.eq.${user.id},to_user_id.eq.${friendUserId}),and(from_user_id.eq.${friendUserId},to_user_id.eq.${user.id})`);

  if (requestError) {
    throw new Error(`Failed to clean up friend requests: ${requestError.message}`);
  }
};

export const validateAndFixUserProfiles = async (): Promise<void> => {
  const { data: profiles, error } = await supabase
    .from('user_profiles')
    .select('*');
  
  if (error) {
    return;
  }
  
  let fixedCount = 0;
  
  for (const profile of profiles) {
    if (!profile.unique_id || profile.unique_id.length !== 8 || !/^\d{8}$/.test(profile.unique_id)) {
      let newId;
      let attempts = 0;
      const maxAttempts = 50;
      
      while (attempts < maxAttempts) {
        const firstDigit = Math.floor(Math.random() * 9) + 1;
        const remainingDigits = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
        newId = firstDigit + remainingDigits;
        
        const { data: existing } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('unique_id', newId)
          .maybeSingle();
        
        if (!existing) {
          break;
        }
        attempts++;
      }
      
      if (attempts >= maxAttempts) {
        continue;
      }
      
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ unique_id: newId })
        .eq('user_id', profile.user_id);
      
      if (updateError) {
        fixedCount++;
      }
    }
  }
};