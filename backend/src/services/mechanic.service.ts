import { Mechanic, IMechanic } from '../models/mechanic.model';
import { Booking, IBooking } from '../models/booking.model';
import { User } from '../models/user.model';
import { EmergencyRequest } from '../models/emergency-request.model';
import { BookingFsm } from './booking-fsm';
import { BookingStatus, EmergencyStatus, MechanicApprovalStatus, UserRole } from '../types';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../errors/app-error';
import {
  OnboardMechanicInput,
  UpdateAvailabilityInput,
  UpdateLocationInput,
} from '../validators/mechanic.validator';

export class MechanicService {
  /**
   * Onboard a user as a mechanic.
   */
  public async onboard(userId: string, data: OnboardMechanicInput): Promise<IMechanic> {
    const existing = await Mechanic.findOne({ userId });
    if (existing) {
      throw new ConflictError('Mechanic profile already exists for this user');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.role !== UserRole.MECHANIC) {
      throw new ForbiddenError('A mechanic account is required for onboarding');
    }

    const mechanic = await Mechanic.create({
      userId,
      specializations: data.specializations,
      experience: data.experience || 0,
      documents: data.documents || {},
      serviceAreaIds: data.serviceAreaIds || [],
      isAvailable: false,
      isOnline: false,
      isApproved: false,
      approvalStatus: MechanicApprovalStatus.PENDING,
      rating: 0,
      totalJobs: 0,
      totalEarnings: 0,
    });

    return mechanic;
  }

  /**
   * Get mechanic profile by userId.
   */
  public async getProfile(userId: string): Promise<IMechanic> {
    const mechanic = await Mechanic.findOne({ userId }).populate(
      'userId',
      'name email phone avatar'
    );
    if (!mechanic) {
      throw new NotFoundError('Mechanic profile not found');
    }
    return mechanic;
  }

  /**
   * Update online/availability toggle. Only allowed if approved.
   */
  public async updateAvailability(
    userId: string,
    data: UpdateAvailabilityInput
  ): Promise<IMechanic> {
    const mechanic = await Mechanic.findOne({ userId });
    if (!mechanic) {
      throw new NotFoundError('Mechanic profile not found');
    }

    if (mechanic.approvalStatus !== MechanicApprovalStatus.APPROVED) {
      throw new ForbiddenError(
        'Cannot change availability. Mechanic verification status is not APPROVED'
      );
    }

    mechanic.isOnline = data.isOnline;
    mechanic.isAvailable = data.isOnline && (data.isAvailable ?? true);
    if (!data.isOnline) mechanic.currentLocation = undefined;
    await mechanic.save();

    return mechanic;
  }

  /**
   * Update mechanic real-time GPS location.
   */
  public async updateLocation(
    userId: string,
    data: UpdateLocationInput
  ): Promise<IMechanic> {
    const mechanic = await Mechanic.findOne({ userId });
    if (!mechanic) {
      throw new NotFoundError('Mechanic profile not found');
    }

    if (!mechanic.isApproved || mechanic.approvalStatus !== MechanicApprovalStatus.APPROVED) {
      throw new ForbiddenError('Mechanic must be approved to share location');
    }
    const activeFilter = { _id: data.jobId, isActive: true, status: { $in: [BookingStatus.EN_ROUTE, BookingStatus.ARRIVED] } };
    const job = data.jobType === 'booking'
      ? await Booking.exists({ ...activeFilter, mechanicId: userId })
      : await EmergencyRequest.exists({ ...activeFilter, assignedProviderId: userId, status: { $in: [EmergencyStatus.EN_ROUTE, EmergencyStatus.ARRIVED] } });
    if (!job) throw new ForbiddenError('Location sharing requires your assigned active journey');
    mechanic.currentLocation = {
      latitude: data.latitude,
      longitude: data.longitude,
      updatedAt: new Date(),
    };
    await mechanic.save();

    return mechanic;
  }

  /**
   * Admin verification action for mechanic.
   */
  public async verifyMechanic(
    mechanicId: string,
    status: MechanicApprovalStatus
  ): Promise<IMechanic> {
    const mechanic = await Mechanic.findById(mechanicId);
    if (!mechanic) {
      throw new NotFoundError('Mechanic not found');
    }

    mechanic.approvalStatus = status;
    mechanic.isApproved = status === MechanicApprovalStatus.APPROVED;
    if (!mechanic.isApproved) {
      mechanic.isOnline = false;
      mechanic.isAvailable = false;
      mechanic.currentLocation = undefined;
    }
    await mechanic.save();

    return mechanic;
  }

