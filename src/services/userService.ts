import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
  limit,
  setDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { UserProfile, ReportItem } from '../types';

/**
 * Search users by username or display name
 */
export async function searchUsers(searchTerm: string, currentUserId: string): Promise<UserProfile[]> {
  if (!searchTerm.trim()) return [];
  const term = searchTerm.trim().toLowerCase();

  try {
    const q = query(collection(db, 'users'), limit(20));
    const snap = await getDocs(q);
    const results: UserProfile[] = [];

    snap.forEach((docSnap) => {
      if (docSnap.id === currentUserId) return;
      const data = docSnap.data() as UserProfile;
      data.id = docSnap.id;

      if (
        data.username?.toLowerCase().includes(term) ||
        data.displayName?.toLowerCase().includes(term) ||
        data.email?.toLowerCase().includes(term)
      ) {
        results.push(data);
      }
    });

    return results;
  } catch (error) {
    return handleFirestoreError(error, OperationType.GET, 'users');
  }
}

/**
 * Update user profile details
 */
export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
  const userRef = doc(db, 'users', userId);
  try {
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
  }
}

/**
 * Block or unblock a user
 */
export async function toggleBlockUser(currentUserId: string, targetUserId: string, block: boolean): Promise<void> {
  const userRef = doc(db, 'users', currentUserId);
  try {
    await updateDoc(userRef, {
      blockedUsers: block ? arrayUnion(targetUserId) : arrayRemove(targetUserId),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${currentUserId}`);
  }
}

/**
 * Submit report for abuse or moderation
 */
export async function submitUserReport(
  reporterId: string,
  reporterName: string,
  reportedUserId: string,
  reportedUserName: string,
  reason: string
): Promise<string> {
  const reportId = `rep_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const reportRef = doc(db, 'reports', reportId);

  const report: ReportItem = {
    id: reportId,
    reporterId,
    reporterName,
    reportedUserId,
    reportedUserName,
    reason,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(reportRef, report);
    return reportId;
  } catch (error) {
    return handleFirestoreError(error, OperationType.WRITE, `reports/${reportId}`);
  }
}

/**
 * Fetch all reports for Admin dashboard
 */
export async function getAdminReports(): Promise<ReportItem[]> {
  try {
    const snap = await getDocs(collection(db, 'reports'));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ReportItem, 'id'>) }));
  } catch (error) {
    return handleFirestoreError(error, OperationType.GET, 'reports');
  }
}

/**
 * Resolve or dismiss a report
 */
export async function updateReportStatus(reportId: string, status: 'resolved' | 'dismissed'): Promise<void> {
  const reportRef = doc(db, 'reports', reportId);
  try {
    await updateDoc(reportRef, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `reports/${reportId}`);
  }
}
