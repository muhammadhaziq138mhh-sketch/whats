import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Conversation, Message, MessageType, UserProfile } from '../types';

/**
 * Subscribe to all conversations for current user
 */
export function subscribeToConversations(
  userId: string,
  onData: (conversations: Conversation[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(
    collection(db, 'conversations'),
    where('memberIds', 'array-contains', userId)
  );

  return onSnapshot(
    q,
    async (snapshot) => {
      try {
        const convs: Conversation[] = [];
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data() as Conversation;
          data.id = docSnap.id;

          // If direct chat, resolve the other member profile
          if (data.type === 'direct') {
            const otherId = data.memberIds.find((id) => id !== userId);
            if (otherId) {
              try {
                const userSnap = await getDoc(doc(db, 'users', otherId));
                if (userSnap.exists()) {
                  data.otherMember = { id: userSnap.id, ...userSnap.data() } as UserProfile;
                }
              } catch {
                // Keep conversation without profile if unavailable
              }
            }
          }
          convs.push(data);
        }

        // Sort by lastMessageAt descending
        convs.sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime());
        onData(convs);
      } catch (err) {
        console.error('Error parsing conversations snapshot:', err);
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, 'conversations');
    }
  );
}

/**
 * Subscribe to messages in a conversation
 */
export function subscribeToMessages(
  conversationId: string,
  onData: (messages: Message[]) => void,
  onError?: (err: Error) => void
) {
  const path = `conversations/${conversationId}/messages`;
  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('createdAt', 'asc'),
    limit(100)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const messages: Message[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Message, 'id'>),
      }));
      onData(messages);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Send a message
 */
export async function sendMessage(
  conversationId: string,
  messageData: {
    senderId: string;
    senderName: string;
    senderPhoto?: string;
    type: MessageType;
    text: string;
    attachmentUrl?: string;
    attachmentName?: string;
    attachmentSize?: number;
    attachmentType?: string;
    duration?: number;
    replyTo?: Message['replyTo'];
  }
): Promise<string> {
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
  const convRef = doc(db, 'conversations', conversationId);
  const now = new Date().toISOString();

  const newMsg: Message = {
    id: messageId,
    conversationId,
    senderId: messageData.senderId,
    senderName: messageData.senderName,
    senderPhoto: messageData.senderPhoto || '',
    type: messageData.type,
    text: messageData.text,
    attachmentUrl: messageData.attachmentUrl || '',
    attachmentName: messageData.attachmentName || '',
    attachmentSize: messageData.attachmentSize || 0,
    attachmentType: messageData.attachmentType || '',
    duration: messageData.duration || 0,
    replyTo: messageData.replyTo,
    reactions: {},
    starredBy: [],
    status: 'sent',
    readBy: [messageData.senderId],
    isEdited: false,
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(messageRef, newMsg);

    // Update conversation summary
    const preview =
      messageData.type === 'text'
        ? messageData.text.slice(0, 80)
        : messageData.type === 'voice'
        ? '🎤 Voice message'
        : messageData.type === 'image'
        ? '📷 Photo'
        : messageData.type === 'video'
        ? '🎥 Video'
        : messageData.type === 'document'
        ? `📄 ${messageData.attachmentName || 'Document'}`
        : 'Attachment';

    await updateDoc(convRef, {
      lastMessageAt: now,
      lastMessagePreview: preview,
      lastMessageSenderId: messageData.senderId,
      lastMessageStatus: 'sent',
      updatedAt: now,
    });

    return messageId;
  } catch (error) {
    return handleFirestoreError(error, OperationType.WRITE, `conversations/${conversationId}/messages/${messageId}`);
  }
}

/**
 * Mark messages in a conversation as read by current user
 */
export async function markConversationAsRead(conversationId: string, userId: string, messages: Message[]) {
  const unread = messages.filter((m) => m.senderId !== userId && (!m.readBy || !m.readBy.includes(userId)));
  if (unread.length === 0) return;

  const convRef = doc(db, 'conversations', conversationId);
  try {
    // update conversation status
    await updateDoc(convRef, {
      lastMessageStatus: 'read',
    });

    for (const msg of unread) {
      const msgRef = doc(db, 'conversations', conversationId, 'messages', msg.id);
      await updateDoc(msgRef, {
        status: 'read',
        readBy: arrayUnion(userId),
      });
    }
  } catch (e) {
    console.warn('Silent read status update failed:', e);
  }
}

/**
 * Update typing indicator for current user
 */
export async function setTypingStatus(conversationId: string, userId: string, isTyping: boolean) {
  const convRef = doc(db, 'conversations', conversationId);
  try {
    await updateDoc(convRef, {
      typingUsers: isTyping ? arrayUnion(userId) : arrayRemove(userId),
    });
  } catch (e) {
    // Non-critical presence update
  }
}

/**
 * Add or toggle an emoji reaction
 */
