import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';
import { sessionEvents } from '../services/session-events';
jest.mock('../constants', () => ({ API_CONFIG: { baseUrl: 'http://api.example.test', timeout: 100 }, STORAGE_KEYS: { AUTH_TOKEN: 'access', REFRESH_TOKEN: 'refresh', USER_DATA: 'user' } }));
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn(), setItem: jest.fn(), multiRemove: jest.fn() } }));
jest.mock('axios', () => {
  const instance = { interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } }, request: jest.fn() };
  const isAxiosError = (error: unknown) => !!error && typeof error === 'object' && 'isAxiosError' in error;
  return { __esModule: true, default: { create: jest.fn(() => instance), post: jest.fn(), isAxiosError }, isAxiosError };
});
const onError = (api.interceptors.response.use as jest.Mock).mock.calls[0][1] as (error: unknown) => Promise<unknown>;
const expired = () => ({ isAxiosError: true, response: { status: 401 }, config: { url: '/vehicles', headers: {} } });
beforeEach(() => { jest.clearAllMocks(); jest.mocked(AsyncStorage.getItem).mockResolvedValue('saved-refresh'); jest.mocked(AsyncStorage.setItem).mockResolvedValue(); jest.mocked(AsyncStorage.multiRemove).mockResolvedValue(); (api.request as jest.Mock).mockResolvedValue({ data: 'retried' }); });
afterEach(() => jest.restoreAllMocks());
test('simultaneous expired requests share one refresh and replay with the new token', async () => {
  jest.mocked(axios.post).mockResolvedValue({ data: { data: { accessToken: 'new-token' } } });
  await Promise.all([onError(expired()), onError(expired())]);
  expect(axios.post).toHaveBeenCalledTimes(1); expect(api.request).toHaveBeenCalledTimes(2);
  expect(AsyncStorage.setItem).toHaveBeenCalledWith('access','new-token'); expect(AsyncStorage.multiRemove).not.toHaveBeenCalled();
});
test('rejected refresh ends the session and clears credentials', async () => {
  const emit = jest.spyOn(sessionEvents,'emit'); jest.mocked(axios.post).mockRejectedValue({ isAxiosError: true, response: { status: 401 } });
  await expect(onError(expired())).rejects.toMatchObject({ response: { status: 401 } });
  expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(['access','user','refresh']); expect(emit).toHaveBeenCalledWith({ type: 'expired' });
});
test('network failure while refreshing does not erase saved credentials', async () => {
  jest.mocked(axios.post).mockRejectedValue({ isAxiosError: true, message: 'Network unavailable' });
  await expect(onError(expired())).rejects.toMatchObject({ message: 'Network unavailable' });
  expect(AsyncStorage.multiRemove).not.toHaveBeenCalled();
});
test('invalid login credentials do not trigger refresh or clear another session', async () => {
  await expect(onError({ ...expired(), config: { url: '/auth/login', headers: {} } })).rejects.toMatchObject({ response: { status: 401 } });
  expect(axios.post).not.toHaveBeenCalled(); expect(AsyncStorage.multiRemove).not.toHaveBeenCalled();
});
