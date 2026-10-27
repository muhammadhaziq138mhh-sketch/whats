import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Conversation, Message, MessageType, UserProfile, CallRecord } from '../types';
import { useAuth } from './AuthContext';
import {
  subscribeToConversations,
  subscribeToMessages,
  sendMessage as firebaseSendMessage,
  markConversationAsRead,
  setTypingStatus,
  toggleReaction,
  toggleStarMessage,
  editMessage,
  deleteMessage,
  createOrGetDirectConversation,
  createGroupConversation,
  toggleConversationSetting,
} from '../services/chatService';
import {
  DEMO_CONVERSATIONS,
  DEMO_MESSAGES,
  DEMO_USERS,
  DEMO_CALL_HISTORY,
} from '../data/demoData';

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  activeFilter: 'all' | 'unread' | 'groups' | 'archived';
  searchQuery: string;
  filteredConversations: Conversation[];
  activeCall: CallRecord | null;
  callHistory: CallRecord[];
  replyingTo: Message | null;
  isDetailsOpen: boolean;
  starredMessages: Message[];
  setActiveFilter: (filter: 'all' | 'unread' | 'groups' | 'archived') => void;
  setSearchQuery: (query: string) => void;
  selectConversation: (conv: Conversation | null) => void;
  setReplyingTo: (msg: Message | null) => void;
  setIsDetailsOpen: (open: boolean) => void;
  sendChatMessage: (content: {
    type: MessageType;
    text: string;
    attachmentUrl?: string;
    attachmentName?: string;
    attachmentSize?: number;
    attachmentType?: string;
    duration?: number;
  }) => Promise<void>;
  sendTypingIndicator: (isTyping: boolean) => void;
  reactToMessage: (messageId: string, emoji: string) => Promise<void>;
  toggleStar: (messageId: string) => Promise<void>;
  editUserMessage: (messageId: string, newText: string) => Promise<void>;
  deleteUserMessage: (messageId: string) => Promise<void>;
  startDirectChatWithUser: (targetUser: UserProfile) => Promise<string>;
  createNewGroupChat: (name: string, description: string, memberIds: string[], photoURL?: string) => Promise<string>;
  archiveConversation: (conversationId: string) => Promise<void>;
  pinConversation: (conversationId: string) => Promise<void>;
  muteConversation: (conversationId: string) => Promise<void>;
  startCallSession: (receiver: UserProfile, type: 'voice' | 'video') => void;
  endCallSession: () => void;
  acceptCallSession: () => void;
  rejectCallSession: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLiveMode } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'groups' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [activeCall, setActiveCall] = useState<CallRecord | null>(null);
  const [callHistory, setCallHistory] = useState<CallRecord[]>(DEMO_CALL_HISTORY);

  // In-memory demo store for demo mode mutations
  const [demoConversationsState, setDemoConversationsState] = useState<Conversation[]>(DEMO_CONVERSATIONS);
  const [demoMessagesState, setDemoMessagesState] = useState<Record<string, Message[]>>(DEMO_MESSAGES);

  // Sync conversations depending on mode
  useEffect(() => {
    if (!user) {
      setConversations([]);
      setActiveConversation(null);
      return;
    }

    if (!isLiveMode) {
      setConversations(demoConversationsState);
      if (!activeConversation && demoConversationsState.length > 0) {
        setActiveConversation(demoConversationsState[0]);
      }
      return;
    }

    // Live mode: subscribe to Firestore conversations
    const unsubscribe = subscribeToConversations(user.id, (convs) => {
      setConversations(convs);
      // Auto-select first conversation if none selected
      if (!activeConversation && convs.length > 0) {
        setActiveConversation(convs[0]);
      } else if (activeConversation) {
        // Refresh active conversation pointer
        const refreshed = convs.find((c) => c.id === activeConversation.id);
        if (refreshed) setActiveConversation(refreshed);
      }
    });

    return () => unsubscribe();
  }, [user, isLiveMode, demoConversationsState]);

  // Sync messages for active conversation
  useEffect(() => {
    if (!activeConversation || !user) {
      setMessages([]);
      return;
    }

    if (!isLiveMode) {
      const activeMsgs = demoMessagesState[activeConversation.id] || [];
      setMessages(activeMsgs);
      return;
    }

    // Live mode: subscribe to subcollection messages
    const unsubscribe = subscribeToMessages(activeConversation.id, (msgs) => {
      setMessages(msgs);
      // Mark read automatically
      markConversationAsRead(activeConversation.id, user.id, msgs);
    });

    return () => unsubscribe();
  }, [activeConversation?.id, isLiveMode, user?.id, demoMessagesState]);

  const selectConversation = (conv: Conversation | null) => {
    setActiveConversation(conv);
    setReplyingTo(null);
  };

  const sendChatMessage = async (content: {
    type: MessageType;
    text: string;
    attachmentUrl?: string;
    attachmentName?: string;
    attachmentSize?: number;
    attachmentType?: string;
    duration?: number;
  }) => {
    if (!activeConversation || !user) return;

    const replyReference = replyingTo
      ? {
          id: replyingTo.id,
          text: replyingTo.text || (replyingTo.type === 'voice' ? 'Voice note' : 'Attachment'),
          senderName: replyingTo.senderName,
          type: replyingTo.type,
        }
      : undefined;

    setReplyingTo(null);

    if (!isLiveMode) {
      // Demo mode optimistic update
      const newMsgId = `msg_demo_${Date.now()}`;
      const now = new Date().toISOString();
      const newMsg: Message = {
        id: newMsgId,
        conversationId: activeConversation.id,
        senderId: user.id,
        senderName: user.displayName,
        senderPhoto: user.photoURL,
        type: content.type,
        text: content.text,
        attachmentUrl: content.attachmentUrl,
        attachmentName: content.attachmentName,
        attachmentSize: content.attachmentSize,
        attachmentType: content.attachmentType,
        duration: content.duration,
        replyTo: replyReference,
        reactions: {},
        starredBy: [],
        status: 'delivered',
        readBy: [user.id],
        isEdited: false,
        isDeleted: false,
        createdAt: now,
      };

      const convId = activeConversation.id;
      const updatedList = [...(demoMessagesState[convId] || []), newMsg];
      setDemoMessagesState((prev) => ({
        ...prev,
        [convId]: updatedList,
      }));

      // Update preview in conversations list
      const previewText =
        content.type === 'text'
          ? content.text
          : content.type === 'voice'
          ? '🎤 Voice note'
          : content.type === 'image'
          ? '📷 Photo'
          : 'Attachment';

      setDemoConversationsState((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                lastMessagePreview: previewText,
                lastMessageAt: now,
                lastMessageSenderId: user.id,
                lastMessageStatus: 'delivered',
              }
            : c
        )
      );

      // In demo mode, trigger a realistic automated reply after 2.5 seconds if direct chat with a demo user!
      if (activeConversation.type === 'direct' && activeConversation.otherMember) {
        const other = activeConversation.otherMember;
        setTimeout(() => {
          const autoReplyId = `msg_reply_${Date.now()}`;
          const replyNow = new Date().toISOString();
          const autoReplies = [
            `Thanks for sending! Connectly's realtime sync is so smooth ✨`,
            `Got it! Let me review this on my screen right now 🚀`,
            `Looks awesome! The UI responsiveness feels native 💚`,
            `Received loud and clear! Talk soon.`,
          ];
          const chosenReply = autoReplies[Math.floor(Math.random() * autoReplies.length)];

          const replyMsg: Message = {
            id: autoReplyId,
            conversationId: convId,
            senderId: other.id,
            senderName: other.displayName,
            senderPhoto: other.photoURL,
            type: 'text',
            text: chosenReply,
            reactions: {},
            starredBy: [],
            status: 'read',
            readBy: [user.id, other.id],
            createdAt: replyNow,
          };

          setDemoMessagesState((prev) => ({
            ...prev,
            [convId]: [...(prev[convId] || []), replyMsg],
          }));

          setDemoConversationsState((prev) =>
            prev.map((c) =>
              c.id === convId
                ? {
                    ...c,
                    lastMessagePreview: chosenReply,
                    lastMessageAt: replyNow,
                    lastMessageSenderId: other.id,
                    lastMessageStatus: 'read',
                  }
                : c
            )
          );
        }, 2200);
      }
      return;
    }

    // Live Mode: real Firestore message
    await firebaseSendMessage(activeConversation.id, {
      senderId: user.id,
      senderName: user.displayName,
      senderPhoto: user.photoURL,
      type: content.type,
      text: content.text,
      attachmentUrl: content.attachmentUrl,
      attachmentName: content.attachmentName,
      attachmentSize: content.attachmentSize,
      attachmentType: content.attachmentType,
      duration: content.duration,
      replyTo: replyReference,
    });
  };

  const sendTypingIndicator = (isTyping: boolean) => {
    if (!activeConversation || !user || !isLiveMode) return;
    setTypingStatus(activeConversation.id, user.id, isTyping);
  };

  const reactToMessage = async (messageId: string, emoji: string) => {
    if (!activeConversation || !user) return;
    if (!isLiveMode) {
      setDemoMessagesState((prev) => {
        const msgs = prev[activeConversation.id] || [];
        return {
          ...prev,
          [activeConversation.id]: msgs.map((m) => {
            if (m.id !== messageId) return m;
            const currentEmoji = m.reactions?.[user.id];
            const newReactions = { ...(m.reactions || {}) };
            if (currentEmoji === emoji) {
              delete newReactions[user.id];
            } else {
              newReactions[user.id] = emoji;
            }
            return { ...m, reactions: newReactions };
          }),
        };
      });
      return;
    }
    await toggleReaction(activeConversation.id, messageId, user.id, emoji);
  };

  const toggleStar = async (messageId: string) => {
    if (!activeConversation || !user) return;
    const msg = messages.find((m) => m.id === messageId);
    const isCurrentlyStarred = msg?.starredBy?.includes(user.id) || false;

    if (!isLiveMode) {
      setDemoMessagesState((prev) => {
        const msgs = prev[activeConversation.id] || [];
        return {
          ...prev,
          [activeConversation.id]: msgs.map((m) => {
            if (m.id !== messageId) return m;
            const starred = m.starredBy || [];
            return {
              ...m,
              starredBy: isCurrentlyStarred
                ? starred.filter((id) => id !== user.id)
                : [...starred, user.id],
            };
          }),
        };
      });
      return;
    }
    await toggleStarMessage(activeConversation.id, messageId, user.id, !isCurrentlyStarred);
  };

  const editUserMessage = async (messageId: string, newText: string) => {
    if (!activeConversation) return;
    if (!isLiveMode) {
      setDemoMessagesState((prev) => {
        const msgs = prev[activeConversation.id] || [];
        return {
          ...prev,
          [activeConversation.id]: msgs.map((m) =>
            m.id === messageId ? { ...m, text: newText, isEdited: true } : m
          ),
        };
      });
      return;
    }
    await editMessage(activeConversation.id, messageId, newText);
  };

  const deleteUserMessage = async (messageId: string) => {
    if (!activeConversation) return;
    if (!isLiveMode) {
      setDemoMessagesState((prev) => {
        const msgs = prev[activeConversation.id] || [];
        return {
          ...prev,
          [activeConversation.id]: msgs.map((m) =>
            m.id === messageId
              ? { ...m, text: 'This message was deleted.', isDeleted: true, attachmentUrl: '' }
              : m
          ),
        };
      });
      return;
    }
    await deleteMessage(activeConversation.id, messageId);
  };

  const startDirectChatWithUser = async (targetUser: UserProfile): Promise<string> => {
    if (!user) return '';

    if (!isLiveMode) {
      const existing = demoConversationsState.find(
        (c) => c.type === 'direct' && c.memberIds.includes(targetUser.id)
      );
      if (existing) {
        setActiveConversation(existing);
        return existing.id;
      }

      const newId = `conv_demo_${targetUser.id}`;
      const now = new Date().toISOString();
      const newConv: Conversation = {
        id: newId,
        type: 'direct',
        memberIds: [user.id, targetUser.id],
        createdBy: user.id,
        createdAt: now,
        updatedAt: now,
        lastMessageAt: now,
        lastMessagePreview: 'Started a conversation',
        otherMember: targetUser,
        isArchivedBy: [],
        pinnedBy: [],
        mutedBy: [],
        typingUsers: [],
      };

      setDemoConversationsState((prev) => [newConv, ...prev]);
      setActiveConversation(newConv);
      return newId;
    }

    const convId = await createOrGetDirectConversation(user.id, targetUser.id);
    return convId;
  };

  const createNewGroupChat = async (
    name: string,
    description: string,
    memberIds: string[],
    photoURL?: string
  ): Promise<string> => {
    if (!user) return '';

    if (!isLiveMode) {
      const newId = `grp_demo_${Date.now()}`;
      const now = new Date().toISOString();
      const newGroup: Conversation = {
        id: newId,
        type: 'group',
        name,
        description,
        photoURL: photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}`,
        memberIds: [user.id, ...memberIds],
        adminIds: [user.id],
        createdBy: user.id,
        createdAt: now,
        updatedAt: now,
        lastMessageAt: now,
        lastMessagePreview: 'Group created',
        lastMessageSenderId: user.id,
        isArchivedBy: [],
        pinnedBy: [],
        mutedBy: [],
        typingUsers: [],
      };

      setDemoConversationsState((prev) => [newGroup, ...prev]);
      setActiveConversation(newGroup);
      return newId;
    }

    const convId = await createGroupConversation(user.id, name, description, memberIds, photoURL);
    return convId;
  };

  const archiveConversation = async (conversationId: string) => {
    if (!user) return;
    const conv = conversations.find((c) => c.id === conversationId);
    const isArchived = conv?.isArchivedBy?.includes(user.id) || false;

    if (!isLiveMode) {
      setDemoConversationsState((prev) =>
        prev.map((c) => {
          if (c.id !== conversationId) return c;
          const list = c.isArchivedBy || [];
          return {
            ...c,
            isArchivedBy: isArchived ? list.filter((id) => id !== user.id) : [...list, user.id],
          };
        })
      );
      return;
    }
    await toggleConversationSetting(conversationId, user.id, 'archive', !isArchived);
  };

  const pinConversation = async (conversationId: string) => {
    if (!user) return;
    const conv = conversations.find((c) => c.id === conversationId);
    const isPinned = conv?.pinnedBy?.includes(user.id) || false;

    if (!isLiveMode) {
      setDemoConversationsState((prev) =>
        prev.map((c) => {
          if (c.id !== conversationId) return c;
          const list = c.pinnedBy || [];
          return {
            ...c,
            pinnedBy: isPinned ? list.filter((id) => id !== user.id) : [...list, user.id],
          };
        })
      );
      return;
    }
    await toggleConversationSetting(conversationId, user.id, 'pin', !isPinned);
  };

  const muteConversation = async (conversationId: string) => {
    if (!user) return;
    const conv = conversations.find((c) => c.id === conversationId);
    const isMuted = conv?.mutedBy?.includes(user.id) || false;

    if (!isLiveMode) {
      setDemoConversationsState((prev) =>
        prev.map((c) => {
          if (c.id !== conversationId) return c;
          const list = c.mutedBy || [];
          return {
            ...c,
            mutedBy: isMuted ? list.filter((id) => id !== user.id) : [...list, user.id],
          };
        })
      );
      return;
    }
    await toggleConversationSetting(conversationId, user.id, 'mute', !isMuted);
  };

  // Calling
  const startCallSession = (receiver: UserProfile, type: 'voice' | 'video') => {
    if (!user) return;
    const newCall: CallRecord = {
      id: `call_${Date.now()}`,
      callerId: user.id,
      callerName: user.displayName,
      callerPhoto: user.photoURL,
      receiverId: receiver.id,
      receiverName: receiver.displayName,
      receiverPhoto: receiver.photoURL,
      type,
      status: 'calling',
      createdAt: new Date().toISOString(),
    };
    setActiveCall(newCall);

    // Simulate answer after 2.5s in demo mode
    if (!isLiveMode) {
      setTimeout(() => {
        setActiveCall((prev) => (prev ? { ...prev, status: 'ongoing', startedAt: new Date().toISOString() } : null));
      }, 2500);
    }
  };

  const endCallSession = () => {
    if (activeCall) {
      const finished: CallRecord = {
        ...activeCall,
        status: 'ended',
        endedAt: new Date().toISOString(),
        duration: activeCall.startedAt
          ? Math.round((Date.now() - new Date(activeCall.startedAt).getTime()) / 1000)
          : 0,
      };
      setCallHistory((prev) => [finished, ...prev]);
    }
    setActiveCall(null);
  };

  const acceptCallSession = () => {
    if (activeCall) {
      setActiveCall({
        ...activeCall,
        status: 'ongoing',
        startedAt: new Date().toISOString(),
      });
    }
  };

  const rejectCallSession = () => {
    if (activeCall) {
      const rejected: CallRecord = {
        ...activeCall,
        status: 'rejected',
        endedAt: new Date().toISOString(),
      };
      setCallHistory((prev) => [rejected, ...prev]);
    }
    setActiveCall(null);
  };

  // Filtered conversations based on tab & search
  const filteredConversations = useMemo(() => {
    if (!user) return [];
    return conversations.filter((c) => {
      const isArchived = c.isArchivedBy?.includes(user.id);

      // Tab filtering
      if (activeFilter === 'archived') {
        if (!isArchived) return false;
      } else {
        if (isArchived) return false;
        if (activeFilter === 'unread' && (c.unreadCount || 0) === 0) return false;
        if (activeFilter === 'groups' && c.type !== 'group') return false;
      }

      // Search filtering
      if (searchQuery.trim()) {
        const queryLower = searchQuery.toLowerCase();
        const title = (c.type === 'group' ? c.name : c.otherMember?.displayName) || '';
        const preview = c.lastMessagePreview || '';
        return title.toLowerCase().includes(queryLower) || preview.toLowerCase().includes(queryLower);
      }

      return true;
    });
  }, [conversations, activeFilter, searchQuery, user]);

  const starredMessages = useMemo(() => {
    if (!user) return [];
    const allMsgs: Message[] = [];
    if (!isLiveMode) {
      Object.values(demoMessagesState).forEach((msgs) => {
        msgs.forEach((m) => {
          if (m.starredBy?.includes(user.id)) allMsgs.push(m);
        });
      });
    } else {
      messages.forEach((m) => {
        if (m.starredBy?.includes(user.id)) allMsgs.push(m);
      });
    }
    return allMsgs;
  }, [user, isLiveMode, demoMessagesState, messages]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        activeFilter,
        searchQuery,
        filteredConversations,
        activeCall,
        callHistory,
        replyingTo,
        isDetailsOpen,
        starredMessages,
        setActiveFilter,
        setSearchQuery,
        selectConversation,
        setReplyingTo,
        setIsDetailsOpen,
        sendChatMessage,
        sendTypingIndicator,
        reactToMessage,
        toggleStar,
        editUserMessage,
        deleteUserMessage,
        startDirectChatWithUser,
        createNewGroupChat,
        archiveConversation,
        pinConversation,
        muteConversation,
        startCallSession,
        endCallSession,
        acceptCallSession,
        rejectCallSession,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
