import React, { createContext, useContext, useState, useEffect } from 'react';
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
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUserRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  userRole: null,
  userName: '',
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  setUserRole: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Récupérer les infos supplémentaires depuis Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser(user);
            setIsAuthenticated(true);
            setUserRole(userData.role || null);
            setUserName(userData.name || user.email || '');
            
            // Redirection vers le dashboard approprié
            router.replace('/(tabs)');
          } else {
            // Si l'utilisateur n'a pas de document dans Firestore
            await firebaseSignOut(auth);
            router.replace('/login');
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          await firebaseSignOut(auth);
          router.replace('/login');
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setUserRole(null);
        setUserName('');
        router.replace('/login');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Récupérer les infos supplémentaires depuis Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser(user);
        setIsAuthenticated(true);
        setUserRole(userData.role || null);
        setUserName(userData.name || user.email || '');
        router.replace('/(tabs)');
      } else {
        throw new Error("User document not found in Firestore");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      setIsAuthenticated(false);
      setUser(null);
      setUserRole(null);
      setUserName('');
      router.replace('/login');
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    isAuthenticated,
    user,
    userRole,
    userName,
    loading,
    signIn,
    signOut,
    setUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}