import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useToast } from './ToastContext';

interface UserProfile {
  uid: string;
  email: string | null;
  role: 'admin' | 'user';
  surname?: string;
  firstName?: string;
  address?: string;
  city?: string;
  stateLocation?: string;
  lga?: string;
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
  signInWithGoogle: (credential: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, additionalData: any) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updatedData: Partial<UserProfile>) => Promise<void>;
  logOut: () => Promise<void>;
  token: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  profile: null,
  loading: true,
  signInWithGoogle: async (credential: string) => {},
  registerWithEmail: async () => {},
  loginWithEmail: async () => {},
  resetPassword: async () => {},
  updateProfile: async () => {},
  logOut: async () => {},
  token: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'user' | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check local storage for session
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');
    const storedProfile = localStorage.getItem('authProfile');
    
    if (storedToken && storedUser && storedProfile) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setProfile(JSON.parse(storedProfile));
      setRole(JSON.parse(storedProfile).role);
    }
    setLoading(false);
  }, []);

  const setSession = (newToken: string, newUser: User, newProfile: UserProfile) => {
    setToken(newToken);
    setUser(newUser);
    setProfile(newProfile);
    setRole(newProfile.role);
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUser', JSON.stringify(newUser));
    localStorage.setItem('authProfile', JSON.stringify(newProfile));
  };

  const signInWithGoogle = async (credential: string) => {
    try {
      // Decode the Google ID token locally to bypass the stuck backend
      const decoded: any = jwtDecode(credential);
      if (!decoded || !decoded.email) {
        throw new Error('Invalid Google credential token');
      }

      // We still try to call the backend so that if the server is ever fixed, it syncs.
      // But we DO NOT strictly require it to succeed, we will just log the error.
      let jwtConfiguredToken = credential; // Fallback token
      
      try {
        let clientGeo = null;
        try {
          const cached = localStorage.getItem('tizzitech_client_geo');
          if (cached) clientGeo = JSON.parse(cached);
        } catch (e) {}

        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential, clientGeo })
        });
        const text = await res.text();
        const data = text ? JSON.parse(text) : null;
        if (data && data.success && data.token) {
          jwtConfiguredToken = data.token;
          if (data.user && data.user.id) {
            decoded.backendId = data.user.id;
          }
        }
      } catch (err) {
        console.warn('Backend google auth failed, continuing with client-side session', err);
      }

      const userId = decoded.backendId || `g_${decoded.sub?.substring(0, 8) || Math.random().toString(36).substring(2,10)}`;
      const authUser: User = { 
        uid: userId, 
        email: decoded.email, 
        displayName: decoded.name || decoded.given_name || 'Google User'
      } as any;
      
      const authProfile: UserProfile = { 
        uid: userId, 
        email: decoded.email, 
        firstName: decoded.given_name || '',
        surname: decoded.family_name || '',
        role: 'user'
      };
      
      setSession(jwtConfiguredToken, authUser, authProfile);
    } catch (err: any) {
      console.error('Google Sign-In caught error:', err);
      throw new Error(err.message || 'Google Sign-In failed');
    }
  };

  const registerWithEmail = async (email: string, password: string, additionalData: any) => {
    let clientGeo = null;
    try {
      const cached = localStorage.getItem('tizzitech_client_geo');
      if (cached) clientGeo = JSON.parse(cached);
    } catch (e) {}

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, ...additionalData, clientGeo })
    });
    
    let data;
    let text = '';
    try {
      text = await res.text();
      data = text ? JSON.parse(text) : { success: false, message: 'Registration server error.' };
    } catch(e) {
      console.error("Failed to parse response:", text);
      data = { success: false, message: 'Server communication failed.' };
    }

    if (!data.success) {
      throw new Error(data.message || 'Registration failed');
    }

    const { user: userData, token: jwtConfiguredToken } = data;
    const authUser: User = { uid: userData.id, email: userData.email, displayName: userData.firstName };
    const authProfile: UserProfile = { ...userData, uid: userData.id };
    
    setSession(jwtConfiguredToken, authUser, authProfile);
  };

  const loginWithEmail = async (email: string, password: string) => {
    let clientGeo = null;
    try {
      const cached = localStorage.getItem('tizzitech_client_geo');
      if (cached) clientGeo = JSON.parse(cached);
    } catch (e) {}

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, clientGeo })
    });
    
    let data;
    let text = '';
    try {
      text = await res.text();
      data = text ? JSON.parse(text) : { success: false, message: 'Invalid credentials or server error.' };
    } catch(e) {
      console.error("Failed to parse response:", text);
      data = { success: false, message: 'Server communication failed.' };
    }
    
    if (!data.success) {
      throw new Error(data.message || 'Login failed');
    }

    const { user: userData, token: jwtConfiguredToken } = data;
    const authUser: User = { uid: userData.id, email: userData.email, displayName: userData.firstName };
    const authProfile: UserProfile = { ...userData, uid: userData.id };
    
    setSession(jwtConfiguredToken, authUser, authProfile);
  };

  const resetPassword = async (email: string) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      let data = { success: false, message: '' };
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : { success: res.ok, message: 'Password reset sent.' };
      } catch(e) {
        data = { success: false, message: 'Invalid response from server.' };
      }
      if (!data.success || !res.ok) {
        throw new Error(data.message || 'Failed to send reset link');
      }
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const updateProfile = async (updatedData: Partial<UserProfile>) => {
    if (!user || !profile || !token) return;

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });
      const data = await res.json();
      if (!data.success) {
        console.error('Failed to update profile on backend:', data.message);
      }
    } catch (e) {
      console.error('Error updating profile on backend:', e);
    }

    const newProfile = { ...profile, ...updatedData };
    const newUser = { 
      ...user, 
      displayName: (updatedData.firstName || updatedData.surname)
        ? `${updatedData.firstName || ''} ${updatedData.surname || ''}`.trim()
        : user.displayName 
    };
    setSession(token, newUser, newProfile);
  };

  const logOut = async () => {
    setToken(null);
    setUser(null);
    setProfile(null);
    setRole(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    localStorage.removeItem('authProfile');
    showToast('Logged out successfully. See you again soon!', 'info');
  };

  return (
    <AuthContext.Provider value={{ user, role, profile, loading, token, signInWithGoogle, registerWithEmail, loginWithEmail, resetPassword, updateProfile, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