  /**
   * Get jobs dispatched/assigned to this mechanic.
   */
  public async getAssignedJobs(userId: string): Promise<IBooking[]> {
    const mechanic = await this.getProfile(userId);
    if (!mechanic.isApproved) {
      throw new ForbiddenError('Mechanic is not approved');
    }

    return Booking.find({
      mechanicId: userId,
      status: { $in: [BookingStatus.ASSIGNED, BookingStatus.ACCEPTED, BookingStatus.EN_ROUTE, BookingStatus.ARRIVED, BookingStatus.IN_PROGRESS] },
      isActive: true,
    })
      .populate('vehicleId', 'brand model registrationNumber year')
      .populate('addressId', 'label addressLine1 city pincode')
      .populate('serviceIds', 'name price duration')
      .populate('customerId', 'name phone')
      .sort({ scheduledDate: 1 });
  }

  /**
   * Mechanic accepts an assigned job.
   */
  public async acceptJob(userId: string, bookingId: string): Promise<IBooking> {
    const mechanic = await this.getProfile(userId);
    if (!mechanic.isApproved || !mechanic.isOnline) {
      throw new ForbiddenError('Mechanic must be approved and online to accept jobs');
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      mechanicId: userId,
      isActive: true,
    });

    if (!booking) {
      throw new NotFoundError('Booking not found or not assigned to you');
    }

    BookingFsm.assertTransition(booking.status, BookingStatus.ACCEPTED);

    return this.transitionJob(userId, bookingId, booking.status, BookingStatus.ACCEPTED, 'Job accepted by mechanic');
  }

  /**
   * Mechanic rejects an assigned job.
   */
  public async rejectJob(
    userId: string,
    bookingId: string,
    reason?: string
  ): Promise<IBooking> {
    const booking = await Booking.findOne({
      _id: bookingId,
      mechanicId: userId,
      isActive: true,
    });

    if (!booking) {
      throw new NotFoundError('Booking not found or not assigned to you');
    }

    if (booking.status !== BookingStatus.ASSIGNED) {
      throw new BadRequestError('Only assigned jobs can be rejected');
    }

    return this.transitionJob(userId, bookingId, booking.status, BookingStatus.REJECTED, reason || 'Job rejected by mechanic');
  }

  /**
   * Get current active in-progress job for mechanic.
   */
  public async getActiveJob(userId: string): Promise<IBooking | null> {
    return Booking.findOne({
      mechanicId: userId,
      status: {
        $in: [
          BookingStatus.ACCEPTED,
          BookingStatus.EN_ROUTE,
          BookingStatus.ARRIVED,
          BookingStatus.IN_PROGRESS,
        ],
      },
      isActive: true,
    })
      .populate('vehicleId')
      .populate('addressId')
      .populate('serviceIds')
      .populate('customerId', 'name phone');
  }

  /**
   * Mechanic execution step (EN_ROUTE, ARRIVED, IN_PROGRESS, COMPLETED).
   */
  public async updateJobExecutionStatus(
    userId: string,
    bookingId: string,
    nextStatus: BookingStatus,
    notes?: string
  ): Promise<IBooking> {
    const booking = await Booking.findOne({
      _id: bookingId,
      mechanicId: userId,
      isActive: true,
    });

    if (!booking) {
      throw new NotFoundError('Booking not found or not assigned to you');
    }

    BookingFsm.assertTransition(booking.status, nextStatus);

    const updated = await this.transitionJob(userId, bookingId, booking.status, nextStatus,
      notes || `Status updated to ${nextStatus} by mechanic`,
      nextStatus === BookingStatus.COMPLETED ? booking.estimatedPrice : undefined);
    if (![BookingStatus.EN_ROUTE, BookingStatus.ARRIVED].includes(nextStatus)) {
      await Mechanic.updateOne({ userId }, { $unset: { currentLocation: 1 } });
    }

    // If completed, update mechanic metrics
    if (nextStatus === BookingStatus.COMPLETED) {
      await Mechanic.findOneAndUpdate(
        { userId },
        {
          $inc: {
            totalJobs: 1,
            totalEarnings: updated.finalPrice ?? updated.estimatedPrice,
          },
        }
      );
    }

    return updated;
  }

  private async transitionJob(userId: string, bookingId: string, current: BookingStatus, next: BookingStatus, reason: string, finalPrice?: number): Promise<IBooking> {
    const updated = await Booking.findOneAndUpdate(
      { _id: bookingId, mechanicId: userId, status: current, isActive: true },
      { $set: { status: next, ...(finalPrice !== undefined ? { finalPrice } : {}) }, $push: { statusHistory: { status: next, timestamp: new Date(), reason } } },
      { new: true, runValidators: true }
    );
    if (!updated) throw new ConflictError('Booking changed. Refresh and retry.');
    return updated;
  }
}

export const mechanicService = new MechanicService();
