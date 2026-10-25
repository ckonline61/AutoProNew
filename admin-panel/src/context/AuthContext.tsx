import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

interface User { id: string; name: string; email: string; role: string; }
interface AuthCtx {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthCtx | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const u = localStorage.getItem('admin_user');
    return u ? JSON.parse(u) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('admin_token'));
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const data = res.data?.data;
      const u = data?.user;
      const role = (u?.role || '').toUpperCase();
      if (!u || (role !== 'ADMIN' && role !== 'SUPER_ADMIN')) {
        throw new Error('Access denied. Admin account required.');
      }
      const tk = data?.tokens?.accessToken;
      localStorage.setItem('admin_token', tk);
      localStorage.setItem('admin_user', JSON.stringify(u));
      setToken(tk);
      setUser(u);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setToken(null);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, token, login, logout, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
