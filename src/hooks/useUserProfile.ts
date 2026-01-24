import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { UserProfile, UserProfileFormData } from '../types/userProfile';
import { fetchUserProfile, updateUserProfile } from '../lib/userProfile';

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const profileData = await fetchUserProfile();
      setProfile(profileData);
      
      if (profileData && (!profileData.uniqueId || profileData.uniqueId.length !== 8 || !/^\d{8}$/.test(profileData.uniqueId))) {
        setTimeout(() => {
          loadProfile();
        }, 1000);
      }
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: UserProfileFormData) => {
    try {
      setError(null);
      const updatedProfile = await updateUserProfile(updates);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      setError('Failed to update profile');
      throw err;
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    refreshProfile: loadProfile
  };
};