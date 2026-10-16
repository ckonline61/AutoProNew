import { MechanicService } from '../src/services/mechanic.service';
import { Mechanic } from '../src/models/mechanic.model';
import { Booking } from '../src/models/booking.model';
import { EmergencyRequest } from '../src/models/emergency-request.model';
import { User } from '../src/models/user.model';
import { BookingStatus, UserRole } from '../src/types';
import { assertTrackingAccess } from '../src/services/tracking-access';
jest.mock('../src/models/mechanic.model');
jest.mock('../src/models/booking.model');
jest.mock('../src/models/emergency-request.model');
jest.mock('../src/models/user.model');
const service = new MechanicService();
const userId = '507f1f77bcf86cd799439011';
const jobId = '507f1f77bcf86cd799439022';
beforeEach(() => jest.resetAllMocks());
test('onboarding cannot change a customers or administrators role', async () => {
  (Mechanic.findOne as jest.Mock).mockResolvedValue(null);
  (User.findById as jest.Mock).mockResolvedValue({ role: UserRole.ADMIN });
  await expect(service.onboard(userId, { specializations: ['Engine'], experience: 2, documents: {}, serviceAreaIds: [] })).rejects.toThrow(/mechanic account/);
  expect(Mechanic.create).not.toHaveBeenCalled();
});
test('GPS cannot be stored without an owned travelling job', async () => {
  const save = jest.fn();
  (Mechanic.findOne as jest.Mock).mockResolvedValue({ isApproved: true, approvalStatus: 'APPROVED', save });
  (Booking.exists as jest.Mock).mockResolvedValue(null);
  await expect(service.updateLocation(userId, { latitude: 10, longitude: 20, jobId, jobType: 'booking' })).rejects.toThrow(/active journey/);
  expect(Booking.exists).toHaveBeenCalledWith({ _id: jobId, mechanicId: userId, isActive: true, status: { $in: ['EN_ROUTE', 'ARRIVED'] } });
  expect(save).not.toHaveBeenCalled();
});
test('a lost completion race does not increment earnings', async () => {
  (Booking.findOne as jest.Mock).mockResolvedValue({ status: BookingStatus.IN_PROGRESS, estimatedPrice: 500 });
  (Booking.findOneAndUpdate as jest.Mock).mockResolvedValue(null);
  await expect(service.updateJobExecutionStatus(userId, jobId, BookingStatus.COMPLETED)).rejects.toThrow(/changed/);
  expect(Mechanic.findOneAndUpdate).not.toHaveBeenCalled();
});
test('completion clears location and counts only the successful transition', async () => {
  (Booking.findOne as jest.Mock).mockResolvedValue({ status: BookingStatus.IN_PROGRESS, estimatedPrice: 500 });
  (Booking.findOneAndUpdate as jest.Mock).mockResolvedValue({ status: BookingStatus.COMPLETED, finalPrice: 500 });
  await service.updateJobExecutionStatus(userId, jobId, BookingStatus.COMPLETED);
  expect(Mechanic.updateOne).toHaveBeenCalledWith({ userId }, { $unset: { currentLocation: 1 } });
  expect(Mechanic.findOneAndUpdate).toHaveBeenCalledWith({ userId }, { $inc: { totalJobs: 1, totalEarnings: 500 } });
});
test('offline availability cannot remain available', async () => {
  const profile = { approvalStatus: 'APPROVED', isOnline: true, isAvailable: true, currentLocation: { latitude: 10 }, save: jest.fn() };
  (Mechanic.findOne as jest.Mock).mockResolvedValue(profile);
  await service.updateAvailability(userId, { isOnline: false, isAvailable: true });
  expect(profile.isAvailable).toBe(false);
  expect(profile.currentLocation).toBeUndefined();
});
test('websocket rooms require an active account and job ownership', async () => {
  (User.findById as jest.Mock).mockResolvedValue({ role: UserRole.CUSTOMER, isActive: true });
  (Booking.exists as jest.Mock).mockResolvedValue(null);
  await expect(assertTrackingAccess(userId, 'booking', jobId)).rejects.toThrow();
  expect(Booking.exists).toHaveBeenCalledWith({ _id: jobId, isActive: true, $or: [{ customerId: userId }, { mechanicId: userId }] });
});
test('customers cannot publish GPS and providers require an active owned journey', async () => {
  (User.findById as jest.Mock).mockResolvedValueOnce({ role: UserRole.CUSTOMER, isActive: true }).mockResolvedValue({ role: UserRole.MECHANIC, isActive: true });
  await expect(assertTrackingAccess(userId, 'emergency', jobId, true)).rejects.toThrow();
  (Mechanic.exists as jest.Mock).mockResolvedValue({ _id: userId });
  (EmergencyRequest.exists as jest.Mock).mockResolvedValue({ _id: jobId });
  await expect(assertTrackingAccess(userId, 'emergency', jobId, true)).resolves.toBeUndefined();
  expect(EmergencyRequest.exists).toHaveBeenCalledWith({ _id: jobId, isActive: true, assignedProviderId: userId, status: { $in: ['EN_ROUTE', 'ARRIVED'] } });
});
