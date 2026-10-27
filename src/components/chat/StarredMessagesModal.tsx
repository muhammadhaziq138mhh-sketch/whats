import React from 'react';
import { useChat } from '../../context/ChatContext';
import { Avatar } from '../common/Avatar';
import { X, Star, MessageSquare } from 'lucide-react';

interface StarredMessagesModalProps {
  onClose: () => void;
}

export const StarredMessagesModal: React.FC<StarredMessagesModalProps> = ({ onClose }) => {
  const { starredMessages, selectConversation, conversations } = useChat();

  const handleGoToChat = (convId: string) => {
    const conv = conversations.find((c) => c.id === convId);
    if (conv) selectConversation(conv);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#111B21] rounded-3xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-[#202C33]">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-current" />
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              Starred Messages
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-[#2A3942] text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {starredMessages.length > 0 ? (
            starredMessages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => handleGoToChat(msg.conversationId)}
                className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#202C33] hover:bg-gray-100 dark:hover:bg-[#2A3942] border border-gray-200 dark:border-gray-700/60 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#00A884] dark:text-[#25D366]">
                    {msg.senderName}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(msg.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed">
                  {msg.text || (msg.type === 'voice' ? '🎤 Voice message' : '📷 Attachment')}
                </p>

                <div className="flex justify-end items-center gap-1 mt-2 text-[11px] text-[#00A884] font-semibold">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Go to chat</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-xs text-gray-400">
              <Star className="w-8 h-8 mx-auto mb-2 opacity-30 text-amber-500" />
              No starred messages yet.
              <p className="mt-1 text-[11px]">Hover over any message and click the star icon to save it here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
