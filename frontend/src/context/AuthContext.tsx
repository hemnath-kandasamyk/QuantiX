import React, { createContext, useContext, useState, useCallback } from 'react';

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
  registerShop: (details: {
    shopName: string;
    ownerName: string;
    email: string;
    pass: string;
  }) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  logout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const demoUser: User = {
  id: '1',
  name: 'Demo Admin',
  email: 'admin@quantix.com',
  role: 'admin',
  shopName: 'QuantiX Demo Store',
  shopCode: 'QTX001',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(demoUser);
  const [loading] = useState(false);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      return next;
    });
  }, []);

  const login = async (): Promise<User> => {
    setUser(demoUser);
    return demoUser;
  };

  const registerShop = async (): Promise<User> => {
    setUser(demoUser);
    return demoUser;
  };

  const loginWithGoogle = async (): Promise<User> => {
    setUser(demoUser);
    return demoUser;
  };

  const logout = () => {
    // Disabled during development
    console.log('Logout disabled in development mode.');
  };

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
