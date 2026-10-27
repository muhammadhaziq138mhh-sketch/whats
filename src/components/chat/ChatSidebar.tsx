import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { ChatListItem } from './ChatListItem';
import { Avatar } from '../common/Avatar';
import { Logo } from '../common/Logo';
import {
  Search,
  X,
  MessageSquarePlus,
  Users,
  CircleDot,
  Phone,
  Star,
  Archive,
  Settings,
  Shield,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Sun,
  Moon,
} from 'lucide-react';

interface ChatSidebarProps {
  onOpenNewChat: () => void;
  onOpenNewGroup: () => void;
  onOpenStatusFeed: () => void;
  onOpenCalls: () => void;
  onOpenStarred: () => void;
  onOpenSettings: () => void;
  onOpenAdmin: () => void;
  onOpenProfile: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  onOpenNewChat,
  onOpenNewGroup,
  onOpenStatusFeed,
  onOpenCalls,
  onOpenStarred,
  onOpenSettings,
  onOpenAdmin,
  onOpenProfile,
}) => {
  const { user, isLiveMode, toggleLiveMode, theme, toggleTheme, isAdmin } = useAuth();
  const {
    activeConversation,
    filteredConversations,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    selectConversation,
  } = useChat();

  return (
    <div className="flex flex-col h-full w-full md:w-[380px] lg:w-[420px] bg-white dark:bg-[#111B21] border-r border-gray-200 dark:border-gray-800 flex-shrink-0 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-gray-50/80 dark:bg-[#202C33] border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <Avatar
            src={user?.photoURL}
            name={user?.displayName || 'User'}
            size="md"
            isOnline={user?.isOnline}
            onClick={onOpenProfile}
            className="hover:opacity-90 transition-opacity"
          />
          <div>
            <Logo size="sm" showText={false} />
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
          {/* Status / Stories */}
          <button
            onClick={onOpenStatusFeed}
            title="Status Stories"
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#2A3942] transition-colors"
          >
            <CircleDot className="w-5 h-5 text-[#00A884]" />
          </button>

          {/* Calls */}
          <button
            onClick={onOpenCalls}
            title="Calls & Logs"
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#2A3942] transition-colors"
          >
            <Phone className="w-5 h-5" />
          </button>

          {/* Starred */}
          <button
            onClick={onOpenStarred}
            title="Starred Messages"
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#2A3942] transition-colors"
          >
            <Star className="w-5 h-5" />
          </button>

          {/* New Group */}
          <button
            onClick={onOpenNewGroup}
            title="New Group Chat"
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#2A3942] transition-colors"
          >
            <Users className="w-5 h-5" />
          </button>

          {/* New Direct Chat */}
          <button
            onClick={onOpenNewChat}
            title="New Chat"
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#2A3942] transition-colors"
          >
            <MessageSquarePlus className="w-5 h-5 text-[#00A884]" />
          </button>

          {/* Admin Dashboard if authorized */}
          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              title="Admin Dashboard"
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#2A3942] text-amber-500 transition-colors"
            >
              <Shield className="w-5 h-5" />
            </button>
          )}

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            title="Settings"
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#2A3942] transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mode Switcher Banner (Live vs Demo Mode) */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#E8F8F5] dark:bg-[#005C4B]/25 text-xs text-[#0F534C] dark:text-[#25D366] border-b border-[#00A884]/20">
        <div className="flex items-center gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Mode: <strong>{isLiveMode ? 'LIVE FIREBASE' : 'DEMO PREVIEW'}</strong></span>
        </div>
        <button
          onClick={toggleLiveMode}
          className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#00A884] hover:bg-[#008f70] text-white font-medium text-[11px] transition-colors"
        >
          Switch to {isLiveMode ? 'Demo' : 'Live'}
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="p-3">
        <div className="relative flex items-center bg-gray-100 dark:bg-[#202C33] rounded-xl px-3 py-2 text-gray-700 dark:text-gray-200">
          <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or start new chat"
            className="w-full bg-transparent text-sm focus:outline-none placeholder-gray-400 dark:placeholder-gray-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 px-3 pb-2 overflow-x-auto no-scrollbar">
        {(['all', 'unread', 'groups', 'archived'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
              activeFilter === filter
                ? 'bg-[#E7F8F4] text-[#00A884] dark:bg-[#005C4B] dark:text-white'
                : 'bg-gray-100 dark:bg-[#202C33] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#2A3942]'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conv) => (
            <ChatListItem
              key={conv.id}
              conversation={conv}
              isSelected={activeConversation?.id === conv.id}
              onClick={() => selectConversation(conv)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              No conversations found
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {searchQuery ? 'Try a different search query' : 'Start a new chat to begin messaging'}
            </p>
            <button
              onClick={onOpenNewChat}
              className="mt-3 px-3 py-1.5 text-xs font-semibold text-white bg-[#00A884] rounded-lg hover:bg-[#008f70] transition-colors"
            >
              New Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
