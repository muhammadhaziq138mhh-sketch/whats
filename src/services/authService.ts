import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  updateProfile as updateAuthProfile,
  deleteUser,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { UserProfile } from '../types';

/**
 * Creates or updates the user profile document in Firestore
 */
export async function syncUserProfile(user: User, extraData?: Partial<UserProfile>): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(userRef);
    const now = new Date().toISOString();

    if (!snap.exists()) {
      const usernameGenerated = (user.displayName || user.email?.split('@')[0] || 'user')
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '')
        .slice(0, 30) || `user_${user.uid.slice(0, 5)}`;

      const newProfile: UserProfile = {
        id: user.uid,
        displayName: user.displayName || 'Connectly User',
        username: usernameGenerated,
        usernameNormalized: usernameGenerated.toLowerCase(),
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        photoURL:
          user.photoURL ||
          `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
        about: 'Hey there! I am using Connectly.',
        role: user.email === 'muhammadhaziq138mhh@gmail.com' ? 'admin' : 'user',
        isOnline: true,
        lastSeen: now,
        createdAt: now,
        updatedAt: now,
        privacySettings: {
          lastSeen: 'everyone',
          online: 'everyone',
          readReceipts: true,
        },
        notificationSettings: {
          messages: true,
          groups: true,
          sound: true,
          preview: true,
        },
        blockedUsers: [],
        ...extraData,
      };

      await setDoc(userRef, newProfile);
      return newProfile;
    } else {
      const existing = snap.data() as UserProfile;
      const updates: Partial<UserProfile> = {
        isOnline: true,
        lastSeen: now,
        updatedAt: now,
        ...extraData,
      };
      if (!existing.email && user.email) updates.email = user.email;
      if (!existing.displayName && user.displayName) updates.displayName = user.displayName;
      if (!existing.photoURL && user.photoURL) updates.photoURL = user.photoURL;

      await updateDoc(userRef, updates);
      return { ...existing, ...updates };
    }
  } catch (error) {
    return handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
  }
}

/**
 * Sign in using Google Popup (Safe in AI Studio preview iframe)
 */
export async function signInWithGoogle(): Promise<UserProfile> {
  const result = await signInWithPopup(auth, googleProvider);
  return await syncUserProfile(result.user);
}

/**
 * Sign in with email and password
 */
export async function signInEmail(email: string, pass: string): Promise<UserProfile> {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return await syncUserProfile(result.user);
}

/**
 * Register new user with email and password
 */
export async function signUpEmail(
  email: string,
  pass: string,
  displayName: string,
  username: string
): Promise<UserProfile> {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  await updateAuthProfile(result.user, {
    displayName,
    photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`,
  });

  try {
    await sendEmailVerification(result.user);
  } catch (e) {
    console.warn('Email verification send ignored:', e);
  }

  return await syncUserProfile(result.user, {
    displayName,
    username: username.toLowerCase().replace(/[^a-z0-9_]/g, ''),
    usernameNormalized: username.toLowerCase().replace(/[^a-z0-9_]/g, ''),
  });
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Resend verification email
 */
export async function sendVerification(): Promise<void> {
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
  }
}

/**
 * Sign out and set offline in database
 */
export async function logOut(): Promise<void> {
  if (auth.currentUser) {
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        isOnline: false,
        lastSeen: new Date().toISOString(),
      });
    } catch {
      // ignore offline update failure on logout
    }
  }
  await firebaseSignOut(auth);
}

/**
 * Delete account securely
 */
export async function deleteAccount(): Promise<void> {
  if (auth.currentUser) {
    const uid = auth.currentUser.uid;
    const userRef = doc(db, 'users', uid);
    try {
      await updateDoc(userRef, {
        about: 'Account deleted',
        displayName: 'Deleted User',
        isOnline: false,
      });
    } catch (e) {
      console.warn('Could not update user doc before delete:', e);
    }
    await deleteUser(auth.currentUser);
  }
}
