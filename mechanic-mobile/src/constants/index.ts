import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const APP_NAME = 'Auto Pro';
export const APP_VERSION = '0.1.0';

function apiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) return process.env.EXPO_PUBLIC_API_BASE_URL;
  if (!__DEV__) throw new Error('Set EXPO_PUBLIC_API_BASE_URL before building a production app.');
  const host = Constants.expoConfig?.hostUri?.split(':')[0] || (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');
  return `http://${host}:5000/api/v1`;
}

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'autopro_mechanic_token',
  REFRESH_TOKEN: 'autopro_mechanic_refresh',
  USER_DATA: 'autopro_mechanic_user',
};

export const API_CONFIG = {
  baseUrl: apiBaseUrl(),
  timeout: 30000,
};

export const COLORS = {
  primary: '#1A73E8',
  secondary: '#FF6B00',
  background: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#6C757D',
  border: '#E0E0E0',
  error: '#DC3545',
  success: '#28A745',
  warning: '#FFC107',
};
