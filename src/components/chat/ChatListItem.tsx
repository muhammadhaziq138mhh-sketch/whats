import React from 'react';
import { Conversation, MessageStatus } from '../../types';
import { Avatar } from '../common/Avatar';
import { Pin, VolumeX, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ChatListItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({
  conversation,
  isSelected,
  onClick,
}) => {
  const { user } = useAuth();

  const isGroup = conversation.type === 'group';
  const title = isGroup ? conversation.name || 'Group Chat' : conversation.otherMember?.displayName || 'User';
  const avatarUrl = isGroup ? conversation.photoURL : conversation.otherMember?.photoURL;
  const isOnline = isGroup ? false : conversation.otherMember?.isOnline;

  const isPinned = user && conversation.pinnedBy?.includes(user.id);
  const isMuted = user && conversation.mutedBy?.includes(user.id);
  const isTyping = conversation.typingUsers && conversation.typingUsers.length > 0;
  const isLastMessageFromMe = user && conversation.lastMessageSenderId === user.id;

  // Format timestamp
  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    const diffDays = Math.round((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const renderStatusTicks = (status?: MessageStatus) => {
    if (!isLastMessageFromMe) return null;
    if (status === 'read') {
      return <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB] dark:text-[#53BDEB] inline mr-1 flex-shrink-0" />;
    }
    if (status === 'delivered') {
      return <CheckCheck className="w-3.5 h-3.5 text-gray-400 inline mr-1 flex-shrink-0" />;
    }
    return <Check className="w-3.5 h-3.5 text-gray-400 inline mr-1 flex-shrink-0" />;
  };

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className={`group relative flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-colors duration-150 select-none ${
        isSelected
          ? 'bg-[#F0F2F5] dark:bg-[#202C33] shadow-xs'
          : 'hover:bg-gray-100/70 dark:hover:bg-[#202C33]/50'
      }`}
    >
      <Avatar
        src={avatarUrl}
        name={title}
        size="lg"
        isOnline={isOnline}
      />

      <div className="flex-1 min-w-0 pr-1">
        {/* Title and Time row */}
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 truncate tracking-tight">
            {title}
          </h4>
          <span
            className={`text-xs flex-shrink-0 ml-2 font-medium ${
              (conversation.unreadCount || 0) > 0
                ? 'text-[#00A884] dark:text-[#25D366] font-semibold'
                : 'text-gray-400 dark:text-gray-400'
            }`}
          >
            {formatTime(conversation.lastMessageAt)}
          </span>
        </div>

        {/* Message preview and indicators row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 truncate pr-2">
            {isTyping ? (
              <span className="text-[#00A884] dark:text-[#25D366] font-medium animate-pulse flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00A884] animate-ping" />
                typing...
              </span>
            ) : (
              <>
                {renderStatusTicks(conversation.lastMessageStatus)}
                <span className="truncate">{conversation.lastMessagePreview || 'No messages yet'}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isMuted && <VolumeX className="w-3.5 h-3.5 text-gray-400" />}
            {isPinned && <Pin className="w-3.5 h-3.5 text-gray-400 transform rotate-45" />}

            {(conversation.unreadCount || 0) > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[11px] font-bold text-white bg-[#25D366] rounded-full">
                {conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
