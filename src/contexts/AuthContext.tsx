import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { generateSalt, deriveKey } from '@/lib/encryption';

interface AuthContextType {
  user: User | null;
  encryptionKey: CryptoKey | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  initializeEncryption: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      // Clear encryption key on sign out
      if (!user) {
        setEncryptionKey(null);
      }
    });

    return unsubscribe;
  }, []);

  const initializeEncryption = async (password: string) => {
    if (!user) throw new Error('No user logged in');

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();

    if (!userData?.encryptionSalt) {
      throw new Error('User encryption salt not found');
    }

    const key = await deriveKey(password, userData.encryptionSalt);
    setEncryptionKey(key);
  };

  const signIn = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    
    // Derive encryption key after successful login
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    const userData = userDoc.data();
    
    if (userData?.encryptionSalt) {
      const key = await deriveKey(password, userData.encryptionSalt);
      setEncryptionKey(key);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile
    await updateProfile(result.user, { displayName });
    
    // Generate encryption salt and create user document
    const encryptionSalt = generateSalt();
    
    await setDoc(doc(db, 'users', result.user.uid), {
      displayName,
      email,
      encryptionSalt,
      settings: {
        theme: 'system',
        locale: 'en',
        currency: 'USD',
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    // Derive encryption key
    const key = await deriveKey(password, encryptionSalt);
    setEncryptionKey(key);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Check if user document exists
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    
    if (!userDoc.exists()) {
      // Create new user document for Google sign-in
      // Note: For Google auth, user needs to set up encryption separately
      const encryptionSalt = generateSalt();
      
      await setDoc(doc(db, 'users', result.user.uid), {
        displayName: result.user.displayName || 'User',
        email: result.user.email,
        encryptionSalt,
        settings: {
          theme: 'system',
          locale: 'en',
          currency: 'USD',
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  };

  const logout = async () => {
    await signOut(auth);
    setEncryptionKey(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        encryptionKey,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        logout,
        initializeEncryption,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
