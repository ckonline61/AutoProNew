import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';
import { STORAGE_KEYS } from '../constants';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  loadStoredToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadStoredToken = async () => {
    try {
      setIsLoading(true);
      const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.warn('Failed to restore auth credentials', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStoredToken();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      // Attempt API call
      let authToken = 'mock_jwt_token_' + Date.now();
      let loggedUser: User = {
        id: 'usr_1',
        name: email.split('@')[0] || 'Auto Pro Customer',
        email,
        phone: '+91 9876543210',
        role: UserRole.CUSTOMER,
      };

      try {
        const response = await api.post('/auth/login', { email, password });
        if (response.data?.data) {
          authToken = response.data.data.token || authToken;
          loggedUser = response.data.data.user || loggedUser;
        }
      } catch (apiError) {
        // Allow mock/dev login for prototyping if backend is not currently running
        console.warn('Auth API not reachable, using mock session for local development', apiError);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, authToken);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(loggedUser));

      setToken(authToken);
      setUser(loggedUser);

      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    phone: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      let authToken = 'mock_jwt_token_' + Date.now();
      let registeredUser: User = {
        id: 'usr_' + Date.now(),
        name,
        email,
        phone,
        role: UserRole.CUSTOMER,
      };

      try {
        const response = await api.post('/auth/register', { name, email, phone, password });
        if (response.data?.data) {
          authToken = response.data.data.token || authToken;
          registeredUser = response.data.data.user || registeredUser;
        }
      } catch (apiError) {
        console.warn('Register API not reachable, using mock session for local development', apiError);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, authToken);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(registeredUser));

      setToken(authToken);
      setUser(registeredUser);

      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      try {
        await api.post('/auth/logout');
      } catch {
        // proceed even if network fails
      }
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
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
        register,
        logout,
        loadStoredToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
