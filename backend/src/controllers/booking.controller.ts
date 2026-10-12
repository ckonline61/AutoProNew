import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { apiResponse } from '../utils/api-response';
import { bookingService } from '../services/booking.service';
import { UnauthorizedError } from '../errors/app-error';
import { BookingQueryInput } from '../validators/booking.validator';

export const bookingController = {
  /**
   * Create a new booking for authenticated customer.
   */
  create: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const customerId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!customerId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const booking = await bookingService.create(customerId, req.body);
    res.status(201).json(apiResponse.success(booking, 'Booking created successfully'));
  }),

  /**
   * Get all bookings for authenticated customer.
   */
  getAll: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const customerId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!customerId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const query = req.query as unknown as BookingQueryInput;
    const result = await bookingService.getCustomerBookings(customerId, query);

    res.status(200).json(
      apiResponse.success(result.bookings, 'Bookings retrieved successfully', {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      })
    );
  }),

  /**
   * Get single booking by ID.
   */
  getById: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const customerId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!customerId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const booking = await bookingService.getById(customerId, req.params.id as string);
    res.status(200).json(apiResponse.success(booking, 'Booking retrieved successfully'));
  }),

  /**
   * Cancel booking.
   */
  cancel: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const customerId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!customerId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const { reason } = req.body;
    const booking = await bookingService.cancel(customerId, req.params.id as string, reason);
    res.status(200).json(apiResponse.success(booking, 'Booking cancelled successfully'));
  }),
};
