import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isAxiosError } from 'axios';
import api from '../config/api';
import { STORAGE_KEYS } from '../constants';
import { User, UserRole } from '../types';
import { sessionEvents } from '../services/session-events';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRestoring: boolean;
  isPreview: boolean;
  enterPreview: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  googleLogin: (idToken: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  loadStoredToken: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
function customerUser(value: User & { _id?: string }): User {
  if (!value || value.role !== UserRole.CUSTOMER) throw new Error('Please sign in with a customer account.');
  return { ...value, id: value.id || value._id || '' };
}
function errorMessage(error: unknown): string {
  if (isAxiosError(error)) return error.response?.data?.message || 'Cannot reach the server. Check your Wi-Fi and API address, or use Preview App.';
  return error instanceof Error ? error.message : 'Unable to sign in. Please try again.';
}
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);
  const [isPreview, setIsPreview] = useState(false);
  const clearSession = async () => {
    await AsyncStorage.multiRemove([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.USER_DATA, STORAGE_KEYS.REFRESH_TOKEN]);
    setToken(null);
    setUser(null);
    setIsPreview(false);
  };
  const loadStoredToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (storedToken) {
        const response = await api.get('/auth/me');
        setUser(customerUser(response.data?.data));
        setToken(await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || storedToken);
      }
    } catch {
      await clearSession();
    } finally {
      setIsRestoring(false);
    }
  };
  useEffect(() => { void loadStoredToken(); }, []);
  useEffect(() => sessionEvents.subscribe(event => {
    if (event.type === 'refreshed') setToken(event.accessToken);
    else { setToken(null); setUser(null); setIsPreview(false); }
  }), []);
  const enterPreview = () => {
    if (!__DEV__) return;
    setIsPreview(true);
    setToken(null);
    setUser({ id: 'preview-customer', name: 'Preview Customer', email: 'preview@example.test', phone: '', role: UserRole.CUSTOMER });
  };
  const signIn = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const data = response.data?.data;
    const verifiedUser = customerUser(data?.user);
    if (typeof data?.tokens?.accessToken !== 'string' || typeof data?.tokens?.refreshToken !== 'string') {
      throw new Error('The server returned an invalid login response.');
    }
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.AUTH_TOKEN, data.tokens.accessToken],
      [STORAGE_KEYS.REFRESH_TOKEN, data.tokens.refreshToken],
      [STORAGE_KEYS.USER_DATA, JSON.stringify(verifiedUser)],
    ]);
    setUser(verifiedUser);
    setToken(data.tokens.accessToken);
    setIsPreview(false);
  };
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try { await signIn(email, password); return { success: true }; }
    catch (error) { return { success: false, message: errorMessage(error) }; }
    finally { setIsLoading(false); }
  };
  const googleLogin = async (idToken: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/google', { idToken });
      const data = response.data?.data;
      // Google users might not have a standard customer role enforced on first login
      const userData = data?.user;
      if (!userData) throw new Error('Invalid response from server.');
      const verifiedUser: User = { ...userData, id: userData.id || userData._id || '' };
      if (typeof data?.tokens?.accessToken !== 'string' || typeof data?.tokens?.refreshToken !== 'string') {
        throw new Error('The server returned an invalid login response.');
      }
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.AUTH_TOKEN, data.tokens.accessToken],
        [STORAGE_KEYS.REFRESH_TOKEN, data.tokens.refreshToken],
        [STORAGE_KEYS.USER_DATA, JSON.stringify(verifiedUser)],
      ]);
      setUser(verifiedUser);
      setToken(data.tokens.accessToken);
      setIsPreview(false);
      return { success: true };
    } catch (error) { return { success: false, message: errorMessage(error) }; }
    finally { setIsLoading(false); }
  };
  const register = async (name: string, email: string, phone: string, password: string) => {
    setIsLoading(true);
    try {
      await api.post('/auth/register', { name, email, phone, password });
      await signIn(email, password);
      return { success: true };
    } catch (error) { return { success: false, message: errorMessage(error) }; }
    finally { setIsLoading(false); }
  };
  const logout = async () => {
    try {
      if (token && !isPreview) await api.post('/auth/logout', { refreshToken: await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) });
    } catch { /* Local logout must work offline. */ }
    finally { await clearSession(); }
  };
  return <AuthContext.Provider value={{ user, token, isAuthenticated: !!user && (!!token || isPreview), isLoading, isRestoring, isPreview, enterPreview, login, googleLogin, register, logout, loadStoredToken }}>{children}</AuthContext.Provider>;
};
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
