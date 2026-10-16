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

export const API_CONFIG = {
  baseUrl: apiBaseUrl(),
  timeout: 30000,
};

export const COLORS = {
  primary: '#DC2626',
  primaryDark: '#B91C1C',
  primaryLight: '#FEE2E2',
  secondary: '#F59E0B',
  emergency: '#DC2626',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  white: '#FFFFFF',
  black: '#1A1A1A',
  starGold: '#FBBF24',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'autopro_auth_token',
  REFRESH_TOKEN: 'autopro_refresh_token',
  USER_DATA: 'autopro_user_data',
};
