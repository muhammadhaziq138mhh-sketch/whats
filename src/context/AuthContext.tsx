import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, testConnection } from '../services/firebase';
import {
  signInWithGoogle,
  signInEmail,
  signUpEmail,
  logOut as firebaseLogOut,
  syncUserProfile,
} from '../services/authService';
import { updateUserProfile } from '../services/userService';
import { UserProfile } from '../types';
import { CURRENT_DEMO_USER, DEMO_USERS } from '../data/demoData';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: User | null;
  isLoading: boolean;
  isLiveMode: boolean;
  theme: 'light' | 'dark';
  isAdmin: boolean;
  toggleLiveMode: () => void;
  toggleTheme: () => void;
  switchDemoPersona: (persona: UserProfile) => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfileData: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiveMode, setIsLiveMode] = useState(false); // defaults to demo preview, instant switch to live
  const [activeDemoPersona, setActiveDemoPersona] = useState<UserProfile>(CURRENT_DEMO_USER);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('connectly_theme') as 'light' | 'dark') || 'light';
  });

  // Test connection on boot
  useEffect(() => {
    testConnection();
  }, []);

  // Update theme class on HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('connectly_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      if (fUser) {
        try {
          const profile = await syncUserProfile(fUser);
          setUser(profile);
          setIsLiveMode(true); // Automatically switch to Live mode when logged in with real account
        } catch (err) {
          console.error('Failed to sync Firebase user profile:', err);
        }
      } else {
        if (isLiveMode) {
          setUser(null);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isLiveMode]);

  // Sync active user when in Demo Mode
  useEffect(() => {
    if (!isLiveMode) {
      setUser(activeDemoPersona);
      setIsLoading(false);
    } else if (!firebaseUser) {
      setUser(null);
    }
  }, [isLiveMode, activeDemoPersona, firebaseUser]);

  const toggleLiveMode = () => {
    setIsLiveMode((prev) => {
      const next = !prev;
      if (!next) {
        setUser(activeDemoPersona);
      } else {
        setUser(firebaseUser ? user : null);
      }
      return next;
    });
  };

  const switchDemoPersona = (persona: UserProfile) => {
    setActiveDemoPersona(persona);
    if (!isLiveMode) {
      setUser(persona);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const profile = await signInWithGoogle();
      setUser(profile);
      setIsLiveMode(true);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const profile = await signInEmail(email, pass);
      setUser(profile);
      setIsLiveMode(true);
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string, username: string) => {
    setIsLoading(true);
    try {
      const profile = await signUpEmail(email, pass, name, username);
      setUser(profile);
      setIsLiveMode(true);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (isLiveMode && firebaseUser) {
      await firebaseLogOut();
    }
    setUser(null);
    if (!isLiveMode) {
      // In demo mode, log out switches to unauthenticated view
      setIsLiveMode(true);
    }
  };

  const updateProfileData = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    if (isLiveMode && firebaseUser) {
      await updateUserProfile(user.id, updates);
    } else {
      setActiveDemoPersona(updated);
    }
  };

  const isAdmin = useMemo(() => {
    if (!user) return false;
    return (
      user.role === 'admin' ||
      user.role === 'superadmin' ||
      user.email === 'muhammadhaziq138mhh@gmail.com'
    );
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoading,
        isLiveMode,
        theme,
        isAdmin,
        toggleLiveMode,
        toggleTheme,
        switchDemoPersona,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        updateProfileData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
