import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

jest.mock('../constants', () => ({ STORAGE_KEYS: { AUTH_TOKEN: 'token', REFRESH_TOKEN: 'refresh', USER_DATA: 'user' } }));
jest.mock('../config/api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn() } }));
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: {
  getItem: jest.fn(), multiSet: jest.fn(), multiRemove: jest.fn(),
} }));
let auth: ReturnType<typeof useAuth>;
let tree: ReactTestRenderer;
function Consumer() { auth = useAuth(); return null; }
const customer = { _id: 'customer-id', name: 'Customer', email: 'customer@example.test', phone: '9876543210', role: 'CUSTOMER' };
const loginResponse = { data: { data: { user: customer, tokens: { accessToken: 'access', refreshToken: 'refresh-value' } } } };

beforeEach(async () => {
  jest.clearAllMocks();
  jest.mocked(AsyncStorage.getItem).mockResolvedValue(null);
  jest.mocked(AsyncStorage.multiSet).mockResolvedValue();
  jest.mocked(AsyncStorage.multiRemove).mockResolvedValue();
  await act(async () => { tree = create(<AuthProvider><Consumer /></AuthProvider>); });
});
afterEach(async () => { await act(async () => tree.unmount()); });

test('failed login never creates or stores a fake customer session', async () => {
  jest.mocked(api.post).mockRejectedValueOnce(new Error('Invalid credentials'));
  let result;
  await act(async () => { result = await auth.login('customer@example.test', 'wrong'); });
  expect(result).toEqual({ success: false, message: 'Invalid credentials' });
  expect(auth.isAuthenticated).toBe(false);
  expect(AsyncStorage.multiSet).not.toHaveBeenCalled();
});
test('explicit preview opens locally without a token or network request', async () => {
  await act(async () => auth.enterPreview());
  expect(auth.isPreview).toBe(true);
  expect(auth.isAuthenticated).toBe(true);
  expect(auth.token).toBeNull();
  expect(api.post).not.toHaveBeenCalled();
  expect(AsyncStorage.multiSet).not.toHaveBeenCalled();
});
test('real login uses nested tokens and normalizes MongoDB user id', async () => {
  jest.mocked(api.post).mockResolvedValueOnce(loginResponse);
  await act(async () => { await auth.login('customer@example.test', 'password'); });
  expect(auth.token).toBe('access');
  expect(auth.user?.id).toBe('customer-id');
  expect(auth.isPreview).toBe(false);
  expect(AsyncStorage.multiSet).toHaveBeenCalledWith(expect.arrayContaining([['refresh', 'refresh-value']]));
});
test('registration signs in after the backend creates the account', async () => {
  jest.mocked(api.post).mockResolvedValueOnce({ data: { data: customer } }).mockResolvedValueOnce(loginResponse);
  await act(async () => { await auth.register('Customer', 'customer@example.test', '9876543210', 'password'); });
  expect(api.post).toHaveBeenNthCalledWith(1, '/auth/register', expect.objectContaining({ name: 'Customer' }));
  expect(api.post).toHaveBeenNthCalledWith(2, '/auth/login', expect.objectContaining({ email: 'customer@example.test' }));
  expect(auth.isAuthenticated).toBe(true);
});
test('mechanic account cannot become a customer session', async () => {
  jest.mocked(api.post).mockResolvedValueOnce({ data: { data: { ...loginResponse.data.data, user: { ...customer, role: 'MECHANIC' } } } });
  await act(async () => { await auth.login('mechanic@example.test', 'password'); });
  expect(auth.isAuthenticated).toBe(false);
  expect(AsyncStorage.multiSet).not.toHaveBeenCalled();
});
