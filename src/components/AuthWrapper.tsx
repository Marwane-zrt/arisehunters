import React, { useState } from 'react';
import { AuthForm } from './AuthForm';
import { DataMigration } from './DataMigration';
import { useAuth } from '../hooks/useAuth';
import { LoginFormData, SignupFormData } from '../types/auth';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { user, loading, signIn, signUp } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showMigration, setShowMigration] = useState(false);
  const [migrationComplete, setMigrationComplete] = useState(false);

  const handleAuth = async (data: LoginFormData | SignupFormData) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      let result;
      
      if (authMode === 'login') {
        result = await signIn(data.email, data.password);
      } else {
        const signupData = data as SignupFormData;
        if (signupData.password !== signupData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        result = await signUp(data.email, data.password);
      }

      if (result.error) {
        throw result.error;
      }

      if (authMode === 'signup' && result.data?.user && !result.data.session) {
        setAuthError('Please check your email to confirm your account before signing in.');
      } else if (authMode === 'login' && result.data?.session) {
        // Show migration dialog for existing users
        setShowMigration(true);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setAuthError(error.message || 'An error occurred during authentication');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleModeChange = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthError(null);
  };

  const handleMigrationComplete = () => {
    setShowMigration(false);
    setMigrationComplete(true);
  };
  // Show loading screen while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-blue-400 border-r-purple-400 mx-auto"></div>
          </div>
          <div className="space-y-2">
            <p className="text-blue-300 text-lg font-medium">Initializing Hunter System...</p>
            <div className="flex items-center justify-center gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show auth form if user is not authenticated
  if (!user) {
    return (
      <AuthForm
        mode={authMode}
        onSubmit={handleAuth}
        loading={authLoading}
        error={authError}
        onModeChange={handleModeChange}
      />
    );
  }

  // Show migration dialog for first-time login
  if (showMigration && !migrationComplete) {
    return <DataMigration onMigrationComplete={handleMigrationComplete} />;
  }
  // User is authenticated, show the main app
  return <>{children}</>;
};