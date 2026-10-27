import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { UserProfile } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateUserProfileData: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Super admin email recognized automatically
export const SUPER_ADMIN_EMAIL = 'nazrulpost75@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUserProfile = async (currentUser: FirebaseUser) => {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const snapshot = await getDoc(userRef);

      const isCurrentSuperAdmin = currentUser.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfile;
        setUserProfile(data);
        setIsAdmin(isCurrentSuperAdmin || data.role === 'admin' || data.role === 'superadmin');
        setIsSuperAdmin(isCurrentSuperAdmin);
      } else {
        // Create initial user document
        const newProfile: UserProfile = {
          uid: currentUser.uid,
          displayName: currentUser.displayName || 'সম্মানিত নাগরিক',
          email: currentUser.email || '',
          role: isCurrentSuperAdmin ? 'superadmin' : 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(userRef, newProfile);
        setUserProfile(newProfile);
        setIsAdmin(isCurrentSuperAdmin);
        setIsSuperAdmin(isCurrentSuperAdmin);
      }
    } catch (err) {
      console.error('Error fetching/creating user profile:', err);
      // Fallback role check using email directly
      const isCurrentSuperAdmin = currentUser.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
      setIsAdmin(isCurrentSuperAdmin);
      setIsSuperAdmin(isCurrentSuperAdmin);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserProfile(currentUser);
      } else {
        setUserProfile(null);
        setIsAdmin(false);
        setIsSuperAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      await updateProfile(cred.user, { displayName: name });
      const userRef = doc(db, 'users', cred.user.uid);
      const isCurrentSuperAdmin = email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
      const profile: UserProfile = {
        uid: cred.user.uid,
        displayName: name,
        email: email,
        role: isCurrentSuperAdmin ? 'superadmin' : 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(userRef, profile);
      setUserProfile(profile);
      setIsAdmin(isCurrentSuperAdmin);
      setIsSuperAdmin(isCurrentSuperAdmin);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const signOutUser = async () => {
    await signOut(auth);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user);
    }
  };

  const updateUserProfileData = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const updated = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    await setDoc(userRef, updated, { merge: true });
    await refreshProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isAdmin,
        isSuperAdmin,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        signOutUser,
        refreshProfile,
        updateUserProfileData
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
