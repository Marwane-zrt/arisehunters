import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { deleteAccount as deleteAccountFromDb } from '../lib/database';
import { User, AuthState } from '../types/auth';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setAuthState({
          user: session?.user ? {
            id: session.user.id,
            email: session.user.email!,
            created_at: session.user.created_at
          } : null,
          loading: false
        });
      } catch (error) {
        // Clear invalid tokens and reset auth state
        await supabase.auth.signOut();
        setAuthState({
          user: null,
          loading: false
        });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthState({
          user: session?.user ? {
            id: session.user.id,
            email: session.user.email!,
            created_at: session.user.created_at
          } : null,
          loading: false
        });
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    // Always clear the local auth state, even if server-side logout fails
    setAuthState({
      user: null,
      loading: false
    });

    try {
      // Check if there's an active session before attempting to sign out
      const { data: { session } } = await supabase.auth.getSession();

      // If no session exists, skip the server-side sign out to avoid unnecessary errors
      if (!session) {
        return { error: null };
      }

      const { error } = await supabase.auth.signOut();

      // Handle the specific case where the session doesn't exist on the server
      // This is not a critical error since the client-side logout is successful
      if (error && error.message === 'Session from session_id claim in JWT does not exist') {
        return { error: null };
      }

      return { error };
    } catch (error: any) {
      // Handle any network or other errors during sign out
      // Since we've already cleared the local state, we can treat this as successful
      console.warn('Sign out request failed, but local session cleared:', error);
      return { error: null };
    }
  };

  const deleteAccount = async () => {
    try {
      await deleteAccountFromDb();
      // Auth state change listener will handle the sign out update
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  return {
    user: authState.user,
    loading: authState.loading,
    signUp,
    signIn,
    signOut,
    deleteAccount
  };
};