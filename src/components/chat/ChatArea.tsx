import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { Avatar } from '../common/Avatar';
import { Logo } from '../common/Logo';
import {
  Phone,
  Video,
  Search,
  MoreVertical,
  ArrowLeft,
  Lock,
  X,
  Sparkles,
  MessageSquare,
  Users,
} from 'lucide-react';

interface ChatAreaProps {
  onBack: () => void;
  onOpenNewChat: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ onBack, onOpenNewChat }) => {
  const { user } = useAuth();
  const {
    activeConversation,
    messages,
    isDetailsOpen,
    setIsDetailsOpen,
    startCallSession,
  } = useChat();

  const [inChatSearch, setInChatSearch] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (!activeConversation) {
    return (
      <div className="hidden md:flex flex-1 flex-col items-center justify-center h-full bg-[#F0F2F5]/70 dark:bg-[#111B21] border-l border-gray-200 dark:border-gray-800 p-8 text-center select-none">
        <div className="max-w-md flex flex-col items-center">
          <div className="w-20 h-20 rounded-3xl bg-teal-50 dark:bg-[#005C4B]/20 flex items-center justify-center mb-6 shadow-inner">
            <Logo size="xl" showText={false} />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Connectly Web
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
            Send and receive real-time messages, share documents and media, make WebRTC voice and video calls, and post 24-hour status stories.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <button
              onClick={onOpenNewChat}
              className="flex items-center gap-2 px-4 py-2 bg-[#00A884] hover:bg-[#008f70] text-white text-xs font-semibold rounded-xl shadow-md transition-transform active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              Start New Chat
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
            <Lock className="w-3.5 h-3.5" />
            <span>Messages protected by authenticated access rules and transport encryption</span>
          </div>
        </div>
      </div>
    );
  }

  const isGroup = activeConversation.type === 'group';
  const title = isGroup
    ? activeConversation.name || 'Group Chat'
    : activeConversation.otherMember?.displayName || 'User';
  const subtitle = isGroup
    ? `${activeConversation.memberIds.length} participants`
    : activeConversation.otherMember?.isOnline
    ? 'online'
    : activeConversation.otherMember?.lastSeen
    ? `last seen ${new Date(activeConversation.otherMember.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : 'offline';

  // In-chat search filter
  const displayedMessages = inChatSearch.trim()
    ? messages.filter((m) => m.text?.toLowerCase().includes(inChatSearch.toLowerCase()))
    : messages;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#EFEAE2] dark:bg-[#0B141A] relative overflow-hidden">
      {/* Active Conversation Header */}
      <div className="flex items-center justify-between px-3 md:px-4 py-2.5 bg-gray-50/95 dark:bg-[#202C33] border-b border-gray-200 dark:border-gray-800 z-10 select-none">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <button
            onClick={onBack}
            className="md:hidden p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-[#2A3942] text-gray-600 dark:text-gray-300 mr-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <Avatar
            src={isGroup ? activeConversation.photoURL : activeConversation.otherMember?.photoURL}
            name={title}
            size="md"
            isOnline={isGroup ? false : activeConversation.otherMember?.isOnline}
            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          />

          <div
            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
            className="min-w-0 cursor-pointer"
          >
            <h3 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 truncate tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
          {!isGroup && activeConversation.otherMember && (
            <>
              <button
                onClick={() => startCallSession(activeConversation.otherMember!, 'video')}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#2A3942] text-[#00A884] transition-colors"
                title="Video Call"
              >
                <Video className="w-5 h-5" />
              </button>
              <button
                onClick={() => startCallSession(activeConversation.otherMember!, 'voice')}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#2A3942] text-[#00A884] transition-colors"
                title="Voice Call"
              >
                <Phone className="w-5 h-5" />
              </button>
            </>
          )}

          <button
            onClick={() => setShowSearchInput(!showSearchInput)}
            className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#2A3942] transition-colors ${
              showSearchInput ? 'text-[#00A884]' : ''
            }`}
            title="Search in conversation"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#2A3942] transition-colors"
            title="Details"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* In-chat search bar */}
      {showSearchInput && (
        <div className="px-4 py-2 bg-white dark:bg-[#182229] border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={inChatSearch}
            onChange={(e) => setInChatSearch(e.target.value)}
            placeholder="Search messages in this chat..."
            className="w-full bg-transparent text-xs text-gray-900 dark:text-gray-100 focus:outline-none"
            autoFocus
          />
          {inChatSearch && (
            <button
              onClick={() => setInChatSearch('')}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Message stream */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {/* Security badge at top */}
        <div className="flex justify-center mb-4">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100/90 dark:bg-[#1F2C34] text-amber-800 dark:text-amber-300 rounded-lg text-[11px] shadow-xs max-w-sm text-center leading-snug">
            <Lock className="w-3 h-3 flex-shrink-0" />
            Messages are stored securely in Firestore and accessible only to members.
          </span>
        </div>

        {displayedMessages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isGroup={isGroup}
            onImageClick={(url) => setLightboxImg(url)}
          />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <MessageInput />

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={lightboxImg}
              alt="Enlarged preview"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-lg font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
