import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, authStorage } from '../api/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (emailOrCreds: string | { email: string; password: string }, password?: string) => Promise<User>;
  register: (
    nameOrPayload: string | { name: string; email: string; phone?: string; password: string; city?: string },
    email?: string,
    phone?: string,
    password?: string,
    city?: string
  ) => Promise<User>;
  loginWithDemoAdmin: () => Promise<User>;
  loginWithDemoUser: () => Promise<User>;
  logout: () => void;
  updateUser: (updated: User) => void;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const token = authStorage.getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api.getMe();
      setUser(res.user);
    } catch (err) {
      console.warn('Session expired or invalid:', err);
      authStorage.clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (
    emailOrCreds: string | { email: string; password: string },
    password?: string
  ) => {
    let payload: { email: string; password: string };
    if (typeof emailOrCreds === 'string') {
      payload = { email: emailOrCreds, password: password || '' };
    } else {
      payload = emailOrCreds;
    }

    const res = await api.login(payload);
    authStorage.setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const register = async (
    nameOrPayload: string | { name: string; email: string; phone?: string; password: string; city?: string },
    email?: string,
    phone?: string,
    password?: string,
    city?: string
  ) => {
    let payload: { name: string; email: string; phone?: string; password: string; city?: string };
    if (typeof nameOrPayload === 'string') {
      payload = {
        name: nameOrPayload,
        email: email || '',
        phone: phone || '',
        password: password || '',
        city: city || 'Jhumri Telaiya, Jharkhand'
      };
    } else {
      payload = nameOrPayload;
    }

    const res = await api.register(payload);
    authStorage.setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const loginWithDemoAdmin = async () => {
    return login('ashishweddingfilm@gmail.com', 'Ashish@2026!');
  };

  const loginWithDemoUser = async () => {
    return login('rohan.client@gmail.com', 'User@1234');
  };

  const logout = () => {
    authStorage.clearToken();
    setUser(null);
  };

  const updateUser = (updated: User) => {
    setUser(updated);
  };

  const isAdmin = user?.role === 'admin' || user?.email?.toLowerCase() === 'ashishweddingfilm@gmail.com';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginWithDemoAdmin,
        loginWithDemoUser,
        logout,
        updateUser,
        refreshUser,
        isAdmin,
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
