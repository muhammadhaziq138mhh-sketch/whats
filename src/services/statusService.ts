import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  query,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { StatusStory } from '../types';

/**
 * Post a 24-hour status story
 */
export async function createStatusStory(
  userId: string,
  userName: string,
  userPhoto: string | undefined,
  type: 'text' | 'image' | 'video',
  caption: string,
  mediaUrl?: string,
  backgroundColor?: string
): Promise<string> {
  const statusId = `stat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const statusRef = doc(db, 'users', userId, 'statuses', statusId);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

  const status: StatusStory = {
    id: statusId,
    userId,
    userName,
    userPhoto: userPhoto || '',
    type,
    caption: caption || '',
    mediaUrl: mediaUrl || '',
    backgroundColor: backgroundColor || '#0F534C',
    createdAt: now.toISOString(),
    expiresAt,
    viewers: [userId],
  };

  try {
    await setDoc(statusRef, status);
    return statusId;
  } catch (error) {
    return handleFirestoreError(error, OperationType.WRITE, `users/${userId}/statuses/${statusId}`);
  }
}

/**
 * Mark status as viewed by current user
 */
export async function markStatusViewed(authorId: string, statusId: string, currentUserId: string): Promise<void> {
  const statusRef = doc(db, 'users', authorId, 'statuses', statusId);
  try {
    await updateDoc(statusRef, {
      viewers: arrayUnion(currentUserId),
    });
  } catch (e) {
    // Non-critical viewer counter
  }
}

/**
 * Delete own status
 */
export async function deleteStatusStory(userId: string, statusId: string): Promise<void> {
  const statusRef = doc(db, 'users', userId, 'statuses', statusId);
  try {
    await deleteDoc(statusRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/statuses/${statusId}`);
  }
}
