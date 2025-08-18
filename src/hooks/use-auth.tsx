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


export const DebugAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User|null>(null);
  const [loading, setLoading] = useState(true);
  const [mountId] = useState(() => Math.random().toString(36).slice(2,8));

  useEffect(() => {
    console.log(`[Auth DBG ${mountId}] provider mounted`);
    console.log('[Auth DBG] firebase config check:', {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.slice(0,6),
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });

    const unsub = onAuthStateChanged(auth, (u) => {
      console.log(`[Auth DBG ${mountId}] onAuthStateChanged ->`, u ? { uid: u.uid, email: u.email } : null);
      setUser(u);
      setLoading(false);
    }, (err) => {
      console.error(`[Auth DBG ${mountId}] onAuthStateChanged ERROR:`, err);
      setLoading(false);
    });

    // Safety valve: if nothing fires in 5s, stop loading to reveal the page + console
    const timer = setTimeout(() => {
      if (loading) {
        console.warn(`[Auth DBG ${mountId}] timeout: forcing loading=false (listener didn’t fire)`);
        setLoading(false);
      }
    }, 5000);

    return () => { clearTimeout(timer); unsub(); };
  }, [mountId]); // eslint-disable-line

  const signup = async (email: string, password: string, displayName?: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }
      await sendEmailVerification(cred.user);
    } catch (e:any) {
      console.error('[Auth DBG] signup error:', e.code, e.message);
      throw new Error(friendly(e));
    }
  };
  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e:any) {
      console.error('[Auth DBG] login error:', e.code, e.message);
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

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('[Auth DBG] logout error:', e);
      throw new Error(friendly(e, 'Could not log out.'));
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (e) {
      console.error('[Auth DBG] reset error:', e);
       throw new Error(friendly(e, 'Could not send reset link.'));
    }
  };

  const value = useMemo(() => ({ user, loading, signup, login, logout, resetPassword, loginWithGoogle }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {/* Tiny on-screen tracer (remove later) */}
      <div style={{position:'fixed',bottom:8,right:8,background:'#0008',color:'#fff',fontSize:12,padding:'6px 8px',borderRadius:6,zIndex:9999}}>
        loading:{String(loading)} · user:{user?.uid ?? 'null'}
      </div>
      {loading ? <div className="grid min-h-[50vh] place-items-center">Loading…</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
