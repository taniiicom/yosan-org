'use client'

import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, TwitterAuthProvider, signOut } from 'firebase/auth';
import { auth } from './firebase';

interface AuthContextType {
  user: User | null;
  loginGoogle: () => Promise<void>;
  loginTwitter: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loginGoogle: async () => {},
  loginTwitter: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  const loginGoogle = async () => {
    await signInWithPopup(auth, new GoogleAuthProvider());
  };

  const loginTwitter = async () => {
    await signInWithPopup(auth, new TwitterAuthProvider());
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loginGoogle, loginTwitter, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
