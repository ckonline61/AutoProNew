import { Booking, IBooking } from '../models/booking.model';
import { Vehicle } from '../models/vehicle.model';
import { Address } from '../models/address.model';
import { serviceCatalogService } from './service.service';
import { BookingFsm } from './booking-fsm';
import { BookingStatus, UserRole } from '../types';
import { BadRequestError, NotFoundError, ConflictError } from '../errors/app-error';
import { CreateBookingInput, BookingQueryInput } from '../validators/booking.validator';
import { Mechanic } from '../models/mechanic.model';
import { User } from '../models/user.model';
import { Types } from 'mongoose';

export class BookingService {
  public async assignMechanic(bookingId: string, mechanicId: string, actorId: string): Promise<IBooking> {
    const mechanic = await Mechanic.findOne({ userId: mechanicId, isApproved: true, isAvailable: true });
    const user = await User.findOne({ _id: mechanicId, role: UserRole.MECHANIC, isActive: true });
    if (!mechanic || !user) throw new BadRequestError('Choose an active, approved and available mechanic');
    const booking = await Booking.findOne({ _id: bookingId, isActive: true });
    if (!booking) throw new NotFoundError('Booking not found');
    BookingFsm.assertTransition(booking.status,BookingStatus.ASSIGNED);
    const assigned = await Booking.findOneAndUpdate({ _id: bookingId, status: booking.status, isActive: true }, { $set: { mechanicId: new Types.ObjectId(mechanicId), status: BookingStatus.ASSIGNED }, $push: { statusHistory: { status: BookingStatus.ASSIGNED, timestamp: new Date(), updatedBy: new Types.ObjectId(actorId), reason: 'Assigned by administrator' } } }, { new: true, runValidators: true });
    if (!assigned) throw new ConflictError('Booking changed while assigning. Refresh and retry.');
    return assigned;
  }
  /**
   * Helper to generate human-readable unique booking numbers (e.g. BK-20261012-XXXX).
   */
  private generateBookingNumber(): string {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `BK-${dateStr}-${randomSuffix}`;
  }

  /**
   * Create a new booking with server-side pricing and slot availability validation.
   */
  public async create(customerId: string, data: CreateBookingInput): Promise<IBooking> {
    // 1. Verify vehicle belongs to customer and is active
    const vehicle = await Vehicle.findOne({
      _id: data.vehicleId,
      userId: customerId,
      isActive: true,
    });
    if (!vehicle) {
      throw new NotFoundError('Vehicle not found or does not belong to user');
    }

    // 2. If doorstep service, verify address belongs to customer and is active
    if (data.serviceType === 'DOORSTEP') {
      if (!data.addressId) {
        throw new BadRequestError('Address is required for doorstep service');
      }
      const address = await Address.findOne({
        _id: data.addressId,
        userId: customerId,
        isActive: true,
      });
      if (!address) {
        throw new NotFoundError('Address not found or does not belong to user');
      }
    }

    // 3. Fetch services from database and compute price & duration on server
    const services = await serviceCatalogService.getServicesByIds(data.serviceIds);
    if (services.length !== data.serviceIds.length) {
      throw new BadRequestError('One or more selected services are invalid or unavailable');
    }

    const estimatedPrice = services.reduce((total, s) => {
      const price = s.discountedPrice !== undefined && s.discountedPrice !== null ? s.discountedPrice : s.price;
      return total + price;
    }, 0);

    const estimatedDuration = services.reduce((total, s) => total + (s.duration || 60), 0);

    // 4. Validate scheduledDate
    const scheduledDateObj = new Date(data.scheduledDate);
    if (isNaN(scheduledDateObj.getTime())) {
      throw new BadRequestError('Invalid scheduled date');
    }

    // 5. Check for conflicting active bookings for this vehicle at the same date and slot
    const existingConflict = await Booking.findOne({
      vehicleId: data.vehicleId,
      scheduledDate: scheduledDateObj,
      scheduledTime: data.scheduledTime,
      status: {
        $nin: [
          BookingStatus.CANCELLED,
          BookingStatus.REJECTED,
          BookingStatus.COMPLETED,
          BookingStatus.FAILED,
        ],
      },
      isActive: true,
    });

    if (existingConflict) {
      throw new ConflictError(
        'An active booking already exists for this vehicle at the requested date and time slot'
      );
    }

    // 6. Create booking with PENDING status and initial statusHistory
    const bookingNumber = this.generateBookingNumber();
    const booking = await Booking.create({
      bookingNumber,
      customerId,
      vehicleId: data.vehicleId,
      addressId: data.addressId,
      serviceType: data.serviceType || 'DOORSTEP',
      serviceIds: data.serviceIds,
      status: BookingStatus.PENDING,
      scheduledDate: scheduledDateObj,
      scheduledTime: data.scheduledTime,
      estimatedDuration,
      estimatedPrice,
      discount: 0,
      notes: data.notes,
      statusHistory: [
        {
          status: BookingStatus.PENDING,
          timestamp: new Date(),
          reason: 'Booking initiated by customer',
        },
      ],
      isActive: true,
    });

    return booking;
  }

