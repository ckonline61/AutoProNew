import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS } from '../constants';
import { sessionEvents } from '../services/session-events';
const api = axios.create({ baseURL: API_CONFIG.baseUrl, timeout: API_CONFIG.timeout, headers: { 'Content-Type': 'application/json', Accept: 'application/json' } });
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
let refreshPromise: Promise<string> | null = null;
async function refreshAccessToken(): Promise<string> {
  const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  if (!refreshToken) throw new Error('Your session has expired. Sign in again.');
  const response = await axios.post(`${API_CONFIG.baseUrl}/auth/refresh`, { refreshToken }, { timeout: API_CONFIG.timeout });
  const token = response.data?.data?.accessToken;
  if (typeof token !== 'string' || !token) throw new Error('Invalid refresh response. Sign in again.');
  await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  sessionEvents.emit({ type: 'refreshed', accessToken: token });
  return token;
}
api.interceptors.response.use(response => response, async (error: AxiosError) => {
  const config = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
  if (error.response?.status !== 401 || !config || /\/auth\/(login|register|refresh)(?:\?|$)/.test(config.url || '')) return Promise.reject(error);
  if (!config._retry) {
    config._retry = true;
    try {
      if (!refreshPromise) refreshPromise = refreshAccessToken().finally(() => { refreshPromise = null; });
      const token = await refreshPromise;
      config.headers.Authorization = `Bearer ${token}`;
      return api.request(config);
    } catch (refreshError) {
      // A network outage does not invalidate credentials; only rejected credentials end a session.
      if (axios.isAxiosError(refreshError) && refreshError.response?.status !== 401 && refreshError.response?.status !== 403) return Promise.reject(refreshError);
    }
  }
  await AsyncStorage.multiRemove([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.USER_DATA, STORAGE_KEYS.REFRESH_TOKEN]);
  sessionEvents.emit({ type: 'expired' });
  return Promise.reject(error);
});
export default api;
