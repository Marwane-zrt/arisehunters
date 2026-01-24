import React, { useState } from 'react';
import { X, User, Hash, Save, Copy, Check, AlertTriangle, Trash2 } from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { useAuth } from '../hooks/useAuth';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile, loading } = useUserProfile();
  const { deleteAccount } = useAuth();
  const [nickname, setNickname] = useState(profile?.nickname || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateProfile({ nickname: nickname.trim() || undefined });
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const copyUserId = async () => {
    if (profile?.uniqueId) {
      try {
        await navigator.clipboard.writeText(profile.uniqueId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy ID:', error);
      }
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      const { error } = await deleteAccount();
      if (error) {
        alert('Failed to delete account. Please try again or contact support.');
        setIsDeleting(false);
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
      setIsDeleting(false);
    }
  };

  if (!isOpen || !profile) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
        <div className="relative bg-black/90 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8 w-full max-w-md shadow-2xl">

          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <User className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white tracking-wide">Hunter Profile</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <X size={24} />
            </button>
          </div>

          {/* User ID Display */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-blue-300 mb-3 uppercase tracking-wider">
              Hunter ID
            </label>
            <div className="relative">
              <div className="flex items-center gap-3 bg-black/60 border border-blue-500/30 rounded-lg px-4 py-3">
                <Hash className="text-blue-400" size={20} />
                <span className="font-mono text-xl font-bold text-white tracking-wider">
                  {profile.uniqueId}
                </span>
                <button
                  onClick={copyUserId}
                  className="ml-auto text-gray-400 hover:text-white transition-colors p-1"
                  title="Copy ID"
                >
                  {copied ? (
                    <Check className="text-green-400" size={16} />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Your unique Hunter ID - share this with other hunters to connect
              </p>
            </div>
          </div>

          {/* Nickname Input */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-blue-300 mb-3 uppercase tracking-wider">
              Display Name (Optional)
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full bg-black/60 border border-blue-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter a display name..."
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-2">
              This will be shown instead of your email in the interface
            </p>
          </div>

          {/* Profile Stats */}
          <div className="mb-8 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">
              Profile Stats
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Member Since:</span>
                <span className="text-white">{profile.createdAt.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Profile Updated:</span>
                <span className="text-white">{profile.updatedAt.toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          {showDeleteConfirm ? (
            <div className="mb-8 bg-red-500/10 border border-red-500/50 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="text-red-500 flex-shrink-0" size={24} />
                <div>
                  <h4 className="text-red-500 font-bold mb-1">Delete Account?</h4>
                  <p className="text-red-400/80 text-sm">
                    This action cannot be undone. All your progress, habits, and stats will be permanently lost.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Confirm Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-400 hover:text-red-300 text-sm flex items-center gap-2 transition-colors"
              >
                <Trash2 size={16} />
                Delete Account
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 py-3 rounded-lg transition-all font-medium border border-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg border border-blue-400/30 uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};