  /**
   * Get all bookings for authenticated customer.
   */
  public async getCustomerBookings(
    customerId: string,
    query: BookingQueryInput
  ): Promise<{
    bookings: IBooking[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {
      customerId,
      isActive: true,
    };

    if (query.status) {
      filter.status = query.status;
    }

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('vehicleId', 'brand model registrationNumber year')
        .populate('addressId', 'label addressLine1 city pincode')
        .populate('serviceIds', 'name price discountedPrice duration')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(filter),
    ]);

    return {
      bookings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get single booking by ID with ownership verification.
   */
  public async getById(customerId: string, bookingId: string): Promise<IBooking> {
    const booking = await Booking.findOne({
      _id: bookingId,
      customerId,
      isActive: true,
    })
      .populate('vehicleId')
      .populate('addressId')
      .populate('serviceIds')
      .populate('mechanicId', 'name phone');

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    return booking;
  }

  /**
   * Cancel booking by customer with policy enforcement.
   */
  public async cancel(
    customerId: string,
    bookingId: string,
    reason: string
  ): Promise<IBooking> {
    const booking = await Booking.findOne({
      _id: bookingId,
      customerId,
      isActive: true,
    });

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Policy check via FSM
    BookingFsm.assertCustomerCanCancel(booking.status);
    BookingFsm.assertTransition(booking.status, BookingStatus.CANCELLED);

    booking.status = BookingStatus.CANCELLED;
    booking.cancellationReason = reason;
    booking.cancelledBy = 'CUSTOMER';
    booking.statusHistory.push({
      status: BookingStatus.CANCELLED,
      timestamp: new Date(),
      reason,
    });

    await booking.save();
    return booking;
  }

  /**
   * Transition booking status following the FSM.
   */
  public async updateStatus(
    bookingId: string,
    newStatus: BookingStatus,
    updatedBy?: string,
    reason?: string
  ): Promise<IBooking> {
    const booking = await Booking.findOne({ _id: bookingId, isActive: true });
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    BookingFsm.assertTransition(booking.status, newStatus);

    const updated = await Booking.findOneAndUpdate({ _id: bookingId, status: booking.status, isActive: true }, { $set: { status: newStatus }, $push: { statusHistory: { status: newStatus, timestamp: new Date(), updatedBy: updatedBy ? new Types.ObjectId(updatedBy) : undefined, reason } } }, { new: true, runValidators: true });
    if (!updated) throw new ConflictError('Booking changed while updating. Refresh and retry.');
    if (![BookingStatus.EN_ROUTE, BookingStatus.ARRIVED].includes(newStatus) && updated.mechanicId) {
      await Mechanic.updateOne({ userId: updated.mechanicId }, { $unset: { currentLocation: 1 } });
    }
    return updated;
  }
}

export const bookingService = new BookingService();
