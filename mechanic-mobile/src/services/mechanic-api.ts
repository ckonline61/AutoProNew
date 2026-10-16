import AsyncStorage from '@react-native-async-storage/async-storage';
import { isAxiosError } from 'axios';
import api from '../config/api';
import { STORAGE_KEYS } from '../constants';

export interface MechanicUser { _id: string; name: string; role: string }
export interface Profile {
  _id: string; approvalStatus: string; isOnline: boolean; isAvailable: boolean;
  rating: number; totalJobs: number; totalEarnings: number; specializations: string[];
}
export interface Job {
  _id: string; status: string; bookingNumber?: string; requestNumber?: string;
  scheduledDate?: string; scheduledTime?: string; problemType?: string;
  address?: string; latitude?: number; longitude?: number; estimatedPrice: number;
  customerId?: { name?: string; phone?: string };
  vehicleId?: { brand?: string; model?: string; registrationNumber?: string };
  addressId?: { addressLine1?: string; city?: string; pincode?: string };
  serviceIds?: { _id: string; name: string }[];
}
export type JobKind = 'booking' | 'emergency';
export const nextStatus: Record<string, string> = {
  ACCEPTED: 'EN_ROUTE', EN_ROUTE: 'ARRIVED', ARRIVED: 'IN_PROGRESS', IN_PROGRESS: 'COMPLETED',
};
export const statusLabel: Record<string, string> = {
  EN_ROUTE: 'Start journey', ARRIVED: 'Mark arrived', IN_PROGRESS: 'Start work', COMPLETED: 'Complete job',
};
export const canShareLocation = (status: string) => ['EN_ROUTE', 'ARRIVED'].includes(status);
export function errorMessage(error: unknown): string {
  if (isAxiosError(error)) return error.response?.data?.message || 'Cannot reach the server. Check your connection and try again.';
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}
function mechanicUser(value: MechanicUser): MechanicUser {
  if (!value?._id || value.role !== 'MECHANIC') throw new Error('Please sign in with a mechanic account.');
  return value;
}
export async function login(email: string, password: string): Promise<MechanicUser> {
  const { data } = await api.post('/auth/login', { email: email.trim(), password });
  const user = mechanicUser(data?.data?.user);
  const tokens = data?.data?.tokens;
  if (!tokens?.accessToken || !tokens?.refreshToken || typeof tokens.accessToken !== 'string' || typeof tokens.refreshToken !== 'string') throw new Error('Invalid login response. Please try again.');
  await AsyncStorage.multiSet([
    [STORAGE_KEYS.AUTH_TOKEN, tokens.accessToken], [STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken],
    [STORAGE_KEYS.USER_DATA, JSON.stringify(user)],
  ]);
  return user;
}
export async function restoreSession(): Promise<MechanicUser | null> {
  if (!await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)) return null;
  const { data } = await api.get('/auth/me');
  return mechanicUser(data?.data);
}
export async function logout(): Promise<void> {
  try { await api.post('/auth/logout', { refreshToken: await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) }); }
  finally { await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS)); }
}
export async function register(name: string, email: string, phone: string, password: string): Promise<void> {
  await api.post('/auth/register', { name: name.trim(), email: email.trim(), phone: phone.trim(), password, role: 'MECHANIC' });
}
export async function loadWorkspace(): Promise<{ profile: Profile | null; jobs: Job[]; emergencies: Job[] }> {
  let profile: Profile;
  try { profile = (await api.get('/mechanics/profile')).data.data; }
  catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return { profile: null, jobs: [], emergencies: [] };
    throw error;
  }
  if (profile.approvalStatus !== 'APPROVED') return { profile, jobs: [], emergencies: [] };
  const [assigned, active, emergencies] = await Promise.all([
    api.get('/mechanics/jobs'), api.get('/mechanics/jobs/active'), api.get('/emergency/assigned'),
  ]);
  const jobs = new Map<string, Job>();
  for (const job of [...assigned.data.data, ...(active.data.data ? [active.data.data] : [])] as Job[]) jobs.set(job._id, job);
  return { profile, jobs: [...jobs.values()], emergencies: emergencies.data.data };
}
export async function updateJob(kind: JobKind, job: Job, action: string, notes: string): Promise<void> {
  const base = kind === 'booking' ? `/mechanics/jobs/${job._id}` : `/emergency/${job._id}`;
  if (action === 'accept' || action === 'reject') await api.post(`${base}/${action}`, { reason: notes || 'Declined by mechanic' });
  else await api.put(`${base}/status`, { status: action, notes });
}
