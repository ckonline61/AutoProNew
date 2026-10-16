import { Booking } from '../models/booking.model';
import { EmergencyRequest } from '../models/emergency-request.model';
import { Mechanic } from '../models/mechanic.model';
import { User } from '../models/user.model';
import { ForbiddenError } from '../errors/app-error';
import { objectIdSchema } from '../validators/common';
import { MechanicApprovalStatus, UserRole } from '../types';

export async function assertTrackingAccess(userId: string, kind: 'booking' | 'emergency', jobId: string, publish = false): Promise<void> {
  if (!objectIdSchema.safeParse(jobId).success) throw new ForbiddenError('Invalid job');
  const user = await User.findById(userId);
  if (!user?.isActive) throw new ForbiddenError('Account unavailable');
  const providerKey = kind === 'booking' ? 'mechanicId' : 'assignedProviderId';
  const filter: Record<string, unknown> = { _id: jobId, isActive: true };
  if (publish) {
    if (user.role !== UserRole.MECHANIC || !await Mechanic.exists({ userId, isApproved: true, approvalStatus: MechanicApprovalStatus.APPROVED })) throw new ForbiddenError('Approved mechanic required');
    filter[providerKey] = userId;
    filter.status = { $in: ['EN_ROUTE', 'ARRIVED'] };
  } else if (![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role)) {
    filter.$or = [{ customerId: userId }, { [providerKey]: userId }];
  }
  const job = kind === 'booking' ? await Booking.exists(filter) : await EmergencyRequest.exists(filter);
  if (!job) throw new ForbiddenError('Job unavailable or not assigned to you');
}
