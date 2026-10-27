import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { searchUsers } from '../../services/userService';
import { DEMO_USERS } from '../../data/demoData';
import { UserProfile } from '../../types';
import { Avatar } from '../common/Avatar';
import { X, Search, UserPlus, MessageSquare } from 'lucide-react';

interface NewChatModalProps {
  onClose: () => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({ onClose }) => {
  const { user, isLiveMode } = useAuth();
  const { startDirectChatWithUser } = useChat();

  const [queryText, setQueryText] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Available contact suggestions (demo users not equal to current)
  const contactSuggestions = DEMO_USERS.filter((u) => u.id !== user?.id);

  const handleSearch = async (val: string) => {
    setQueryText(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }

    if (!isLiveMode) {
      const filtered = DEMO_USERS.filter(
        (u) =>
          u.id !== user?.id &&
          (u.displayName.toLowerCase().includes(val.toLowerCase()) ||
            u.username.toLowerCase().includes(val.toLowerCase()))
      );
      setSearchResults(filtered);
      return;
    }

    if (!user) return;
    setIsSearching(true);
    try {
      const results = await searchUsers(val, user.id);
      setSearchResults(results);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectUser = async (target: UserProfile) => {
    await startDirectChatWithUser(target);
    onClose();
  };

  const displayedList = queryText.trim() ? searchResults : contactSuggestions;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#202C33] rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#00A884]" />
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              New Direct Chat
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5 bg-gray-100 dark:bg-[#182229] px-3.5 py-2.5 rounded-xl text-gray-800 dark:text-gray-200">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={queryText}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by name, username or email..."
              className="w-full bg-transparent text-xs focus:outline-none placeholder-gray-400"
              autoFocus
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            {queryText ? 'Search Results' : 'Suggested Contacts'}
          </p>

          {isSearching ? (
            <p className="text-xs text-center py-6 text-gray-400 animate-pulse">
              Searching users...
            </p>
          ) : displayedList.length > 0 ? (
            displayedList.map((contact) => (
              <div
                key={contact.id}
                onClick={() => handleSelectUser(contact)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#182229] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar
                    src={contact.photoURL}
                    name={contact.displayName}
                    size="md"
                    isOnline={contact.isOnline}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {contact.displayName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      @{contact.username} • {contact.about || 'Available'}
                    </p>
                  </div>
                </div>

                <button className="p-2 text-[#00A884] hover:bg-[#00A884]/10 rounded-full flex-shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-xs text-gray-400">
              No matching users found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
