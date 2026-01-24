import React, { useState } from 'react';
import { User, LogOut, Settings, ChevronDown, Hash, Edit } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { ProfileModal } from './ProfileModal';

export const UserMenu: React.FC = () => {
  const { user, signOut } = useAuth();
  const { profile } = useUserProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  if (!user) return null;

  const displayName = profile?.nickname || user.email?.split('@')[0] || 'Hunter';

  return (
    <>
      <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-black/40 backdrop-blur-sm border border-blue-500/30 rounded-lg px-4 py-2 text-white hover:border-blue-400/50 transition-all"
      >
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <User size={16} className="text-white" />
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium">{displayName}</div>
          {profile?.uniqueId && (
            <div className="text-xs text-blue-300 flex items-center gap-1">
              <Hash size={10} />
              {profile.uniqueId}
            </div>
          )}
          {!profile?.uniqueId && (
            <div className="text-xs text-yellow-300">
              Loading ID...
            </div>
          )}
        </div>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20">
            <div className="p-3 border-b border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{displayName}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  {profile?.uniqueId && (
                    <div className="flex items-center gap-1 text-xs text-blue-300 mt-1">
                      <Hash size={10} />
                      <span className="font-mono">Hunter ID: {profile.uniqueId}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(profile.uniqueId);
                        }}
                        className="ml-1 text-blue-400 hover:text-blue-300"
                        title="Copy Hunter ID"
                      >
                        📋
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="py-1">
              <button
                onClick={() => {
                  setShowProfileModal(true);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                <Edit size={16} />
                Edit Profile
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
};