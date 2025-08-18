// src/lib/use-auth.tsx
'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  onIdTokenChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string, displayName?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signup: async () => {},
  login: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
});

const errorMap: Record<string, string> = {
  'auth/invalid-api-key': 'Invalid Firebase API key—check your project config.',
  'auth/operation-not-allowed': 'Email/password sign-in is disabled in Firebase.',
  'auth/weak-password': 'Password is too weak (min 6 characters).',
  'auth/email-already-in-use': 'This email is already registered.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-not-found': 'No account found for this email.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
  'auth/network-request-failed': 'Network error. Check your connection or ad blockers.',
  'auth/popup-closed-by-user': 'Sign-in popup was closed.',
};

function friendly(e: unknown, fallback = 'Something went wrong. Please try again.') {
  const code = (e as any)?.code as string | undefined;
  console.error('Auth error:', code, (e as any)?.message);
  return (code && errorMap[code]) || fallback;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Keep auth state in sync and refresh ID token
  useEffect(() => {
    const unsub1 = onAuthStateChanged(auth, u => {
      setUser(u);
      setLoading(false);
    });

    const unsub2 = onIdTokenChanged(auth, async u => {
      // If you need a fresh token for API calls:
      // const token = u ? await u.getIdToken() : null;
      // send token to your backend here if needed
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  const signup = async (email: string, password: string, displayName?: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }
      // Optional but recommended:
      await sendEmailVerification(cred.user);
    } catch (e) {
      throw new Error(friendly(e));
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      throw new Error(friendly(e));
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      throw new Error(friendly(e, 'Google sign-in failed.'));
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (e) {
      throw new Error(friendly(e, 'Could not send reset link.'));
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      throw new Error(friendly(e, 'Could not log out.'));
    }
  };

  const value = useMemo(
    () => ({ user, loading, signup, login, loginWithGoogle, logout, resetPassword }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