export async function toggleReaction(conversationId: string, messageId: string, userId: string, emoji: string) {
  const msgRef = doc(db, 'conversations', conversationId, 'messages', messageId);
  try {
    const snap = await getDoc(msgRef);
    if (!snap.exists()) return;
    const msg = snap.data() as Message;
    const reactions = { ...(msg.reactions || {}) };

    if (reactions[userId] === emoji) {
      delete reactions[userId];
    } else {
      reactions[userId] = emoji;
    }

    await updateDoc(msgRef, { reactions });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `conversations/${conversationId}/messages/${messageId}`);
  }
}

/**
 * Star or unstar a message
 */
export async function toggleStarMessage(conversationId: string, messageId: string, userId: string, isStarred: boolean) {
  const msgRef = doc(db, 'conversations', conversationId, 'messages', messageId);
  try {
    await updateDoc(msgRef, {
      starredBy: isStarred ? arrayUnion(userId) : arrayRemove(userId),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `conversations/${conversationId}/messages/${messageId}`);
  }
}

/**
 * Edit message text
 */
export async function editMessage(conversationId: string, messageId: string, newText: string) {
  const msgRef = doc(db, 'conversations', conversationId, 'messages', messageId);
  try {
    await updateDoc(msgRef, {
      text: newText,
      isEdited: true,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `conversations/${conversationId}/messages/${messageId}`);
  }
}

/**
 * Delete message (Soft delete)
 */
export async function deleteMessage(conversationId: string, messageId: string) {
  const msgRef = doc(db, 'conversations', conversationId, 'messages', messageId);
  try {
    await updateDoc(msgRef, {
      text: 'This message was deleted.',
      isDeleted: true,
      attachmentUrl: '',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `conversations/${conversationId}/messages/${messageId}`);
  }
}

/**
 * Create or open a direct conversation
 */
export async function createOrGetDirectConversation(currentUserId: string, targetUserId: string): Promise<string> {
  // Check if conversation already exists between these 2 users
  const q = query(
    collection(db, 'conversations'),
    where('type', '==', 'direct'),
    where('memberIds', 'array-contains', currentUserId)
  );

  try {
    const snap = await getDocs(q);
    for (const docSnap of snap.docs) {
      const data = docSnap.data() as Conversation;
      if (data.memberIds.includes(targetUserId)) {
        return docSnap.id;
      }
    }

    // Otherwise create new
    const convId = `conv_${[currentUserId, targetUserId].sort().join('_').replace(/[^a-zA-Z0-9_]/g, '')}`;
    const convRef = doc(db, 'conversations', convId);
    const now = new Date().toISOString();

    const newConv: Conversation = {
      id: convId,
      type: 'direct',
      memberIds: [currentUserId, targetUserId],
      createdBy: currentUserId,
      createdAt: now,
      updatedAt: now,
      lastMessageAt: now,
      lastMessagePreview: 'Started a conversation',
      isArchivedBy: [],
      pinnedBy: [],
      mutedBy: [],
      typingUsers: [],
    };

    await setDoc(convRef, newConv);
    return convId;
  } catch (error) {
    return handleFirestoreError(error, OperationType.WRITE, 'conversations');
  }
}

/**
 * Create a new group conversation
 */
export async function createGroupConversation(
  creatorId: string,
  name: string,
  description: string,
  memberIds: string[],
  photoURL?: string
): Promise<string> {
  const convId = `grp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const convRef = doc(db, 'conversations', convId);
  const now = new Date().toISOString();
  const allMembers = Array.from(new Set([creatorId, ...memberIds]));

  const newGroup: Conversation = {
    id: convId,
    type: 'group',
    name,
    description: description || '',
    photoURL: photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}`,
    memberIds: allMembers,
    adminIds: [creatorId],
    createdBy: creatorId,
    createdAt: now,
    updatedAt: now,
    lastMessageAt: now,
    lastMessagePreview: 'Group created',
    lastMessageSenderId: creatorId,
    isArchivedBy: [],
    pinnedBy: [],
    mutedBy: [],
    typingUsers: [],
  };

  try {
    await setDoc(convRef, newGroup);

    // Add initial system message
    const msgId = `msg_sys_${Date.now()}`;
    await setDoc(doc(db, 'conversations', convId, 'messages', msgId), {
      id: msgId,
      conversationId: convId,
      senderId: creatorId,
      senderName: 'System',
      type: 'system',
      text: `Group "${name}" was created`,
      status: 'sent',
      createdAt: now,
    });

    return convId;
  } catch (error) {
    return handleFirestoreError(error, OperationType.WRITE, `conversations/${convId}`);
  }
}

/**
 * Toggle archive or pin for conversation
 */
export async function toggleConversationSetting(
  conversationId: string,
  userId: string,
  setting: 'archive' | 'pin' | 'mute',
  active: boolean
) {
  const convRef = doc(db, 'conversations', conversationId);
  const field = setting === 'archive' ? 'isArchivedBy' : setting === 'pin' ? 'pinnedBy' : 'mutedBy';

  try {
    await updateDoc(convRef, {
      [field]: active ? arrayUnion(userId) : arrayRemove(userId),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `conversations/${conversationId}`);
  }
}
