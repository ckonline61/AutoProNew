export const APP_NAME = 'Auto Pro Admin';
export const APP_VERSION = '0.1.0';

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  timeout: 30000,
};

export const COLORS = {
  primary: '#1A73E8',
  secondary: '#FF6B00',
  dark: '#1A1A2E',
  background: '#F8F9FA',
  text: '#212529',
  textSecondary: '#6C757D',
  border: '#E0E0E0',
  error: '#DC3545',
  success: '#28A745',
  warning: '#FFC107',
};
