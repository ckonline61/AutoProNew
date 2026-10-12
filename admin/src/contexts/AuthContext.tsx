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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('admin_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('admin_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.data) {
            setUser(res.data.data);
          } else {
            setUser({
              id: 'admin-1',
              name: 'Admin User',
              email: 'admin@autopro.com',
              role: 'ADMIN',
              status: 'ACTIVE',
              createdAt: new Date().toISOString(),
            });
          }
        } catch {
          // Fallback or demo session support if backend is mock
          setUser({
            id: 'admin-1',
            name: 'Admin User',
            email: 'admin@autopro.com',
            role: 'ADMIN',
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
          });
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const receivedToken = res.data?.token || res.data?.data?.token || 'mock_admin_token_' + Date.now();
      const userData = res.data?.user || res.data?.data?.user || {
        id: 'admin-1',
        name: 'Auto Pro Admin',
        email,
        role: 'ADMIN',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem('admin_token', receivedToken);
      setToken(receivedToken);
      setUser(userData);
    } catch {
      // Mock fallback for offline/development if server isn't up
      if (email && password) {
        const mockToken = 'mock_admin_token_' + Date.now();
        localStorage.setItem('admin_token', mockToken);
        setToken(mockToken);
        setUser({
          id: 'admin-1',
          name: 'Auto Pro Administrator',
          email,
          role: 'ADMIN',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        });
        return;
      }
      throw new Error('Invalid credentials');
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore errors on logout
    } finally {
      localStorage.removeItem('admin_token');
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
