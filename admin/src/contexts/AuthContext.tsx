import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
function requireAdmin(user: User | undefined): User {
  if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) throw new Error('An administrator account is required.');
  return user;
}
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('admin_token'));
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    let active = true;
    const initAuth = async () => {
      setIsLoading(true);
      if (token) {
        try {
          const res = await api.get('/auth/me');
          const verifiedUser = requireAdmin(res.data?.data);
          if (active) setUser(verifiedUser);
        } catch {
          if (active) {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_refresh_token');
            setToken(null);
            setUser(null);
          }
        }
      }
      if (active) setIsLoading(false);
    };
    void initAuth();
    return () => { active = false; };
  }, [token]);
  const login = async (email: string, password: string): Promise<void> => {
    const res = await api.post('/auth/login', { email, password });
    const receivedToken = res.data?.data?.tokens?.accessToken;
    const refreshToken = res.data?.data?.tokens?.refreshToken;
    const verifiedUser = requireAdmin(res.data?.data?.user);
    if (typeof receivedToken !== 'string' || !receivedToken) throw new Error('The server returned an invalid login response.');
    localStorage.setItem('admin_token', receivedToken);
    if (typeof refreshToken === 'string') localStorage.setItem('admin_refresh_token', refreshToken);
    setUser(verifiedUser);
    setToken(receivedToken);
  };
  const logout = async (): Promise<void> => {
    try {
      await api.post('/auth/logout', { refreshToken: localStorage.getItem('admin_refresh_token') });
    } catch {
      // Clear this browser session even when the server is unavailable.
    } finally {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_refresh_token');
      setToken(null);
      setUser(null);
    }
  };
  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token && !!user && ['ADMIN', 'SUPER_ADMIN'].includes(user.role), isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
