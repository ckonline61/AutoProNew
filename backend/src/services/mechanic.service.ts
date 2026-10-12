import { Mechanic, IMechanic } from '../models/mechanic.model';
import { Booking, IBooking } from '../models/booking.model';
import { User } from '../models/user.model';
import { BookingFsm } from './booking-fsm';
import { BookingStatus, MechanicApprovalStatus, UserRole } from '../types';
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

    // Update user role to MECHANIC if not already
    if (user.role !== UserRole.MECHANIC) {
      user.role = UserRole.MECHANIC;
      await user.save();
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
    mechanic.isAvailable = data.isAvailable !== undefined ? data.isAvailable : data.isOnline;
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
      status: { $in: [BookingStatus.ASSIGNED, BookingStatus.ACCEPTED] },
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

    booking.status = BookingStatus.ACCEPTED;
    booking.statusHistory.push({
      status: BookingStatus.ACCEPTED,
      timestamp: new Date(),
      reason: 'Job accepted by mechanic',
    });

    await booking.save();
    return booking;
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

    booking.status = BookingStatus.REJECTED;
    booking.statusHistory.push({
      status: BookingStatus.REJECTED,
      timestamp: new Date(),
      reason: reason || 'Job rejected by mechanic',
    });

    await booking.save();
    return booking;
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

    booking.status = nextStatus;
    if (nextStatus === BookingStatus.COMPLETED) {
      booking.finalPrice = booking.estimatedPrice;
    }

    booking.statusHistory.push({
      status: nextStatus,
      timestamp: new Date(),
      reason: notes || `Status updated to ${nextStatus} by mechanic`,
    });

    await booking.save();

    // If completed, update mechanic metrics
    if (nextStatus === BookingStatus.COMPLETED) {
      await Mechanic.findOneAndUpdate(
        { userId },
        {
          $inc: {
            totalJobs: 1,
            totalEarnings: booking.finalPrice || booking.estimatedPrice,
          },
        }
      );
    }

    return booking;
  }
}

export const mechanicService = new MechanicService();
