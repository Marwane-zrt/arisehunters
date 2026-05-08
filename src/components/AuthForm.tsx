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
    <div className="min-h-screen bg-[#050810] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-cyan-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '4s' }}></div>
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>
      </div>

      <div className="relative w-full max-w-md z-10">
        {/* Glowing Border Effect behind the card */}
        <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-cyan-500/30 rounded-[2rem] blur-xl opacity-75 animate-pulse"></div>
        
        <div className="relative bg-[#0B0F19]/90 backdrop-blur-2xl border border-white/5 rounded-[2rem] shadow-2xl overflow-hidden p-8 sm:p-10">
          
          {/* Header */}
          <div className="text-center mb-10">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="relative group cursor-default">
                <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-500"></div>
                <div className="relative p-4 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-2xl border border-blue-400/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                  <Swords className="text-white drop-shadow-md" size={36} strokeWidth={1.5} />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl font-black bg-gradient-to-br from-white via-blue-100 to-blue-400 bg-clip-text text-transparent mb-1 tracking-widest drop-shadow-sm">
              ARISE
            </h1>
            <p className="text-blue-500/80 text-[10px] font-bold tracking-[0.3em] uppercase mb-8">
              Hunter System
            </p>
            
            <h2 className="text-2xl font-bold text-white mb-2 tracking-wide">
              {isSignup ? 'Join the Guild' : 'Welcome Back, Hunter'}
            </h2>
            <p className="text-gray-400 text-sm font-medium">
              {isSignup 
                ? 'Begin your journey to become the strongest hunter'
                : 'Continue your path to greatness'
              }
            </p>
          </div>

          {/* Form */}
          <div className="">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="group">
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider group-focus-within:text-blue-400 transition-colors">
                  Hunter Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full bg-[#151A2D]/50 border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-[#151A2D] transition-all"
                    placeholder="hunter@arise.com"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="group">
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider group-focus-within:text-blue-400 transition-colors">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full bg-[#151A2D]/50 border border-white/5 rounded-xl pl-11 pr-12 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-[#151A2D] transition-all"
                    placeholder="Enter your password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field (Signup only) */}
              {isSignup && (
                <div className="group animate-in fade-in slide-in-from-top-2">
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider group-focus-within:text-blue-400 transition-colors">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Shield className="text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`w-full bg-[#151A2D]/50 border rounded-xl pl-11 pr-12 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:bg-[#151A2D] transition-all ${
                        formData.confirmPassword && !passwordsMatch
                          ? 'border-red-500/30 focus:ring-red-500/50 focus:border-red-500/50'
                          : 'border-white/5 focus:ring-blue-500/50 focus:border-blue-500/50'
                      }`}
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {formData.confirmPassword && !passwordsMatch && (
                    <p className="mt-2 text-red-400 text-xs font-medium pl-1">Passwords do not match</p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || (isSignup && !passwordsMatch)}
                className="w-full relative group mt-8"
              >
                <div className="absolute inset-0 bg-blue-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] border border-blue-500/30 uppercase tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group-hover:scale-[1.02] active:scale-[0.98]">
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
                  ) : (
                    <>
                      <Zap size={18} className="text-blue-200" />
                      <span className="drop-shadow-md">{isSignup ? 'Awaken as Hunter' : 'Enter the System'}</span>
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Mode Switch */}
            <div className="mt-10 text-center relative z-10">
              <p className="text-gray-500 text-xs font-medium mb-3">
                {isSignup ? 'ALREADY A REGISTERED HUNTER?' : 'NEW TO THE HUNTER SYSTEM?'}
              </p>
              <button
                onClick={() => onModeChange(isSignup ? 'login' : 'signup')}
                className="text-blue-400 hover:text-white font-bold transition-colors uppercase tracking-wider text-sm px-4 py-2 rounded-lg hover:bg-blue-500/10"
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