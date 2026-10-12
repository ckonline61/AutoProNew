export const APP_NAME = 'Auto Pro';
export const APP_VERSION = '0.1.0';

export const API_CONFIG = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:5000/api/v1',
  timeout: 30000,
};

export const COLORS = {
  primary: '#2563EB',
  secondary: '#F59E0B',
  emergency: '#EF4444',
  success: '#10B981',
  background: '#F8FAFC',
  cardBackground: '#FFFFFF',
  text: '#1E293B',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  white: '#FFFFFF',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'autopro_auth_token',
  USER_DATA: 'autopro_user_data',
};
