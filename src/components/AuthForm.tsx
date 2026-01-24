import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Swords, Shield, Zap, AlertCircle } from 'lucide-react';
import { LoginFormData, SignupFormData } from '../types/auth';

interface AuthFormProps {
  mode: 'login' | 'signup';
  onSubmit: (data: LoginFormData | SignupFormData) => Promise<void>;
  loading: boolean;
  error: string | null;
  onModeChange: (mode: 'login' | 'signup') => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  mode,
  onSubmit,
  loading,
  error,
  onModeChange
}) => {
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'signup' && formData.password !== formData.confirmPassword) {
      return;
    }

    await onSubmit(formData);
  };

  const handleInputChange = (field: keyof SignupFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isSignup = mode === 'signup';
  const passwordsMatch = formData.password === formData.confirmPassword;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Glowing Border Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-500/20 rounded-2xl blur-xl"></div>
        
        <div className="relative bg-black/80 backdrop-blur-sm border border-blue-500/30 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 text-center border-b border-blue-500/20">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-xl blur-lg opacity-50"></div>
                <div className="relative p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                  <Swords className="text-white" size={32} />
                </div>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2 tracking-wider">
              ARISE
            </h1>
            <p className="text-blue-300 text-sm font-medium tracking-widest uppercase">
              Hunter System
            </p>
            
            <div className="mt-6">
              <h2 className="text-xl font-bold text-white mb-2">
                {isSignup ? 'Join the Guild' : 'Welcome Back, Hunter'}
              </h2>
              <p className="text-gray-400 text-sm">
                {isSignup 
                  ? 'Begin your journey to become the strongest hunter'
                  : 'Continue your path to greatness'
                }
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
                <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-bold text-blue-300 mb-3 uppercase tracking-wider">
                  Hunter Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="text-gray-400" size={20} />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full bg-black/60 border border-blue-500/30 rounded-lg pl-12 pr-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="hunter@arise.com"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-bold text-blue-300 mb-3 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="text-gray-400" size={20} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full bg-black/60 border border-blue-500/30 rounded-lg pl-12 pr-12 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field (Signup only) */}
              {isSignup && (
                <div>
                  <label className="block text-sm font-bold text-blue-300 mb-3 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Shield className="text-gray-400" size={20} />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`w-full bg-black/60 border rounded-lg pl-12 pr-12 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                        formData.confirmPassword && !passwordsMatch
                          ? 'border-red-500/50 focus:ring-red-500'
                          : 'border-blue-500/30 focus:ring-blue-500'
                      }`}
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {formData.confirmPassword && !passwordsMatch && (
                    <p className="mt-2 text-red-400 text-sm">Passwords do not match</p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || (isSignup && !passwordsMatch)}
                className="w-full relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur-lg opacity-75 group-hover:opacity-100 transition-all"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white font-bold py-4 rounded-lg transition-all shadow-lg border border-blue-400/30 uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <Zap size={20} />
                      {isSignup ? 'Awaken as Hunter' : 'Enter the System'}
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Mode Switch */}
            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm mb-4">
                {isSignup ? 'Already a registered hunter?' : 'New to the Hunter System?'}
              </p>
              <button
                onClick={() => onModeChange(isSignup ? 'login' : 'signup')}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors uppercase tracking-wider"
              >
                {isSignup ? 'Sign In to Your Account' : 'Create Hunter Account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};