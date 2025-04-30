import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';

type UserRole = 'parent' | 'driver' | 'admin' | 'student' | null;

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: UserRole;
  userName: string;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  setUserRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userRole: null,
  userName: '',
  signIn: async () => {},
  signOut: () => {},
  setUserRole: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userName, setUserName] = useState('');

  // Mock user data - in a real app, this would come from backend
  const mockUsers = {
    'parent@example.com': { name: 'Ahmed Lakhdar', role: 'parent' },
    'driver@example.com': { name: 'Mohamed Krim', role: 'driver' },
    'admin@example.com': { name: 'Sara Taleb', role: 'admin' },
    'student@example.com': { name: 'Yacine Bouali', role: 'student' },
  };

  useEffect(() => {
    // Check if user is already logged in (e.g., from AsyncStorage)
    const checkAuthentication = async () => {
      // In a real app, check stored credentials
      const storedUser = false; // Mock - no stored user

      if (storedUser) {
        setIsAuthenticated(true);
        // Redirect to main app
        router.replace('/(tabs)');
      } else {
        // Redirect to login
        router.replace('/login');
      }
    };

    checkAuthentication();
  }, []);

  const signIn = async (email: string, password: string) => {
    // Mock authentication
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        // Check if user exists in our mock data
        const user = mockUsers[email as keyof typeof mockUsers];
        
        if (user && password === 'password') { // Simple password check for demo
          setIsAuthenticated(true);
          setUserRole(user.role as UserRole);
          setUserName(user.name);
          resolve();
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  };

  const signOut = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    router.replace('/login');
  };

  const value = {
    isAuthenticated,
    userRole,
    userName,
    signIn,
    signOut,
    setUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}