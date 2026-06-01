import React, { createContext, useContext, useEffect, useState } from 'react';

interface UserProfile {
  uid: string;
  email: string | null;
  role: 'admin' | 'user';
  surname?: string;
  firstName?: string;
  address?: string;
  codename?: string;
  phone?: string;
  createdAt?: any;
}

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AuthContextType {
  user: User | null;
  role: 'admin' | 'user' | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  registerWithEmail: (email: string, password: string, additionalData: any) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updatedData: Partial<UserProfile>) => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  profile: null,
  loading: true,
  signInWithGoogle: async () => {},
  registerWithEmail: async () => {},
  loginWithEmail: async () => {},
  resetPassword: async () => {},
  updateProfile: async () => {},
  logOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'user' | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check local storage for mock user session
    const storedUser = localStorage.getItem('mockUser');
    const storedProfile = localStorage.getItem('mockProfile');
    
    if (storedUser && storedProfile) {
      setUser(JSON.parse(storedUser));
      setProfile(JSON.parse(storedProfile));
      setRole(JSON.parse(storedProfile).role);
    }
    setLoading(false);
  }, []);

  const setMockSession = (newUser: User, newProfile: UserProfile) => {
    setUser(newUser);
    setProfile(newProfile);
    setRole(newProfile.role);
    localStorage.setItem('mockUser', JSON.stringify(newUser));
    localStorage.setItem('mockProfile', JSON.stringify(newProfile));
  };

  const signInWithGoogle = async () => {
    // Mock Google Sign-In
    const mockUid = Math.random().toString(36).substring(7);
    const mockUser: User = { uid: mockUid, email: 'demo@google.com', displayName: 'Google User' };
    const mockProfile: UserProfile = { uid: mockUid, email: 'demo@google.com', role: 'user', codename: 'Googler' };
    setMockSession(mockUser, mockProfile);
  };

  const registerWithEmail = async (email: string, password: string, additionalData: any) => {
    // Mock Registration
    const mockUid = Math.random().toString(36).substring(7);
    const mockUser: User = { uid: mockUid, email, displayName: email.split('@')[0] };
    const mockProfile: UserProfile = { ...additionalData, uid: mockUid, email, role: 'user' };
    setMockSession(mockUser, mockProfile);
  };

  const loginWithEmail = async (email: string, password: string) => {
    // Mock Login (assuming role = admin if email has admin, else user)
    const mockUid = Math.random().toString(36).substring(7);
    const isAdmin = email.includes('admin');
    const mockUser: User = { uid: mockUid, email, displayName: email.split('@')[0] };
    const mockProfile: UserProfile = { uid: mockUid, email, role: isAdmin ? 'admin' : 'user', codename: 'User' };
    setMockSession(mockUser, mockProfile);
  };

  const resetPassword = async (email: string) => {
    // Mock password reset
    return new Promise<void>((resolve) => setTimeout(resolve, 1000));
  };

  const updateProfile = async (updatedData: Partial<UserProfile>) => {
    if (!user || !profile) return;
    const newProfile = { ...profile, ...updatedData };
    const newUser = { 
      ...user, 
      displayName: (updatedData.firstName || updatedData.surname)
        ? `${updatedData.firstName || ''} ${updatedData.surname || ''}`.trim()
        : user.displayName 
    };
    setUser(newUser);
    setProfile(newProfile);
    localStorage.setItem('mockUser', JSON.stringify(newUser));
    localStorage.setItem('mockProfile', JSON.stringify(newProfile));
  };

  const logOut = async () => {
    setUser(null);
    setProfile(null);
    setRole(null);
    localStorage.removeItem('mockUser');
    localStorage.removeItem('mockProfile');
  };

  return (
    <AuthContext.Provider value={{ user, role, profile, loading, signInWithGoogle, registerWithEmail, loginWithEmail, resetPassword, updateProfile, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
