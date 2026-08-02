import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import { signInWithGoogle, signOutFirebase } from '../lib/firebase';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  shopName: string;
  shopCode?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  registerShop: (details: { shopName: string; ownerName: string; email: string; pass: string }) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  logout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  // Verify session with server on initial mount
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await client.get('/auth/me');
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifySession();

    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener('quantix:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('quantix:unauthorized', handleUnauthorized);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const login = useCallback(async (email: string, pass: string): Promise<User> => {
    setLoading(true);
    try {
      const { data } = await client.post('/auth/login', { email, password: pass });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const registerShop = useCallback(
    async (details: { shopName: string; ownerName: string; email: string; pass: string }): Promise<User> => {
      setLoading(true);
      try {
        const { data } = await client.post('/auth/register-shop', details);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const loginWithGoogle = useCallback(async (): Promise<User> => {
    setLoading(true);
    try {
      let googleData;
      try {
        googleData = await signInWithGoogle();
      } catch (fErr: any) {
        if (fErr?.code === 'auth/popup-closed-by-user') {
          throw new Error('Google Sign-In popup was closed before completing.');
        } else if (fErr?.code === 'auth/cancelled-popup-request') {
          throw new Error('Sign-In request was cancelled.');
        }
        throw new Error(fErr?.message || 'Google authentication failed. Please try again or use email/password.');
      }

      const { data } = await client.post('/auth/google', {
        idToken: googleData.idToken,
        email: googleData.email,
        name: googleData.displayName,
        photoURL: googleData.photoURL,
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await client.post('/auth/logout');
    } catch {
      // Swallowed on purpose
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      signOutFirebase();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        registerShop,
        loginWithGoogle,
        logout,
        theme,
        toggleTheme,
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
