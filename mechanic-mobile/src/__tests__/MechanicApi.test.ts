import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';
import { canShareLocation, loadWorkspace, login, logout, register, restoreSession, updateJob } from '../services/mechanic-api';
jest.mock('../constants', () => ({ STORAGE_KEYS: { AUTH_TOKEN: 'token', REFRESH_TOKEN: 'refresh', USER_DATA: 'user' } }));
jest.mock('../config/api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn(), put: jest.fn() } }));
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn(), multiSet: jest.fn(), multiRemove: jest.fn() } }));
beforeEach(() => { jest.resetAllMocks(); });
const user = { _id: 'mechanic1', name: 'Mechanic', role: 'MECHANIC' };
const response = { data: { data: { user, tokens: { accessToken: 'access', refreshToken: 'refresh' } } } };
test('login persists only verified mechanic credentials', async () => {
  jest.mocked(api.post).mockResolvedValueOnce(response);
  expect(await login(' mechanic@test.test ', 'password')).toEqual(user);
  expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'mechanic@test.test', password: 'password' });
  expect(AsyncStorage.multiSet).toHaveBeenCalledWith([['token', 'access'], ['refresh', 'refresh'], ['user', JSON.stringify(user)]]);
});
test('customer login and malformed tokens cannot create a mechanic session', async () => {
  jest.mocked(api.post).mockResolvedValueOnce({ data: { data: { ...response.data.data, user: { ...user, role: 'CUSTOMER' } } } });
  await expect(login('customer@test.test', 'password')).rejects.toThrow(/mechanic account/);
  jest.mocked(api.post).mockResolvedValueOnce({ data: { data: { user, tokens: {} } } });
  await expect(login('mechanic@test.test', 'password')).rejects.toThrow(/Invalid login/);
  expect(AsyncStorage.multiSet).not.toHaveBeenCalled();
});
test('registration explicitly requests the mechanic role', async () => {
  await register('Mechanic', 'm@test.test', '9876543210', 'password');
  expect(api.post).toHaveBeenCalledWith('/auth/register', expect.objectContaining({ role: 'MECHANIC' }));
});
test('restoration verifies server identity and preserves credentials during network failure', async () => {
  jest.mocked(AsyncStorage.getItem).mockResolvedValue('saved');
  jest.mocked(api.get).mockRejectedValueOnce(new Error('offline'));
  await expect(restoreSession()).rejects.toThrow('offline');
  expect(AsyncStorage.multiRemove).not.toHaveBeenCalled();
});
test('offline logout clears local credentials', async () => {
  jest.mocked(api.post).mockRejectedValueOnce(new Error('offline'));
  await expect(logout()).rejects.toThrow('offline');
  expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(['token', 'refresh', 'user']);
});
test('missing profile starts onboarding but network failures are not treated as missing profiles', async () => {
  jest.mocked(api.get).mockRejectedValueOnce({ isAxiosError: true, response: { status: 404 } });
  expect((await loadWorkspace()).profile).toBeNull();
  jest.mocked(api.get).mockRejectedValueOnce(new Error('offline'));
  await expect(loadWorkspace()).rejects.toThrow('offline');
});
test('pending approval does not request protected jobs', async () => {
  jest.mocked(api.get).mockResolvedValueOnce({ data: { data: { approvalStatus: 'PENDING' } } });
  expect((await loadWorkspace()).jobs).toEqual([]);
  expect(api.get).toHaveBeenCalledTimes(1);
});
test('active jobs merge with assignments without duplicates', async () => {
  const job = { _id: 'job1', status: 'ACCEPTED', estimatedPrice: 500 };
  jest.mocked(api.get).mockImplementation(async path => ({ data: { data: path === '/mechanics/profile' ? { approvalStatus: 'APPROVED' } : path === '/mechanics/jobs/active' ? { ...job, status: 'EN_ROUTE' } : path === '/mechanics/jobs' ? [job] : [] } }));
  expect((await loadWorkspace()).jobs).toEqual([{ ...job, status: 'EN_ROUTE' }]);
});
test('failed job mutation rejects and never invents successful state', async () => {
  jest.mocked(api.put).mockRejectedValueOnce(new Error('conflict'));
  await expect(updateJob('booking', { _id: 'job1', status: 'IN_PROGRESS', estimatedPrice: 500 }, 'COMPLETED', 'Done')).rejects.toThrow('conflict');
  expect(api.put).toHaveBeenCalledWith('/mechanics/jobs/job1/status', { status: 'COMPLETED', notes: 'Done' });
});
test('location is offered only while travelling or arrived', () => {
  expect(canShareLocation('EN_ROUTE')).toBe(true);
  expect(canShareLocation('ARRIVED')).toBe(true);
  for (const status of ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']) expect(canShareLocation(status)).toBe(false);
});
