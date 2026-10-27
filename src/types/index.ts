export type UserRole = 'user' | 'admin' | 'superadmin';

export interface UserProfile {
  id: string;
  displayName: string;
  username: string;
  usernameNormalized: string;
  email: string;
  phoneNumber?: string;
  photoURL?: string;
  about?: string;
  role: UserRole;
  isOnline: boolean;
  lastSeen: string; // ISO string
  createdAt: string;
  updatedAt: string;
  privacySettings: {
    lastSeen: 'everyone' | 'contacts' | 'nobody';
    online: 'everyone' | 'contacts' | 'nobody';
    readReceipts: boolean;
  };
  notificationSettings: {
    messages: boolean;
    groups: boolean;
    sound: boolean;
    preview: boolean;
  };
  blockedUsers: string[];
}

export type ConversationType = 'direct' | 'group';

export interface Conversation {
  id: string;
  type: ConversationType;
  memberIds: string[];
  adminIds?: string[]; // for group chats
  name?: string; // for group chats
  description?: string;
  photoURL?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  lastMessageSenderId?: string;
  lastMessageStatus?: MessageStatus;
  isArchivedBy?: string[];
  pinnedBy?: string[];
  mutedBy?: string[];
  typingUsers?: string[];
  // Transient or populated data
  otherMember?: UserProfile;
  unreadCount?: number;
}

export type MessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'voice'
  | 'document'
  | 'system';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface MessageReaction {
  [userId: string]: string; // userId -> emoji
}

export interface ReplyReference {
  id: string;
  text: string;
  senderName: string;
  type?: MessageType;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  type: MessageType;
  text: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: number;
  attachmentType?: string;
  duration?: number; // seconds for voice/audio
  replyTo?: ReplyReference;
  reactions?: MessageReaction;
  starredBy?: string[];
  status: MessageStatus;
  readBy?: string[];
  isEdited?: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface StatusStory {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  type: 'text' | 'image' | 'video';
  caption?: string;
  mediaUrl?: string;
  backgroundColor?: string;
  createdAt: string;
  expiresAt: string;
  viewers: string[];
}

export type CallType = 'voice' | 'video';
export type CallStatus = 'calling' | 'ongoing' | 'ended' | 'rejected' | 'missed';

export interface CallRecord {
  id: string;
  callerId: string;
  callerName: string;
  callerPhoto?: string;
  receiverId: string;
  receiverName: string;
  receiverPhoto?: string;
  type: CallType;
  status: CallStatus;
  startedAt?: string;
  endedAt?: string;
  duration?: number; // seconds
  createdAt: string;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  reporterName?: string;
  reportedUserId: string;
  reportedUserName?: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  adminEmail: string;
  action: string;
  targetId?: string;
  details: string;
}
