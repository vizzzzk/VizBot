"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase"; // Make sure this path is correct
import { Loader } from "lucide-react";

// A simple loading component to show while auth state is being determined
const CenteredLoader = () => (
    <div style={{ display: 'flex', height: '100vh', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <Loader className="animate-spin" />
    </div>
);


interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, pass: string) => Promise<any>;
  login: (email: string, pass: string) => Promise<any>;
  logout: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signup: async () => {},
  login: async () => {},
  logout: async () => {},
});

// This is the provider component that will wrap your app
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This is the core of "remembering" the user.
    // Firebase automatically handles session persistence.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    // Unsubscribe from the listener when the component unmounts
    return () => unsubscribe();
  }, []);
  
  const signup = (email: string, pass: string) => {
      return createUserWithEmailAndPassword(auth, email, pass);
  }

  const login = (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  };
  
  const logout = () => {
      return signOut(auth);
  }

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <CenteredLoader /> : children}
    </AuthContext.Provider>
  );
};

// This is the custom hook you'll use in your components to access auth state and functions
export const useAuth = () => {
  return useContext(AuthContext);
};
