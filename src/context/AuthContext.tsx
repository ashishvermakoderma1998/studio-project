import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, authStorage } from '../api/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (emailOrCreds: string | { email: string; password: string }, password?: string) => Promise<{ user?: User; mfaRequired?: boolean; mfaChallengeToken?: string; message?: string; otpHint?: string }>;
  completeMfaLogin: (mfaChallengeToken: string, code: string) => Promise<User>;
  sendRegisterOtp: (payload: { name: string; email: string; phone?: string; password: string; city?: string }) => Promise<{ message: string; email: string; expiresInSeconds: number; otpHint?: string }>;
  verifyRegisterOtp: (payload: { email: string; otp: string }) => Promise<User>;
  resendRegisterOtp: (email: string) => Promise<{ message: string; otpHint?: string }>;
  register: (
    nameOrPayload: string | { name: string; email: string; phone?: string; password: string; city?: string },
    email?: string,
    phone?: string,
    password?: string,
    city?: string
  ) => Promise<{ user: User; verificationCodeHint?: string }>;
  loginWithDemoAdmin: () => Promise<any>;
  logout: () => Promise<void>;
  updateUser: (updated: User) => void;
  refreshUser: () => Promise<void>;
  setSession: (token: string, user: User) => void;
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
    if (res.mfaRequired && res.mfaChallengeToken) {
      return {
        mfaRequired: true,
        mfaChallengeToken: res.mfaChallengeToken
      };
    }

    if (res.token && res.user) {
      authStorage.setToken(res.token);
      setUser(res.user);
      return { user: res.user };
    }

    throw new Error('Login failed: invalid response from server');
  };

  const completeMfaLogin = async (mfaChallengeToken: string, code: string) => {
    const res = await api.loginMfaChallenge({ mfaChallengeToken, code });
    if (res.token && res.user) {
      authStorage.setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error('MFA verification failed');
  };

  const sendRegisterOtp = async (payload: { name: string; email: string; phone?: string; password: string; city?: string }) => {
    return await api.sendRegisterOtp(payload);
  };

  const verifyRegisterOtp = async (payload: { email: string; otp: string }) => {
    const res = await api.verifyRegisterOtp(payload);
    if (res.token && res.user) {
      authStorage.setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error('Verification failed');
  };

  const resendRegisterOtp = async (email: string) => {
    return await api.resendRegisterOtp(email);
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
    return { user: res.user, verificationCodeHint: res.verificationCodeHint };
  };

  const loginWithDemoAdmin = async () => {
    return login('ashishweddingfilm@gmail.com', 'Ashish@2026!');
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // ignore network errors on logout
    } finally {
      authStorage.clearToken();
      setUser(null);
    }
  };

  const setSession = (token: string, newUser: User) => {
    authStorage.setToken(token);
    setUser(newUser);
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
        completeMfaLogin,
        sendRegisterOtp,
        verifyRegisterOtp,
        resendRegisterOtp,
        register,
        loginWithDemoAdmin,
        logout,
        updateUser,
        refreshUser,
        setSession,
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
