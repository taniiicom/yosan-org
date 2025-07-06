'use client'

import { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  TwitterAuthProvider,
  signOut,
  fetchSignInMethodsForEmail,
  linkWithCredential,
} from 'firebase/auth';
import type { FirebaseError } from 'firebase/app';
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


  const handleMerge = async (error: FirebaseError) => {
    const email = error?.customData?.email as string | undefined;
    const pendingCred =
      GoogleAuthProvider.credentialFromError(error) ||
      TwitterAuthProvider.credentialFromError(error);
    if (!email || !pendingCred) return;
    const methods = await fetchSignInMethodsForEmail(auth, email);
    if (methods.includes('google.com')) {
      alert('既に Google で登録済みです。Google でログインして続行します。');
      const { user } = await signInWithPopup(auth, new GoogleAuthProvider());
      await linkWithCredential(user, pendingCred);
    } else if (methods.includes('twitter.com')) {
      alert('既に Twitter で登録済みです。Twitter でログインして続行します。');
      const { user } = await signInWithPopup(auth, new TwitterAuthProvider());
      await linkWithCredential(user, pendingCred);
    }
  };

  const loginGoogle = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e) {
      const err = e as FirebaseError;
      if (err.code === 'auth/account-exists-with-different-credential') {
        await handleMerge(err);
      } else {
        console.error(err);
      }
    }
  };

  const loginTwitter = async () => {
    try {
      await signInWithPopup(auth, new TwitterAuthProvider());
    } catch (e) {
      const err = e as FirebaseError;
      if (err.code === 'auth/account-exists-with-different-credential') {
        await handleMerge(err);
      } else {
        console.error(err);
      }
    }
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
