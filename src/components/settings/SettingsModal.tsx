import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { uploadMediaFile } from '../../services/storageService';
import { deleteAccount } from '../../services/authService';
import {
  X,
  User,
  Moon,
  Sun,
  Shield,
  Bell,
  Ban,
  Trash2,
  Camera,
  Check,
  AlertTriangle,
  Lock,
} from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { user, updateProfileData, theme, toggleTheme, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'theme' | 'privacy' | 'notifications' | 'blocked' | 'danger'>('profile');

  // Profile Form state
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [about, setAbout] = useState(user?.about || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Privacy state
  const [lastSeen, setLastSeen] = useState(user?.privacySettings.lastSeen || 'everyone');
  const [online, setOnline] = useState(user?.privacySettings.online || 'everyone');
  const [readReceipts, setReadReceipts] = useState(user?.privacySettings.readReceipts ?? true);

  // Notification state
  const [soundEnabled, setSoundEnabled] = useState(user?.notificationSettings.sound ?? true);
  const [previewEnabled, setPreviewEnabled] = useState(user?.notificationSettings.preview ?? true);

  // Delete account confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      await updateProfileData({
        displayName: displayName.trim(),
        username: username.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''),
        about: about.trim(),
        phoneNumber: phoneNumber.trim(),
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploaded = await uploadMediaFile(file, 'avatars');
      await updateProfileData({ photoURL: uploaded.url });
    } catch (err) {
      console.error('Failed to upload avatar:', err);
    }
  };

  const handleSavePrivacy = async () => {
    await updateProfileData({
      privacySettings: {
        lastSeen,
        online,
        readReceipts,
      },
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleSaveNotifications = async () => {
    await updateProfileData({
      notificationSettings: {
        messages: true,
        groups: true,
        sound: soundEnabled,
        preview: previewEnabled,
      },
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      await logout();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#111B21] rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row h-[85vh] max-h-[680px] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Left Settings Sidebar */}
        <div className="w-full md:w-56 bg-gray-50 dark:bg-[#202C33] p-4 border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between flex-shrink-0">
          <div>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Settings
              </h3>
              <button
                onClick={onClose}
                className="md:hidden p-1 rounded-full text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-1 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-[#00A884] text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-[#2A3942]'
                }`}
              >
                <User className="w-4 h-4" />
                Profile & Bio
              </button>

              <button
                onClick={() => setActiveTab('theme')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                  activeTab === 'theme'
                    ? 'bg-[#00A884] text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-[#2A3942]'
                }`}
              >
                {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                Theme & Display
              </button>

              <button
                onClick={() => setActiveTab('privacy')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                  activeTab === 'privacy'
                    ? 'bg-[#00A884] text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-[#2A3942]'
                }`}
              >
                <Shield className="w-4 h-4" />
                Privacy & Security
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                  activeTab === 'notifications'
                    ? 'bg-[#00A884] text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-[#2A3942]'
                }`}
              >
                <Bell className="w-4 h-4" />
                Notifications
              </button>

              <button
                onClick={() => setActiveTab('blocked')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                  activeTab === 'blocked'
                    ? 'bg-[#00A884] text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-[#2A3942]'
                }`}
              >
                <Ban className="w-4 h-4" />
                Blocked Users
              </button>

              <button
                onClick={() => setActiveTab('danger')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors ${
                  activeTab === 'danger' ? 'bg-red-600 text-white' : ''
                }`}
              >
                <Trash2 className="w-4 h-4" />
                Account Deletion
              </button>
            </nav>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full text-xs font-bold text-gray-500 hover:text-red-500 py-1 text-left px-2"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Right Content Pane */}
        <div className="flex-1 overflow-y-auto p-6 relative">
          <button
            onClick={onClose}
            className="hidden md:block absolute top-5 right-5 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>

          {profileSaved && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold animate-in fade-in">
              <Check className="w-4 h-4" />
              Settings saved successfully!
            </div>
          )}

          {/* Tab 1: Profile */}
          {activeTab === 'profile' && (
            <div className="space-y-4 max-w-md">
              <h4 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Personal Profile
              </h4>

              {/* Avatar changer */}
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <Avatar src={user?.photoURL} name={user?.displayName} size="xl" />
                  <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Camera className="w-5 h-5" />
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                </div>
                <div className="text-xs text-gray-500">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Profile Photo</p>
                  <p>Click image to upload new avatar</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#00A884]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  Username
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-gray-400 text-xs font-mono">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full text-xs pl-7 pr-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#00A884]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  About / Bio
                </label>
                <textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  rows={2}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#00A884]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#00A884]"
                />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="px-5 py-2 rounded-xl bg-[#00A884] hover:bg-[#008f70] text-white text-xs font-bold transition-colors shadow-md"
              >
                {isSavingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          )}

          {/* Tab 2: Theme */}
          {activeTab === 'theme' && (
            <div className="space-y-4 max-w-md">
              <h4 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Theme & Display
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Choose between classic crisp Light mode or modern dark styling.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => theme === 'dark' && toggleTheme()}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    theme === 'light'
                      ? 'border-[#00A884] bg-teal-50/50 shadow-sm'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <Sun className="w-6 h-6 text-amber-500 mb-2" />
                  <p className="text-xs font-bold text-gray-900">Light Theme</p>
                  <p className="text-[11px] text-gray-500">Classic WhatsApp light look</p>
                </button>

                <button
                  onClick={() => theme === 'light' && toggleTheme()}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    theme === 'dark'
                      ? 'border-[#00A884] bg-[#202C33] shadow-sm'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <Moon className="w-6 h-6 text-[#25D366] mb-2" />
                  <p className="text-xs font-bold text-white">Dark Theme</p>
                  <p className="text-[11px] text-gray-400">Deep teal and dark tones</p>
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Privacy */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 max-w-md">
              <h4 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Privacy & Security
              </h4>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  Who can see my Last Seen
                </label>
                <select
                  value={lastSeen}
                  onChange={(e) => setLastSeen(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100"
                >
                  <option value="everyone">Everyone</option>
                  <option value="contacts">My Contacts</option>
                  <option value="nobody">Nobody</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  Who can see when I am Online
                </label>
                <select
                  value={online}
                  onChange={(e) => setOnline(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100"
                >
                  <option value="everyone">Everyone</option>
                  <option value="contacts">Same as Last Seen</option>
                  <option value="nobody">Nobody</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#202C33] border border-gray-200 dark:border-gray-800">
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-gray-100">Read Receipts</p>
                  <p className="text-[11px] text-gray-500">Show blue checkmarks when messages are read</p>
                </div>
                <input
                  type="checkbox"
                  checked={readReceipts}
                  onChange={(e) => setReadReceipts(e.target.checked)}
                  className="w-4 h-4 text-[#00A884] rounded"
                />
              </div>

              <button
                onClick={handleSavePrivacy}
                className="px-5 py-2 rounded-xl bg-[#00A884] hover:bg-[#008f70] text-white text-xs font-bold transition-colors shadow-md"
              >
                Save Privacy Settings
              </button>
            </div>
          )}

          {/* Tab 4: Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-4 max-w-md">
              <h4 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Notification Preferences
              </h4>

              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#202C33] border border-gray-200 dark:border-gray-800">
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-gray-100">Message Sounds</p>
                  <p className="text-[11px] text-gray-500">Play subtle audio alert on new incoming message</p>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="w-4 h-4 text-[#00A884] rounded"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#202C33] border border-gray-200 dark:border-gray-800">
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-gray-100">Message Previews</p>
                  <p className="text-[11px] text-gray-500">Show message text preview in in-app banners</p>
                </div>
                <input
                  type="checkbox"
                  checked={previewEnabled}
                  onChange={(e) => setPreviewEnabled(e.target.checked)}
                  className="w-4 h-4 text-[#00A884] rounded"
                />
              </div>

              <button
                onClick={handleSaveNotifications}
                className="px-5 py-2 rounded-xl bg-[#00A884] hover:bg-[#008f70] text-white text-xs font-bold transition-colors shadow-md"
              >
                Save Notification Settings
              </button>
            </div>
          )}

          {/* Tab 5: Blocked Users */}
          {activeTab === 'blocked' && (
            <div className="space-y-4 max-w-md">
              <h4 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Blocked Users
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Blocked users cannot send you direct messages, call you, or view your status updates.
              </p>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#202C33] text-center text-xs text-gray-400 border border-gray-200 dark:border-gray-800">
                No users currently blocked.
              </div>
            </div>
          )}

          {/* Tab 6: Danger Zone */}
          {activeTab === 'danger' && (
            <div className="space-y-4 max-w-md">
              <h4 className="text-base font-bold text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Delete Account
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Deleting your Connectly account is irreversible. Your profile, settings, and personal message records will be deleted in accordance with privacy rules.
              </p>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-md"
              >
                Delete My Account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#202C33] rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-red-200 dark:border-red-900 text-center">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">
              Are you sure?
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              This action cannot be undone. You will lose access to your Connectly chats and profile.
            </p>

            <div className="flex justify-center gap-3 text-xs font-semibold">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
