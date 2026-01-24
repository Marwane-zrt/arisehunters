import { supabase } from './supabase';
import { UserProfile, UserProfileFormData } from '../types/userProfile';

const generateUniqueId = async (): Promise<string> => {
  let attempts = 0;
  const maxAttempts = 100;
  
  while (attempts < maxAttempts) {
    const firstDigit = Math.floor(Math.random() * 9) + 1;
    const remainingDigits = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
    const id = firstDigit + remainingDigits;
    
    const { data: existing, error } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('unique_id', id)
      .maybeSingle();
    
    if (error) {
      attempts++;
      continue;
    }
    
    if (!existing) {
      return id;
    }
    
    attempts++;
  }
  
  throw new Error('Failed to generate unique ID after multiple attempts');
};

export const fetchUserProfile = async (): Promise<UserProfile | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }


  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return await createUserProfile();
  }


  if (!data.unique_id || data.unique_id.length !== 8 || !/^\d{8}$/.test(data.unique_id)) {
    const newId = await generateUniqueId();
    
    const { data: updatedData, error: updateError } = await supabase
      .from('user_profiles')
      .update({ unique_id: newId })
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (updateError) {
      throw updateError;
    }
    
    return {
      id: updatedData.id,
      userId: updatedData.user_id,
      uniqueId: updatedData.unique_id,
      nickname: updatedData.nickname,
      createdAt: new Date(updatedData.created_at),
      updatedAt: new Date(updatedData.updated_at)
    };
  }

  return {
    id: data.id,
    userId: data.user_id,
    uniqueId: data.unique_id,
    nickname: data.nickname,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
};

export const createUserProfile = async (): Promise<UserProfile> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('No authenticated user');
  }


  const { data: existingProfile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (existingProfile) {
    if (!existingProfile.unique_id || existingProfile.unique_id.length !== 8 || !/^\d{8}$/.test(existingProfile.unique_id)) {
      const newId = await generateUniqueId();
      const { data: updatedData, error: updateError } = await supabase
        .from('user_profiles')
        .update({ unique_id: newId })
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (updateError) {
        throw updateError;
      }
      
      return {
        id: updatedData.id,
        userId: updatedData.user_id,
        uniqueId: updatedData.unique_id,
        nickname: updatedData.nickname,
        createdAt: new Date(updatedData.created_at),
        updatedAt: new Date(updatedData.updated_at)
      };
    }

    return {
      id: existingProfile.id,
      userId: existingProfile.user_id,
      uniqueId: existingProfile.unique_id,
      nickname: existingProfile.nickname,
      createdAt: new Date(existingProfile.created_at),
      updatedAt: new Date(existingProfile.updated_at)
    };
  }

  const newId = await generateUniqueId();

  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      user_id: user.id,
      unique_id: newId
    })
    .select()
    .single();

  if (error) {
    throw error;
  }


  return {
    id: data.id,
    userId: data.user_id,
    uniqueId: data.unique_id,
    nickname: data.nickname,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
};

export const updateUserProfile = async (updates: UserProfileFormData): Promise<UserProfile> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('No authenticated user');
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      nickname: updates.nickname
    })
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    userId: data.user_id,
    uniqueId: data.unique_id,
    nickname: data.nickname,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
};

export const fixAllInvalidIds = async (): Promise<void> => {
  const { data: profiles, error } = await supabase
    .from('user_profiles')
    .select('*');
  
  if (error) {
    return;
  }
  
  for (const profile of profiles) {
    if (!profile.unique_id || profile.unique_id.length !== 8 || !/^\d{8}$/.test(profile.unique_id)) {
      try {
        const newId = await generateUniqueId();
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ unique_id: newId })
          .eq('user_id', profile.user_id);
        
        if (updateError) {
        }
      } catch (err) {
      }
    }
  }
};