import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAuth, signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { router } from 'expo-router';

type UserRole = 'parent' | 'driver' | 'admin' | 'student' | null;

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  userRole: UserRole;
  userName: string;
  userEmail: string;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  userRole: null,
  userName: '',
  userEmail: '',
  loading: true,
  error: null,
  signIn: async () => {},
  signOut: async () => {},
  refreshUserData: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth = getAuth();

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, "Users", userId));
      
      if (!userDoc.exists()) {
        throw new Error("User document not found");
      }

      const userData = userDoc.data();
      return {
        role: userData.role || null,
        name: userData.fullName || userData.name || '',
        email: userData.email || ''
      };
    } catch (err) {
      console.error("Error fetching user data:", err);
      throw err;
    }
  }, []);

  const updateAuthState = useCallback(async (user: User | null) => {
    setLoading(true);
    setError(null);

    try {
      if (user) {
        const { role, name, email } = await fetchUserData(user.uid);
        
        setUser(user);
        setIsAuthenticated(true);
        setUserRole(role);
        setUserName(name);
        setUserEmail(email);
        
        // Redirection basée sur le rôle
        if (role) {
          router.replace('/(tabs)');
        }
      } else {
        resetAuthState();
        router.replace('/login');
      }
    } catch (err) {
      console.error("Auth state error:", err);
      setError(err.message || "Failed to authenticate");
      await firebaseSignOut(auth);
      resetAuthState();
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  }, [fetchUserData]);

  const resetAuthState = () => {
    setIsAuthenticated(false);
    setUser(null);
    setUserRole(null);
    setUserName('');
    setUserEmail('');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, updateAuthState);
    return unsubscribe;
  }, [updateAuthState]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await updateAuthState(userCredential.user);
    } catch (err) {
      console.error("Sign in error:", err);
      setError(getAuthErrorMessage(err.code));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      resetAuthState();
      router.replace('/login');
    } catch (err) {
      console.error("Sign out error:", err);
      setError(err.message || "Failed to sign out");
    } finally {
      setLoading(false);
    }
  };

  const refreshUserData = async () => {
    if (user) {
      try {
        const { role, name, email } = await fetchUserData(user.uid);
        setUserRole(role);
        setUserName(name);
        setUserEmail(email);
      } catch (err) {
        console.error("Refresh error:", err);
        setError(err.message || "Failed to refresh user data");
      }
    }
  };

  const getAuthErrorMessage = (code: string): string => {
    switch (code) {
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/user-disabled':
        return 'Account disabled';
      case 'auth/user-not-found':
        return 'No account found';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/too-many-requests':
        return 'Too many attempts. Try again later';
      case 'permission-denied':
        return 'Insufficient permissions';
      default:
        return 'Authentication failed';
    }
  };

  const value = {
    isAuthenticated,
    user,
    userRole,
    userName,
    userEmail,
    loading,
    error,
    signIn,
    signOut,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}