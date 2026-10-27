import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { DEMO_USERS } from '../../data/demoData';
import { Avatar } from '../common/Avatar';
import { X, Users, Check, Camera } from 'lucide-react';

interface NewGroupModalProps {
  onClose: () => void;
}

export const NewGroupModal: React.FC<NewGroupModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { createNewGroupChat } = useChat();

  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableContacts = DEMO_USERS.filter((u) => u.id !== user?.id);

  const toggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUserIds.length === 0) return;
    setIsSubmitting(true);
    try {
      await createNewGroupChat(groupName.trim(), description.trim(), selectedUserIds);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#202C33] rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#00A884]" />
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              Create New Group
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Group Details Form */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Group Name *
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Design Systems, Project Phoenix"
              maxLength={60}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#00A884]"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Group Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add an optional topic or team guidelines"
              maxLength={150}
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#00A884]"
            />
          </div>
        </div>

        {/* Select Participants */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Select Participants ({selectedUserIds.length})
            </span>
          </div>

          {availableContacts.map((contact) => {
            const isSelected = selectedUserIds.includes(contact.id);
            return (
              <div
                key={contact.id}
                onClick={() => toggleSelectUser(contact.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#E8F8F5] dark:bg-[#005C4B]/20 border border-[#00A884]/30'
                    : 'hover:bg-gray-100 dark:hover:bg-[#182229]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    src={contact.photoURL}
                    name={contact.displayName}
                    size="md"
                    isOnline={contact.isOnline}
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {contact.displayName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      @{contact.username}
                    </p>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-[#00A884] text-white'
                      : 'border-2 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || selectedUserIds.length === 0 || isSubmitting}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#00A884] hover:bg-[#008f70] text-white disabled:opacity-50 transition-colors shadow-md"
          >
            {isSubmitting ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  );
};
