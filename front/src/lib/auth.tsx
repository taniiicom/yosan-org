'use client'

import { createContext, useContext, useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from '@chakra-ui/react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  TwitterAuthProvider,
  AuthCredential,
  signOut,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  updateProfile,
} from 'firebase/auth';
import type { FirebaseError } from 'firebase/app';
import { auth } from './firebase';

interface AuthContextType {
  user: User | null;
  loginGoogle: () => Promise<void>;
  loginTwitter: () => Promise<void>;
  logout: () => Promise<void>;
  updateUsername: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loginGoogle: async () => {},
  loginTwitter: async () => {},
  logout: async () => {},
  updateUsername: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [pendingCred, setPendingCred] = useState<AuthCredential | null>(null);
  const [mergeProvider, setMergeProvider] = useState<'google.com' | 'twitter.com' | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);


  const handleMerge = async (error: FirebaseError) => {
    const email = error?.customData?.email as string | undefined;
    const cred =
      GoogleAuthProvider.credentialFromError(error) ||
      TwitterAuthProvider.credentialFromError(error);
    if (!email || !cred) return;
    const methods = await fetchSignInMethodsForEmail(auth, email);
    if (methods.includes('google.com')) {
      setMergeProvider('google.com');
      setPendingCred(cred);
      onOpen();
    } else if (methods.includes('twitter.com')) {
      setMergeProvider('twitter.com');
      setPendingCred(cred);
      onOpen();
    }
  };

  const proceedMerge = async () => {
    if (!pendingCred || !mergeProvider) return;
    try {
      const provider =
        mergeProvider === 'google.com'
          ? new GoogleAuthProvider()
          : new TwitterAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      await linkWithCredential(user, pendingCred);
      setPendingCred(null);
      setMergeProvider(null);
    } catch (e) {
      console.error(e);
    } finally {
      onClose();
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

  const updateUsername = async (name: string) => {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: name });
      setUser({ ...auth.currentUser });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loginGoogle, loginTwitter, logout, updateUsername }}>
      {children}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>既存アカウントにログイン</ModalHeader>
          <ModalBody>
            {mergeProvider === 'google.com'
              ? '既に Google で登録済みです。Google でログインして続行してください。'
              : '既に Twitter で登録済みです。Twitter でログインして続行してください。'}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={proceedMerge}>
              {mergeProvider === 'google.com' ? 'Googleでログイン' : 'Twitterでログイン'}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              キャンセル
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AuthContext.Provider>
  );
};
